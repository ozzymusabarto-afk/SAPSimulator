/**
 * NexusTech ERP • VA03 View Component
 * Transação de Exibição de Ordem & Fluxo de Documentos (Document Flow)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';

export class Va03ViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'va03-view';
    this.selectedDocNumber = initialParams.docNumber || '10000001';
  }

  setParams(params = {}) {
    if (params.docNumber) {
      this.selectedDocNumber = params.docNumber;
      this.render();
    }
  }

  render() {
    const orders = db.getAllSalesOrders();
    const currentOrder = db.getSalesOrder(this.selectedDocNumber) || orders[orders.length - 1] || null;

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VA03</span>
          <div>
            <div class="transaction-title">Exibir Ordem do Cliente: Fluxo de Documentos & Status</div>
            <div class="text-xs text-muted">Acompanhamento do Processo de Ponta a Ponta</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-va01">
            ${Icons.fileText} Criar Nova Ordem (VA01)
          </button>
        </div>
      </div>

      ${currentOrder ? `
        <!-- Seletor de Ordem e Resumo do Documento -->
        <div class="transaction-section">
          <div class="section-title">
            <span>Dados da Ordem de Venda Selecionada</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="text-xs text-muted">Selecionar Ordem:</span>
              <select class="erp-select font-mono text-xs" id="order-selector" style="padding: 2px 8px;">
                ${orders.map(o => `
                  <option value="${o.docNumber}" ${o.docNumber === currentOrder.docNumber ? 'selected' : ''}>
                    Ordem ${Formatters.documentNumber(o.docNumber)} - ${o.customerId} (${Formatters.currency(o.totalValue)})
                  </option>
                `).join('')}
              </select>
            </div>
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
            <div class="doc-flow-node ${currentOrder.overallStatus === 'CREDIT_BLOCKED' ? '' : 'active'}">
              <div class="doc-flow-info">
                <span class="erp-badge ${currentOrder.overallStatus === 'CREDIT_BLOCKED' ? 'erp-badge-code' : 'erp-badge-primary'}">
                  2. Remessa / Fornecimento (VL01N)
                </span>
                <span class="doc-flow-number font-mono">
                  ${currentOrder.overallStatus === 'CREDIT_BLOCKED' ? 'Bloqueado no Picking' : 'Doc: 80000104'}
                </span>
              </div>
              <div>
                ${currentOrder.overallStatus === 'CREDIT_BLOCKED' 
                  ? `<span class="erp-badge erp-badge-danger">${Icons.lock} Aguardando Liberação VKM1</span>` 
                  : `<span class="erp-badge erp-badge-primary">${Icons.clock} Pronto para Expedição</span>`}
              </div>
            </div>

            <!-- Etapa 3: Fatura Comercial -->
            <div class="doc-flow-node">
              <div class="doc-flow-info">
                <span class="erp-badge erp-badge-code">3. Fatura / Nota Fiscal (VF01)</span>
                <span class="doc-flow-number font-mono">-</span>
              </div>
              <div>
                <span class="erp-badge erp-badge-code">Não Faturado</span>
              </div>
            </div>

          </div>
        </div>
      ` : `
        <div class="erp-card" style="text-align: center; padding: 32px;">
          <p class="text-muted" style="margin-bottom: 12px;">Nenhuma ordem de venda emitida no momento.</p>
          <button class="btn btn-primary btn-sm" id="btn-goto-va01-empty">
            ${Icons.play} Ir para VA01 Criar Ordem
          </button>
        </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const sel = this.container.querySelector('#order-selector');
    if (sel) {
      sel.addEventListener('change', (e) => {
        this.selectedDocNumber = e.target.value;
        this.render();
      });
    }

    const btn1 = this.container.querySelector('#btn-goto-va01');
    if (btn1) btn1.addEventListener('click', () => this.onNavigate('VA01'));

    const btn2 = this.container.querySelector('#btn-goto-va01-empty');
    if (btn2) btn2.addEventListener('click', () => this.onNavigate('VA01'));
  }

  getElement() {
    return this.container;
  }
}
