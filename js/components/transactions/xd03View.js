/**
 * NexusTech ERP • XD03 View Component
 * Transação de Consulta de Dados Mestres de Clientes (Customer Master Data)
 * Mentor: Chefe Wilson (Coordenador Comercial | Mentor SD)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { MentorDockComponent } from '../mentorDock.js';

export class Xd03ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'xd03-view';
    this.selectedCustomerId = '';
    this.activeTab = 'SALES'; // GENERAL, SALES, PARTNERS, CREDIT
    this.searchError = '';
    this.currentScenarioId = null; // Lote D: guard de cenario
  }

  resetForm() {
    // Lote D: limpa estado ao mudar de missao
    this.selectedCustomerId = '';
    this.searchError = '';
    this.activeTab = 'SALES';
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }
    const customer = this.selectedCustomerId ? db.getCustomer(this.selectedCustomerId) : null;

    this.container.innerHTML = `
      <!-- Cabeçalho da Transação XD03 -->
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">XD03</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Exibir Cliente: Dados Centrais & Área de Vendas</div>
            <div class="text-xs text-muted">Mestre de Clientes • Visões Gerais, Comerciais e Financeiras</div>
          </div>
        </div>
        <div class="transaction-actions">
          <span class="erp-badge erp-badge-sap text-xs font-mono">Mandante 800 • KNA1 / KNVV</span>
        </div>
      </div>

      <!-- Barra de Seleção do Cliente -->
      <div class="transaction-selection-bar">
        <div class="transaction-selection-group" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="transaction-selection-label">Código / Razão Social (KUNNR):</span>
          <button type="button" class="erp-field-help-btn" data-help-id="customerId" title="F1 - Ajuda do Campo">?</button>
          <input
            type="text"
            id="xd03-customer-input"
            class="erp-input font-mono font-bold text-xs"
            placeholder="Ex: 100045 ou Varejo Eletro"
            value="${this.selectedCustomerId || ''}"
            style="width: 220px;"
          />
          <button class="btn btn-primary btn-sm" id="btn-search-customer">
            ${Icons.search} Consultar
          </button>
        </div>
        <div class="text-xs text-muted font-mono">
          ${customer ? 'Grupo de Contas: <span class="font-bold text-primary">KUNA (Cliente Padrão)</span>' : 'Acesso Inicial ao Mestre (Código, Razão Social ou CNPJ)'}
        </div>
      </div>

      ${this.searchError ? `
        <div class="erp-alert erp-alert-danger" style="margin: 12px 0; padding: 10px 14px; border-radius: 6px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 13px; display: flex; align-items: center; gap: 8px;">
          ${Icons.alertTriangle}
          <span>${this.searchError}</span>
        </div>
      ` : ''}

      ${!customer ? `
        <!-- Estado Vazio Inicial -->
        <div class="erp-card" style="text-align: center; padding: 48px 16px; background: #ffffff; margin-top: 16px; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 12px; font-size: 28px;">${Icons.users}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900); font-size: 16px; margin-bottom: 6px;">Nenhum cliente carregado para exibição</h4>
          <p class="text-xs text-muted" style="max-width: 520px; margin: 0 auto; line-height: 1.5;">
            Informe o código do cliente (KUNNR) no campo acima e clique em <strong>Consultar</strong> (ou pressione Enter) para visualizar as condições comerciais (KNVV), dados cadastrais (KNA1), parceiros (KNVP) e limite de crédito (KNKK).
          </p>
        </div>
      ` : `
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
            <input type="text" class="erp-input font-mono font-bold text-primary" value="${customer.paymentTerms} - ${customer.paymentTerms === 'Z060' ? '60 dias líquido' : customer.paymentTerms === 'Z015' ? '15 dias líquido' : customer.paymentTerms === 'Z28D' ? '28 dias líquido' : '30 dias líquido'}" readonly />
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

        <div class="form-grid-3">
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
      `}
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

    const searchInput = this.container.querySelector('#xd03-customer-input');
    const searchBtn = this.container.querySelector('#btn-search-customer');

    const executeSearch = () => {
      const val = searchInput ? searchInput.value.trim() : '';
      if (!val) {
        this.searchError = 'Informe o código do cliente (KUNNR) para consulta.';
        this.selectedCustomerId = '';
        this.render();
        return;
      }

      const foundCustomer = db.getCustomer(val);
      if (!foundCustomer) {
        this.searchError = `Cliente "${val}" não encontrado no cadastro do mandante 800.`;
        this.selectedCustomerId = '';
        this.render();
        return;
      }

      this.searchError = '';
      this.selectedCustomerId = foundCustomer.id;
      this.render();

      // Validação pedagógica da consulta na XD03 se houver cenário ativo
      const scenario = scenarioEngine.getActiveScenario();
      if (scenario) {
        const result = scenarioEngine.validateCustomerAnalysis(this.selectedCustomerId);
        if (result && result.isValid) {
          const requiresCreditAnalysis = scenario.targetCriteria?.action === 'CREDIT_RELEASE';
          if (requiresCreditAnalysis) this.activeTab = 'CREDIT';
          this.render();

          const mentorGuidance = requiresCreditAnalysis
            ? `Dados de crédito do cliente ${this.selectedCustomerId} carregados. Confira a categoria de risco, o limite, o valor utilizado e as observações financeiras antes de decidir na VKM1.`
            : `Cadastro do cliente ${this.selectedCustomerId} carregado. Revise os dados comerciais nas abas KNVV, KNA1 e KNVP antes de continuar para a próxima etapa.`;
          MentorDockComponent.speak(mentorGuidance, 'SUCCESS');
          // A consulta é uma etapa de análise: manter os dados abertos para inspeção, sem um modal sobrepondo a tela.
          return;
        } else if (result && !result.isValid && result.feedback) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: result.feedback.mentorSpeech,
            whatHappened: result.feedback.whatHappened,
            why: result.feedback.why,
            businessImpact: result.feedback.businessImpact,
            onConfirm: () => {}
          });
        }
      }
    };

    if (searchBtn) {
      searchBtn.addEventListener('click', executeSearch);
    }

    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeSearch();
        }
      });
    }
  }

  getElement() {
    return this.container;
  }
}
