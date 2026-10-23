/**
 * NexusTech ERP • VA02 View Component
 * Transação de Modificação de Ordem de Venda (Change Sales Order)
 * Mentor: Chefe Wilson (Coordenador Comercial | Mentor SD)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { CompanyStructure } from '../../core/domain/company.js';
import { db } from '../../core/engine/erpDatabase.js';
import { PricingEngine } from '../../core/engine/pricingEngine.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';

export class Va02ViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'va02-view';
    this.selectedDocNumber = initialParams.docNumber || '';
    this.searchError = '';

    // Estado local da ordem carregada
    this.orderType = 'OR';
    this.salesOrg = '1000';
    this.distChannel = '10';
    this.division = '01';
    this.customerId = '';
    this.customerPoNumber = '';
    this.paymentTerms = '';
    this.incoterms = '';
    this.incotermsLocation = '';
    this.items = [];

    this.activeTab = 'HEADER'; // HEADER, ITEMS, PARTNERS, CONDITIONS
    this.fieldErrors = {};
    this.currentScenarioId = null;

    if (this.selectedDocNumber) {
      this.loadOrder(this.selectedDocNumber);
    }
  }

  resetForm() {
    this.selectedDocNumber = '';
    this.searchError = '';
    this.orderType = 'OR';
    this.salesOrg = '1000';
    this.distChannel = '10';
    this.division = '01';
    this.customerId = '';
    this.customerPoNumber = '';
    this.paymentTerms = '';
    this.incoterms = '';
    this.incotermsLocation = '';
    this.items = [];
    this.activeTab = 'HEADER';
    this.fieldErrors = {};
  }

  setParams(params = {}) {
    // Lote E: setParams não pré-preenche campos nem carrega a ordem automaticamente.
    // DADO FORNECIDO NO CHAMADO ≠ DADO PREENCHIDO NA TELA.
    // O trainee deve digitar o número e executar a consulta.
    this.render();
  }

  loadOrder(docNumber) {
    const order = db.getSalesOrder(docNumber);
    if (order) {
      this.selectedDocNumber = order.docNumber;
      this.searchError = '';
      this.orderType = order.orderType || 'OR';
      this.salesOrg = order.salesOrg || '1000';
      this.distChannel = order.distChannel || '10';
      this.division = order.division || '01';
      this.customerId = order.customerId || '';
      this.customerPoNumber = order.customerPoNumber || '';
      this.paymentTerms = order.paymentTerms || '';
      this.incoterms = order.incoterms || '';
      this.incotermsLocation = order.incotermsLocation || '';
      this.items = JSON.parse(JSON.stringify(order.items || []));
      this.fieldErrors = {};
    }
  }

  render() {
    const activeScenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = activeScenario ? activeScenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    const currentOrder = this.selectedDocNumber ? db.getSalesOrder(this.selectedDocNumber) : null;
    const materials = db.getAllMaterials();
    const customer = currentOrder ? db.getCustomer(this.customerId) : null;
    const orderCalculation = PricingEngine.calculateOrderTotals(this.items, this.salesOrg, this.distChannel);

    this.container.innerHTML = `
      <!-- Cabeçalho da Transação -->
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VA02</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Modificar Ordem do Cliente: Dados Comerciais & Posições</div>
            <div class="text-xs text-muted">Alteração de Volumes, Descontos e Termos de Fornecimento</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-simulate-pricing" title="Recalcular totais e impostos" ${!currentOrder ? 'disabled' : ''}>
            ${Icons.dollarSign} Recalcular Preço
          </button>
          <button class="btn btn-primary btn-sm" id="btn-save-order" ${!currentOrder ? 'disabled' : ''}>
            ${Icons.fileText} Gravar Alterações (Ctrl+S)
          </button>
        </div>
      </div>

      <!-- Barra de Seleção de Ordem -->
      <div class="transaction-selection-bar">
        <div class="transaction-selection-group" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="transaction-selection-label">Ordem de Venda (VBELN):</span>
          <input type="text" id="va02-order-input" class="erp-input font-mono font-bold text-xs" placeholder="Ex: 10000007" value="${this.selectedDocNumber || ''}" style="width: 150px; text-transform: uppercase;" />
          <button class="btn btn-primary btn-sm" id="btn-load-va02-order">
            ${Icons.search} Modificar
          </button>
        </div>
        <div class="text-xs text-muted font-mono">
          ${currentOrder ? `Status Geral: <span class="font-bold text-primary">${currentOrder.overallStatus || 'OPEN'}</span>` : 'Acesso Inicial de Modificação'}
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
          <h4 class="font-semibold" style="color: var(--erp-navy-900); font-size: 16px; margin-bottom: 6px;">Nenhuma ordem de venda carregada para modificação</h4>
          <p class="text-xs text-muted" style="max-width: 520px; margin: 0 auto; line-height: 1.5; margin-bottom: 16px;">
            Informe o número da ordem de venda (VBELN) no campo acima e clique em <strong>Modificar</strong> (ou pressione Enter) para carregar os dados comerciais e posições da ordem.
          </p>
          <button class="btn btn-secondary btn-sm" id="btn-goto-va01">
            ${Icons.fileText} Criar Nova Ordem (VA01)
          </button>
        </div>
      ` : `
        <!-- Banner de Identificação da Ordem Carregada -->
        <div style="background-color: var(--erp-surface-subtle); border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--erp-border-subtle);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div>
              <span class="text-xs text-muted font-semibold">NÚMERO DA ORDEM:</span>
              <span class="font-mono text-sm font-bold text-primary" style="margin-left: 4px;">
                ${Formatters.documentNumber(currentOrder.docNumber)}
              </span>
            </div>
            <div>
              <span class="text-xs text-muted font-semibold">CLIENTE:</span>
              <span class="text-sm font-semibold" style="margin-left: 4px;">
                ${this.customerId} - ${customer ? customer.name : ''}
              </span>
            </div>
          </div>
          <div>
            ${currentOrder.overallStatus === 'CREDIT_BLOCKED' 
              ? `<span class="erp-badge erp-badge-danger">${Icons.lock} Bloqueado por Crédito</span>` 
              : `<span class="erp-badge erp-badge-success">${Icons.check} Ordem Aberta</span>`}
          </div>
        </div>

        <!-- Abas da Ordem de Venda -->
        <div class="transaction-tabs-bar">
          <div class="transaction-tab ${this.activeTab === 'HEADER' ? 'active' : ''}" data-tab="HEADER">
            ${Icons.fileText} 1. Cabeçalho & Dados Comerciais
          </div>
          <div class="transaction-tab ${this.activeTab === 'ITEMS' ? 'active' : ''}" data-tab="ITEMS">
            ${Icons.package} 2. Posições / Itens (${this.items.length})
          </div>
          <div class="transaction-tab ${this.activeTab === 'PARTNERS' ? 'active' : ''}" data-tab="PARTNERS">
            ${Icons.users} 3. Parceiros Comerciais
          </div>
          <div class="transaction-tab ${this.activeTab === 'CONDITIONS' ? 'active' : ''}" data-tab="CONDITIONS">
            ${Icons.dollarSign} 4. Esquema de Condições (Pricing)
          </div>
        </div>

        <!-- Aba 1: Cabeçalho & Dados Comerciais -->
        <div class="transaction-section" style="${this.activeTab === 'HEADER' ? '' : 'display: none;'}">
          <div class="section-title">
            <span>Estrutura Organizacional (Fixa) & Dados de Negociação</span>
            <span class="erp-badge erp-badge-sap text-xs">Tabela VBAK</span>
          </div>

          <!-- Campos Bloqueados após criação (Padrão SAP) -->
          <div class="form-grid-4">
            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Tipo de Ordem (Doc. Type)</span>
                <span class="text-xs text-muted font-mono">Bloqueado</span>
              </label>
              <input type="text" class="erp-input font-mono" value="${this.orderType} - Ordem Padrão" readonly disabled style="background-color: var(--erp-surface-subtle); color: var(--erp-text-muted);" />
            </div>

            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Organização de Vendas</span>
                <span class="text-xs text-muted font-mono">Bloqueado</span>
              </label>
              <input type="text" class="erp-input font-mono" value="${this.salesOrg} - Vendas Nacionais" readonly disabled style="background-color: var(--erp-surface-subtle); color: var(--erp-text-muted);" />
            </div>

            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Canal de Distribuição</span>
                <span class="text-xs text-muted font-mono">Bloqueado</span>
              </label>
              <input type="text" class="erp-input font-mono" value="${this.distChannel} - ${this.distChannel === '20' ? 'Revenda / Atacado' : 'Venda Direta'}" readonly disabled style="background-color: var(--erp-surface-subtle); color: var(--erp-text-muted);" />
            </div>

            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Setor de Atividade</span>
                <span class="text-xs text-muted font-mono">Bloqueado</span>
              </label>
              <input type="text" class="erp-input font-mono" value="${this.division} - Equipamentos" readonly disabled style="background-color: var(--erp-surface-subtle); color: var(--erp-text-muted);" />
            </div>
          </div>

          <!-- Campos Comerciais Editáveis -->
          <div class="form-grid-3">
            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Emissor da Ordem (Sold-to Party)</span>
                <span class="text-xs text-muted font-mono">Bloqueado</span>
              </label>
              <input type="text" class="erp-input font-mono font-bold" value="${this.customerId} - ${customer ? customer.name : ''}" readonly disabled style="background-color: var(--erp-surface-subtle);" />
            </div>

            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Nº Pedido de Compra do Cliente (BSTNK)</span>
                <span class="text-xs text-primary font-medium">Editável</span>
              </label>
              <input 
                type="text" 
                class="erp-input font-mono ${this.fieldErrors.customerPoNumber ? 'border-danger' : ''}" 
                id="va02-po-number" 
                value="${this.customerPoNumber}" 
                placeholder="ex: PO-TL-2026-042" 
                style="${this.fieldErrors.customerPoNumber ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}"
              />
            </div>

            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Condição de Pagamento (ZTERM)</span>
                <span class="text-xs text-primary font-medium">Editável</span>
              </label>
              <select class="erp-select font-mono ${this.fieldErrors.paymentTerms ? 'border-danger' : ''}" id="va02-payment-terms" style="${this.fieldErrors.paymentTerms ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
                ${CompanyStructure.paymentTerms.map(p => `
                  <option value="${p.id}" ${this.paymentTerms === p.id ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="erp-form-group">
              <label class="erp-form-label">
                <span>Incoterms (Modalidade de Frete)</span>
                <span class="text-xs text-primary font-medium">Editável</span>
              </label>
              <select class="erp-select font-mono ${this.fieldErrors.incoterms ? 'border-danger' : ''}" id="va02-incoterms" style="${this.fieldErrors.incoterms ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
                ${CompanyStructure.incotermsList.map(i => `
                  <option value="${i.id}" ${this.incoterms === i.id ? 'selected' : ''}>${i.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="erp-form-group">
              <label class="erp-form-label">Local de Destino do Incoterms</label>
              <input type="text" class="erp-input" id="va02-incoterms-loc" value="${this.incotermsLocation}" placeholder="ex: Curitiba - PR" />
            </div>
          </div>
        </div>

        <!-- Aba 2: Posições / Itens -->
        <div class="transaction-section" style="${this.activeTab === 'ITEMS' ? '' : 'display: none;'}">
          <div class="section-title">
            <span>Posições da Ordem de Venda (Edição de Volumes & Descontos)</span>
            <button class="btn btn-secondary btn-sm" id="va02-btn-add-item">
              ${Icons.package} + Adicionar Posição
            </button>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th style="width: 60px;">Posição</th>
                  <th style="width: 280px;">Material (MATNR)</th>
                  <th style="width: 100px;">Qtd. Pedida *</th>
                  <th style="width: 60px;">UM</th>
                  <th style="width: 120px;">Preço Base (PR00)</th>
                  <th style="width: 110px;">Desconto (%)</th>
                  <th style="width: 130px;">Valor Líquido</th>
                  <th style="width: 120px;">Disponibilidade ATP</th>
                  <th style="width: 60px;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${this.items.map((item, index) => {
                  const mat = db.getMaterial(item.materialId);
                  const pricing = PricingEngine.calculateItemPricing(item, this.salesOrg, this.distChannel);
                  const isStockOk = mat ? mat.stockAvailable >= item.quantity : false;
                  const hasError = this.fieldErrors.items;

                  return `
                    <tr style="${hasError ? 'background-color: #fff8f8;' : ''}">
                      <td class="font-mono" style="font-weight: 700;">${(index + 1) * 10}</td>
                      <td>
                        <select class="erp-select font-mono va02-material-select" data-index="${index}" style="width: 100%; font-size: 11.5px;">
                          ${materials.map(m => `
                            <option value="${m.id}" ${item.materialId === m.id ? 'selected' : ''}>
                              ${m.id} - ${m.description}
                            </option>
                          `).join('')}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          class="erp-input font-mono va02-qty-input" 
                          data-index="${index}" 
                          value="${item.quantity || ''}" 
                          min="1" 
                          style="width: 80px; padding: 3px 6px; font-weight: 700; color: var(--erp-blue-primary);" 
                        />
                      </td>
                      <td class="font-mono text-xs">${mat ? mat.baseUnit : '-'}</td>
                      <td class="font-mono text-sm">${mat ? Formatters.currency(pricing.basePrice) : '-'}</td>
                      <td>
                        <input 
                          type="number" 
                          class="erp-input font-mono va02-discount-input" 
                          data-index="${index}" 
                          value="${item.manualDiscountPercent || 0}" 
                          min="0" 
                          max="100" 
                          style="width: 65px; padding: 3px 6px;" 
                        />
                      </td>
                      <td class="font-mono text-sm font-semibold text-primary">
                        ${mat && item.quantity > 0 ? Formatters.currency(pricing.netValue) : '-'}
                      </td>
                      <td>
                        ${mat ? `
                          <span class="erp-badge ${isStockOk ? 'erp-badge-success' : 'erp-badge-danger'} text-xs">
                            ${isStockOk ? `${Icons.check} ${mat.stockAvailable} UN` : `${Icons.alertTriangle} Ruptura (${mat.stockAvailable} disp.)`}
                          </span>
                        ` : '-'}
                      </td>
                      <td>
                        <button class="btn btn-ghost btn-sm text-danger va02-btn-remove-item" data-index="${index}" title="Remover Posição">
                          ${Icons.x}
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Resumo Financeiro Recalculado -->
          <div class="order-summary-box">
            <div class="summary-card">
              <div class="summary-row">
                <span>Subtotal Bruto (PR00):</span>
                <span class="font-mono font-medium">${Formatters.currency(orderCalculation.totalGross)}</span>
              </div>
              ${orderCalculation.totalDiscount > 0 ? `
                <div class="summary-row" style="color: var(--erp-green-success);">
                  <span>Desconto Comercial (RB00):</span>
                  <span class="font-mono font-medium">-${Formatters.currency(orderCalculation.totalDiscount)}</span>
                </div>
              ` : ''}
              <div class="summary-row">
                <span>Valor Comercial Líquido:</span>
                <span class="font-mono font-semibold">${Formatters.currency(orderCalculation.totalNet)}</span>
              </div>
              <div class="summary-row text-muted text-xs">
                <span>Impostos Totais (ICMS 18% + PIS/COF 9.25%):</span>
                <span class="font-mono">${Formatters.currency(orderCalculation.totalTaxes)}</span>
              </div>
              <div class="summary-row total">
                <span>Novo Valor Total da Ordem:</span>
                <span class="font-mono text-primary">${Formatters.currency(orderCalculation.totalOrderValue)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Aba 3: Parceiros Comerciais -->
        <div class="transaction-section" style="${this.activeTab === 'PARTNERS' ? '' : 'display: none;'}">
          <div class="section-title">
            <span>Funções de Parceiro da Ordem</span>
            <span class="erp-badge erp-badge-sap text-xs">Tabela VBPA</span>
          </div>
          ${this.renderPartnersTab(customer)}
        </div>

        <!-- Aba 4: Esquema de Condições -->
        <div class="transaction-section" style="${this.activeTab === 'CONDITIONS' ? '' : 'display: none;'}">
          <div class="section-title">
            <span>Esquema de Cálculo Recalculado (Pricing Procedure)</span>
            <span class="erp-badge erp-badge-sap text-xs">Tabela KONP</span>
          </div>
          ${this.renderPricingConditionsTab(orderCalculation)}
        </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  renderPartnersTab(customer) {
    if (!customer) return '<p class="text-sm text-muted">Cliente não selecionado.</p>';
    return `
      <div class="erp-table-container">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Função (PF)</th>
              <th>Descrição SAP</th>
              <th>Código Parceiro</th>
              <th>Nome / Razão Social</th>
              <th>Endereço / Localidade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-mono font-bold">SP</td>
              <td>Emissor da Ordem (Sold-to party)</td>
              <td class="font-mono">${customer.partners.soldToParty.id}</td>
              <td class="font-semibold">${customer.partners.soldToParty.name}</td>
              <td>${customer.city} - ${customer.state}</td>
            </tr>
            <tr>
              <td class="font-mono font-bold">SH</td>
              <td>Recebedor da Mercadoria (Ship-to party)</td>
              <td class="font-mono">${customer.partners.shipToParty.id}</td>
              <td class="font-semibold">${customer.partners.shipToParty.name}</td>
              <td>${customer.city} - ${customer.state}</td>
            </tr>
            <tr>
              <td class="font-mono font-bold">BP</td>
              <td>Recebedor da Fatura (Bill-to party)</td>
              <td class="font-mono">${customer.partners.billToParty.id}</td>
              <td class="font-semibold">${customer.partners.billToParty.name}</td>
              <td>${customer.city} - ${customer.state}</td>
            </tr>
            <tr>
              <td class="font-mono font-bold">PY</td>
              <td>Pagador Financeiro (Payer)</td>
              <td class="font-mono">${customer.partners.payer.id}</td>
              <td class="font-semibold">${customer.partners.payer.name}</td>
              <td>${customer.city} - ${customer.state}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderPricingConditionsTab(orderCalculation) {
    return `
      <div class="erp-table-container">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Tipo Condição</th>
              <th>Nome da Condição</th>
              <th>Base de Cálculo</th>
              <th>Alíquota / Taxa</th>
              <th>Montante Total (R$)</th>
              <th>Impacto Contábil</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-mono font-bold">PR00</td>
              <td>Preço Base da Tabela</td>
              <td class="font-mono">Quantidade Total</td>
              <td class="font-mono">-</td>
              <td class="font-mono font-semibold">${Formatters.currency(orderCalculation.totalGross)}</td>
              <td><span class="erp-badge erp-badge-primary text-xs">Receita Bruta</span></td>
            </tr>
            ${orderCalculation.totalDiscount > 0 ? `
              <tr>
                <td class="font-mono font-bold">RB00</td>
                <td>Desconto Comercial Especial</td>
                <td class="font-mono">${Formatters.currency(orderCalculation.totalGross)}</td>
                <td class="font-mono text-danger">-${this.items[0]?.manualDiscountPercent || 0}%</td>
                <td class="font-mono text-danger font-semibold">-${Formatters.currency(orderCalculation.totalDiscount)}</td>
                <td><span class="erp-badge erp-badge-warning text-xs">Dedução da Receita</span></td>
              </tr>
            ` : ''}
            <tr>
              <td class="font-mono font-bold">MWST</td>
              <td>ICMS Estadual</td>
              <td class="font-mono">${Formatters.currency(orderCalculation.totalNet)}</td>
              <td class="font-mono">18.00%</td>
              <td class="font-mono">${Formatters.currency(orderCalculation.totalNet * 0.18)}</td>
              <td><span class="erp-badge erp-badge-code text-xs">Tributo Estadual</span></td>
            </tr>
            <tr>
              <td class="font-mono font-bold">PIS_COF</td>
              <td>PIS / COFINS Federal</td>
              <td class="font-mono">${Formatters.currency(orderCalculation.totalNet)}</td>
              <td class="font-mono">9.25%</td>
              <td class="font-mono">${Formatters.currency(orderCalculation.totalNet * 0.0925)}</td>
              <td><span class="erp-badge erp-badge-code text-xs">Tributo Federal</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  bindEvents() {
    // Busca / Carregamento de Ordem no Topo
    const orderInput = this.container.querySelector('#va02-order-input');
    const loadBtn = this.container.querySelector('#btn-load-va02-order');

    const executeLoadOrder = () => {
      const val = orderInput ? orderInput.value.trim() : '';
      if (!val) {
        this.searchError = 'Informe o número da ordem de venda (VBELN) para modificação.';
        this.selectedDocNumber = '';
        this.render();
        return;
      }

      const order = db.getSalesOrder(val);
      if (!order) {
        this.searchError = `Ordem de venda "${val}" não cadastrada no mandante 800.`;
        this.selectedDocNumber = '';
        this.render();
        return;
      }

      this.searchError = '';
      this.loadOrder(order.docNumber);
      this.render();
    };

    if (loadBtn) {
      loadBtn.addEventListener('click', executeLoadOrder);
    }
    if (orderInput) {
      orderInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeLoadOrder();
        }
      });
    }

    const btnVa01 = this.container.querySelector('#btn-goto-va01');
    if (btnVa01) {
      btnVa01.addEventListener('click', () => this.onNavigate('VA01'));
    }

    // Abas
    this.container.querySelectorAll('.transaction-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const t = tab.getAttribute('data-tab');
        if (t) {
          this.activeTab = t;
          this.render();
        }
      });
    });

    // Campos do Cabeçalho
    const poInput = this.container.querySelector('#va02-po-number');
    if (poInput) {
      poInput.addEventListener('input', (e) => {
        this.customerPoNumber = e.target.value;
        delete this.fieldErrors.customerPoNumber;
      });
    }

    const paySelect = this.container.querySelector('#va02-payment-terms');
    if (paySelect) {
      paySelect.addEventListener('change', (e) => {
        this.paymentTerms = e.target.value;
        delete this.fieldErrors.paymentTerms;
      });
    }

    const incoSelect = this.container.querySelector('#va02-incoterms');
    if (incoSelect) {
      incoSelect.addEventListener('change', (e) => {
        this.incoterms = e.target.value;
        delete this.fieldErrors.incoterms;
      });
    }

    const incoLocInput = this.container.querySelector('#va02-incoterms-loc');
    if (incoLocInput) {
      incoLocInput.addEventListener('input', (e) => {
        this.incotermsLocation = e.target.value;
      });
    }

    // Edição de Itens
    this.container.querySelectorAll('.va02-material-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const index = parseInt(sel.getAttribute('data-index'), 10);
        this.items[index].materialId = e.target.value;
        delete this.fieldErrors.items;
        this.render();
      });
    });

    this.container.querySelectorAll('.va02-qty-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const index = parseInt(inp.getAttribute('data-index'), 10);
        this.items[index].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
        delete this.fieldErrors.items;
        this.render();
      });
    });

    this.container.querySelectorAll('.va02-discount-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const index = parseInt(inp.getAttribute('data-index'), 10);
        this.items[index].manualDiscountPercent = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
        delete this.fieldErrors.items;
        this.render();
      });
    });

    const addItemBtn = this.container.querySelector('#va02-btn-add-item');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        this.items.push({ materialId: 'MAT-2004', quantity: 1, manualDiscountPercent: 0, manualFreight: 0 });
        this.render();
      });
    }

    this.container.querySelectorAll('.va02-btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (this.items.length > 1) {
          this.items.splice(index, 1);
          this.render();
        }
      });
    });

    // Simulação
    const simBtn = this.container.querySelector('#btn-simulate-pricing');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.activeTab = 'CONDITIONS';
        this.render();
      });
    }

    // Gravação
    const saveBtn = this.container.querySelector('#btn-save-order');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.handleSaveOrder();
      });
    }
  }

  handleSaveOrder() {
    const totals = PricingEngine.calculateOrderTotals(this.items, this.salesOrg, this.distChannel);

    const updatedOrderData = {
      docNumber: this.selectedDocNumber,
      orderType: this.orderType,
      salesOrg: this.salesOrg,
      distChannel: this.distChannel,
      division: this.division,
      customerId: this.customerId,
      customerPoNumber: this.customerPoNumber,
      paymentTerms: this.paymentTerms,
      incoterms: this.incoterms,
      incotermsLocation: this.incotermsLocation,
      incotermsVersion: '2020',
      items: this.items,
      netValue: totals.totalNet,
      taxValue: totals.totalTaxes,
      totalValue: totals.totalOrderValue
    };

    const result = scenarioEngine.validateSalesOrderModification(this.selectedDocNumber, updatedOrderData);

    if (result.isValid) {
      this.fieldErrors = {};
      const updatedOrder = db.updateSalesOrder(this.selectedDocNumber, updatedOrderData);

      const custObj = db.getCustomer(this.customerId);
      const custDisplay = custObj ? `${this.customerId} - ${custObj.name}` : this.customerId;

      diagnosticModal.show({
        isValid: true,
        operationSummary: {
          title: 'Ordem de Venda Modificada com Sucesso',
          docTypeBadge: 'VBAK • Alteração Salva',
          primaryLabel: 'Nº da Ordem Atualizada (VBELN):',
          primaryNumber: Formatters.documentNumber(this.selectedDocNumber),
          statusText: 'Parâmetros Comerciais Atualizados (SAVED)',
          partnerLabel: 'Emissor da Ordem:',
          partnerOrOrigin: custDisplay,
          referenceDoc: `Pedido do Cliente: ${this.customerPoNumber || 'Não informado'}`,
          inspectLabel: `Inspecionar Ordem [${Formatters.documentNumber(this.selectedDocNumber)}] em VA03`
        },
        mentorSpeech: result.mentorSpeech,
        whatHappened: `Ordem de Venda nº ${Formatters.documentNumber(this.selectedDocNumber)} modificada com sucesso no sistema.`,
        why: result.why,
        businessImpact: result.businessImpact,
        onConfirm: () => {
          this.onNavigate('VA03', { docNumber: this.selectedDocNumber });
        },
        onInspect: () => {
          this.onNavigate('VA03', { docNumber: this.selectedDocNumber });
        }
      });
    } else {
      if (result.fieldError) {
        this.fieldErrors[result.fieldError] = true;
      }

      diagnosticModal.show({
        isValid: false,
        mentorSpeech: result.mentorSpeech,
        whatHappened: result.whatHappened,
        why: result.why,
        businessImpact: result.businessImpact,
        onConfirm: () => {
          if (result.activeTabHint) {
            this.activeTab = result.activeTabHint;
          }
          this.render();
        }
      });
    }
  }

  getElement() {
    return this.container;
  }
}
