/**
 * NexusTech ERP • VK11 View Component
 * Transação de Criação / Manutenção de Registros de Condição de Preço (Pricing Records)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';

export class Vk11ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vk11-view';

    this.currentScenarioId = null;
    this.conditionCode = 'PR00';
    this.materialId = '';
    this.salesOrg = '1000';
    this.distChannel = '10';
    this.amount = 0;
    this.resetForm();
  }

  resetForm() {
    const activeScenario = scenarioEngine.getActiveScenario();
    const tc = activeScenario?.targetCriteria;

    this.conditionCode = tc?.conditionCode || 'PR00';
    this.salesOrg = tc?.salesOrg || '1000';
    this.distChannel = tc?.distChannel || '10';

    // Prioriza dados declarativos do catálogo/targetCriteria ou fallback do cenário atual
    this.materialId = tc?.targetMaterialId || tc?.items?.[0]?.materialId || 'MAT-4099';
    this.amount = (tc?.targetAmount !== undefined ? tc.targetAmount : (tc?.targetPrice !== undefined ? tc.targetPrice : 65.00));
  }

  render() {
    const activeScenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = activeScenario ? activeScenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    const materials = db.getAllMaterials();
    const records = db.pricingRecords;

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VK11</span>
          <div>
            <div class="transaction-title">Criar Registro de Condição: Preço Base Material (PR00)</div>
            <div class="text-xs text-muted">Esquema de Cálculo • Tabela de Condições KONP</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-primary btn-sm" id="btn-save-condition">
            ${Icons.dollarSign} Gravar Condição (VK11)
          </button>
        </div>
      </div>

      <!-- Formulário de Cadastro de Condição -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Parâmetros da Sequência de Acesso & Tabela de Condição</span>
          <span class="erp-badge erp-badge-sap text-xs">Org. Vendas / Canal / Material</span>
        </div>

        <div class="form-grid-4">
          <div class="erp-form-group">
            <label class="erp-form-label">Tipo de Condição (KSCHL)</label>
            <input type="text" class="erp-input font-mono font-bold" value="PR00 - Preço Base de Tabela" readonly />
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Material (MATNR)</label>
            <select class="erp-select font-mono" id="input-material-id">
              ${materials.map(m => `
                <option value="${m.id}" ${this.materialId === m.id ? 'selected' : ''}>
                  ${m.id} - ${m.description}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Montante / Valor Unitário (KBETR)</label>
            <input type="number" class="erp-input font-mono font-bold text-primary" id="input-amount" value="${this.amount}" step="0.50" min="0.01" />
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Unidade de Condição / Moeda</label>
            <input type="text" class="erp-input font-mono" value="BRL / 1 UN" readonly />
          </div>
        </div>
      </div>

      <!-- Registros de Condição Ativos -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Registros de Condição Ativos na Empresa (Tabela KONP)</span>
        </div>

        <div class="erp-table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Condição</th>
                <th>Material</th>
                <th>Org. Vendas</th>
                <th>Canal</th>
                <th>Montante Unitário</th>
                <th>Moeda</th>
                <th>Validade Até</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(r => `
                <tr>
                  <td class="font-mono font-bold">${r.conditionCode}</td>
                  <td class="font-mono">${r.materialId} - ${db.getMaterial(r.materialId)?.description || ''}</td>
                  <td class="font-mono">${r.salesOrg}</td>
                  <td class="font-mono">${r.distChannel}</td>
                  <td class="font-mono font-bold text-primary">${Formatters.currency(r.amount)}</td>
                  <td class="font-mono">BRL</td>
                  <td class="font-mono text-xs">${r.validTo}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const matSel = this.container.querySelector('#input-material-id');
    if (matSel) {
      matSel.addEventListener('change', (e) => {
        this.materialId = e.target.value;
      });
    }

    const amtInput = this.container.querySelector('#input-amount');
    if (amtInput) {
      amtInput.addEventListener('change', (e) => {
        this.amount = parseFloat(e.target.value) || 0;
      });
    }

    const saveBtn = this.container.querySelector('#btn-save-condition');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        db.addOrUpdatePricingRecord({
          materialId: this.materialId,
          salesOrg: this.salesOrg,
          distChannel: this.distChannel,
          conditionCode: this.conditionCode,
          amount: this.amount,
          validTo: '31.12.2028'
        });

        const activeScenario = scenarioEngine.getActiveScenario();
        if (activeScenario) {
          scenarioEngine.completeObjective('create_pricing_record');
        }

        diagnosticModal.show({
          isValid: true,
          whatHappened: `Registro de condição ${this.conditionCode} para o material ${this.materialId} gravado com sucesso no valor de ${Formatters.currency(this.amount)}.`,
          why: 'A determinação de preço busca registros na sequência de acesso de vendas antes de permitir o cálculo da ordem.',
          businessImpact: 'A ordem de venda que antes estava travada por falta de preço agora poderá ser emitida normalmente.',
          onConfirm: () => this.render()
        });
      });
    }
  }

  getElement() {
    return this.container;
  }
}
