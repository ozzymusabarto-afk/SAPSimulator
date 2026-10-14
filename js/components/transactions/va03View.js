/**
 * NexusTech ERP • VA03 View Component
 * Transação de Exibição de Ordem & Fluxo de Documentos (Document Flow)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { MentorDockComponent } from '../mentorDock.js';

export class Va03ViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'va03-view';
    this.selectedDocNumber = initialParams.docNumber || '';
    this.searchError = '';
  }

  setParams(params = {}) {
    const activeScenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = activeScenario ? activeScenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.selectedDocNumber = '';
      this.searchError = '';
      this.currentScenarioId = activeScenarioId;
    }
    this.selectedDocNumber = params.docNumber || '';
    this.searchError = '';
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.currentScenarioId = activeScenarioId;
      this.selectedDocNumber = '';
      this.searchError = '';
    }

    const currentOrder = this.selectedDocNumber ? db.getSalesOrder(this.selectedDocNumber) : null;

    const deliveryFlow = currentOrder?.documentFlow?.find(f => f.type === 'DELIVERY');
    const matDocFlow = currentOrder?.documentFlow?.find(f => f.type === 'MATERIAL_DOC');
    const invoiceFlow = currentOrder?.documentFlow?.find(f => f.type === 'INVOICE');

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VA03</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Exibir Ordem do Cliente: Fluxo de Documentos & Status</div>
            <div class="text-xs text-muted">Acompanhamento do Processo de Ponta a Ponta (Document Flow • Tabela VBFA)</div>
          </div>
        </div>
        <div class="transaction-actions">
          ${currentOrder && !deliveryFlow && currentOrder.overallStatus !== 'CREDIT_BLOCKED' && currentOrder.overallStatus !== 'CANCELLED' ? `
            <button class="btn btn-primary btn-sm" id="btn-goto-vl01n-top">
              ${Icons.package} Criar Remessa (VL01N)
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" id="btn-goto-va01">
            ${Icons.fileText} Criar Nova Ordem (VA01)
          </button>
        </div>
      </div>

      <!-- Barra de Seleção de Ordem -->
      <div class="transaction-selection-bar">
        <div class="transaction-selection-group" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="transaction-selection-label">Ordem de Venda (VBELN):</span>
          <input type="text" id="va03-order-input" class="erp-input font-mono font-bold text-xs" placeholder="Ex: 10000007" value="${this.selectedDocNumber || ''}" style="width: 150px; text-transform: uppercase;" />
          <button class="btn btn-primary btn-sm" id="btn-search-order">
            ${Icons.search} Exibir
          </button>
        </div>
        <div class="text-xs text-muted font-mono">
          ${currentOrder ? `Status: <span class="font-bold text-primary">${currentOrder.overallStatus}</span>` : 'Acesso Inicial de Exibição'}
        </div>
      </div>

      ${this.searchError ? `
        <div class="erp-alert erp-alert-danger" style="margin: 12px 0; padding: 10px 14px; border-radius: 6px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 13px; display: flex; align-items: center; gap: 8px;">
          ${Icons.alertTriangle}
          <span>${this.searchError}</span>
        </div>
      ` : ''}

      ${!currentOrder ? `
        <div class="erp-card" style="text-align: center; padding: 48px 16px; background: #ffffff; margin-top: 16px; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 12px; font-size: 28px;">${Icons.fileText}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900); font-size: 16px; margin-bottom: 6px;">Nenhuma ordem de venda carregada para exibição</h4>
          <p class="text-xs text-muted" style="max-width: 520px; margin: 0 auto; line-height: 1.5;">
            Informe o número da ordem de venda (VBELN) no campo acima e clique em <strong>Exibir</strong> (ou pressione Enter) para visualizar o status do documento e o fluxo de documentos completo (Tabela VBFA).
          </p>
        </div>
      ` : `

        <!-- Resumo do Documento -->
        <div class="transaction-section">
          <div class="section-title">
            <span>Dados da Ordem de Venda Selecionada</span>
            <span class="erp-badge erp-badge-sap text-xs">Documento de Vendas (VBAK)</span>
          </div>

          <div class="form-grid-4">
            <div>
              <div class="text-xs text-muted">Número da Ordem (VBELN):</div>
              <div class="font-mono text-base font-bold text-primary">
                ${Formatters.documentNumber(currentOrder.docNumber)}
              </div>
            </div>

            <div>
              <div class="text-xs text-muted">Emissor da Ordem (KUNNR):</div>
              <div class="font-semibold text-sm">
                ${currentOrder.customerId} - ${db.getCustomer(currentOrder.customerId)?.name || ''}
              </div>
            </div>

            <div>
              <div class="text-xs text-muted">Valor Total da Ordem:</div>
              <div class="font-mono text-base font-bold text-success">
                ${Formatters.currency(currentOrder.totalValue)}
              </div>
            </div>

            <div>
              <div class="text-xs text-muted">Status Geral / Bloqueio:</div>
              <div>
                ${currentOrder.overallStatus === 'CREDIT_BLOCKED' 
                  ? `<span class="erp-badge erp-badge-danger">${Icons.lock} Bloqueado por Crédito (VKM1)</span>` 
                  : currentOrder.overallStatus === 'CANCELLED'
                  ? `<span class="erp-badge erp-badge-danger">${Icons.alertTriangle} Cancelado</span>`
                  : currentOrder.deliveryStatus === 'COMPLETED'
                  ? `<span class="erp-badge erp-badge-success">${Icons.check} Fornecimento Concluído</span>`
                  : `<span class="erp-badge erp-badge-success">${Icons.check} Aberto para Fornecimento</span>`}
              </div>
            </div>
          </div>
        </div>

        <!-- Fluxo de Documentos Interativo (Document Flow SD) -->
        <div class="transaction-section">
          <div class="section-title">
            <span>Fluxo de Documentos Comerciais (Document Flow)</span>
            <span class="erp-badge erp-badge-sap text-xs">Tabela VBFA</span>
          </div>

          <div class="doc-flow-tree">
            
            <!-- Etapa 1: Ordem de Venda -->
            <div class="doc-flow-node active">
              <div class="doc-flow-info">
                <span class="erp-badge erp-badge-primary">1. Ordem de Venda (OR)</span>
                <span class="doc-flow-number font-mono">Doc: ${Formatters.documentNumber(currentOrder.docNumber)}</span>
                <span class="text-xs text-muted">Data: ${Formatters.date()}</span>
              </div>
              <div>
                <span class="erp-badge erp-badge-success">${Icons.check} Concluído</span>
              </div>
            </div>

            <!-- Etapa 2: Fornecimento / Remessa -->
            <div class="doc-flow-node ${deliveryFlow ? 'active' : (currentOrder.overallStatus === 'CREDIT_BLOCKED' ? '' : 'active')}">
              <div class="doc-flow-info">
                <span class="erp-badge ${deliveryFlow ? 'erp-badge-primary' : (currentOrder.overallStatus === 'CREDIT_BLOCKED' ? 'erp-badge-code' : 'erp-badge-primary')}">
                  2. Remessa / Fornecimento (VL01N)
                </span>
                <span class="doc-flow-number font-mono">
                  ${deliveryFlow
                    ? `Doc: ${deliveryFlow.number}`
                    : (currentOrder.overallStatus === 'CREDIT_BLOCKED' ? 'Bloqueado no Picking' : 'Pendente de Criação (VL01N)')}
                </span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                ${deliveryFlow ? `
                  <span class="erp-badge ${deliveryFlow.status === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-warning'}">
                    ${deliveryFlow.status === 'COMPLETED' ? `${Icons.check} PGI Concluído` : `${Icons.clock} Em Aberto / Picking`}
                  </span>
                  <button class="btn btn-secondary btn-xs btn-open-delivery" data-del="${deliveryFlow.number}">
                    ${Icons.search} Ver VL03N
                  </button>
                ` : currentOrder.overallStatus === 'CREDIT_BLOCKED' ? `
                  <span class="erp-badge erp-badge-danger">${Icons.lock} Aguardando Liberação VKM1</span>
                ` : `
                  <span class="erp-badge erp-badge-primary">${Icons.clock} Pronto para Expedição</span>
                  <button class="btn btn-primary btn-xs" id="btn-flow-create-delivery">
                    ${Icons.package} Criar VL01N
                  </button>
                `}
              </div>
            </div>

            <!-- Etapa 3: Documento de Material MM (se PGI executado) -->
            ${matDocFlow ? `
              <div class="doc-flow-node active">
                <div class="doc-flow-info">
                  <span class="erp-badge erp-badge-success">3. Documento de Material MM (Mov. 601)</span>
                  <span class="doc-flow-number font-mono">Doc: ${matDocFlow.number}</span>
                  <span class="text-xs text-muted">Baixa de Estoque Realizada</span>
                </div>
                <div>
                  <span class="erp-badge erp-badge-success">${Icons.check} Contabilizado</span>
                </div>
              </div>
            ` : ''}

            <!-- Etapa 4: Fatura Comercial -->
            <div class="doc-flow-node ${invoiceFlow ? 'active' : ''}">
              <div class="doc-flow-info">
                <span class="erp-badge ${invoiceFlow ? 'erp-badge-primary' : 'erp-badge-code'}">
                  ${matDocFlow ? '4. Fatura / Nota Fiscal (VF01)' : '3. Fatura / Nota Fiscal (VF01)'}
                </span>
                <span class="doc-flow-number font-mono">${invoiceFlow ? `Doc: ${invoiceFlow.number}` : '-'}</span>
              </div>
              <div>
                <span class="erp-badge ${invoiceFlow ? 'erp-badge-success' : 'erp-badge-code'}">
                  ${invoiceFlow ? `${Icons.check} Faturado` : 'Não Faturado'}
                </span>
              </div>
            </div>

          </div>
        </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const searchInput = this.container.querySelector('#va03-order-input');
    const searchBtn = this.container.querySelector('#btn-search-order');

    const executeDisplayOrder = () => {
      const val = searchInput ? searchInput.value.trim() : '';
      if (!val) {
        this.searchError = 'Informe o número da ordem de venda (VBELN) para exibição.';
        this.selectedDocNumber = '';
        this.render();
        return;
      }

      const foundOrder = db.getSalesOrder(val);
      if (!foundOrder) {
        this.searchError = `Ordem de venda "${val}" não cadastrada no mandante 800.`;
        this.selectedDocNumber = '';
        this.render();
        return;
      }

      this.selectedDocNumber = foundOrder.docNumber;
      this.searchError = '';
      this.render();

      // Validação do objetivo da missão após a consulta bem-sucedida do trainee
      const scenario = scenarioEngine.getActiveScenario();
      if (scenario) {
        const result = scenarioEngine.validateSalesOrderInspection(foundOrder.docNumber);
        if (result?.mentorSpeech) {
          MentorDockComponent.speak(result.mentorSpeech, result.isValid ? 'SUCCESS' : 'WARN');
        }
      }
    };

    if (searchBtn) {
      searchBtn.addEventListener('click', executeDisplayOrder);
    }
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeDisplayOrder();
        }
      });
    }

    const btn1 = this.container.querySelector('#btn-goto-va01');
    if (btn1) btn1.addEventListener('click', () => this.onNavigate('VA01'));

    const btnTopVl01n = this.container.querySelector('#btn-goto-vl01n-top');
    if (btnTopVl01n) {
      btnTopVl01n.addEventListener('click', () => this.onNavigate('VL01N', { salesOrderNumber: this.selectedDocNumber }));
    }

    const btnFlowVl01n = this.container.querySelector('#btn-flow-create-delivery');
    if (btnFlowVl01n) {
      btnFlowVl01n.addEventListener('click', () => this.onNavigate('VL01N', { salesOrderNumber: this.selectedDocNumber }));
    }

    const btnOpenDel = this.container.querySelector('.btn-open-delivery');
    if (btnOpenDel) {
      btnOpenDel.addEventListener('click', () => {
        const delNum = btnOpenDel.getAttribute('data-del');
        this.onNavigate('VL03N', { deliveryNumber: delNum });
      });
    }
  }

  getElement() {
    return this.container;
  }
}
