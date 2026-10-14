/**
 * NexusTech ERP • VL02N View Component
 * Transação de Modificação de Remessa: Picking & Registro de Saída de Mercadorias (Post Goods Issue - PGI)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { MentorDockComponent } from '../mentorDock.js';
import { CompanyStructure } from '../../core/domain/company.js';

export class Vl02nViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vl02n-view';
    this.selectedDeliveryNumber = '';
    this.loadedDelivery = null;
    this.currentScenarioId = null;
  }

  resetForm() {
    this.selectedDeliveryNumber = '';
    this.loadedDelivery = null;
  }

  setParams(params = {}) {
    // Não pré-preenche automaticamente a remessa por navegação, cumprindo o princípio
    // DADO FORNECIDO NO CHAMADO ≠ DADO PREENCHIDO NA TELA.
    this.render();
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    if (this.selectedDeliveryNumber) {
      this.loadedDelivery = db.getDelivery(this.selectedDeliveryNumber);
    } else {
      this.loadedDelivery = null;
    }

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VL02N</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Modificar Fornecimento: Picking & Saída de Mercadorias (PGI)</div>
            <div class="text-xs text-muted">Separação Física, Movimento MM 601 e Baixa Contábil de Estoque • Tabela LIKP / LIPS</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-vl01n">
            ${Icons.fileText} Criar Remessa (VL01N)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-vl03n">
            ${Icons.search} Consultar Remessa (VL03N)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-va03">
            ${Icons.layers} Fluxo na Ordem (VA03)
          </button>
        </div>
      </div>

      <!-- Seção 1: Seletor de Remessa -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Identificação do Documento de Fornecimento</span>
          <span class="erp-badge erp-badge-sap text-xs">Ponto de Expedição 1000</span>
        </div>

        <div class="form-grid-3" style="align-items: flex-end;">
          <div style="grid-column: span 2;">
            <label class="form-label">Número da Remessa / Fornecimento (Outbound Delivery):</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="erp-input font-mono font-bold" id="vl02n-delivery-input" placeholder="Ex: 80000001" value="${this.selectedDeliveryNumber || ''}" style="flex: 1; text-transform: uppercase;">
            </div>
          </div>

          <div>
            <button class="btn btn-primary" id="btn-load-delivery" style="width: 100%;">
              ${Icons.search} Carregar Remessa
            </button>
          </div>
        </div>
      </div>

      <!-- Seção 2: Dados da Remessa Carregada -->
      ${this.loadedDelivery ? `
        <div class="transaction-section">
          <div class="section-title">
            <span>Remessa nº ${Formatters.documentNumber(this.loadedDelivery.deliveryNumber)} • Ordem de Venda: ${Formatters.documentNumber(this.loadedDelivery.salesOrderNumber)}</span>
            <div style="display: flex; gap: 8px;">
              <span class="erp-badge ${this.loadedDelivery.pickingStatus === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-warning'}">
                Picking: ${this.loadedDelivery.pickingStatus === 'COMPLETED' ? 'Concluído' : 'Pendente'}
              </span>
              <span class="erp-badge ${this.loadedDelivery.goodsIssueStatus === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-primary'}">
                ${this.loadedDelivery.goodsIssueStatus === 'COMPLETED' ? `${Icons.check} Saída Registrada (PGI)` : `${Icons.clock} Pronto p/ Saída`}
              </span>
            </div>
          </div>

          <!-- Cabeçalho da Remessa -->
          <div class="form-grid-4" style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <div>
              <div class="text-xs text-muted">Destinatário da Mercadoria (KUNNR):</div>
              <div class="font-semibold text-sm font-mono">
                ${this.loadedDelivery.customerId} - ${db.getCustomer(this.loadedDelivery.customerId)?.name || ''}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Destino / Local de Entrega:</div>
              <div class="font-mono text-sm font-semibold text-primary">
                ${(() => {
                  const cust = db.getCustomer(this.loadedDelivery.customerId);
                  const city = cust?.city ? `${cust.city}/${cust.state || 'BR'}` : 'Conforme Cadastro';
                  const shipTo = cust?.partners?.shipToParty?.name || '';
                  return shipTo ? `${city} • ${shipTo}` : city;
                })()}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Ponto de Expedição (Origem):</div>
              <div class="font-mono text-sm font-bold">${CompanyStructure.getShippingPointName(this.loadedDelivery.shippingPoint)}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Data Planejada / Peso Total:</div>
              <div class="font-mono text-sm font-bold text-primary">
                ${new Date(this.loadedDelivery.deliveryDate).toLocaleDateString('pt-BR')} • ${this.loadedDelivery.totalWeightKg.toFixed(1)} Kg
              </div>
            </div>
          </div>

          <!-- Aba de Conferência de Picking / Separação Física -->
          <div class="section-title" style="margin-top: 12px;">
            <span>Conferência de Picking & Itens a Expedir</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-auto-pick" ${this.loadedDelivery.status === 'COMPLETED' ? 'disabled' : ''}>
                ${Icons.check} Copiar Qtd Fornecimento para Picking
              </button>
            </div>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Material (MATNR)</th>
                  <th>Centro/Depósito</th>
                  <th>Qtd Fornecimento</th>
                  <th>Qtd Picking (Separada)</th>
                  <th>Unid</th>
                  <th>Peso (Kg)</th>
                  <th>Status Picking</th>
                </tr>
              </thead>
              <tbody>
                ${this.loadedDelivery.items.map((it, idx) => {
                  const isPicked = it.pickedQuantity >= it.deliveryQuantity || this.loadedDelivery.pickingStatus === 'COMPLETED';
                  const currentPickVal = isPicked ? it.deliveryQuantity : (it.pickedQuantity || 0);

                  return `
                    <tr>
                      <td class="font-mono font-bold text-center">${it.itemPosition || (idx + 1) * 10}</td>
                      <td>
                        <div class="font-semibold font-mono text-primary">${it.materialId}</div>
                        <div class="text-xs text-muted">${it.description}</div>
                      </td>
                      <td class="font-mono text-xs">${it.plantId || '1000'} / ${it.storageLocation || 'DEP1'}</td>
                      <td class="font-mono font-bold text-center">${it.deliveryQuantity}</td>
                      <td class="text-center font-mono">
                        <input type="number" class="erp-input text-center font-bold input-pick-qty" 
                          data-idx="${idx}" min="0" max="${it.deliveryQuantity}" 
                          value="${currentPickVal}" 
                          style="width: 70px; display: inline-block; padding: 2px 4px;"
                          ${this.loadedDelivery.status === 'COMPLETED' ? 'disabled' : ''}>
                      </td>
                      <td class="text-xs text-center">${it.unit}</td>
                      <td class="font-mono text-right text-xs">${(it.weightKg || 0).toFixed(1)} Kg</td>
                      <td>
                        <span class="erp-badge ${isPicked ? 'erp-badge-success' : 'erp-badge-warning'} text-xs">
                          ${isPicked ? `${Icons.check} Separado` : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Barra de Ações: PGI (Post Goods Issue) -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-top: 20px; padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div class="text-xs text-muted" style="flex: 1 1 260px; min-width: 0;">
              Ao registrar a Saída de Mercadorias (PGI), o estoque físico é baixado no depósito (Mov. 601) e a remessa é concluída.
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="btn-post-goods-issue" 
                style="padding: 10px 24px; font-weight: 700; background: ${this.loadedDelivery.status === 'COMPLETED' ? '#64748b' : 'var(--erp-green-success)'}; border-color: ${this.loadedDelivery.status === 'COMPLETED' ? '#64748b' : 'var(--erp-green-success)'};"
                ${this.loadedDelivery.status === 'COMPLETED' ? 'disabled' : ''}>
                ${Icons.package} ${this.loadedDelivery.status === 'COMPLETED' ? 'Saída de Mercadorias já Registrada (PGI Concluído)' : 'Registrar Saída de Mercadorias (PGI)'}
              </button>
            </div>
          </div>
        </div>
      ` : `
        <div class="erp-card" style="text-align: center; padding: 40px 16px; background: #ffffff;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 10px;">${Icons.package}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900);">Nenhuma remessa carregada no momento</h4>
          <p class="text-xs text-muted" style="margin-top: 4px; max-width: 500px; margin-left: auto; margin-right: auto;">
            Informe o número da Remessa (ex: 80000001) no campo superior ou crie uma nova remessa na transação VL01N.
          </p>
        </div>
      `}

      <!-- Guia Didático de Negócio sobre VL02N / PGI -->
      <div class="erp-card" style="padding: 16px; margin-top: 20px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: var(--erp-blue-primary);">${Icons.info}</span>
          <span class="font-semibold text-xs text-navy-900" style="text-transform: uppercase;">A Importância do Post Goods Issue (PGI / Movimento 601)</span>
        </div>
        <p class="text-xs text-muted" style="line-height: 1.5;">
          No SAP SD, o registro do <strong>Post Goods Issue (PGI)</strong> na transação <strong>VL02N</strong> é o divisor de águas da logística. É ele que contabiliza a saída física das mercadorias do depósito (tabela MARD / movimento MM 601), reduzindo simultaneamente o estoque físico e a reserva. Após o PGI, a entrega torna-se irreversível e o documento fica pronto para emissão da Fatura Comercial (VF01).
        </p>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // 1. Carregar Remessa & Tecla Enter
    const btnLoad = this.container.querySelector('#btn-load-delivery');
    const delInput = this.container.querySelector('#vl02n-delivery-input');

    const executeLoadDelivery = () => {
      this.selectedDeliveryNumber = delInput ? delInput.value.trim() : '';

      if (!this.selectedDeliveryNumber) {
        diagnosticModal.show({
          isValid: false,
          mentorSpeech: 'Atenção: Informe o número da Remessa (Outbound Delivery) para carregar o documento.',
          whatHappened: 'Nenhum número de remessa digitado.',
          why: 'A transação VL02N necessita do identificador do fornecimento.',
          businessImpact: 'Impossível localizar os itens para conferência de picking.'
        });
        return;
      }

      const del = db.getDelivery(this.selectedDeliveryNumber);
      if (!del) {
        diagnosticModal.show({
          isValid: false,
          mentorSpeech: `Atenção: A Remessa nº ${this.selectedDeliveryNumber} não foi encontrada. Crie o fornecimento na VL01N antes de tentar modificá-lo.`,
          whatHappened: `Remessa ${this.selectedDeliveryNumber} inexistente.`,
          why: 'O documento precisa ter sido criado previamente a partir de uma ordem de venda.',
          businessImpact: 'Sem documento de remessa, não há expedição autorizada.'
        });
        return;
      }

      this.loadedDelivery = del;

      // Validação de objetivo somente após ação de carga bem-sucedida do documento correto
      const scenario = scenarioEngine.getActiveScenario();
      if (scenario) {
        const targetDoc = scenario.targetCriteria?.targetDocNumber;
        if (!targetDoc || del.salesOrderNumber === targetDoc || del.deliveryNumber === targetDoc) {
          scenarioEngine.completeObjective('access_vl02n');
        }
      }

      this.render();
    };

    if (btnLoad) {
      btnLoad.addEventListener('click', executeLoadDelivery);
    }
    if (delInput) {
      delInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeLoadDelivery();
        }
      });
    }

    // 2. Edição Manual de Quantidade no Picking
    this.container.querySelectorAll('.input-pick-qty').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const val = parseFloat(e.target.value) || 0;
        if (this.loadedDelivery && this.loadedDelivery.items[idx]) {
          this.loadedDelivery.items[idx].pickedQuantity = Math.max(0, Math.min(this.loadedDelivery.items[idx].deliveryQuantity, val));
          const allDone = this.loadedDelivery.items.every(it => (it.pickedQuantity || 0) >= it.deliveryQuantity);
          this.loadedDelivery.pickingStatus = allDone ? 'COMPLETED' : 'PENDING';
          if (allDone) {
            scenarioEngine.completeObjective('confirm_picking');
          }
        }
      });
      inp.addEventListener('change', () => {
        this.render();
      });
    });

    // 3. Botão Auto-Pick (Copiar Qtd)
    const btnAutoPick = this.container.querySelector('#btn-auto-pick');
    if (btnAutoPick && this.loadedDelivery) {
      btnAutoPick.addEventListener('click', () => {
        this.loadedDelivery.items.forEach(it => {
          it.pickedQuantity = it.deliveryQuantity;
        });
        this.loadedDelivery.pickingStatus = 'COMPLETED';
        scenarioEngine.completeObjective('confirm_picking');
        MentorDockComponent.speak('Picking confirmado. Quantidade separada igual à quantidade da remessa. Prossiga para a Saída de Mercadorias (PGI).', 'SUCCESS');
        this.render();
      });
    }

    // 4. Botão Registrar Saída de Mercadorias (PGI)
    const btnPgi = this.container.querySelector('#btn-post-goods-issue');
    if (btnPgi && this.loadedDelivery) {
      btnPgi.addEventListener('click', () => {
        // P2: Desabilita imediatamente para evitar duplo-clique enquanto modal está aberto
        btnPgi.disabled = true;

        const activeScenario = scenarioEngine.getActiveScenario();
        const pgiTargetDoc = activeScenario?.targetCriteria?.targetDocNumber;
        if (pgiTargetDoc && this.loadedDelivery.salesOrderNumber !== pgiTargetDoc) {
          btnPgi.disabled = false;
          const validation = scenarioEngine.validatePostGoodsIssue(this.loadedDelivery.deliveryNumber, this.loadedDelivery);
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: validation.mentorSpeech,
            whatHappened: validation.whatHappened,
            why: validation.why,
            businessImpact: validation.businessImpact,
            onConfirm: () => this.render()
          });
          return;
        }
        // Executa PGI no banco
        const result = db.postGoodsIssue(this.loadedDelivery.deliveryNumber);

        if (!result.success) {
          btnPgi.disabled = false;
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: `Atenção: Falha ao registrar Saída de Mercadorias. Motivo: ${result.error}`,
            whatHappened: result.error,
            why: 'O sistema bloqueou a baixa por duplicidade ou inconsistência no documento.',
            businessImpact: 'A baixa de estoque não foi processada.',
            onConfirm: () => { this.render(); }
          });
          return;
        }

        // Validação no ScenarioEngine
        const validation = scenarioEngine.validatePostGoodsIssue(this.loadedDelivery.deliveryNumber, result.delivery);

        if (validation.isValid) {
          MentorDockComponent.speak(`Saída de mercadorias (PGI) da remessa ${this.loadedDelivery.deliveryNumber} contabilizada. Estoque baixado e remessa liberada para faturamento.`, 'SUCCESS');
        }

        diagnosticModal.show({
          isValid: validation.isValid,
          operationSummary: validation.isValid ? {
            title: 'Saída de Mercadorias (PGI) Contabilizada',
            docTypeBadge: 'LIKP / MKPF • Movimento MM 601',
            primaryLabel: 'Nº da Remessa Atualizada:',
            primaryNumber: this.loadedDelivery.deliveryNumber,
            secondaryLabel: 'Doc. Material MM (Mov. 601):',
            secondaryNumber: result.materialDocNumber || 'Contabilizado',
            statusText: 'Baixa de Estoque Concluída (COMPLETED)',
            referenceDoc: `Ordem Vinculada: ${Formatters.documentNumber(this.loadedDelivery.salesOrderNumber)}`,
            inspectLabel: `Inspecionar Remessa [${this.loadedDelivery.deliveryNumber}] em VL03N`
          } : null,
          mentorSpeech: validation.mentorSpeech,
          whatHappened: validation.whatHappened,
          why: validation.why,
          businessImpact: validation.businessImpact,
          onConfirm: () => {
            const scenario = scenarioEngine.getActiveScenario();
            const action = scenario?.targetCriteria?.action;
            if (action === 'CREATE_INVOICE' || action === 'FULL_O2C') {
              this.onNavigate('VF01', { deliveryNumber: this.loadedDelivery.deliveryNumber });
            } else {
              this.render();
            }
          },
          onInspect: () => {
            this.onNavigate('VL03N', { deliveryNumber: this.loadedDelivery.deliveryNumber });
          }
        });
      });
    }

    // 5. Navegação
    const btnVl01n = this.container.querySelector('#btn-goto-vl01n');
    if (btnVl01n) btnVl01n.addEventListener('click', () => this.onNavigate('VL01N'));

    const btnVl03n = this.container.querySelector('#btn-goto-vl03n');
    if (btnVl03n) btnVl03n.addEventListener('click', () => this.onNavigate('VL03N', { deliveryNumber: this.selectedDeliveryNumber }));

    const btnVa03 = this.container.querySelector('#btn-goto-va03');
    if (btnVa03 && this.loadedDelivery) {
      btnVa03.addEventListener('click', () => this.onNavigate('VA03', { docNumber: this.loadedDelivery.salesOrderNumber }));
    }
  }

  getElement() {
    return this.container;
  }
}