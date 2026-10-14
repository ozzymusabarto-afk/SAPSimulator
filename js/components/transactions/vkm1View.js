/**
 * NexusTech ERP • VKM1 View Component
 * Transação de Liberação de Documentos Bloqueados por Crédito Comercial (Credit Release)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { MentorDockComponent } from '../mentorDock.js';

export class Vkm1ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vkm1-view';
    this.selectedDocNumber = null;
    this.currentScenarioId = null; // Lote D: guard de cenário
  }

  resetForm() {
    // Lote D: limpa estado ao mudar de missão
    this.selectedDocNumber = null;
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;

    // Lote D: guard de cenário — limpa estado ao trocar de missão
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    // Lote B: completeObjective('access_vkm1') e ('investigate_credit') REMOVIDOS do render().
    // Serão disparados apenas após ação real do trainee no handler de liberação.

    const blocked = db.creditBlockedOrders;
    const requiredDecision = scenario?.targetCriteria?.creditDecision || null;
    const requiresDocumentedDecision = Boolean(requiredDecision);

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VKM1</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Documentos de Vendas Bloqueados por Crédito (Credit Management)</div>
            <div class="text-xs text-muted">Controle de Crédito Comercial • Integração SD &amp; FI-AR</div>
          </div>
        </div>
        <div class="transaction-actions">
          <span class="erp-badge ${blocked.length > 0 ? 'erp-badge-danger' : 'erp-badge-success'}">
            ${blocked.length > 0 ? `${Icons.lock} ${blocked.length} Ordens Bloqueadas` : `${Icons.check} Fila Limpa`}
          </span>
        </div>
      </div>

      <!-- Tabela de Ordens Bloqueadas -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Fila de Ordens Aguardando Parecer de Crédito</span>
          <span class="erp-badge erp-badge-sap text-xs">Área de Controle BR01</span>
        </div>

        ${blocked.length > 0 ? `
          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Nº da Ordem</th>
                  <th>Cliente (KUNNR)</th>
                  <th>Valor do Pedido</th>
                  <th>Limite de Crédito</th>
                  <th>Saldo Utilizado</th>
                  <th>Risco</th>
                  <th>Motivo do Bloqueio</th>
                      <th>${requiresDocumentedDecision ? 'Decisão e parecer' : 'Ação de Liberação'}</th>
                </tr>
              </thead>
              <tbody>
                ${blocked.map(b => `
                  <tr>
                    <td class="font-mono font-bold text-primary">${Formatters.documentNumber(b.orderDocNumber)}</td>
                    <td>
                      <div class="font-semibold">${b.customer.id} - ${b.customer.name}</div>
                      <div class="text-xs text-muted">${b.customer.city} - ${b.customer.state}</div>
                    </td>
                    <td class="font-mono font-bold text-danger">${Formatters.currency(b.totalValue)}</td>
                    <td class="font-mono">${Formatters.currency(b.customer.creditLimit)}</td>
                    <td class="font-mono text-warning">${Formatters.currency(b.customer.creditUsed)}</td>
                    <td>
                      <span class="credit-risk-badge risk-high">
                        ${b.customer.riskCategory}
                      </span>
                    </td>
                    <td class="text-xs text-muted" style="min-width: 180px;">
                      ${b.reason}
                    </td>
                    <td>
                      ${requiresDocumentedDecision ? `
                        <select class="erp-select credit-decision-select" data-doc="${b.orderDocNumber}" style="width: 150px; margin-bottom: 6px;">
                          <option value="">Selecionar decisão</option>
                          <option value="RELEASE">RELEASE — liberar</option>
                          <option value="HOLD">HOLD — manter</option>
                          <option value="ESCALATE">ESCALATE — encaminhar</option>
                          <option value="REJECT">REJECT — rejeitar</option>
                        </select>
                        <textarea class="erp-input credit-decision-note" data-doc="${b.orderDocNumber}" rows="2" placeholder="Parecer e evidência (mín. 20 caracteres)" style="width: 190px; margin-bottom: 6px;"></textarea>
                        <button class="btn btn-primary btn-sm btn-release-order" data-doc="${b.orderDocNumber}">
                          ${Icons.check} Registrar decisão
                        </button>
                      ` : `
                        <button class="btn btn-primary btn-sm btn-release-order" data-doc="${b.orderDocNumber}">
                          ${Icons.unlock} Liberar Ordem
                        </button>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="text-align: center; padding: 32px 16px;">
            <div style="color: var(--erp-green-success); margin-bottom: 8px;">${Icons.check}</div>
            <h4 class="font-semibold" style="color: var(--erp-navy-900);">Nenhuma ordem de venda retida por crédito.</h4>
            <p class="text-xs text-muted" style="margin-top: 4px;">
              Todas as ordens emitidas estão dentro do limite ou foram devidamente aprovadas pelo financeiro.
            </p>
          </div>
        `}
      </div>

      <!-- Pílula de Conhecimento de Negócio sobre VKM1 -->
      <div class="erp-card" style="padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: var(--erp-blue-primary);">${Icons.info}</span>
          <span class="font-semibold text-xs text-navy-900" style="text-transform: uppercase;">Boas Práticas de Gestão de Crédito no SAP SD</span>
        </div>
        <p class="text-xs text-muted" style="line-height: 1.5;">
          A liberação na VKM1 nunca deve ser feita de forma automática sem conferência prévia. O analista deve checar o histórico de títulos em atraso, a idoneidade cadastral do cliente e negociar garantias adicionais (como pagamento de títulos vencidos) antes de autorizar o envio para a expedição física.
        </p>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    this.container.querySelectorAll('.btn-release-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const docNumber = btn.getAttribute('data-doc');
        if (docNumber) {
          const activeScenario = scenarioEngine.getActiveScenario();
          const targetCriteria = activeScenario?.targetCriteria || {};
          const selectedOrder = db.getSalesOrder(docNumber);
          const matchesTargetDocument = !targetCriteria.targetDocNumber || targetCriteria.targetDocNumber === docNumber;
          const matchesTargetCustomer = !targetCriteria.customerId || selectedOrder?.customerId === targetCriteria.customerId;
          const matchesTargetPo = !targetCriteria.customerPoNumber || selectedOrder?.customerPoNumber === targetCriteria.customerPoNumber;

          if (activeScenario && (!matchesTargetDocument || !matchesTargetCustomer || !matchesTargetPo)) {
            const expected = targetCriteria.targetDocNumber
              ? `ordem ${targetCriteria.targetDocNumber}`
              : targetCriteria.customerId
                ? `ordem bloqueada do cliente ${targetCriteria.customerId}`
                : 'documento solicitado na missão';
            diagnosticModal.show({
              isValid: false,
              mentorSpeech: `Esta não é a ordem solicitada. Confira a ${expected} antes de liberar crédito.`,
              whatHappened: `A ordem ${docNumber} não corresponde ao documento ou cliente esperado pela missão.`,
              why: 'A alçada de crédito deve ser aplicada somente ao documento indicado no chamado.',
              businessImpact: 'A liberação de uma ordem diferente pode autorizar uma expedição indevida.',
              onConfirm: () => this.render()
            });
            return;
          }

          const selectedDecision = this.container.querySelector(`.credit-decision-select[data-doc="${docNumber}"]`)?.value || 'RELEASE';
          const decisionNote = this.container.querySelector(`.credit-decision-note[data-doc="${docNumber}"]`)?.value?.trim() || '';
          const expectedDecision = targetCriteria.creditDecision;
          if (expectedDecision && selectedDecision !== expectedDecision) {
            diagnosticModal.show({
              isValid: false,
              mentorSpeech: `A decisão selecionada (${selectedDecision || 'nenhuma'}) não corresponde à análise deste chamado. Reavalie risco, exposição e alçada antes de registrar.`,
              whatHappened: `Decisão informada: ${selectedDecision || 'em branco'}. Decisão esperada para o exercício: ${expectedDecision}.`,
              why: 'A decisão de crédito deve refletir as evidências do parceiro e a autorização disponível.',
              businessImpact: 'Liberar, rejeitar ou manter uma ordem sem fundamento pode causar risco financeiro ou atraso indevido.',
              onConfirm: () => this.render()
            });
            return;
          }
          if (expectedDecision && decisionNote.length < 20) {
            diagnosticModal.show({
              isValid: false,
              mentorSpeech: 'Registre um parecer objetivo com a evidência que sustenta a decisão (mínimo de 20 caracteres).',
              whatHappened: 'O parecer de crédito está ausente ou superficial.',
              why: 'Uma decisão documentada precisa deixar claro o motivo, a evidência e o encaminhamento.',
              businessImpact: 'Sem rastreabilidade, outra pessoa não consegue revisar a decisão nem assumir a próxima etapa.',
              onConfirm: () => this.render()
            });
            return;
          }

          // Decisão diferente de RELEASE mantém a ordem bloqueada e registra o encaminhamento.
          if (expectedDecision && selectedDecision !== 'RELEASE') {
            const scenario = scenarioEngine.getActiveScenario();
            scenarioEngine.completeObjective('access_vkm1');
            scenarioEngine.completeObjective('release_with_notes');
            scenarioEngine.completeObjective('release_credit_order');
            scenarioEngine.completeObjective('analyze_credit');
            scenarioEngine.completeObjective('release_order');
            const summary = `Ordem ${docNumber} • decisão ${selectedDecision} • parecer: ${decisionNote}`;
            const missionCompleted = scenarioEngine.completeActiveScenarioIfReady('Decisão documentada de crédito', summary);
            trainee.recordAction(true, 'Decisão documentada de crédito', summary);
            diagnosticModal.show({
              isValid: true,
              operationSummary: {
                title: 'Decisão de Crédito Registrada',
                docTypeBadge: 'Credit Management • S/4HANA reference',
                primaryLabel: 'Ordem analisada:',
                primaryNumber: Formatters.documentNumber(docNumber),
                statusText: `Ordem permanece retida (${selectedDecision})`,
                partnerLabel: 'Parecer:',
                partnerOrOrigin: decisionNote,
                referenceDoc: missionCompleted ? 'Missão concluída; aguarde a alçada responsável.' : 'Conclua as etapas pendentes do chamado.',
                inspectLabel: `Inspecionar Ordem [${Formatters.documentNumber(docNumber)}] em VA03`
              },
              mentorSpeech: scenario?.completionFeedback?.mentorSpeech || `Decisão ${selectedDecision} registrada. A ordem continua bloqueada até a próxima alçada.`,
              whatHappened: scenario?.completionFeedback?.whatHappened || `Parecer ${selectedDecision} registrado para a ordem ${docNumber}.`,
              why: scenario?.completionFeedback?.why || 'A ordem não deve ser liberada sem aprovação e evidência compatíveis.',
              businessImpact: scenario?.completionFeedback?.businessImpact || 'O caso foi encaminhado com rastreabilidade para a área responsável.',
              onConfirm: () => this.render(),
              onInspect: () => this.onNavigate('VA03', { docNumber })
            });
            return;
          }

          // Lote B+F: desabilita botão imediatamente para evitar dupla liberação
          btn.disabled = true;
          btn.textContent = 'Processando...';

          try {
            const success = db.releaseCreditOrder(docNumber, 'Liberado pelo trainee com alçada comercial supervisionada.');

            if (success) {
              const scenario = scenarioEngine.getActiveScenario();
              if (scenario) {
                const targetDoc = scenario.targetCriteria?.targetDocNumber;
                const isTargetOrder = !targetDoc || targetDoc === docNumber;

                // Lote B: completeObjective disparado AQUI, após ação real do trainee
                scenarioEngine.completeObjective('access_vkm1');
                scenarioEngine.completeObjective('release_with_notes');
                scenarioEngine.completeObjective('release_credit_order');
                scenarioEngine.completeObjective('analyze_credit');
                scenarioEngine.completeObjective('release_order');

                const isFinalCreditMission = isTargetOrder && (
                  scenario.targetCriteria?.requiresVkm1Release ||
                  scenario.targetCriteria?.action === 'CREDIT_RELEASE' ||
                  scenario.validationRules?.actionType === 'CREDIT_RELEASE'
                );

                if (isFinalCreditMission) {
                  const summary = `Ordem ${docNumber} liberada na VKM1 • Parecer comercial supervisionado`;
                  const missionCompleted = scenarioEngine.completeActiveScenarioIfReady('Liberação de Crédito VKM1', summary);
                  if (!missionCompleted) trainee.recordAction(true, 'Liberação de Crédito VKM1', summary);
                  const pendingObjectives = scenario.objectives.filter(objective => !objective.done);

                  const feedback = scenario?.completionFeedback || {};
                  MentorDockComponent.speak(
                    missionCompleted
                      ? (feedback.mentorSpeech || `Ordem nº ${Formatters.documentNumber(docNumber)} liberada na VKM1. Missão concluída!`)
                      : `Ordem nº ${Formatters.documentNumber(docNumber)} liberada na VKM1, mas a missão continua. Conclua também: ${pendingObjectives.map(objective => objective.text).join('; ')}.`,
                    'SUCCESS'
                  );

                  const orderObj = db.getSalesOrder(docNumber);
                  const custName = orderObj ? (db.getCustomer(orderObj.customerId)?.name || orderObj.customerId) : '';

                  diagnosticModal.show({
                    isValid: true,
                    operationSummary: {
                      title: 'Ordem Liberada por Alçada de Crédito',
                      docTypeBadge: 'VBAK / KNKK • Alçada Comercial',
                      primaryLabel: 'Nº da Ordem Desbloqueada (VBELN):',
                      primaryNumber: Formatters.documentNumber(docNumber),
                      statusText: 'Crédito Liberado (RELEASED_MANUAL)',
                      partnerLabel: 'Emissor da Ordem:',
                      partnerOrOrigin: orderObj ? `${orderObj.customerId} - ${custName}` : 'Cliente Comercial',
                      referenceDoc: 'Status Fornecimento: Aberto (OPEN)',
                      inspectLabel: `Inspecionar Ordem [${Formatters.documentNumber(docNumber)}] em VA03`
                    },
                    mentorSpeech: missionCompleted
                      ? (feedback.mentorSpeech || `Ordem de Venda nº ${Formatters.documentNumber(docNumber)} liberada com sucesso do bloqueio de crédito na VKM1.`)
                      : `Ordem ${docNumber} liberada; a missão permanece em andamento até cumprir as etapas pendentes.`,
                    whatHappened: missionCompleted
                      ? (feedback.whatHappened || `Ordem de Venda nº ${Formatters.documentNumber(docNumber)} liberada com sucesso do bloqueio de crédito.`)
                      : `Ordem liberada; ${pendingObjectives.length} objetivo(s) continuam pendentes.`,
                    why: feedback.why || 'O status global de fornecimento foi alterado de BLOQUEADO para ABERTO, permitindo a criação da remessa na transação VL01N.',
                    businessImpact: feedback.businessImpact || 'A mercadoria pode agora ser separada no centro de distribuição, garantindo o cumprimento do prazo contratual com a indústria.',
                    onConfirm: () => this.render(),
                    onInspect: () => this.onNavigate('VA03', { docNumber })
                  });
                } else {
                  // Etapa intermediária de cenários compostos (ex: DSF-204, DSF-205, DSF-208)
                  // Apenas desbloqueia o fluxo logístico sem conceder o XP final ou feedback de encerramento da missão
                  trainee.recordAction(true, 'Liberação de Crédito VKM1', `Ordem ${docNumber} liberada para continuidade logística`);

                  MentorDockComponent.speak(`Ordem nº ${Formatters.documentNumber(docNumber)} liberada na VKM1. Trava comercial removida! Prossiga para a expedição (VL01N).`, 'SUCCESS');

                  const orderObj = db.getSalesOrder(docNumber);
                  const custName = orderObj ? (db.getCustomer(orderObj.customerId)?.name || orderObj.customerId) : '';

                  diagnosticModal.show({
                    isValid: true,
                    operationSummary: {
                      title: 'Ordem Liberada por Alçada de Crédito',
                      docTypeBadge: 'VBAK / KNKK • Alçada Comercial',
                      primaryLabel: 'Nº da Ordem Desbloqueada (VBELN):',
                      primaryNumber: Formatters.documentNumber(docNumber),
                      statusText: 'Crédito Liberado (RELEASED_MANUAL)',
                      partnerLabel: 'Emissor da Ordem:',
                      partnerOrOrigin: orderObj ? `${orderObj.customerId} - ${custName}` : 'Cliente Comercial',
                      referenceDoc: 'Próxima Etapa: Gerar Remessa (VL01N)',
                      inspectLabel: `Inspecionar Ordem [${Formatters.documentNumber(docNumber)}] em VA03`
                    },
                    mentorSpeech: `Muito bem! O bloqueio de crédito da Ordem de Venda nº ${Formatters.documentNumber(docNumber)} foi liberado com sucesso na transação VKM1. A trava comercial foi removida no mandante 800. Agora avance para a transação VL01N para criar o documento de remessa (fornecimento)!`,
                    whatHappened: `Bloqueio de crédito comercial resolvido para a Ordem nº ${Formatters.documentNumber(docNumber)}. Status de fornecimento atualizado para ABERTO.`,
                    why: 'A alçada comercial foi aprovada na VKM1, destravando a ordem para as etapas físicas de expedição.',
                    businessImpact: 'A mercadoria está autorizada para movimentação no Centro de Distribuição. A próxima etapa operacional é gerar a remessa na transação VL01N.',
                    onConfirm: () => {
                      this.onNavigate('VL01N', { salesOrderNumber: docNumber });
                    },
                    onInspect: () => this.onNavigate('VA03', { docNumber })
                  });
                }
              } else {
                // Fallback defensivo caso não haja cenário ativo
                MentorDockComponent.speak(`Ordem nº ${Formatters.documentNumber(docNumber)} liberada na gestão de crédito (VKM1).`, 'SUCCESS');
                const orderObj = db.getSalesOrder(docNumber);
                const custName = orderObj ? (db.getCustomer(orderObj.customerId)?.name || orderObj.customerId) : '';

                diagnosticModal.show({
                  isValid: true,
                  operationSummary: {
                    title: 'Ordem Liberada por Alçada de Crédito',
                    docTypeBadge: 'VBAK / KNKK • Alçada Comercial',
                    primaryLabel: 'Nº da Ordem Desbloqueada (VBELN):',
                    primaryNumber: Formatters.documentNumber(docNumber),
                    statusText: 'Crédito Liberado (RELEASED_MANUAL)',
                    partnerLabel: 'Emissor da Ordem:',
                    partnerOrOrigin: orderObj ? `${orderObj.customerId} - ${custName}` : 'Cliente Comercial',
                    referenceDoc: 'Status Fornecimento: Aberto (OPEN)',
                    inspectLabel: `Inspecionar Ordem [${Formatters.documentNumber(docNumber)}] em VA03`
                  },
                  mentorSpeech: `Ordem de Venda nº ${Formatters.documentNumber(docNumber)} liberada com sucesso do bloqueio de crédito na VKM1.`,
                  whatHappened: `Ordem de Venda nº ${Formatters.documentNumber(docNumber)} liberada do bloqueio de crédito.`,
                  why: 'O status global de fornecimento foi alterado para ABERTO.',
                  businessImpact: 'A ordem pode agora seguir para as próximas etapas no sistema ERP.',
                  onConfirm: () => this.render(),
                  onInspect: () => this.onNavigate('VA03', { docNumber })
                });
              }
            } else {
              // Falha na liberação: restaura botão e emite diagnóstico
              btn.disabled = false;
              btn.innerHTML = `${Icons.unlock} Liberar Ordem`;
              diagnosticModal.show({
                isValid: false,
                mentorSpeech: 'Atenção: Não foi possível liberar esta ordem. O documento pode já ter sido liberado ou cancelado.',
                whatHappened: `Falha na liberação da Ordem nº ${docNumber}.`,
                why: 'A ordem não consta com bloqueio de crédito pendente.',
                businessImpact: 'Nenhuma alteração de status foi gravada.',
                onConfirm: () => this.render()
              });
            }
          } catch (err) {
            console.error('Erro na liberação de crédito VKM1:', err);
            btn.disabled = false;
            btn.innerHTML = `${Icons.unlock} Liberar Ordem`;
            diagnosticModal.show({
              isValid: false,
              mentorSpeech: 'Ocorreu um erro inesperado durante a liberação. Tente novamente ou consulte o suporte.',
              whatHappened: `Erro de execução: ${err.message}`,
              why: 'Ocorreu uma falha inesperada no processamento do evento da VKM1.',
              businessImpact: 'A operação foi cancelada e o estado anterior foi preservado.',
              onConfirm: () => this.render()
            });
          }
        }
      });
    });
  }

  getElement() {
    return this.container;
  }
}
