/**
 * NexusTech ERP • VF01 View Component
 * Transação de Criação de Documento de Faturamento / Nota Fiscal (Create Billing Document)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { MentorDockComponent } from '../mentorDock.js';

export class Vf01ViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vf01-view';
    this.selectedBillingType = 'F2';
    this.selectedDeliveryNumber = '';   // Lote A + E: não pré-preencher via initialParams
    this.selectedSalesOrderNumber = ''; // Lote A + E: não pré-preencher via initialParams
    this.billingDate = new Date().toISOString().split('T')[0];
    this.loadedDelivery = null;
    this.loadedOrder = null;
    this.currentScenarioId = null;
    this.savedInvoiceNumber = null; // Lote A: número da fatura criada nesta instância (null = ainda não criada)
  }

  resetForm() {
    this.selectedBillingType = 'F2';
    this.selectedDeliveryNumber = '';
    this.selectedSalesOrderNumber = '';
    this.billingDate = new Date().toISOString().split('T')[0];
    this.loadedDelivery = null;
    this.loadedOrder = null;
    this.savedInvoiceNumber = null; // Nova missão: nenhuma fatura ainda criada
  }

  setParams(params = {}) {
    // Lote E: setParams não pré-preenche campos — o trainee deve localizar o documento manualmente.
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

    // ── Guard pós-criação ───────────────────────────────────────────────────
    // Quando savedInvoiceNumber está preenchido, a fatura já foi criada nesta
    // instância/missão. Renderiza tela de confirmação antes do formulário.
    if (this.savedInvoiceNumber !== null) {
      return this._renderInvoiceConfirmed();
    }
    // ── Fim do guard pós-criação ────────────────────────────────────────────

    // Lote B: completeObjective('access_vf01') removido do render() —
    // será disparado apenas após a remessa ser localizada manualmente (no handler do btn-load-billing-doc).

    const allDeliveries = db.getAllDeliveries();
    const allOrders = db.getAllSalesOrders();

    if (this.selectedDeliveryNumber) {
      this.loadedDelivery = db.getDelivery(this.selectedDeliveryNumber);
      if (this.loadedDelivery) {
        this.loadedOrder = db.getSalesOrder(this.loadedDelivery.salesOrderNumber);
      }
    } else if (this.selectedSalesOrderNumber) {
      this.loadedOrder = db.getSalesOrder(this.selectedSalesOrderNumber);
    }

    const isPgiPending = this.loadedDelivery && (this.loadedDelivery.status !== 'COMPLETED' && this.loadedDelivery.goodsIssueStatus !== 'COMPLETED');

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VF01</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Criar Documento de Faturamento (Billing Document)</div>
            <div class="text-xs text-muted">Faturamento Comercial de Vendas (SD-BIL) & Integração com Contas a Receber (FI-AR) • Tabela VBRK / VBRP</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-vf03">
            ${Icons.search} Consultar Faturas (VF03)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-vl02n">
            ${Icons.package} Saída de Mercadorias (VL02N)
          </button>
        </div>
      </div>

      <!-- Seção 1: Parâmetros Iniciais de Faturamento -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Critérios de Seleção para Emissão da Fatura</span>
          <span class="erp-badge erp-badge-sap text-xs">Faturamento com Base na Remessa</span>
        </div>

        <div class="form-grid-4" style="align-items: flex-end;">
          <div>
            <label class="form-label">
              <span>Tipo de Faturamento (Billing Type):</span>
              <button type="button" class="erp-field-help-btn" data-help-id="billingType" title="F1 - Ajuda do Campo">?</button>
            </label>
            <select class="erp-select font-mono" id="vf01-billing-type" data-help-id="billingType">
              <option value="F2" ${this.selectedBillingType === 'F2' ? 'selected' : ''}>F2 - Fatura Comercial / Nota Fiscal</option>
              <option value="S1" ${this.selectedBillingType === 'S1' ? 'selected' : ''}>S1 - Estorno de Fatura Comercial</option>
            </select>
          </div>

          <div>
            <label class="form-label">Data de Faturamento:</label>
            <input type="date" class="erp-input font-mono" id="vf01-billing-date" value="${this.billingDate}">
          </div>

          <div>
            <label class="form-label">Nº da Remessa Precedente (LIKP):</label>
            <div style="display: flex; gap: 6px;">
              <input type="text" class="erp-input font-mono font-bold" id="vf01-delivery-input" 
                placeholder="Ex: 80000001" value="${this.selectedDeliveryNumber}" style="flex: 1; min-width: 0;">
              <select class="erp-select font-mono text-xs" id="vf01-delivery-quick-select" style="max-width: 140px;">
                <option value="">-- Remessas --</option>
                ${(() => {
                  // F2-A+B: Filtra por PGI realizado (status COMPLETED) e, se possível, pela OR do cenário ativo
                  const scenario = scenarioEngine.getActiveScenario();
                  const scenarioOrderNums = (scenario?.initialDocuments || []).map(d => d.salesOrderNumber).filter(Boolean);
                  const eligibleDeliveries = allDeliveries.filter(d => {
                    const hasPgi = d.status === 'COMPLETED' || d.goodsIssueStatus === 'COMPLETED';
                    if (!hasPgi) return false;
                    // Se o cenário tem ordens específicas, filtra por elas; senão exibe todas com PGI
                    if (scenarioOrderNums.length > 0) {
                      return scenarioOrderNums.includes(d.salesOrderNumber);
                    }
                    return true;
                  });
                  if (eligibleDeliveries.length === 0) {
                    return '<option value="" disabled>Nenhuma remessa com PGI disponível</option>';
                  }
                  return eligibleDeliveries.map(d => `
                    <option value="${d.deliveryNumber}" ${d.deliveryNumber === this.selectedDeliveryNumber ? 'selected' : ''}>
                      ${d.deliveryNumber} (PGI OK)
                    </option>
                  `).join('');
                })()}
              </select>
            </div>
          </div>

          <div>
            <button class="btn btn-primary" id="btn-load-billing-doc" style="width: 100%;">
              ${Icons.search} Carregar Documento
            </button>
          </div>
        </div>
      </div>

      <!-- Seção 2: Dados Carregados para Faturamento -->
      ${this.loadedOrder ? `
        <div class="transaction-section">
          <div class="section-title">
            <span>Dados da Fatura: Emissão para ${Formatters.documentNumber(this.loadedOrder.customerId)}</span>
            <div style="display: flex; gap: 8px;">
              ${isPgiPending ? `
                <span class="erp-badge erp-badge-danger">${Icons.alertTriangle} Bloqueio: PGI Não Registrado</span>
              ` : `
                <span class="erp-badge erp-badge-success">${Icons.check} Pronto para Faturamento</span>
              `}
              <span class="erp-badge erp-badge-sap text-xs">Tipo F2</span>
            </div>
          </div>

          ${isPgiPending ? `
            <div class="erp-card" style="padding: 14px; margin-bottom: 16px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #e11d48; font-size: 18px;">${Icons.alertTriangle}</span>
                  <div>
                    <div class="font-bold text-sm" style="color: #9f1239;">Bloqueio de Faturamento: Remessa Sem Saída de Mercadorias</div>
                    <div class="text-xs" style="color: #be123c; margin-top: 2px;">
                      A Remessa nº <strong>${this.selectedDeliveryNumber}</strong> não possui a Saída de Mercadorias (PGI / Mov. 601) contabilizada no armazém. No SAP SD, é estritamente proibido emitir a fatura sem a baixa física de estoque.
                    </div>
                  </div>
                </div>
                <button class="btn btn-danger btn-sm" id="btn-resolve-pgi" style="white-space: nowrap;">
                  ${Icons.package} Ir para VL02N Executar PGI
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Cabeçalho Fiscal e Financeiro -->
          <div class="form-grid-4" style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <div>
              <div class="text-xs text-muted">Destinatário da Fatura / Pagador:</div>
              <div class="font-semibold text-sm font-mono">
                ${this.loadedOrder.customerId} - ${db.getCustomer(this.loadedOrder.customerId)?.name || ''}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Condição de Pagamento:</div>
              <div class="font-mono text-sm font-bold text-primary">${this.loadedOrder.paymentTerms}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Incoterms / Frete:</div>
              <div class="font-mono text-sm">${this.loadedOrder.incoterms}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Ordem / Remessa de Origem:</div>
              <div class="font-mono text-sm">Ordem ${this.loadedOrder.docNumber} ${this.loadedDelivery ? `• Remessa ${this.loadedDelivery.deliveryNumber}` : ''}</div>
            </div>
          </div>

          <!-- Tabela de Itens Faturados -->
          <div class="section-title" style="margin-top: 12px;">
            <span>Posições da Fatura & Esquema Tributário (Pricing & Impostos)</span>
            <span class="text-xs text-muted">${this.loadedOrder.items.length} posições</span>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Material</th>
                  <th>Qtd Faturada</th>
                  <th>Preço Unit (PR00)</th>
                  <th>Desconto (RB00)</th>
                  <th>Valor Líquido</th>
                  <th>ICMS (18%)</th>
                  <th>PIS/COF (9.25%)</th>
                  <th>Total Posição</th>
                </tr>
              </thead>
              <tbody>
                ${this.loadedOrder.items.map((it, idx) => {
                  const mat = db.getMaterial(it.materialId);
                  const pr = db.getPricingRecord(it.materialId, this.loadedOrder.salesOrg, this.loadedOrder.distChannel, 'PR00');
                  const unitPrice = pr ? pr.amount : (mat ? mat.basePrice : 0);
                  const discountPct = Number(it.manualDiscountPercent) || 0;
                  const gross = unitPrice * it.quantity;
                  const discount = gross * (discountPct / 100);
                  const net = gross - discount;
                  const icms = net * 0.18;
                  const piscof = net * 0.0925;
                  const total = net + icms + piscof;

                  return `
                    <tr>
                      <td class="font-mono font-bold text-center">${(idx + 1) * 10}</td>
                      <td>
                        <div class="font-semibold font-mono text-primary">${it.materialId}</div>
                        <div class="text-xs text-muted">${mat ? mat.description : ''}</div>
                      </td>
                      <td class="font-mono font-bold text-center">${it.quantity} ${mat ? mat.baseUnit : 'UN'}</td>
                      <td class="font-mono text-right">${Formatters.currency(unitPrice)}</td>
                      <td class="font-mono text-center text-danger">${discountPct > 0 ? `${discountPct}% (-${Formatters.currency(discount)})` : '-'}</td>
                      <td class="font-mono text-right font-semibold">${Formatters.currency(net)}</td>
                      <td class="font-mono text-right text-xs">${Formatters.currency(icms)}</td>
                      <td class="font-mono text-right text-xs">${Formatters.currency(piscof)}</td>
                      <td class="font-mono text-right font-bold text-success">${Formatters.currency(total)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totais da Fatura e Ações -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-top: 20px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="flex: 1 1 300px; min-width: 0; max-width: 100%;">
              <div class="text-xs text-muted" style="margin-bottom: 4px;">OBSERVAÇÕES FISCAIS / CONTÁBEIS:</div>
              <input type="text" class="erp-input font-mono text-xs" id="vf01-fiscal-notes" 
                value="Fatura Comercial F2 emitida com integração contábil e fiscal automática." style="width: 100%; max-width: 500px; box-sizing: border-box;">
            </div>

            <div style="text-align: right; flex: 1 1 280px; min-width: 0;">
              <div class="text-xs text-muted" style="margin-bottom: 2px;">
                Base Líquida: <strong>${Formatters.currency(this.loadedOrder.netValue)}</strong> • Impostos (27.25%): <strong>${Formatters.currency(this.loadedOrder.taxValue)}</strong>
              </div>
              <div style="font-size: 18px; font-weight: 800; color: var(--erp-navy-900); margin-bottom: 12px; word-break: break-word;">
                VALOR TOTAL DA FATURA: <span style="color: var(--erp-green-success);">${Formatters.currency(this.loadedOrder.totalValue)}</span>
              </div>
              <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                <button class="btn btn-secondary" id="btn-cancel-billing">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-invoice" style="padding: 8px 24px; font-weight: 700;">
                  ${Icons.check} Gravar Fatura Comercial (Post)
                </button>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="erp-card" style="text-align: center; padding: 40px 16px; background: #ffffff;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 10px;">${Icons.fileText}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900);">Informe o documento de remessa para faturar</h4>
          <p class="text-xs text-muted" style="margin-top: 4px; max-width: 500px; margin-left: auto; margin-right: auto;">
            Digite o número da Remessa (ex: 80000001) ou selecione na lista suspensa e clique em "Carregar Documento" para apurar a base fiscal e gerar a Fatura Comercial F2.
          </p>
        </div>
      `}

      <!-- Guia Didático sobre VF01 / Billing -->
      <div class="erp-card" style="padding: 16px; margin-top: 20px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: var(--erp-blue-primary);">${Icons.info}</span>
          <span class="font-semibold text-xs text-navy-900" style="text-transform: uppercase;">O Fechamento do Ciclo Order-to-Cash (O2C) na Transação VF01</span>
        </div>
        <p class="text-xs text-muted" style="line-height: 1.5;">
          A transação <strong>VF01</strong> é o elo final do processo comercial no SAP SD. Ao emitir a Fatura Comercial (Tipo F2), o sistema encerra a remessa física, grava o documento contábil no Contas a Receber (FI-AR) e atualiza o status global da ordem para <strong>CONCLUÍDO (COMPLETED)</strong>.
        </p>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // Botões da tela de confirmação pós-criação
    const btnVf03C = this.container.querySelector('#btn-goto-vf03-confirmed');
    if (btnVf03C) {
      btnVf03C.addEventListener('click', () => this.onNavigate('VF03', { invoiceNumber: this.savedInvoiceNumber }));
    }
    const btnDashC = this.container.querySelector('#btn-goto-dashboard-confirmed');
    if (btnDashC) {
      btnDashC.addEventListener('click', () => this.onNavigate('DASHBOARD'));
    }

    // 1. Carregar Documento
    const btnLoad = this.container.querySelector('#btn-load-billing-doc');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        const delInput = this.container.querySelector('#vf01-delivery-input');
        const typeSelect = this.container.querySelector('#vf01-billing-type');
        const dateInput = this.container.querySelector('#vf01-billing-date');

        this.selectedDeliveryNumber = delInput ? delInput.value.trim() : '';
        this.selectedBillingType = typeSelect ? typeSelect.value : 'F2';
        this.billingDate = dateInput ? dateInput.value : this.billingDate;

        if (!this.selectedDeliveryNumber) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: 'Atenção: Informe o número da Remessa (LIKP) que deseja faturar na transação VF01.',
            whatHappened: 'Nenhum documento de remessa informado.',
            why: 'O faturamento no modelo padrão necessita do documento de remessa expedido.',
            businessImpact: 'Sem a remessa, não há comprovação física da entrega para amparar a emissão da nota.'
          });
          return;
        }

        const del = db.getDelivery(this.selectedDeliveryNumber);
        if (!del) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: `Atenção: A Remessa nº ${this.selectedDeliveryNumber} não foi encontrada. Verifique o número digitado ou consulte na VL03N.`,
            whatHappened: `Remessa ${this.selectedDeliveryNumber} inexistente.`,
            why: 'O documento precisa ter sido gerado na transação VL01N.',
            businessImpact: 'Não é possível faturar documento inexistente.'
          });
          return;
        }

        this.loadedDelivery = del;
        this.loadedOrder = db.getSalesOrder(del.salesOrderNumber);

        // Lote B: completeObjective disparado apenas após carga manual correta
        const scenario = scenarioEngine.getActiveScenario();
        if (scenario) {
          scenarioEngine.completeObjective('access_vf01');
        }

        this.render();
      });
    }

    // 2. Quick select de remessas
    const quickSel = this.container.querySelector('#vf01-delivery-quick-select');
    if (quickSel) {
      quickSel.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectedDeliveryNumber = e.target.value;
          this.loadedDelivery = db.getDelivery(e.target.value);
          if (this.loadedDelivery) {
            this.loadedOrder = db.getSalesOrder(this.loadedDelivery.salesOrderNumber);
          }
          this.render();
        }
      });
    }

    // 3. Botão Resolver PGI (atalho)
    const btnPgi = this.container.querySelector('#btn-resolve-pgi');
    if (btnPgi && this.loadedDelivery) {
      btnPgi.addEventListener('click', () => {
        this.onNavigate('VL02N', { deliveryNumber: this.loadedDelivery.deliveryNumber });
      });
    }

    // 4. Botão Gravar Fatura
    const btnSave = this.container.querySelector('#btn-save-invoice');
    if (btnSave && this.loadedOrder) {
      btnSave.addEventListener('click', () => {
        // Guard contra dupla criação no nível de lógica
        if (this.savedInvoiceNumber !== null) return;

        const notesInput = this.container.querySelector('#vf01-fiscal-notes');
        const notes = notesInput ? notesInput.value : '';

        const activeScenario = scenarioEngine.getActiveScenario();
        const invoiceTarget = activeScenario?.targetCriteria;
        const wrongBillingType = invoiceTarget?.billingType && this.selectedBillingType !== invoiceTarget.billingType;
        const wrongOrder = invoiceTarget?.targetDocNumber && this.loadedOrder.docNumber !== invoiceTarget.targetDocNumber;
        if (activeScenario && (wrongBillingType || wrongOrder)) {
          const validation = scenarioEngine.validateInvoiceCreation(
            this.selectedBillingType,
            this.selectedDeliveryNumber || this.loadedOrder.docNumber,
            { salesOrderNumber: this.loadedOrder.docNumber }
          );
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: validation.mentorSpeech,
            whatHappened: validation.whatHappened,
            why: validation.why,
            businessImpact: validation.businessImpact
          });
          return;
        }
        // Tenta criar fatura no erpDatabase
        const result = db.createInvoice({
          deliveryNumber: this.loadedDelivery ? this.loadedDelivery.deliveryNumber : null,
          salesOrderNumber: this.loadedOrder.docNumber,
          billingType: this.selectedBillingType,
          billingDate: this.billingDate,
          notes
        });

        if (!result.success) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: `Atenção: Não foi possível emitir o faturamento. Motivo: ${result.error}`,
            whatHappened: result.error,
            why: 'As regras de negócio do SAP SD impedem o faturamento antes da efetivação da Saída de Mercadorias (PGI).',
            businessImpact: 'A fatura não foi gerada para evitar inconsistências fiscais com o Fisco e com o cliente.'
          });
          return;
        }

        // Persiste o número da fatura criada — impede nova criação
        this.savedInvoiceNumber = result.invoice.invoiceNumber;

        // Validação no ScenarioEngine
        const validation = scenarioEngine.validateInvoiceCreation(this.selectedBillingType, this.selectedDeliveryNumber || this.loadedOrder.docNumber, result.invoice);

        if (validation.isValid) {
          MentorDockComponent.speak(`Fatura comercial ${result.invoice.invoiceNumber} emitida com sucesso. Ciclo Order-to-Cash concluído em conformidade fiscal.`, 'SUCCESS');
        }

        const refText = this.loadedDelivery
          ? `Remessa: ${this.loadedDelivery.deliveryNumber} • Ordem: ${Formatters.documentNumber(this.loadedOrder.docNumber)}`
          : `Ordem de Origem: ${Formatters.documentNumber(this.loadedOrder.docNumber)}`;

        diagnosticModal.show({
          isValid: validation.isValid,
          operationSummary: validation.isValid ? {
            title: 'Fatura Comercial Emitida com Sucesso',
            docTypeBadge: `VBRK / VBRP • Tipo ${this.selectedBillingType || 'F2'}`,
            primaryLabel: 'Nº da Fatura (Billing Document):',
            primaryNumber: result.invoice.invoiceNumber,
            statusText: 'Contabilizada e Liberada para FI (POSTED)',
            partnerLabel: 'Pagador / Destinatário:',
            partnerOrOrigin: `${this.loadedOrder.customerId} - ${db.getCustomer(this.loadedOrder.customerId)?.name || ''}`,
            referenceDoc: refText,
            inspectLabel: `Inspecionar Fatura [${result.invoice.invoiceNumber}] em VF03`
          } : null,
          mentorSpeech: validation.mentorSpeech,
          whatHappened: validation.whatHappened,
          why: validation.why,
          businessImpact: validation.businessImpact,
          onConfirm: () => {
            this.onNavigate('VF03', { invoiceNumber: result.invoice.invoiceNumber });
          },
          onInspect: () => {
            this.onNavigate('VF03', { invoiceNumber: result.invoice.invoiceNumber });
          }
        });
      });
    }

    // 5. Navegação
    const btnVf03 = this.container.querySelector('#btn-goto-vf03');
    if (btnVf03) btnVf03.addEventListener('click', () => this.onNavigate('VF03'));

    const btnVl02n = this.container.querySelector('#btn-goto-vl02n');
    if (btnVl02n) btnVl02n.addEventListener('click', () => this.onNavigate('VL02N'));

    const btnCancel = this.container.querySelector('#btn-cancel-billing');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        this.loadedDelivery = null;
        this.loadedOrder = null;
        this.selectedDeliveryNumber = '';
        this.render();
      });
    }
  }

  _renderInvoiceConfirmed() {
    const scenario = scenarioEngine.getActiveScenario();
    const scenarioCode = scenario ? scenario.code : '';
    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VF01</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Criar Documento de Faturamento (Billing Document)</div>
            <div class="text-xs text-muted">Faturamento Comercial de Vendas (SD-BIL) &amp; Integração com Contas a Receber (FI-AR)</div>
          </div>
        </div>
      </div>
      <div class="erp-card" style="margin-top: 20px; padding: 28px 24px; background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; text-align: center;">
        <div style="color: #15803d; font-size: 32px; margin-bottom: 12px;">${Icons.check}</div>
        <h3 style="color: #14532d; font-size: 16px; font-weight: 700; margin: 0 0 6px 0;">
          Fatura Comercial emitida com sucesso!
        </h3>
        <div style="font-size: 22px; font-weight: 800; color: #15803d; margin: 10px 0; font-family: monospace;">
          Fatura nº ${this.savedInvoiceNumber}
        </div>
        <p class="text-xs text-muted" style="max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
          ${scenarioCode ? `[${scenarioCode}] ` : ''}O ciclo Order-to-Cash foi encerrado com sucesso. Consulte o fluxo completo de documentos na <strong>VF03</strong>.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-goto-vf03-confirmed">
            ${Icons.search} Consultar Fatura (VF03)
          </button>
          <button class="btn btn-secondary" id="btn-goto-dashboard-confirmed">
            ${Icons.layers} Voltar ao Painel
          </button>
        </div>
      </div>
    `;
    this.bindEvents();
    return this.container;
  }

  getElement() {
    return this.container;
  }
}
