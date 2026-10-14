/**
 * NexusTech ERP • VL03N View Component
 * Transação de Consulta de Fornecimento / Remessa (Display Outbound Delivery)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { CompanyStructure } from '../../core/domain/company.js';

export class Vl03nViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vl03n-view';
    this.selectedDeliveryNumber = ''; // Lote D+E: não pré-preencher via initialParams
    this.loadedDelivery = null;
    this.currentScenarioId = null;   // Lote D: guard de cenário
  }

  resetForm() {
    // Lote D: limpa estado ao mudar de missão
    this.selectedDeliveryNumber = '';
    this.loadedDelivery = null;
  }

  setParams(params = {}) {
    // A inspeção contextual de uma remessa criada nesta sessão pode carregar seu documento.
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }
    this.selectedDeliveryNumber = params.deliveryNumber || '';
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const activeScenarioId = scenario ? scenario.id : null;

    // Lote D: guard de cenário
    if (this.currentScenarioId !== activeScenarioId) {
      this.resetForm();
      this.currentScenarioId = activeScenarioId;
    }

    // Lote B: completeObjective('access_vl03n') REMOVIDO do render().
    // Será disparado no bindEvents apenas após o trainee carregar manualmente a remessa.

    const allDeliveries = db.getAllDeliveries();
    // Lote C: remove auto-carregamento — sem ação do trainee, loadedDelivery permanece null
    if (this.selectedDeliveryNumber) {
      this.loadedDelivery = db.getDelivery(this.selectedDeliveryNumber);
    }

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VL03N</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Exibir Fornecimento: Detalhes da Remessa & Rastreabilidade</div>
            <div class="text-xs text-muted">Consulta de Expedição • Ponto de Expedição, Pesos e Fluxo de Documentos (LIKP / VBFA)</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-vl01n">
            ${Icons.fileText} Nova Remessa (VL01N)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-vl02n">
            ${Icons.edit} Modificar / PGI (VL02N)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-va03">
            ${Icons.layers} Ordem Origem (VA03)
          </button>
        </div>
      </div>

      <!-- Seletor de Remessa para Consulta -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Localizar Documento de Remessa</span>
          <span class="erp-badge erp-badge-sap text-xs">Modo Somente Leitura</span>
        </div>

        <div class="form-grid-3" style="align-items: flex-end;">
          <div style="grid-column: span 2;">
            <label class="form-label">Número do Fornecimento (Outbound Delivery):</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="erp-input font-mono font-bold" id="vl03n-delivery-input" 
                placeholder="Ex: 80000001" value="${this.selectedDeliveryNumber}" style="flex: 1;">
              <select class="erp-select font-mono text-xs" id="vl03n-delivery-quick-select" style="max-width: 260px;">
                <option value="">-- Selecionar Remessa --</option>
                ${(() => {
                  // F2-A: Filtra remessas pelo cenário ativo
                  const scenario = scenarioEngine.getActiveScenario();
                  const scenarioOrderNums = (scenario?.initialDocuments || []).map(d => d.salesOrderNumber).filter(Boolean);
                  const eligible = scenarioOrderNums.length > 0
                    ? allDeliveries.filter(d => scenarioOrderNums.includes(d.salesOrderNumber))
                    : allDeliveries;
                  if (eligible.length === 0) {
                    return '<option value="" disabled>Nenhuma remessa disponível</option>';
                  }
                  return eligible.map(d => `
                    <option value="${d.deliveryNumber}" ${d.deliveryNumber === this.selectedDeliveryNumber ? 'selected' : ''}>
                      Remessa ${d.deliveryNumber} • OR ${d.salesOrderNumber} (${d.status})
                    </option>
                  `).join('');
                })()}
              </select>
            </div>
          </div>

          <div>
            <button class="btn btn-primary" id="btn-load-delivery" style="width: 100%;">
              ${Icons.search} Visualizar Remessa
            </button>
          </div>
        </div>
      </div>

      <!-- Detalhes do Fornecimento -->
      ${this.loadedDelivery ? `
        <div class="transaction-section">
          <div class="section-title">
            <span>Dados Gerais da Remessa nº ${Formatters.documentNumber(this.loadedDelivery.deliveryNumber)}</span>
            <div style="display: flex; gap: 8px;">
              <span class="erp-badge ${this.loadedDelivery.status === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-primary'}">
                ${this.loadedDelivery.status === 'COMPLETED' ? `${Icons.check} Expedição Concluída (PGI)` : `${Icons.clock} Em Processamento`}
              </span>
              <span class="erp-badge erp-badge-sap text-xs">${CompanyStructure.getShippingPointName(this.loadedDelivery.shippingPoint)}</span>
            </div>
          </div>

          <!-- Grade de Informações de Cabeçalho e Transporte -->
          <div class="form-grid-4" style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <div>
              <div class="text-xs text-muted">Destinatário da Carga (KUNNR):</div>
              <div class="font-semibold text-sm font-mono">
                ${this.loadedDelivery.customerId} - ${db.getCustomer(this.loadedDelivery.customerId)?.name || ''}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Destino / Local de Entrega:</div>
              <div class="font-mono text-sm font-semibold text-primary">
                ${(() => {
                  const cust = db.getCustomer(this.loadedDelivery.customerId);
                  const city = cust?.city ? `${cust.city}/${cust.state || 'BR'}` : 'Conforme Cadastro';
                  const shipTo = cust?.partners?.shipToParty?.name || '';
                  return shipTo ? `${city} • ${shipTo}` : city;
                })()}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Ordem Precedente / Data:</div>
              <div class="font-mono text-sm font-bold text-primary">
                ${Formatters.documentNumber(this.loadedDelivery.salesOrderNumber)} • ${new Date(this.loadedDelivery.deliveryDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Peso Total da Remessa:</div>
              <div class="font-mono text-sm font-bold text-success">${this.loadedDelivery.totalWeightKg.toFixed(1)} Kg</div>
            </div>
          </div>

          <!-- Tabela de Posições da Remessa -->
          <div class="section-title" style="margin-top: 12px;">
            <span>Posições do Documento de Fornecimento</span>
            <span class="text-xs text-muted">${this.loadedDelivery.items.length} itens</span>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Material (MATNR)</th>
                  <th>Centro/Depósito</th>
                  <th>Qtd Fornecida</th>
                  <th>Qtd Picking</th>
                  <th>Unid</th>
                  <th>Peso Líquido</th>
                  <th>Status de Saída</th>
                </tr>
              </thead>
              <tbody>
                ${this.loadedDelivery.items.map((it, idx) => `
                  <tr>
                    <td class="font-mono font-bold text-center">${it.itemPosition || (idx + 1) * 10}</td>
                    <td>
                      <div class="font-semibold font-mono text-primary">${it.materialId}</div>
                      <div class="text-xs text-muted">${it.description}</div>
                    </td>
                    <td class="font-mono text-xs">${it.plantId || '1000'} / ${it.storageLocation || 'DEP1'}</td>
                    <td class="font-mono font-bold text-center">${it.deliveryQuantity}</td>
                    <td class="font-mono font-bold text-center text-success">${it.pickedQuantity || it.deliveryQuantity}</td>
                    <td class="text-xs text-center">${it.unit}</td>
                    <td class="font-mono text-right text-xs">${(it.weightKg || 0).toFixed(1)} Kg</td>
                    <td>
                      <span class="erp-badge ${this.loadedDelivery.status === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-warning'} text-xs">
                        ${this.loadedDelivery.status === 'COMPLETED' ? 'Mov. 601 Concluído' : 'Pendente PGI'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Rastreabilidade e Fluxo de Documentos (VBFA) -->
          <div class="section-title" style="margin-top: 20px;">
            <span>Fluxo de Documentos Integrado (VBFA)</span>
            <span class="erp-badge erp-badge-sap text-xs">Cadeia Logística SD</span>
          </div>

          <div class="doc-flow-tree">
            <div class="doc-flow-node active">
              <div class="doc-flow-info">
                <span class="erp-badge erp-badge-primary">1. Ordem de Venda (OR)</span>
                <span class="doc-flow-number font-mono">Doc: ${Formatters.documentNumber(this.loadedDelivery.salesOrderNumber)}</span>
              </div>
              <span class="erp-badge erp-badge-success">${Icons.check} Concluído</span>
            </div>

            <div class="doc-flow-node active">
              <div class="doc-flow-info">
                <span class="erp-badge erp-badge-primary">2. Fornecimento / Remessa (VL01N)</span>
                <span class="doc-flow-number font-mono">Doc: ${Formatters.documentNumber(this.loadedDelivery.deliveryNumber)}</span>
              </div>
              <span class="erp-badge ${this.loadedDelivery.status === 'COMPLETED' ? 'erp-badge-success' : 'erp-badge-primary'}">
                ${this.loadedDelivery.status === 'COMPLETED' ? `${Icons.check} PGI Realizado` : `${Icons.clock} Em Aberto`}
              </span>
            </div>

            ${this.loadedDelivery.status === 'COMPLETED' ? `
              <div class="doc-flow-node active">
                <div class="doc-flow-info">
                  <span class="erp-badge erp-badge-success">3. Documento de Material MM (Mov. 601)</span>
                  <span class="doc-flow-number font-mono">Doc: 49${this.loadedDelivery.deliveryNumber.slice(2)}</span>
                </div>
                <span class="erp-badge erp-badge-success">${Icons.check} Baixa Física Efetivada</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <div class="erp-card" style="text-align: center; padding: 40px 16px; background: #ffffff;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 10px;">${Icons.search}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900);">Nenhuma remessa selecionada</h4>
          <p class="text-xs text-muted" style="margin-top: 4px; max-width: 500px; margin-left: auto; margin-right: auto;">
            Informe o número da Remessa no campo acima para consultar a situação do fornecimento e o fluxo de documentos.
          </p>
        </div>
      `}
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const btnLoad = this.container.querySelector('#btn-load-delivery');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        const delInput = this.container.querySelector('#vl03n-delivery-input');
        this.selectedDeliveryNumber = delInput ? delInput.value.trim() : '';
        if (this.selectedDeliveryNumber) {
          this.loadedDelivery = db.getDelivery(this.selectedDeliveryNumber);
          if (this.loadedDelivery) {
            // Lote B: completeObjective disparado após carga manual correta
            const scenario = scenarioEngine.getActiveScenario();
            if (scenario) {
              scenarioEngine.completeObjective('access_vl03n');
            }
          }
        }
        this.render();
      });
    }

    const quickSel = this.container.querySelector('#vl03n-delivery-quick-select');
    if (quickSel) {
      quickSel.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectedDeliveryNumber = e.target.value;
          this.loadedDelivery = db.getDelivery(e.target.value);
          this.render();
        }
      });
    }

    const btnVl01n = this.container.querySelector('#btn-goto-vl01n');
    if (btnVl01n) btnVl01n.addEventListener('click', () => this.onNavigate('VL01N'));

    const btnVl02n = this.container.querySelector('#btn-goto-vl02n');
    if (btnVl02n) btnVl02n.addEventListener('click', () => this.onNavigate('VL02N', { deliveryNumber: this.selectedDeliveryNumber }));

    const btnVa03 = this.container.querySelector('#btn-goto-va03');
    if (btnVa03 && this.loadedDelivery) {
      btnVa03.addEventListener('click', () => this.onNavigate('VA03', { docNumber: this.loadedDelivery.salesOrderNumber }));
    }
  }

  getElement() {
    return this.container;
  }
}
