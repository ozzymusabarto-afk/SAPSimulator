/**
 * NexusTech ERP • MM03 View Component
 * Transação de Consulta de Dados Mestres de Materiais & Disponibilidade ATP
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';

export class Mm03ViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'mm03-view';
    this.selectedMaterialId = 'MAT-1001';
  }

  render() {
    const materials = db.getAllMaterials();
    const material = db.getMaterial(this.selectedMaterialId) || materials[0];

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">MM03</span>
          <div>
            <div class="transaction-title">Exibir Material: Dados Básicos, Vendas & Estoque (ATP)</div>
            <div class="text-xs text-muted">Mestre de Materiais • Tabelas MARA / MARC / MARD</div>
          </div>
        </div>
        <div class="transaction-actions">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="text-xs font-semibold">Material:</span>
            <select class="erp-select font-mono text-xs" id="material-selector">
              ${materials.map(m => `
                <option value="${m.id}" ${m.id === material.id ? 'selected' : ''}>
                  ${m.id} - ${m.description}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

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
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const sel = this.container.querySelector('#material-selector');
    if (sel) {
      sel.addEventListener('change', (e) => {
        this.selectedMaterialId = e.target.value;
        this.render();
      });
    }
  }

  getElement() {
    return this.container;
  }
}
