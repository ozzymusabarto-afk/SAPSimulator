/**
 * NexusTech ERP • VKM1 View Component
 * Transação de Liberação de Documentos Bloqueados por Crédito Comercial (Credit Release)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';

export class Vkm1ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vkm1-view';
    this.selectedDocNumber = null;
  }

  render() {
    const blocked = db.creditBlockedOrders;

    // Se estiver no cenário 3, marca objetivo de acesso à VKM1
    const scenario = scenarioEngine.getActiveScenario();
    if (scenario && scenario.id === 'SCN-03') {
      scenarioEngine.completeObjective('access_vkm1');
    }

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VKM1</span>
          <div>
            <div class="transaction-title">Documentos de Vendas Bloqueados por Crédito (Credit Management)</div>
            <div class="text-xs text-muted">Controle de Crédito Comercial • Integração SD & FI-AR</div>
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
                  <th>Ação de Liberação</th>
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
                    <td class="text-xs text-muted" style="max-width: 200px;">
                      ${b.reason}
                    </td>
                    <td>
                      <button class="btn btn-primary btn-sm btn-release-order" data-doc="${b.orderDocNumber}">
                        ${Icons.unlock} Liberar Ordem
                      </button>
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
          const success = db.releaseCreditOrder(docNumber, 'Liberado pelo trainee com alçada comercial supervisionada.');
          
          if (success) {
            const scenario = scenarioEngine.getActiveScenario();
            if (scenario && scenario.id === 'SCN-03') {
              scenarioEngine.completeObjective('release_with_notes');
            }

            diagnosticModal.show({
              isValid: true,
              whatHappened: `Ordem de Venda nº ${Formatters.documentNumber(docNumber)} liberada com sucesso do bloqueio de crédito.`,
              why: 'O status global de fornecimento foi alterado de BLOQUEADO para ABERTO, permitindo a criação da remessa na transação VL01N.',
              businessImpact: 'A mercadoria pode agora ser separada no centro de distribuição, garantindo o cumprimento do prazo contratual com a indústria.',
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
