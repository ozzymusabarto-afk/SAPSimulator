/**
 * NexusTech ERP • VA01 View Component
 * Transação Interativa de Criação de Ordem de Venda (Sales Order Creation)
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { CompanyStructure } from '../../core/domain/company.js';
import { db } from '../../core/engine/erpDatabase.js';
import { PricingEngine } from '../../core/engine/pricingEngine.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { MentorDockComponent } from '../mentorDock.js';

export class Va01ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'va01-view';

    // Estado inicial: todos os campos de decisão iniciam em branco para ação do trainee
    this.orderType = '';
    this.salesOrg = '';
    this.distChannel = '';
    this.division = '';
    this.customerId = '';
    this.customerPoNumber = '';
    this.paymentTerms = '';
    this.incoterms = '';
    this.incotermsLocation = '';

    // Posições de venda vazias para preenchimento
    this.items = [
      { materialId: '', quantity: 0, manualDiscountPercent: 0, manualFreight: 0 }
    ];

    this.activeTab = 'HEADER'; // HEADER, ITEMS, PARTNERS, CONDITIONS
    this.fieldErrors = {}; // Mapeia campos com inconsistência
    this.currentScenarioId = null;
  }

  resetForm() {
    this.orderType = '';
    this.salesOrg = '';
    this.distChannel = '';
    this.division = '';
    this.customerId = '';
    this.customerPoNumber = '';
    this.paymentTerms = '';
    this.incoterms = '';
    this.incotermsLocation = '';
    this.items = [
      { materialId: '', quantity: 0, manualDiscountPercent: 0, manualFreight: 0 }
    ];
    this.activeTab = 'HEADER';
    this.fieldErrors = {};
  }

  render() {
    const activeScenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = activeScenario ? activeScenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    const customers = db.getAllCustomers();
    const materials = db.getAllMaterials();
    const orderCalculation = PricingEngine.calculateOrderTotals(this.items, this.salesOrg || '1000', this.distChannel || '10');

    this.container.innerHTML = `
      <!-- Cabeçalho da Transação -->
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VA01</span>
          <div>
            <div class="transaction-title">Criar Ordem do Cliente: Acesso Inicial & Dados Comerciais</div>
            <div class="text-xs text-muted">Estrutura Org: ${CompanyStructure.companyCode.id} • ${CompanyStructure.companyCode.name}</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-simulate-pricing" title="Executar cálculo e verificar esquema de condições">
            ${Icons.dollarSign} Simular Preço & Impostos
          </button>
          <button class="btn btn-primary btn-sm" id="btn-save-order">
            ${Icons.fileText} Gravar Ordem (Ctrl+S)
          </button>
        </div>
      </div>

      <!-- Abas da Ordem de Venda -->
      <div class="transaction-tabs-bar">
        <div class="transaction-tab ${this.activeTab === 'HEADER' ? 'active' : ''}" data-tab="HEADER">
          ${Icons.fileText} 1. Cabeçalho & Área de Vendas
        </div>
        <div class="transaction-tab ${this.activeTab === 'ITEMS' ? 'active' : ''}" data-tab="ITEMS">
          ${Icons.package} 2. Posições / Itens (${this.items.filter(i => i.materialId).length})
        </div>
        <div class="transaction-tab ${this.activeTab === 'PARTNERS' ? 'active' : ''}" data-tab="PARTNERS">
          ${Icons.users} 3. Parceiros Comerciais
        </div>
        <div class="transaction-tab ${this.activeTab === 'CONDITIONS' ? 'active' : ''}" data-tab="CONDITIONS">
          ${Icons.dollarSign} 4. Condições & Esquema de Cálculo
        </div>
      </div>

      <!-- Aba 1: Cabeçalho & Área de Vendas -->
      <div class="transaction-section" style="${this.activeTab === 'HEADER' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Dados Organizacionais & Emissor da Ordem</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela VBAK</span>
        </div>

        <div class="form-grid-4">
          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Tipo de Ordem (Doc. Type) *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="orderType" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Decisão</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.orderType ? 'border-danger' : ''}" id="input-order-type" data-help-id="orderType" style="${this.fieldErrors.orderType ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione o Tipo de Ordem --</option>
              ${CompanyStructure.orderTypes.map(t => `
                <option value="${t.id}" ${this.orderType === t.id ? 'selected' : ''}>${t.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Organização de Vendas *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="salesOrg" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Decisão</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.salesOrg ? 'border-danger' : ''}" id="input-sales-org" data-help-id="salesOrg" style="${this.fieldErrors.salesOrg ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione a Org. de Vendas --</option>
              ${CompanyStructure.salesOrganizations.map(o => `
                <option value="${o.id}" ${this.salesOrg === o.id ? 'selected' : ''}>${o.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Canal de Distribuição *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="distChannel" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Consultar XD03</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.distChannel ? 'border-danger' : ''}" id="input-dist-channel" data-help-id="distChannel" style="${this.fieldErrors.distChannel ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione o Canal --</option>
              ${CompanyStructure.distributionChannels.map(c => `
                <option value="${c.id}" ${this.distChannel === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Setor de Atividade *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="division" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Decisão</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.division ? 'border-danger' : ''}" id="input-division" data-help-id="division" style="${this.fieldErrors.division ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione o Setor --</option>
              ${CompanyStructure.divisions.map(d => `
                <option value="${d.id}" ${this.division === d.id ? 'selected' : ''}>${d.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-3" style="margin-top: 8px;">
          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Emissor da Ordem (Sold-to Party / KUNNR) *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="customerId" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Ação do Trainee</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.customerId ? 'border-danger' : ''}" id="input-customer-id" data-help-id="customerId" style="${this.fieldErrors.customerId ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione o Emissor da Ordem --</option>
              ${customers.map(c => `
                <option value="${c.id}" ${this.customerId === c.id ? 'selected' : ''}>${c.id} - ${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Nº Pedido de Compra do Cliente (BSTNK) *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="customerPoNumber" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Digitar do Chamado</span>
            </label>
            <input 
              type="text" 
              class="erp-input font-mono ${this.fieldErrors.customerPoNumber ? 'border-danger' : ''}" 
              id="input-po-number" 
              data-help-id="customerPoNumber"
              value="${this.customerPoNumber}" 
              placeholder="ex: PO-2026-EB01" 
              style="${this.fieldErrors.customerPoNumber ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}"
            />
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Condição de Pagamento (ZTERM) *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="paymentTerms" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Consultar XD03</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.paymentTerms ? 'border-danger' : ''}" id="input-payment-terms" data-help-id="paymentTerms" style="${this.fieldErrors.paymentTerms ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione a Condição de Pagamento --</option>
              ${CompanyStructure.paymentTerms.map(p => `
                <option value="${p.id}" ${this.paymentTerms === p.id ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2" style="margin-top: 8px;">
          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Incoterms (Modalidade de Frete) *</span>
              <button type="button" class="erp-field-help-btn" data-help-id="incoterms" title="F1 - Ajuda do Campo">?</button>
              <span class="text-xs text-primary font-medium" style="margin-left: auto;">Consultar XD03</span>
            </label>
            <select class="erp-select font-mono ${this.fieldErrors.incoterms ? 'border-danger' : ''}" id="input-incoterms" data-help-id="incoterms" style="${this.fieldErrors.incoterms ? 'border-color: #b91c1c; background-color: #fef2f2;' : ''}">
              <option value="">-- Selecione o Incoterms --</option>
              ${CompanyStructure.incotermsList.map(i => `
                <option value="${i.id}" ${this.incoterms === i.id ? 'selected' : ''}>${i.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">
              <span>Local de Destino (Incoterms Parte 2)</span>
              <span class="text-xs text-muted" style="margin-left: auto;">Determinado pelo Cliente</span>
            </label>
            <input
              type="text"
              class="erp-input font-mono"
              id="input-incoterms-loc"
              value="${this.incotermsLocation}"
              placeholder="ex: São Paulo - SP"
            />
          </div>
        </div>
      </div>

      <!-- Aba 2: Posições / Itens -->
      <div class="transaction-section" style="${this.activeTab === 'ITEMS' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Posições de Venda (Linhas de Material Solicitadas)</span>
          <button class="btn btn-secondary btn-sm" id="btn-add-item">
            ${Icons.package} + Adicionar Posição
          </button>
        </div>

        <div class="erp-table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th style="width: 60px;">Posição</th>
                <th style="width: 280px;">Material (MATNR) * <button type="button" class="erp-field-help-btn" data-help-id="materialId" title="F1 - Ajuda do Campo">?</button></th>
                <th style="width: 90px;">Qtd. Pedida * <button type="button" class="erp-field-help-btn" data-help-id="quantity" title="F1 - Ajuda do Campo">?</button></th>
                <th style="width: 60px;">UM</th>
                <th style="width: 120px;">Preço Base (PR00)</th>
                <th style="width: 110px;">Desconto (%) <button type="button" class="erp-field-help-btn" data-help-id="manualDiscountPercent" title="F1 - Ajuda do Campo">?</button></th>
                <th style="width: 130px;">Valor Líquido</th>
                <th style="width: 100px;">Disponibilidade</th>
                <th style="width: 60px;">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${this.items.map((item, index) => {
                const mat = db.getMaterial(item.materialId);
                const pricing = PricingEngine.calculateItemPricing(item, this.salesOrg || '1000', this.distChannel || '10');
                const isStockOk = mat ? mat.stockAvailable >= item.quantity : false;
                const hasError = this.fieldErrors.items;

                return `
                  <tr style="${hasError ? 'background-color: #fff8f8;' : ''}">
                    <td class="font-mono" style="font-weight: 700;">${(index + 1) * 10}</td>
                    <td>
                      <select class="erp-select font-mono item-material-select" data-index="${index}" style="width: 100%; font-size: 11.5px; ${hasError && !item.materialId ? 'border-color: #b91c1c;' : ''}">
                        <option value="">-- Selecione o Material --</option>
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
                        class="erp-input font-mono item-qty-input" 
                        data-index="${index}" 
                        value="${item.quantity || ''}" 
                        placeholder="0" 
                        min="0" 
                        style="width: 70px; padding: 3px 6px; ${hasError && (!item.quantity || item.quantity <= 0) ? 'border-color: #b91c1c;' : ''}" 
                      />
                    </td>
                    <td class="font-mono text-xs">${mat ? mat.baseUnit : '-'}</td>
                    <td class="font-mono text-sm">${mat ? Formatters.currency(pricing.basePrice) : '-'}</td>
                    <td>
                      <input 
                        type="number" 
                        class="erp-input font-mono item-discount-input" 
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
                          ${isStockOk ? `${Icons.check} ${mat.stockAvailable} UN` : `${Icons.alertTriangle} Ruptura ATP`}
                        </span>
                      ` : '-'}
                    </td>
                    <td>
                      <button class="btn btn-ghost btn-sm text-danger btn-remove-item" data-index="${index}" title="Remover Posição">
                        ${Icons.x}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Resumo Financeiro da Ordem -->
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
              <span>Impostos Totais (ICMS + PIS/COF):</span>
              <span class="font-mono">${Formatters.currency(orderCalculation.totalTaxes)}</span>
            </div>
            <div class="summary-row total">
              <span>Valor Total do Pedido:</span>
              <span class="font-mono text-primary">${Formatters.currency(orderCalculation.totalOrderValue)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba 3: Parceiros Comerciais -->
      <div class="transaction-section" style="${this.activeTab === 'PARTNERS' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Determinação de Funções de Parceiro</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela VBPA</span>
        </div>
        ${this.renderPartnersTab()}
      </div>

      <!-- Aba 4: Esquema de Cálculo -->
      <div class="transaction-section" style="${this.activeTab === 'CONDITIONS' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Análise do Esquema de Cálculo de Preço (Pricing Procedure)</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela KONP / V/08</span>
        </div>
        ${this.renderPricingConditionsTab(orderCalculation)}
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  renderPartnersTab() {
    if (!this.customerId) {
      return `
        <div style="padding: 24px; text-align: center;">
          <p class="text-sm text-muted">Selecione o Emissor da Ordem na aba Cabeçalho para visualizar a determinação automática das 4 funções de parceiro (SP, SH, BP, PY).</p>
        </div>
      `;
    }

    const cust = db.getCustomer(this.customerId);
    if (!cust) return '<p class="text-sm text-muted">Cliente não encontrado.</p>';

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
              <td class="font-mono">${cust.partners.soldToParty.id}</td>
              <td class="font-semibold">${cust.partners.soldToParty.name}</td>
              <td>${cust.city} - ${cust.state}</td>
            </tr>
            <tr>
              <td class="font-mono font-bold">SH</td>
              <td>Recebedor da Mercadoria (Ship-to party)</td>
              <td class="font-mono">${cust.partners.shipToParty.id}</td>
              <td class="font-semibold">${cust.partners.shipToParty.name}</td>
              <td>${cust.city} - ${cust.state}</td>
            </tr>
            <tr>
              <td class="font-mono font-bold">BP</td>
              <td>Recebedor da Fatura (Bill-to party)</td>
              <td class="font-mono">${cust.partners.billToParty.id}</td>
              <td class="font-semibold">${cust.partners.billToParty.name}</td>
              <td>${cust.city} - ${cust.state}</td>
            </tr>
            <tr>
              <td class="font-mono font-bold">PY</td>
              <td>Pagador Financeiro (Payer)</td>
              <td class="font-mono">${cust.partners.payer.id}</td>
              <td class="font-semibold">${cust.partners.payer.name}</td>
              <td>${cust.city} - ${cust.state}</td>
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
                <td class="font-mono text-danger">-${orderCalculation.items[0]?.manualDiscountPercent || 0}%</td>
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

    // Inputs do cabeçalho
    const orderTypeSelect = this.container.querySelector('#input-order-type');
    if (orderTypeSelect) {
      orderTypeSelect.addEventListener('change', (e) => {
        this.orderType = e.target.value;
        delete this.fieldErrors.orderType;
      });
    }

    const salesOrgSelect = this.container.querySelector('#input-sales-org');
    if (salesOrgSelect) {
      salesOrgSelect.addEventListener('change', (e) => {
        this.salesOrg = e.target.value;
        delete this.fieldErrors.salesOrg;
        this.render();
      });
    }

    const distChannelSelect = this.container.querySelector('#input-dist-channel');
    if (distChannelSelect) {
      distChannelSelect.addEventListener('change', (e) => {
        this.distChannel = e.target.value;
        delete this.fieldErrors.distChannel;
        this.render();
      });
    }

    const divisionSelect = this.container.querySelector('#input-division');
    if (divisionSelect) {
      divisionSelect.addEventListener('change', (e) => {
        this.division = e.target.value;
        delete this.fieldErrors.division;
      });
    }

    const custSelect = this.container.querySelector('#input-customer-id');
    if (custSelect) {
      custSelect.addEventListener('change', (e) => {
        this.customerId = e.target.value;
        delete this.fieldErrors.customerId;
        const c = db.getCustomer(this.customerId);
        if (c) {
          this.incotermsLocation = `${c.city} - ${c.state}`;
        }
        this.render();
      });
    }

    const poInput = this.container.querySelector('#input-po-number');
    if (poInput) {
      poInput.addEventListener('input', (e) => {
        this.customerPoNumber = e.target.value;
        delete this.fieldErrors.customerPoNumber;
      });
    }

    const paySelect = this.container.querySelector('#input-payment-terms');
    if (paySelect) {
      paySelect.addEventListener('change', (e) => {
        this.paymentTerms = e.target.value;
        delete this.fieldErrors.paymentTerms;
      });
    }

    const incoSelect = this.container.querySelector('#input-incoterms');
    if (incoSelect) {
      incoSelect.addEventListener('change', (e) => {
        this.incoterms = e.target.value;
        delete this.fieldErrors.incoterms;
      });
    }

    const incoLocInput = this.container.querySelector('#input-incoterms-loc');
    if (incoLocInput) {
      incoLocInput.addEventListener('input', (e) => {
        this.incotermsLocation = e.target.value;
      });
    }

    // Itens
    this.container.querySelectorAll('.item-material-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const index = parseInt(sel.getAttribute('data-index'), 10);
        this.items[index].materialId = e.target.value;
        delete this.fieldErrors.items;
        this.render();
      });
    });

    this.container.querySelectorAll('.item-qty-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const index = parseInt(inp.getAttribute('data-index'), 10);
        this.items[index].quantity = Math.max(0, parseInt(e.target.value, 10) || 0);
        delete this.fieldErrors.items;
        this.render();
      });
    });

    this.container.querySelectorAll('.item-discount-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const index = parseInt(inp.getAttribute('data-index'), 10);
        this.items[index].manualDiscountPercent = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
        delete this.fieldErrors.items;
        this.render();
      });
    });

    const addItemBtn = this.container.querySelector('#btn-add-item');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        this.items.push({ materialId: '', quantity: 0, manualDiscountPercent: 0, manualFreight: 0 });
        this.render();
      });
    }

    this.container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (this.items.length > 1) {
          this.items.splice(index, 1);
          this.render();
        }
      });
    });

    // Botão Simular
    const simBtn = this.container.querySelector('#btn-simulate-pricing');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.activeTab = 'CONDITIONS';
        this.render();
        const totals = PricingEngine.calculateOrderTotals(this.items, this.salesOrg || '1000', this.distChannel || '10');
        if (totals.hasPricingError) {
          MentorDockComponent.speak('Atenção: uma ou mais posições não possuem condição de preço PR00 ativa. Verifique o material selecionado.', 'WARN');
        } else {
          MentorDockComponent.speak('Cálculo comercial simulado. O esquema de preços apurou os valores brutos, descontos e tributos. Confira a aba Condições.', 'SUCCESS');
        }
      });
    }

    // Botão Gravar Ordem
    const saveBtn = this.container.querySelector('#btn-save-order');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.handleSaveOrder();
      });
    }
  }

  handleSaveOrder() {
    const totals = PricingEngine.calculateOrderTotals(this.items, this.salesOrg || '1000', this.distChannel || '10');

    // Validação de Determinação de Preço (Pricing / Condição PR00)
    if (totals.hasPricingError) {
      this.fieldErrors.items = true;
      diagnosticModal.show({
        isValid: false,
        mentorSpeech: 'Atenção ao cálculo comercial: não foi possível determinar o preço base deste material. Verifique a condição de preço antes de gravar a ordem.',
        whatHappened: 'Inconsistência na determinação de preço: uma ou mais posições selecionadas não possuem condição de preço base (PR00) ativa para esta Área de Vendas.',
        why: 'No esquema de cálculo padrão (Pricing Procedure), a condição PR00 é obrigatória para a formação do valor bruto e apuração dos tributos.',
        businessImpact: 'Sem condição de preço ativa, o sistema não pode apurar o valor contábil do pedido nem emitir documentos subsequentes de remessa e faturamento.',
        onConfirm: () => {
          this.activeTab = 'ITEMS';
          this.render();
        }
      });
      return;
    }

    const orderData = {
      orderType: this.orderType,
      salesOrg: this.salesOrg,
      distChannel: this.distChannel,
      division: this.division,
      customerId: this.customerId,
      customerPoNumber: this.customerPoNumber,
      paymentTerms: this.paymentTerms,
      incoterms: this.incoterms,
      incotermsLocation: this.incotermsLocation,
      items: this.items,
      netValue: totals.totalNet,
      taxValue: totals.totalTaxes,
      totalValue: totals.totalOrderValue
    };

    const result = scenarioEngine.validateSalesOrderSubmission(orderData);

    if (result.isValid) {
      this.fieldErrors = {};
      const createdOrder = db.createSalesOrder(orderData);

      MentorDockComponent.speak(`Ordem de Venda nº ${Formatters.documentNumber(createdOrder.docNumber)} gravada com sucesso no sistema.`, 'SUCCESS');

      diagnosticModal.show({
        isValid: true,
        mentorSpeech: result.mentorSpeech,
        whatHappened: `Ordem de Venda nº ${Formatters.documentNumber(createdOrder.docNumber)} gravada com status [${createdOrder.overallStatus}].`,
        why: result.why,
        businessImpact: result.businessImpact,
        onConfirm: () => {
          this.onNavigate('VA03', { docNumber: createdOrder.docNumber });
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
