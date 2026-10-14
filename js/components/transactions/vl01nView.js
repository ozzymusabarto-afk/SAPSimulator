/**
 * NexusTech ERP • VL01N View Component
 * Transação de Criação de Fornecimento com Referência à Ordem de Venda (Outbound Delivery)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { db } from '../../core/engine/erpDatabase.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { diagnosticModal } from '../diagnosticModal.js';
import { MentorDockComponent } from '../mentorDock.js';
import { CompanyStructure } from '../../core/domain/company.js';

export class Vl01nViewComponent {
  constructor(onNavigate, initialParams = {}) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'vl01n-view';
    this.selectedShippingPoint = '';
    this.selectedSalesOrderNumber = '';
    this.deliveryDate = new Date().toISOString().split('T')[0];
    this.loadedOrder = null;
    this.currentScenarioId = null;
    this.savedDeliveryNumber = null; // Número da remessa criada nesta instância (null = ainda não criada)
  }

  resetForm() {
    this.selectedShippingPoint = '';
    this.selectedSalesOrderNumber = '';
    this.deliveryDate = new Date().toISOString().split('T')[0];
    this.loadedOrder = null;
    this.savedDeliveryNumber = null; // Nova missão: nenhuma remessa ainda criada
  }

  setParams(params = {}) {
    // Não pré-preenche automaticamente a ordem por navegação, cumprindo o princípio
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
    // Quando savedDeliveryNumber está preenchido, a remessa já foi criada nesta
    // instância/missão. Renderiza tela de confirmação e retorna antes de exibir
    // o formulário ou o botão Gravar novamente.
    if (this.savedDeliveryNumber !== null) {
      return this._renderDeliveryConfirmed();
    }
    // ── Fim do guard pós-criação ────────────────────────────────────────────

    if (this.selectedSalesOrderNumber) {
      this.loadedOrder = db.getSalesOrder(this.selectedSalesOrderNumber);
    }

    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VL01N</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Criar Fornecimento com Referência à Ordem de Venda</div>
            <div class="text-xs text-muted">Gestão de Expedição & Logística de Saída (Outbound Delivery) • Tabela LIKP / LIPS</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-goto-va03">
            ${Icons.fileText} Consultar Ordem (VA03)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-goto-vl02n">
            ${Icons.package} Processar Picking (VL02N)
          </button>
        </div>
      </div>

      <!-- Seção 1: Parâmetros Iniciais de Remessa -->
      <div class="transaction-section">
        <div class="section-title">
          <span>Critérios de Seleção para Criação da Remessa</span>
          <span class="erp-badge erp-badge-sap text-xs">Ponto de Expedição</span>
        </div>

        <div class="form-grid-4" style="align-items: flex-end;">
          <div>
            <label class="form-label">
              <span>Ponto de Expedição / Origem Física:</span>
              <button type="button" class="erp-field-help-btn" data-help-id="shippingPoint" title="F1 - Ajuda do Campo">?</button>
            </label>
            <select class="erp-select font-mono" id="vl01n-shipping-point" data-help-id="shippingPoint">
              <option value="" ${!this.selectedShippingPoint ? 'selected' : ''}>-- Selecionar Centro de Origem --</option>
              ${CompanyStructure.shippingPoints.map(sp => `
                <option value="${sp.id}" ${this.selectedShippingPoint === sp.id ? 'selected' : ''}>${sp.name}</option>
              `).join('')}
            </select>
            <div class="text-xs text-muted" style="margin-top: 4px; font-size: 11px;">
              Local de onde sairá a mercadoria
            </div>
          </div>

          <div>
            <label class="form-label">Data Seleção / Remessa:</label>
            <input type="date" class="erp-input font-mono" id="vl01n-delivery-date" value="${this.deliveryDate}">
          </div>

          <div>
            <label class="form-label">Número da Ordem de Venda (VBELN):</label>
            <div style="display: flex; gap: 6px;">
              <input type="text" class="erp-input font-mono font-bold" id="vl01n-order-input" placeholder="Ex: 10000007" value="${this.selectedSalesOrderNumber || ''}" style="flex: 1; min-width: 0; text-transform: uppercase;">
            </div>
          </div>

          <div>
            <button class="btn btn-primary" id="btn-load-order" style="width: 100%;">
              ${Icons.search} Carregar Ordem
            </button>
          </div>
        </div>
      </div>

      <!-- Seção 2: Dados da Ordem Carregada e Grade de Itens -->
      ${this.loadedOrder ? `
        <div class="transaction-section">
          <div class="section-title">
            <span>Dados do Documento de Origem: Ordem nº ${Formatters.documentNumber(this.loadedOrder.docNumber)}</span>
            <div>
              ${this.loadedOrder.overallStatus === 'CREDIT_BLOCKED' 
                ? `<span class="erp-badge erp-badge-danger">${Icons.lock} Bloqueado por Crédito (VKM1)</span>`
                : this.loadedOrder.overallStatus === 'CANCELLED'
                ? `<span class="erp-badge erp-badge-danger">${Icons.alertTriangle} Ordem Cancelada</span>`
                : this.loadedOrder.deliveryStatus === 'COMPLETED'
                ? `<span class="erp-badge erp-badge-success">${Icons.check} Fornecimento Concluído</span>`
                : `<span class="erp-badge erp-badge-success">${Icons.check} Disponível para Fornecimento</span>`}
            </div>
          </div>

          <!-- Resumo do Cabeçalho da Ordem: Origem e Destino Separados -->
          <div class="form-grid-4" style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <div>
              <div class="text-xs text-muted">Emissor da Ordem (KUNNR):</div>
              <div class="font-semibold text-sm font-mono">
                ${this.loadedOrder.customerId} - ${db.getCustomer(this.loadedOrder.customerId)?.name || ''}
              </div>
              <div class="text-xs text-muted" style="margin-top: 2px;">
                ${this.loadedOrder.salesOrg} / ${this.loadedOrder.distChannel} / ${this.loadedOrder.division}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Origem Física da Carga:</div>
              <div class="font-mono text-sm font-bold text-navy-900">
                ${this.selectedShippingPoint ? CompanyStructure.getShippingPointName(this.selectedShippingPoint) : '<span class="text-muted font-normal">Ponto a selecionar no filtro</span>'}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Destino da Entrega (Recebedor):</div>
              <div class="font-mono text-sm font-semibold text-primary">
                ${(() => {
                  const cust = db.getCustomer(this.loadedOrder.customerId);
                  const city = cust?.city ? `${cust.city}/${cust.state || 'BR'}` : (this.loadedOrder.incotermsLocation || '');
                  const shipTo = cust?.partners?.shipToParty?.name || '';
                  if (city && shipTo) return `${city} • ${shipTo}`;
                  if (city) return city;
                  if (shipTo) return shipTo;
                  return 'Conforme Cadastro do Cliente';
                })()}
              </div>
              <div class="text-xs text-muted" style="margin-top: 2px;">
                Frete: ${this.loadedOrder.incoterms} • ${this.loadedOrder.incotermsLocation || db.getCustomer(this.loadedOrder.customerId)?.incotermsLocation || 'Destino'}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted">Valor Total da Ordem:</div>
              <div class="font-mono text-sm font-bold text-success">${Formatters.currency(this.loadedOrder.totalValue)}</div>
              <div class="text-xs text-muted" style="margin-top: 2px;">
                Prazo: ${this.loadedOrder.paymentTerms}
              </div>
            </div>
          </div>

          <!-- Tabela de Posições da Remessa -->
          <div class="section-title" style="margin-top: 12px;">
            <span>Posições de Fornecimento (Itens a Expedir)</span>
            <span class="text-xs text-muted">${(this.loadedOrder.items || []).length} posições</span>
          </div>

          <div class="erp-table-container">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Material (MATNR)</th>
                  <th>Centro / Depósito</th>
                  <th>Qtd Pedida</th>
                  <th>Qtd a Fornecer</th>
                  <th>Unid</th>
                  <th>Saldo ATP</th>
                  <th>Peso Líquido</th>
                  <th>Status Item</th>
                </tr>
              </thead>
              <tbody>
                ${(this.loadedOrder.items || []).map((it, idx) => {
                  const mat = db.getMaterial(it.materialId);
                  const isStockOk = mat ? mat.stockPhysical >= it.quantity : true;
                  const itemWeight = mat ? (mat.weightKg || 1) * it.quantity : it.quantity;

                  return `
                    <tr>
                      <td class="font-mono font-bold text-center">${(idx + 1) * 10}</td>
                      <td>
                        <div class="font-semibold font-mono text-primary">${it.materialId}</div>
                        <div class="text-xs text-muted">${mat ? mat.description : ''}</div>
                      </td>
                      <td class="font-mono text-xs">${mat ? mat.plantId : '1000'} / ${mat ? mat.storageLocation : 'DEP1'}</td>
                      <td class="font-mono font-bold text-center">${it.quantity}</td>
                      <td class="font-mono font-bold text-center text-success">${it.quantity}</td>
                      <td class="text-xs text-center">${mat ? mat.baseUnit : 'UN'}</td>
                      <td class="font-mono text-center">${mat ? mat.stockAvailable : 0} UN</td>
                      <td class="font-mono text-right text-xs">${itemWeight.toFixed(1)} Kg</td>
                      <td>
                        <span class="erp-badge ${isStockOk ? 'erp-badge-success' : 'erp-badge-danger'} text-xs">
                          ${isStockOk ? 'Confirmado' : 'Ruptura'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Barra de Ações Inferior -->
          <div style="display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
            <button class="btn btn-secondary" id="btn-cancel-delivery">
              Cancelar
            </button>
            <button class="btn btn-primary" id="btn-save-delivery" style="padding: 8px 24px;">
              ${Icons.check} Gerar Remessa / Fornecimento (Gravar)
            </button>
          </div>
        </div>
      ` : `
        <div class="erp-card" style="text-align: center; padding: 40px 16px; background: #ffffff;">
          <div style="color: var(--erp-blue-primary); margin-bottom: 10px;">${Icons.fileText}</div>
          <h4 class="font-semibold" style="color: var(--erp-navy-900);">Informe o número da Ordem de Venda</h4>
          <p class="text-xs text-muted" style="margin-top: 4px; max-width: 500px; margin-left: auto; margin-right: auto;">
            Digite o número da ordem no campo superior ou selecione na lista suspensa e clique em "Carregar Ordem" para visualizar as posições liberadas para remessa.
          </p>
        </div>
      `}

      <!-- Guia Didático de Negócio sobre VL01N -->
      <div class="erp-card" style="padding: 16px; margin-top: 20px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: var(--erp-blue-primary);">${Icons.info}</span>
          <span class="font-semibold text-xs text-navy-900" style="text-transform: uppercase;">Conceitos Essenciais da Transação VL01N no SAP SD</span>
        </div>
        <p class="text-xs text-muted" style="line-height: 1.5;">
          A transação <strong>VL01N</strong> cria a Remessa com base em uma Ordem de Venda existente. Ela representa a autorização formal da área de vendas para que o Centro de Distribuição (Ponto de Expedição) inicie a separação física (Picking) e o empacotamento das mercadorias. Se a ordem estiver retida por crédito (VKM1), o fornecimento é rigorosamente bloqueado.
        </p>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // Botões da tela de confirmação pós-criação
    const btnVl02nC = this.container.querySelector('#btn-goto-vl02n-confirmed');
    if (btnVl02nC) {
      btnVl02nC.addEventListener('click', () => this.onNavigate('VL02N', { deliveryNumber: this.savedDeliveryNumber }));
    }
    const btnVl03nC = this.container.querySelector('#btn-goto-vl03n-confirmed');
    if (btnVl03nC) {
      btnVl03nC.addEventListener('click', () => this.onNavigate('VL03N', { deliveryNumber: this.savedDeliveryNumber }));
    }
    const btnDashC = this.container.querySelector('#btn-goto-dashboard-confirmed');
    if (btnDashC) {
      btnDashC.addEventListener('click', () => this.onNavigate('DASHBOARD'));
    }

    // 1. Botão Carregar Ordem & Tecla Enter
    const btnLoad = this.container.querySelector('#btn-load-order');
    const orderInput = this.container.querySelector('#vl01n-order-input');

    const executeLoadOrder = () => {
      const shippingSelect = this.container.querySelector('#vl01n-shipping-point');
      const dateInput = this.container.querySelector('#vl01n-delivery-date');

      this.selectedSalesOrderNumber = orderInput ? orderInput.value.trim() : '';
      this.selectedShippingPoint = shippingSelect ? shippingSelect.value : '';
      this.deliveryDate = dateInput ? dateInput.value : this.deliveryDate;

      if (!this.selectedSalesOrderNumber) {
        diagnosticModal.show({
          isValid: false,
          mentorSpeech: 'Atenção: Informe o número da Ordem de Venda (VBELN) que deseja fornecer antes de prosseguir.',
          whatHappened: 'Nenhum número de ordem de venda foi digitado.',
          why: 'A transação VL01N exige um documento de ordem precedente para extrair itens e dados de entrega.',
          businessImpact: 'Sem a ordem, não há definição de cliente, endereçamento e materiais a separar.'
        });
        return;
      }

      const order = db.getSalesOrder(this.selectedSalesOrderNumber);
      if (!order) {
        diagnosticModal.show({
          isValid: false,
          mentorSpeech: `Atenção: A Ordem de Venda nº ${this.selectedSalesOrderNumber} não foi encontrada no banco de dados. Verifique a digitação ou consulte a lista na VA03.`,
          whatHappened: `Ordem ${this.selectedSalesOrderNumber} inexistente.`,
          why: 'O documento precisa ter sido previamente gravado na VA01 ou constar na base inicial.',
          businessImpact: 'Impossível prosseguir sem um documento comercial válido.'
        });
        return;
      }

      this.loadedOrder = order;

      const scenario = scenarioEngine.getActiveScenario();
      if (scenario) {
        const targetDoc = scenario.targetCriteria?.targetDocNumber;
        if (!targetDoc || targetDoc === order.docNumber) {
          scenarioEngine.completeObjective('access_vl01n');
          scenarioEngine.completeObjective('check_order');
        }
      }

      this.render();
    };

    if (btnLoad) {
      btnLoad.addEventListener('click', executeLoadOrder);
    }
    if (orderInput) {
      orderInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeLoadOrder();
        }
      });
    }

    // 2. Seleção de Ponto de Expedição
    const shippingSelect = this.container.querySelector('#vl01n-shipping-point');
    if (shippingSelect) {
      shippingSelect.addEventListener('change', (e) => {
        this.selectedShippingPoint = e.target.value;
        const scenario = scenarioEngine.getActiveScenario();
        if (scenario && scenario.targetCriteria?.shippingPoint === e.target.value) {
          scenarioEngine.completeObjective('select_shipping_point');
        }
      });
    }

    // 3. Botão Salvar Remessa
    const btnSave = this.container.querySelector('#btn-save-delivery');
    if (btnSave && this.loadedOrder) {
      btnSave.addEventListener('click', () => {
        // Guard contra dupla criação no nível de lógica
        if (this.savedDeliveryNumber !== null) return;

        const currentShippingSelect = this.container.querySelector('#vl01n-shipping-point');
        const shippingPoint = currentShippingSelect ? currentShippingSelect.value : this.selectedShippingPoint;

        if (!shippingPoint) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: 'Atenção: Selecione o Ponto de Expedição (Shipping Point) antes de gerar o fornecimento.',
            whatHappened: 'Nenhum ponto de expedição foi selecionado.',
            why: 'O Ponto de Expedição determina o local físico de onde as mercadorias serão despachadas.',
            businessImpact: 'A remessa não pode ser emitida sem a definição do Centro de Distribuição responsável.'
          });
          return;
        }

        const activeScenario = scenarioEngine.getActiveScenario();
        const deliveryTarget = activeScenario?.targetCriteria;
        const wrongOrder = deliveryTarget?.targetDocNumber && this.loadedOrder.docNumber !== deliveryTarget.targetDocNumber;
        const wrongShippingPoint = deliveryTarget?.shippingPoint && shippingPoint !== deliveryTarget.shippingPoint;
        if (activeScenario && (wrongOrder || wrongShippingPoint)) {
          const validation = scenarioEngine.validateDeliveryCreation(shippingPoint, this.loadedOrder.docNumber, null);
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: validation.mentorSpeech,
            whatHappened: validation.whatHappened,
            why: validation.why,
            businessImpact: validation.businessImpact
          });
          return;
        }
        // Tenta criar no banco
        const result = db.createDelivery({
          salesOrderNumber: this.loadedOrder.docNumber,
          shippingPoint,
          deliveryDate: this.deliveryDate
        });

        if (!result.success) {
          diagnosticModal.show({
            isValid: false,
            mentorSpeech: `Atenção: Não foi possível gerar o fornecimento. Motivo: ${result.error}`,
            whatHappened: result.error,
            why: 'As regras de negócio do SAP SD impedem a expedição de ordens com pendências comerciais ou canceladas.',
            businessImpact: 'A ordem permanecerá retida até a resolução da pendência na transação correspondente (ex: VKM1).'
          });
          return;
        }

        // Persiste o número da remessa criada — impede nova criação
        this.savedDeliveryNumber = result.delivery.deliveryNumber;

        // Validação no ScenarioEngine
        const validation = scenarioEngine.validateDeliveryCreation(shippingPoint, this.loadedOrder.docNumber, result.delivery);

        if (validation.isValid) {
          MentorDockComponent.speak(`Documento de remessa ${result.delivery.deliveryNumber} criado com sucesso. Prossiga para a VL02N para o Picking e Saída de Mercadorias (PGI).`, 'SUCCESS');
        }

        const shippingDesc = CompanyStructure.getShippingPointName(shippingPoint);

        diagnosticModal.show({
          isValid: validation.isValid,
          operationSummary: validation.isValid ? {
            title: 'Fornecimento / Remessa Criada com Sucesso',
            docTypeBadge: 'LIKP / LIPS • Remessa de Saída',
            primaryLabel: 'Nº da Remessa (Outbound Delivery):',
            primaryNumber: result.delivery.deliveryNumber,
            statusText: 'Aguardando Separação / Picking (OPEN)',
            partnerLabel: 'Ponto de Expedição:',
            partnerOrOrigin: shippingDesc,
            referenceDoc: `Ordem de Origem: ${Formatters.documentNumber(this.loadedOrder.docNumber)}`,
            inspectLabel: `Inspecionar Remessa [${result.delivery.deliveryNumber}] em VL03N`
          } : null,
          mentorSpeech: validation.mentorSpeech,
          whatHappened: validation.whatHappened,
          why: validation.why,
          businessImpact: validation.businessImpact,
          onConfirm: () => {
            // Navega para VL02N para permitir o picking/PGI
            this.onNavigate('VL02N', { deliveryNumber: result.delivery.deliveryNumber });
          },
          onInspect: () => {
            this.onNavigate('VL03N', { deliveryNumber: result.delivery.deliveryNumber });
          }
        });
      });
    }

    // 4. Navegação auxiliar
    const btnVa03 = this.container.querySelector('#btn-goto-va03');
    if (btnVa03) btnVa03.addEventListener('click', () => this.onNavigate('VA03'));

    const btnVl02n = this.container.querySelector('#btn-goto-vl02n');
    if (btnVl02n) btnVl02n.addEventListener('click', () => this.onNavigate('VL02N'));

    const btnCancel = this.container.querySelector('#btn-cancel-delivery');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        this.loadedOrder = null;
        this.selectedSalesOrderNumber = '';
        this.render();
      });
    }
  }

  _renderDeliveryConfirmed() {
    const scenario = scenarioEngine.getActiveScenario();
    const scenarioCode = scenario ? scenario.code : '';
    this.container.innerHTML = `
      <div class="transaction-header-bar">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">VL01N</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Criar Fornecimento com Referência à Ordem de Venda</div>
            <div class="text-xs text-muted">Gestão de Expedição &amp; Logística de Saída (Outbound Delivery) • Tabela LIKP / LIPS</div>
          </div>
        </div>
      </div>
      <div class="erp-card" style="margin-top: 20px; padding: 28px 24px; background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; text-align: center;">
        <div style="color: #15803d; font-size: 32px; margin-bottom: 12px;">${Icons.check}</div>
        <h3 style="color: #14532d; font-size: 16px; font-weight: 700; margin: 0 0 6px 0;">
          Remessa criada com sucesso!
        </h3>
        <div style="font-size: 22px; font-weight: 800; color: #15803d; margin: 10px 0; font-family: monospace;">
          Remessa nº ${this.savedDeliveryNumber}
        </div>
        <p class="text-xs text-muted" style="max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
          ${scenarioCode ? `[${scenarioCode}] ` : ''}O documento de fornecimento foi gerado com sucesso. Agora acesse a <strong>VL02N</strong> para registrar o Picking e a Saída de Mercadorias (PGI / Mov. 601).
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-goto-vl02n-confirmed">
            ${Icons.package} Processar Picking e PGI (VL02N)
          </button>
          <button class="btn btn-secondary" id="btn-goto-vl03n-confirmed">
            ${Icons.search} Consultar Remessa (VL03N)
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
