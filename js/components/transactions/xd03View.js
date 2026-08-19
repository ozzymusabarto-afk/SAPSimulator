/**
 * NexusTech ERP • XD03 View Component
 * Transação de Consulta de Dados Mestres de Clientes (Customer Master Data)
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';

export class Xd03ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'xd03-view';
    this.selectedCustomerId = '100045';
    this.activeTab = 'SALES'; // GENERAL, SALES, PARTNERS, CREDIT
  }

  render() {
    const customers = db.getAllCustomers();
    const customer = db.getCustomer(this.selectedCustomerId) || customers[0];

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">XD03</span>
          <div>
            <div class="transaction-title">Exibir Cliente: Dados Centrais & Área de Vendas</div>
            <div class="text-xs text-muted">Mestre de Clientes • Visões Gerais, Comerciais e Financeiras</div>
          </div>
        </div>
        <div class="transaction-actions">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="text-xs font-semibold">Selecionar Cliente:</span>
            <select class="erp-select font-mono text-xs" id="customer-selector" style="padding: 3px 8px;">
              ${customers.map(c => `
                <option value="${c.id}" ${c.id === customer.id ? 'selected' : ''}>
                  ${c.id} - ${c.name}
                </option>
              `).join('')}
            </select>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-confirm-analysis">
            ${Icons.check} Validar Dados & Avançar para VA01
          </button>
        </div>
      </div>

      <!-- Abas do Mestre de Clientes -->
      <div class="transaction-tabs-bar">
        <div class="transaction-tab ${this.activeTab === 'SALES' ? 'active' : ''}" data-tab="SALES">
          ${Icons.fileText} 1. Dados da Área de Vendas (KNVV)
        </div>
        <div class="transaction-tab ${this.activeTab === 'GENERAL' ? 'active' : ''}" data-tab="GENERAL">
          ${Icons.users} 2. Dados Gerais (KNA1)
        </div>
        <div class="transaction-tab ${this.activeTab === 'PARTNERS' ? 'active' : ''}" data-tab="PARTNERS">
          ${Icons.users} 3. Funções de Parceiro (KNVP)
        </div>
        <div class="transaction-tab ${this.activeTab === 'CREDIT' ? 'active' : ''}" data-tab="CREDIT">
          ${Icons.shieldAlert} 4. Gestão de Crédito (KNKK / FD32)
        </div>
      </div>

      <!-- Conteúdo da Aba 1: Área de Vendas (KNVV) -->
      <div class="transaction-section" style="${this.activeTab === 'SALES' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Condições Comerciais & Faturamento</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela KNVV</span>
        </div>

        <div class="form-grid-3">
          <div class="erp-form-group">
            <label class="erp-form-label">Condição de Pagamento (ZTERM)</label>
            <input type="text" class="erp-input font-mono font-bold text-primary" value="${customer.paymentTerms} - 30 dias líquido" readonly />
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Incoterms Parte 1 / Parte 2</label>
            <input type="text" class="erp-input font-mono font-bold text-primary" value="${customer.incoterms} - ${customer.incotermsLocation}" readonly />
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Esquema de Determinação de Preço</label>
            <input type="text" class="erp-input font-mono" value="01 - Esquema Padrão Nacional" readonly />
          </div>
        </div>

        <div class="form-grid-3" style="margin-top: 8px;">
          <div class="erp-form-group">
            <label class="erp-form-label">Organização de Vendas</label>
            <input type="text" class="erp-input font-mono" value="${customer.salesOrg} - Vendas Nacionais" readonly />
          </div>
          <div class="erp-form-group">
            <label class="erp-form-label">Canal de Distribuição</label>
            <input type="text" class="erp-input font-mono" value="${customer.distChannel} - Venda Direta / Corporativo" readonly />
          </div>
          <div class="erp-form-group">
            <label class="erp-form-label">Setor de Atividade</label>
            <input type="text" class="erp-input font-mono" value="${customer.division} - Equipamentos" readonly />
          </div>
        </div>
      </div>

      <!-- Conteúdo da Aba 2: Dados Gerais (KNA1) -->
      <div class="transaction-section" style="${this.activeTab === 'GENERAL' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Dados de Cadastro & Localização</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela KNA1</span>
        </div>

        <div class="form-grid-3">
          <div class="erp-form-group">
            <label class="erp-form-label">Código do Cliente (KUNNR)</label>
            <input type="text" class="erp-input font-mono font-bold" value="${customer.id}" readonly />
          </div>
          <div class="erp-form-group">
            <label class="erp-form-label">Razão Social</label>
            <input type="text" class="erp-input" value="${customer.name}" readonly />
          </div>
          <div class="erp-form-group">
            <label class="erp-form-label">CNPJ / Identificação Fiscal</label>
            <input type="text" class="erp-input font-mono" value="${customer.cnpj}" readonly />
          </div>
        </div>
      </div>

      <!-- Conteúdo da Aba 3: Parceiros Comerciais (KNVP) -->
      <div class="transaction-section" style="${this.activeTab === 'PARTNERS' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Estrutura de Parceiros Comerciais Padrão</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela KNVP</span>
        </div>

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
      </div>

      <!-- Conteúdo da Aba 4: Gestão de Crédito (KNKK) -->
      <div class="transaction-section" style="${this.activeTab === 'CREDIT' ? '' : 'display: none;'}">
        <div class="section-title">
          <span>Área de Controle de Crédito (BR01)</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela KNKK</span>
        </div>

        <div class="form-grid-4">
          <div class="erp-card" style="padding: 12px;">
            <div class="text-xs text-muted">Limite de Crédito Aprovado:</div>
            <div class="font-mono text-base font-bold text-primary">
              ${Formatters.currency(customer.creditLimit)}
            </div>
          </div>

          <div class="erp-card" style="padding: 12px;">
            <div class="text-xs text-muted">Exposição / Saldo Utilizado:</div>
            <div class="font-mono text-base font-bold ${customer.creditUsed > customer.creditLimit * 0.9 ? 'text-danger' : 'text-navy-900'}">
              ${Formatters.currency(customer.creditUsed)}
            </div>
          </div>

          <div class="erp-card" style="padding: 12px;">
            <div class="text-xs text-muted">Categoria de Risco:</div>
            <div class="text-sm font-semibold">
              ${customer.riskCategory}
            </div>
          </div>

          <div class="erp-card" style="padding: 12px;">
            <div class="text-xs text-muted">Status Comercial:</div>
            <div>
              ${customer.creditStatus === 'BLOCKED' 
                ? `<span class="erp-badge erp-badge-danger">${Icons.lock} Bloqueado na VKM1</span>` 
                : `<span class="erp-badge erp-badge-success">${Icons.check} Crédito Regular</span>`}
            </div>
          </div>
        </div>

        <div class="erp-card" style="margin-top: 14px; padding: 12px; background-color: var(--erp-surface-subtle);">
          <div class="text-xs font-semibold text-muted" style="margin-bottom: 4px;">Observações do Departamento Financeiro (FI-AR):</div>
          <p class="text-xs text-navy-900">${customer.notes}</p>
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    this.container.querySelectorAll('.transaction-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const t = tab.getAttribute('data-tab');
        if (t) {
          this.activeTab = t;
          this.render();
        }
      });
    });

    const sel = this.container.querySelector('#customer-selector');
    if (sel) {
      sel.addEventListener('change', (e) => {
        this.selectedCustomerId = e.target.value;
        this.render();
      });
    }

    const confirmBtn = this.container.querySelector('#btn-confirm-analysis');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const result = scenarioEngine.validateCustomerAnalysis(this.selectedCustomerId);
        
        diagnosticModal.show({
          isValid: result.isValid,
          mentorSpeech: result.feedback.mentorSpeech,
          whatHappened: result.feedback.whatHappened,
          why: result.feedback.why,
          businessImpact: result.feedback.businessImpact,
          onConfirm: () => {
            if (result.isValid) {
              this.onNavigate('VA01');
            }
          }
        });
      });
    }
  }

  getElement() {
    return this.container;
  }
}
