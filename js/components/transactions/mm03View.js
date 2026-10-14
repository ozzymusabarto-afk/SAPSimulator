/**
 * NexusTech ERP • MM03 View Component
 * Transação de Consulta de Dados Mestres de Materiais & Disponibilidade ATP
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';

export class Mm03ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'mm03-view';
    this.selectedMaterialId = '';
    this.searchError = '';
    this.currentScenarioId = null; // Lote D: guard de cenario
  }

  resetForm() {
    // Lote D: limpa estado ao mudar de missao
    this.selectedMaterialId = '';
    this.searchError = '';
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }
    const material = this.selectedMaterialId ? db.getMaterial(this.selectedMaterialId) : null;

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">MM03</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Exibir Material: Dados Básicos, Vendas & Estoque (ATP)</div>
            <div class="text-xs text-muted">Mestre de Materiais • Tabelas MARA / MARC / MARD</div>
          </div>
        </div>
        <div class="transaction-actions">
          <span class="erp-badge erp-badge-sap text-xs">Centro 1000 • Depósito DEP1</span>
        </div>
      </div>

      <!-- Barra de Seleção de Material -->
      <div class="transaction-selection-bar">
        <div class="transaction-selection-group" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="transaction-selection-label">Material (MATNR):</span>
          <input
            type="text"
            id="mm03-material-input"
            class="erp-input font-mono font-bold text-xs"
            placeholder="Ex: MAT-1001"
            value="${this.selectedMaterialId || ''}"
            style="width: 150px; text-transform: uppercase;"
          />
          <button class="btn btn-primary btn-sm" id="btn-search-material">
            ${Icons.search} Consultar
          </button>
        </div>
        <div class="text-xs text-muted font-mono">
          ${material ? `Tipo: <span class="font-bold text-primary">${material.type || 'FERT'}</span>` : 'Acesso Inicial ao Mestre'}
        </div>
      </div>

      ${this.searchError ? `
        <div class="erp-alert erp-alert-danger" style="margin: 12px 0; padding: 10px 14px; border-radius: 6px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 13px; display: flex; align-items: center; gap: 8px;">
          ${Icons.alertTriangle}
          <span>${this.searchError}</span>
        </div>
      ` : ''}

      ${!material ? `
        <!-- Estado Vazio Inicial -->
        <div class="erp-card" style="text-align: center; padding: 48px 16px; background: #ffffff; margin-top: 16px; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 12px; font-size: 28px;">${Icons.package}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900); font-size: 16px; margin-bottom: 6px;">Nenhum material carregado para exibição</h4>
          <p class="text-xs text-muted" style="max-width: 520px; margin: 0 auto; line-height: 1.5;">
            Informe o código do material (MATNR) no campo acima e clique em <strong>Consultar</strong> (ou pressione Enter) para visualizar os dados básicos (MARA), disponibilidade física e reservada (ATP) e precificação ativa (KONP).
          </p>
        </div>
      ` : `

      <!-- Resumo do Material -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Dados Centrais do Produto (Tabela MARA)</span>
          <span class="erp-badge erp-badge-sap text-xs">Visão Dados Básicos 1</span>
        </div>

        <div class="form-grid-3">
          <div class="erp-form-group">
            <label class="erp-form-label">Código do Material (MATNR)</label>
            <input type="text" class="erp-input font-mono font-bold" value="${material.id}" readonly />
          </div>
          <div class="erp-form-group">
            <label class="erp-form-label">Texto Breve do Material (MAKTX)</label>
            <input type="text" class="erp-input" value="${material.description}" readonly />
          </div>
          <div class="erp-form-group">
            <label class="erp-form-label">Unidade de Medida Básica (MEINS)</label>
            <input type="text" class="erp-input font-mono" value="${material.baseUnit} - Unidade" readonly />
          </div>
        </div>
      </div>

      <!-- Disponibilidade de Estoque (ATP / MARC / MARD) -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Verificação de Disponibilidade (ATP - Available to Promise)</span>
          <span class="erp-badge erp-badge-sap text-xs">Centro 1000 • Depósito DEP1</span>
        </div>

        <div class="form-grid-3">
          <div class="erp-card" style="padding: 14px;">
            <div class="text-xs text-muted">Estoque Físico em Depósito (LABST):</div>
            <div class="font-mono text-xl font-bold text-navy-900">
              ${material.stockPhysical} ${material.baseUnit}
            </div>
            <div class="text-xs text-light" style="margin-top: 4px;">Quantidade total armazenada no CD</div>
          </div>

          <div class="erp-card" style="padding: 14px;">
            <div class="text-xs text-muted">Estoque Reservado em Ordens:</div>
            <div class="font-mono text-xl font-bold text-warning">
              ${material.stockReserved} ${material.baseUnit}
            </div>
            <div class="text-xs text-light" style="margin-top: 4px;">Comprometido com outros pedidos</div>
          </div>

          <div class="erp-card" style="padding: 14px;">
            <div class="text-xs text-muted">Disponível para Confirmação (ATP):</div>
            <div class="font-mono text-xl font-bold ${material.stockAvailable < 10 ? 'text-danger' : 'text-success'}">
              ${material.stockAvailable} ${material.baseUnit}
            </div>
            <div class="text-xs text-light" style="margin-top: 4px;">Saldo livre para emissão imediata</div>
          </div>
        </div>
      </div>

      <!-- Precificação & Dados Fiscais -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Condição de Preço Base & Dados Fiscais</span>
          <span class="erp-badge erp-badge-sap text-xs">Tabela KONP / MARC</span>
        </div>

        <div class="form-grid-3">
          <div class="erp-form-group">
            <label class="erp-form-label">Preço Base Ativo (Condição PR00)</label>
            <div class="font-mono text-base font-bold ${material.basePrice > 0 ? 'text-primary' : 'text-danger'}">
              ${material.basePrice > 0 ? Formatters.currency(material.basePrice) : 'SEM REGISTRO DE PREÇO NA VK11'}
            </div>
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Classificação Fiscal (NCM)</label>
            <input type="text" class="erp-input font-mono" value="${material.ncm}" readonly />
          </div>

          <div class="erp-form-group">
            <label class="erp-form-label">Regra Tributária ICMS</label>
            <input type="text" class="erp-input font-mono" value="${material.taxClassification}" readonly />
          </div>
        </div>
      </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const searchInput = this.container.querySelector('#mm03-material-input');
    const searchBtn = this.container.querySelector('#btn-search-material');

    const executeSearch = () => {
      const val = searchInput ? searchInput.value.trim().toUpperCase() : '';
      if (!val) {
        this.searchError = 'Informe o código do material (MATNR) para consulta.';
        this.selectedMaterialId = '';
        this.render();
        return;
      }

      const foundMaterial = db.getMaterial(val);
      if (!foundMaterial) {
        this.searchError = `Material "${val}" não encontrado no cadastro do mandante 800.`;
        this.selectedMaterialId = '';
        this.render();
        return;
      }

      this.searchError = '';
      this.selectedMaterialId = foundMaterial.id;
      this.render();

      const result = scenarioEngine.validateMaterialAnalysis(foundMaterial.id);
      if (!result.isValid && result.mentorSpeech) {
        this.searchError = result.mentorSpeech;
        this.render();
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
