/**
 * NexusTech ERP • VF02 View Component
 * Transação de Modificação de Fatura: Observações Fiscais & Estorno (Change Billing Document)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';

export class Vf02ViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vf02-view';
    this.selectedInvoiceNumber = ''; // Lote D+E: não pré-preencher via initialParams
    this.loadedInvoice = null;
    this.currentScenarioId = null;  // Lote D: guard de cenário
  }

  resetForm() {
    // Lote D: limpa estado ao mudar de missão
    this.selectedInvoiceNumber = '';
    this.loadedInvoice = null;
  }

  setParams(params = {}) {
    // Lote E: setParams não pré-preenche campos — DADO FORNECIDO NO CHAMADO ≠ DADO PREENCHIDO NA TELA.
    // Aceita navegação contextual de outro componente.
    if (params.invoiceNumber) {
      this.selectedInvoiceNumber = params.invoiceNumber;
    }
    this.render();
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;

    // Lote D: guard de cenário
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    const allInvoices = db.getAllInvoices();
    // Lote C: remove auto-carregamento — exibe estado vazio enquanto trainee não localizar manualmente
    if (this.selectedInvoiceNumber) {
      this.loadedInvoice = db.getInvoice(this.selectedInvoiceNumber);
    }

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VF02</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Modificar Documento de Faturamento (Change Billing Document)</div>
            <div class="text-xs text-muted">Manutenção de Dados de Cobrança, Observações Fiscais e Cancelamento • Tabela VBRK</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-vf01">
            ${Icons.fileText} Nova Fatura (VF01)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-vf03">
            ${Icons.search} Exibir Fatura (VF03)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-va03">
            ${Icons.layers} Ordem Origem (VA03)
          </button>
        </div>
      </div>

      <!-- Seletor de Fatura -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Identificação da Fatura Comercial</span>
          <span class="erp-badge erp-badge-sap text-xs">Área de Vendas 1000/10/01</span>
        </div>

        <div class="form-grid-3" style="align-items: flex-end;">
          <div style="grid-column: span 2;">
            <label class="form-label">Número da Fatura (Billing Document):</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="erp-input font-mono font-bold" id="vf02-invoice-input" 
                placeholder="Ex: 90000001" value="${this.selectedInvoiceNumber}" style="flex: 1; min-width: 0;">
              <select class="erp-select font-mono text-xs" id="vf02-invoice-quick-select" style="max-width: 260px;">
                <option value="">-- Selecionar Fatura --</option>
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
                    <option value="${inv.invoiceNumber}" ${inv.invoiceNumber === this.selectedInvoiceNumber ? 'selected' : ''}>
                      Fatura ${inv.invoiceNumber} • OR ${inv.salesOrderNumber} (${inv.status})
                    </option>
                  `).join('');
                })()}
              </select>
            </div>
          </div>

          <div>
            <button class="btn btn-primary" id="btn-load-invoice" style="width: 100%;">
              ${Icons.search} Carregar Fatura
            </button>
          </div>
        </div>
      </div>

      <!-- Dados da Fatura Carregada -->
      ${this.loadedInvoice ? `
        <div class="transaction-section">
          <div class="section-title">
            <span>Fatura nº ${Formatters.documentNumber(this.loadedInvoice.invoiceNumber)} • Tipo ${this.loadedInvoice.billingType}</span>
            <div style="display: flex; gap: 8px;">
              <span class="erp-badge ${this.loadedInvoice.status === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-danger'}">
                ${this.loadedInvoice.status === 'COMPLETED' ? `${Icons.check} Escriturada / Ativa` : `${Icons.alertTriangle} Estornada / Cancelada`}
              </span>
              <span class="erp-badge erp-badge-sap text-xs">Moeda BRL</span>
            </div>
          </div>

          <!-- Resumo de Cabeçalho -->
          <div class="form-grid-4" style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <div>
              <div class="text-xs text-muted">Destinatário da Fatura:</div>
              <div class="font-semibold text-sm font-mono">
                ${this.loadedInvoice.customerId} - ${db.getCustomer(this.loadedInvoice.customerId)?.name || ''}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Ordem / Remessa:</div>
              <div class="font-mono text-sm">Ordem ${this.loadedInvoice.salesOrderNumber} ${this.loadedInvoice.deliveryNumber ? `• Remessa ${this.loadedInvoice.deliveryNumber}` : ''}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Data de Faturamento:</div>
              <div class="font-mono text-sm">${new Date(this.loadedInvoice.billingDate).toLocaleDateString('pt-BR')}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Valor Total da Fatura:</div>
              <div class="font-mono text-sm font-bold text-success">${Formatters.currency(this.loadedInvoice.totalValue)}</div>
            </div>
          </div>

          <!-- Observações Fiscais Editáveis -->
          <div style="margin-bottom: 16px;">
            <label class="form-label">Observações Fiscais / Texto de Cabeçalho:</label>
            <input type="text" class="erp-input font-mono text-sm" id="vf02-notes-input" 
              value="${this.loadedInvoice.fiscalNotes || ''}" 
              ${this.loadedInvoice.status === 'CANCELLED' ? 'disabled' : ''} style="width: 100%;">
          </div>

          <!-- Tabela de Itens Faturados -->
          <div class="section-title">
            <span>Posições Faturadas</span>
            <span class="text-xs text-muted">${this.loadedInvoice.items.length} posições</span>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Preço Unit</th>
                  <th>Base Líquida</th>
                  <th>Impostos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${this.loadedInvoice.items.map((it, idx) => `
                  <tr>
                    <td class="font-mono font-bold text-center">${it.itemPosition || (idx + 1) * 10}</td>
                    <td>
                      <div class="font-semibold font-mono text-primary">${it.materialId}</div>
                      <div class="text-xs text-muted">${it.description}</div>
                    </td>
                    <td class="font-mono font-bold text-center">${it.quantity} ${it.unit}</td>
                    <td class="font-mono text-right">${Formatters.currency(it.unitPrice)}</td>
                    <td class="font-mono text-right font-semibold">${Formatters.currency(it.netValue)}</td>
                    <td class="font-mono text-right text-xs">${Formatters.currency(it.taxValue)}</td>
                    <td class="font-mono text-right font-bold text-success">${Formatters.currency(it.totalValue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Barra de Ações -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 20px; padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="flex: 1 1 auto;">
              ${this.loadedInvoice.status === 'COMPLETED' ? `
                <button class="btn btn-danger btn-sm" id="btn-cancel-invoice">
                  ${Icons.trash} Estornar Fatura (Cancelamento S1)
                </button>
              ` : `
                <span class="text-xs text-danger font-semibold">Esta fatura foi estornada e não permite novos lançamentos.</span>
              `}
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-primary" id="btn-save-notes" ${this.loadedInvoice.status === 'CANCELLED' ? 'disabled' : ''}>
                ${Icons.check} Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      ` : `
        <div class="erp-card" style="text-align: center; padding: 40px 16px; background: #ffffff;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 10px;">${Icons.fileText}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900);">Nenhuma fatura carregada</h4>
          <p class="text-xs text-muted" style="margin-top: 4px; max-width: 500px; margin-left: auto; margin-right: auto;">
            Informe o número da Fatura no campo acima ou gere um novo faturamento na transação VF01.
          </p>
        </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const btnLoad = this.container.querySelector('#btn-load-invoice');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        const invInput = this.container.querySelector('#vf02-invoice-input');
        this.selectedInvoiceNumber = invInput ? invInput.value.trim() : '';

        if (!this.selectedInvoiceNumber) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: 'Atenção: Digite o número da fatura que deseja modificar.',
            whatHappened: 'Nenhum número de fatura digitado.',
            why: 'A transação VF02 necessita do identificador do documento.',
            businessImpact: 'Impossível localizar o registro.'
          });
          return;
        }

        const inv = db.getInvoice(this.selectedInvoiceNumber);
        if (!inv) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: `Atenção: A Fatura nº ${this.selectedInvoiceNumber} não foi encontrada.`,
            whatHappened: `Fatura ${this.selectedInvoiceNumber} inexistente.`,
            why: 'O documento precisa ter sido emitido na transação VF01.',
            businessImpact: 'Documento inexistente.'
          });
          return;
        }

        this.loadedInvoice = inv;
        this.render();
      });
    }

    const quickSel = this.container.querySelector('#vf02-invoice-quick-select');
    if (quickSel) {
      quickSel.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectedInvoiceNumber = e.target.value;
          this.loadedInvoice = db.getInvoice(e.target.value);
          this.render();
        }
      });
    }

    const btnSaveNotes = this.container.querySelector('#btn-save-notes');
    if (btnSaveNotes && this.loadedInvoice) {
      btnSaveNotes.addEventListener('click', () => {
        const notesInput = this.container.querySelector('#vf02-notes-input');
        if (notesInput) {
          db.updateInvoice(this.loadedInvoice.invoiceNumber, { fiscalNotes: notesInput.value });
          diagnosticModal.show({
            isValid: true,
            mentorSpeech: `Alterações gravadas com sucesso na Fatura Comercial nº ${this.loadedInvoice.invoiceNumber}.`,
            whatHappened: 'Observações fiscais atualizadas.',
            why: 'Dados complementares integrados à nota fiscal.',
            businessImpact: 'O departamento fiscal e contábil receberá a anotação atualizada.',
            onConfirm: () => this.render()
          });
        }
      });
    }

    const btnCancelInv = this.container.querySelector('#btn-cancel-invoice');
    if (btnCancelInv && this.loadedInvoice) {
      btnCancelInv.addEventListener('click', () => {
        const result = db.cancelInvoice(this.loadedInvoice.invoiceNumber, 'Estorno manual via VF02');
        if (result.success) {
          diagnosticModal.show({
            isValid: true,
            mentorSpeech: `Fatura nº ${this.loadedInvoice.invoiceNumber} estornada com sucesso. O status da ordem foi reaberto para novo faturamento.`,
            whatHappened: `Estorno fiscal concluído para o documento ${this.loadedInvoice.invoiceNumber}.`,
            why: 'Cancelamento efetuado com geração de registro de estorno S1.',
            businessImpact: 'O título de cobrança no Contas a Receber foi cancelado.',
            onConfirm: () => this.render()
          });
        }
      });
    }

    const btnVf01 = this.container.querySelector('#btn-goto-vf01');
    if (btnVf01) btnVf01.addEventListener('click', () => this.onNavigate('VF01'));

    const btnVf03 = this.container.querySelector('#btn-goto-vf03');
    if (btnVf03) btnVf03.addEventListener('click', () => this.onNavigate('VF03', { invoiceNumber: this.selectedInvoiceNumber }));

    const btnVa03 = this.container.querySelector('#btn-goto-va03');
    if (btnVa03 && this.loadedInvoice) {
      btnVa03.addEventListener('click', () => this.onNavigate('VA03', { docNumber: this.loadedInvoice.salesOrderNumber }));
    }
  }

  getElement() {
    return this.container;
  }
}
