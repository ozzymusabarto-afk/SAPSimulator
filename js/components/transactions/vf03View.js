/**
 * NexusTech ERP • VF03 View Component
 * Transação de Exibição de Fatura Comercial & Fluxo Completo O2C (Display Billing Document)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { MentorDockComponent } from '../mentorDock.js';

export class Vf03ViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vf03-view';
    this.selectedInvoiceNumber = ''; // Lote D+E: não pré-preencher via initialParams
    this.currentScenarioId = null;   // Lote D: guard de cenário
  }

  resetForm() {
    // Lote D: limpa estado ao mudar de missão
    this.selectedInvoiceNumber = '';
  }

  setParams(params = {}) {
    // A inspeção contextual de uma fatura criada nesta sessão pode carregar seu documento.
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }
    this.selectedInvoiceNumber = params.invoiceNumber || '';
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const invoiceAuditPending = scenario?.objectives?.some(objective => objective.id === 'verify_invoice' && !objective.done);
    const activeScenarioId = scenario ? scenario.id : null;

    // Lote D: guard de cenário
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    // Lote B: completeObjective('verify_invoice') e ('verify_document_flow') REMOVIDOS do render().
    // Serão disparados no bindEvents apenas após seleção manual de uma fatura.

    const allInvoices = db.getAllInvoices();
    // Lote C: remove auto-carregamento — exibe estado vazio enquanto trainee não localizar manualmente
    const currentInvoice = this.selectedInvoiceNumber ? db.getInvoice(this.selectedInvoiceNumber) : null;

    const customer = currentInvoice ? db.getCustomer(currentInvoice.customerId) : null;
    const order = currentInvoice ? db.getSalesOrder(currentInvoice.salesOrderNumber) : null;
    const delivery = currentInvoice?.deliveryNumber ? db.getDelivery(currentInvoice.deliveryNumber) : null;
    const matDoc = order?.documentFlow?.find(f => f.type === 'MATERIAL_DOC');

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VF03</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Exibir Documento de Faturamento (Display Billing Document)</div>
            <div class="text-xs text-muted">Auditoria de Escrituração Fiscal, Impostos & Fluxo Completo Order-to-Cash (VBFA)</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-vf01">
            ${Icons.fileText} Nova Fatura (VF01)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-vf02">
            ${Icons.edit} Modificar Fatura (VF02)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-va03">
            ${Icons.layers} Ordem (VA03)
          </button>
        </div>
      </div>

      ${currentInvoice ? `
        <!-- Barra de Seleção de Fatura -->
        <div class="transaction-selection-bar">
          <div class="transaction-selection-group">
            <span class="transaction-selection-label">Selecionar Fatura (VBRK):</span>
            <select class="erp-select font-mono text-xs" id="invoice-selector" style="padding: 4px 10px; max-width: 100%; min-width: 0;">
              ${(() => {
                // F2-A: Filtra faturas pelo cenário ativo
                const scenario = scenarioEngine.getActiveScenario();
                const scenarioOrderNums = (scenario?.initialDocuments || []).map(d => d.salesOrderNumber).filter(Boolean);
                const eligible = scenarioOrderNums.length > 0
                  ? allInvoices.filter(inv => scenarioOrderNums.includes(inv.salesOrderNumber))
                  : allInvoices;
                if (eligible.length === 0) {
                  return '<option value="" disabled>Nenhuma fatura disponível</option>';
                }
                return eligible.map(inv => `
                  <option value="${inv.invoiceNumber}" ${inv.invoiceNumber === currentInvoice.invoiceNumber ? 'selected' : ''}>
                    Fatura ${inv.invoiceNumber} - ${inv.customerId} (${Formatters.currency(inv.totalValue)})
                  </option>
                `).join('');
              })()}
            </select>
          </div>
          <div class="text-xs text-muted font-mono">
            Status Contábil: <span class="font-bold text-success">Lançado em FI</span>
          </div>
        </div>

        <!-- Cabeçalho do Documento -->
        <div class="transaction-section">
          <div class="section-title">
            <span>Dados da Fatura Comercial Selecionada</span>
            <span class="erp-badge erp-badge-sap text-xs">Fatura Comercial (F2)</span>
          </div>

          <div class="form-grid-4">
            <div>
              <div class="text-xs text-muted">Número da Fatura (VBELN):</div>
              <div class="font-mono text-base font-bold text-primary">
                ${Formatters.documentNumber(currentInvoice.invoiceNumber)}
              </div>
            </div>

            <div>
              <div class="text-xs text-muted">Pagador / Destinatário:</div>
              <div class="font-semibold text-sm">
                ${currentInvoice.customerId} - ${customer?.name || ''}
              </div>
            </div>

            <div>
              <div class="text-xs text-muted">Valor Total Faturado:</div>
              <div class="font-mono text-base font-bold text-success">
                ${Formatters.currency(currentInvoice.totalValue)}
              </div>
            </div>

            <div>
              <div class="text-xs text-muted">Status do Documento:</div>
              <div>
                ${currentInvoice.status === 'COMPLETED' 
                  ? `<span class="erp-badge erp-badge-success">${Icons.check} Faturado & Contabilizado</span>` 
                  : `<span class="erp-badge erp-badge-danger">${Icons.alertTriangle} Cancelado / Estornado</span>`}
              </div>
            </div>
          </div>

          <div class="form-grid-4" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
            <div>
              <div class="text-xs text-muted">Tipo de Faturamento:</div>
              <div class="font-mono text-sm font-semibold">${currentInvoice.billingType} - Fatura Comercial / NF</div>
            </div>
            <div>
              <div class="text-xs text-muted">Data de Emissão:</div>
              <div class="font-mono text-sm">${new Date(currentInvoice.billingDate).toLocaleDateString('pt-BR')}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Condição de Pagamento:</div>
              <div class="font-mono text-sm font-bold text-primary">${currentInvoice.paymentTerms}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Incoterms:</div>
              <div class="font-mono text-sm">${currentInvoice.incoterms}</div>
            </div>
          </div>
        </div>

        <!-- Posições Faturadas e Grade Tributária -->
        <div class="transaction-section">
          <div class="section-title">
            <span>Posições Faturadas & Impostos Incidentes</span>
            <span class="text-xs text-muted">${currentInvoice.items.length} itens</span>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Preço Unit (PR00)</th>
                  <th>Desconto (RB00)</th>
                  <th>Base Líquida</th>
                  <th>ICMS (18%)</th>
                  <th>PIS/COFINS (9.25%)</th>
                  <th>Total Faturado</th>
                </tr>
              </thead>
              <tbody>
                ${currentInvoice.items.map((it, idx) => `
                  <tr>
                    <td class="font-mono font-bold text-center">${it.itemPosition || (idx + 1) * 10}</td>
                    <td>
                      <div class="font-semibold font-mono text-primary">${it.materialId}</div>
                      <div class="text-xs text-muted">${it.description}</div>
                    </td>
                    <td class="font-mono font-bold text-center">${it.quantity} ${it.unit}</td>
                    <td class="font-mono text-right">${Formatters.currency(it.unitPrice)}</td>
                    <td class="font-mono text-center text-danger">${it.discountPercent > 0 ? `${it.discountPercent}% (-${Formatters.currency(it.discountValue)})` : '-'}</td>
                    <td class="font-mono text-right font-semibold">${Formatters.currency(it.netValue)}</td>
                    <td class="font-mono text-right text-xs">${Formatters.currency(it.taxValue * (0.18 / 0.2725))}</td>
                    <td class="font-mono text-right text-xs">${Formatters.currency(it.taxValue * (0.0925 / 0.2725))}</td>
                    <td class="font-mono text-right font-bold text-success">${Formatters.currency(it.totalValue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totalizador -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div class="text-xs text-muted">
              Observações Fiscais: <span class="font-mono text-navy-900">${currentInvoice.fiscalNotes || 'Nenhuma observação informada.'}</span>
            </div>
            <div style="text-align: right;">
              <span class="text-xs text-muted">Valor Total da Fatura:</span>
              <span class="font-mono text-lg font-bold text-success" style="margin-left: 8px;">
                ${Formatters.currency(currentInvoice.totalValue)}
              </span>
            </div>
          </div>
        </div>

        <!-- Fluxo de Documentos Completo (VBFA) -->
        <div class="transaction-section">
          <div class="section-title">
            <span>Fluxo Completo de Documentos Comerciais (Order-to-Cash • Tabela VBFA)</span>
            <span class="erp-badge erp-badge-sap text-xs">Cadeia Ponta a Ponta SD</span>
          </div>

          <div class="doc-flow-tree">
            
            <!-- Etapa 1: Ordem de Venda -->
            <div class="doc-flow-node active">
              <div class="doc-flow-info">
                <span class="erp-badge erp-badge-primary">1. Ordem de Venda (VA01/VA03)</span>
                <span class="doc-flow-number font-mono">Doc: ${Formatters.documentNumber(currentInvoice.salesOrderNumber)}</span>
                <span class="text-xs text-muted">Ordem Comercial Aprovada</span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span class="erp-badge erp-badge-success">${Icons.check} Concluído</span>
                <button class="btn btn-secondary btn-xs btn-nav-va03" data-order="${currentInvoice.salesOrderNumber}">
                  ${Icons.search} Ver VA03
                </button>
              </div>
            </div>

            <!-- Etapa 2: Remessa / Fornecimento -->
            ${currentInvoice.deliveryNumber ? `
              <div class="doc-flow-node active">
                <div class="doc-flow-info">
                  <span class="erp-badge erp-badge-primary">2. Remessa / Fornecimento (VL01N/VL03N)</span>
                  <span class="doc-flow-number font-mono">Doc: ${currentInvoice.deliveryNumber}</span>
                  <span class="text-xs text-muted">Separação e Picking Concluídos</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span class="erp-badge erp-badge-success">${Icons.check} Concluído</span>
                  <button class="btn btn-secondary btn-xs btn-nav-vl03n" data-del="${currentInvoice.deliveryNumber}">
                    ${Icons.search} Ver VL03N
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Etapa 3: Documento de Material MM (PGI) -->
            ${matDoc ? `
              <div class="doc-flow-node active">
                <div class="doc-flow-info">
                  <span class="erp-badge erp-badge-success">3. Documento de Material MM (VL02N / Mov. 601)</span>
                  <span class="doc-flow-number font-mono">Doc: ${matDoc.number}</span>
                  <span class="text-xs text-muted">Saída de Mercadorias e Baixa Física</span>
                </div>
                <div>
                  <span class="erp-badge erp-badge-success">${Icons.check} Contabilizado</span>
                </div>
              </div>
            ` : ''}

            <!-- Etapa 4: Fatura Comercial -->
            <div class="doc-flow-node active">
              <div class="doc-flow-info">
                <span class="erp-badge erp-badge-success">4. Fatura Comercial / Nota Fiscal (VF01/VF03)</span>
                <span class="doc-flow-number font-mono">Doc: ${Formatters.documentNumber(currentInvoice.invoiceNumber)}</span>
                <span class="text-xs text-muted">Escrituração Fiscal e Financeira Concluída</span>
              </div>
              <div>
                <span class="erp-badge erp-badge-success">${Icons.check} Escriturado</span>
              </div>
            </div>

          </div>
        </div>
        ${invoiceAuditPending ? `
          <div style="margin: 14px 0; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary btn-sm" id="btn-confirm-invoice-audit">
              ${Icons.check} Confirmar análise da fatura
            </button>
          </div>
        ` : ''}
      ` : `
        <div class="erp-card" style="text-align: center; padding: 40px 16px;">
          <p class="text-muted" style="margin-bottom: 12px;">Nenhuma fatura comercial emitida no momento.</p>
          <button class="btn btn-primary btn-sm" id="btn-goto-vf01-empty">
            ${Icons.play} Ir para VF01 Criar Fatura
          </button>
        </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const sel = this.container.querySelector('#invoice-selector');
    if (sel) {
      sel.addEventListener('change', (e) => {
        this.selectedInvoiceNumber = e.target.value;
        // Selecionar carrega os dados; a trainee confirma a auditoria após inspecionar o fluxo.
        this.render();
      });
    }

    const btnConfirmAudit = this.container.querySelector('#btn-confirm-invoice-audit');
    if (btnConfirmAudit) {
      btnConfirmAudit.addEventListener('click', () => {
        const result = scenarioEngine.validateInvoiceVerification(this.selectedInvoiceNumber);
        if (!result.isValid) {
          MentorDockComponent.speak(result.mentorSpeech, 'WARN');
          return;
        }
        MentorDockComponent.speak(result.mentorSpeech, 'SUCCESS');
        this.render();
      });
    }

    const btnVf01 = this.container.querySelector('#btn-goto-vf01');
    if (btnVf01) btnVf01.addEventListener('click', () => this.onNavigate('VF01'));

    const btnVf01Empty = this.container.querySelector('#btn-goto-vf01-empty');
    if (btnVf01Empty) btnVf01Empty.addEventListener('click', () => this.onNavigate('VF01'));

    const btnVf02 = this.container.querySelector('#btn-goto-vf02');
    if (btnVf02) btnVf02.addEventListener('click', () => this.onNavigate('VF02', { invoiceNumber: this.selectedInvoiceNumber }));

    const btnVa03 = this.container.querySelector('#btn-goto-va03');
    if (btnVa03) {
      const inv = db.getInvoice(this.selectedInvoiceNumber);
      btnVa03.addEventListener('click', () => this.onNavigate('VA03', { docNumber: inv?.salesOrderNumber }));
    }

    const btnNavVa03 = this.container.querySelector('.btn-nav-va03');
    if (btnNavVa03) {
      btnNavVa03.addEventListener('click', () => {
        const orderNum = btnNavVa03.getAttribute('data-order');
        this.onNavigate('VA03', { docNumber: orderNum });
      });
    }

    const btnNavVl03n = this.container.querySelector('.btn-nav-vl03n');
    if (btnNavVl03n) {
      btnNavVl03n.addEventListener('click', () => {
        const delNum = btnNavVl03n.getAttribute('data-del');
        this.onNavigate('VL03N', { deliveryNumber: delNum });
      });
    }
  }

  getElement() {
    return this.container;
  }
}
