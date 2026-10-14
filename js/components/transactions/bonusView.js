/**
 * Nexus ERP Lab • SD Practice Environment
 * Componente de Visualização: Bônus (Bonus & Materials Hub)
 * Arquivo: js/components/transactions/bonusView.js
 * 
 * Central de materiais de apoio, checklists operacionais e guias de consulta.
 * Respeita requisitos de desbloqueio da fase Trainee e representa itens bloqueados
 * de fases futuras, mantendo eventual certificação sob deliberação.
 */

import { Icons } from '../../utils/icons.js';
import { trainee } from '../../core/engine/traineeEngine.js';

export class BonusViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'bonus-view institutional-view-container';
    this.activeModalItem = null;
  }

  render() {
    const profile = trainee.getProfile();
    const completedList = Array.isArray(profile.completedScenarios)
      ? profile.completedScenarios
      : Object.keys(profile.completedScenarios || {});
    const completedCount = completedList.length;
    const isTraineeEligible = completedCount >= 50;

    this.container.innerHTML = `
      <!-- Header Institucional -->
      <div class="view-header-banner" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);">
        <div class="view-header-content">
          <div class="view-header-tag" style="background: rgba(167, 139, 250, 0.2); color: #c4b5fd;">
            ${Icons.award} Central de Conteúdos Complementares
          </div>
          <h1 class="view-header-title">Área de Bônus & Materiais de Apoio</h1>
          <p class="view-header-subtitle">
            Acesse guias práticos, checklists de procedimentos operacionais e referências de consulta rápida
            para apoiar sua rotina transacional de Vendas e Distribuição.
          </p>
        </div>
        <div style="flex-shrink: 0; background: rgba(255, 255, 255, 0.08); padding: 12px 18px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15); text-align: right;">
          <div style="font-size: 11px; text-transform: uppercase; color: #cbd5e1; font-weight: 700;">Requisito de Desbloqueio</div>
          <div style="font-size: 14px; font-weight: 700; color: #a5b4fc; margin-top: 2px;">
            ${completedCount} / 50 Missões Homologadas
          </div>
        </div>
      </div>

      <!-- SEÇÃO 1: BÔNUS DA FASE TRAINEE SD -->
      <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 14px; font-weight: 700; color: var(--erp-navy-900); text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
          Materiais de Apoio • Formação Trainee SD
        </h3>
        <span style="font-size: 12px; color: ${isTraineeEligible ? '#15803d' : '#64748b'}; font-weight: 600;">
          ${isTraineeEligible ? '✓ Materiais Desbloqueados para Consulta' : '🔒 Requer Conclusão das 50 Missões'}
        </span>
      </div>

      <div class="bonus-grid">
        
        <!-- BÔNUS 1: CHECKLIST OTC -->
        <div class="bonus-card ${isTraineeEligible ? 'unlocked' : 'locked'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="bonus-badge ${isTraineeEligible ? 'unlocked' : 'locked'}">
                ${isTraineeEligible ? '✓ Desbloqueado' : '🔒 Bloqueado'}
              </span>
              <span class="tcode-pill">VA01 / VL01N / VF01</span>
            </div>
            <div class="bonus-card-title">Checklist Operacional Order-to-Cash</div>
            <div class="bonus-card-desc">
              Roteiro passo a passo com a sequência operacional obrigatória, campos mandatórios (KUNNR, VKORG, VTWEG, SPART, VSTEL)
              e conferência de fluxo documental entre ordem, remessa e fatura.
            </div>
          </div>
          <div class="bonus-card-footer">
            <span>Formato: Guia de Procedimento</span>
            ${isTraineeEligible ? `
              <button class="btn btn-secondary btn-xs btn-open-bonus" data-bonus-id="CHECKLIST_OTC">
                ${Icons.fileText} Visualizar
              </button>
            ` : '<span style="color: #64748b; font-size: 11px;">Bloqueado</span>'}
          </div>
        </div>

        <!-- BÔNUS 2: GUIA DE PREÇOS E IMPOSTOS -->
        <div class="bonus-card ${isTraineeEligible ? 'unlocked' : 'locked'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="bonus-badge ${isTraineeEligible ? 'unlocked' : 'locked'}">
                ${isTraineeEligible ? '✓ Desbloqueado' : '🔒 Bloqueado'}
              </span>
              <span class="tcode-pill">VK11 / TAX</span>
            </div>
            <div class="bonus-card-title">Guia Prático de Preço & Impostos no Brasil</div>
            <div class="bonus-card-desc">
              Tabela de consulta de condições comerciais (PR00, RB00, KF00), base de cálculo e alíquotas fiscais
              simuladas (ICMS 18%, PIS e COFINS 9,25%).
            </div>
          </div>
          <div class="bonus-card-footer">
            <span>Formato: Manual Fiscal SD</span>
            ${isTraineeEligible ? `
              <button class="btn btn-secondary btn-xs btn-open-bonus" data-bonus-id="PRICING_GUIDE">
                ${Icons.fileText} Visualizar
              </button>
            ` : '<span style="color: #64748b; font-size: 11px;">Bloqueado</span>'}
          </div>
        </div>

        <!-- BÔNUS 3: MAPA DE NAVEGAÇÃO RÁPIDA -->
        <div class="bonus-card ${isTraineeEligible ? 'unlocked' : 'locked'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="bonus-badge ${isTraineeEligible ? 'unlocked' : 'locked'}">
                ${isTraineeEligible ? '✓ Desbloqueado' : '🔒 Bloqueado'}
              </span>
              <span class="tcode-pill">MENU / ATALHOS</span>
            </div>
            <div class="bonus-card-title">Mapa de Navegação Rápida & Transações SD</div>
            <div class="bonus-card-desc">
              Quadro de referência com todos os T-Codes operacionais, finalidades de negócio, permissões por cargo
              e tabelas relacionais simuladas (VBAK, VBAP, LIKP, VBRK).
            </div>
          </div>
          <div class="bonus-card-footer">
            <span>Formato: Mapa de Navegação</span>
            ${isTraineeEligible ? `
              <button class="btn btn-secondary btn-xs btn-open-bonus" data-bonus-id="NAV_MAP">
                ${Icons.fileText} Visualizar
              </button>
            ` : '<span style="color: #64748b; font-size: 11px;">Bloqueado</span>'}
          </div>
        </div>

        <!-- BÔNUS 4: EVENTUAL CERTIFICAÇÃO (EM DELIBERAÇÃO) -->
        <div class="bonus-card locked" style="background: #fafafa; border-style: dashed;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="bonus-badge pending-decision">
                ${Icons.alertTriangle} Em Deliberação
              </span>
              <span class="tcode-pill">CERTIFICAÇÃO</span>
            </div>
            <div class="bonus-card-title">Certificado Digital de Formação Trainee</div>
            <div class="bonus-card-desc">
              Possibilidade futura de emissão de certificado digital após conclusão e homologação no Diagnóstico.
              <em>Item sujeito à decisão posterior da proprietária do projeto. Não constitui promessa de concessão obrigatória nesta fase.</em>
            </div>
          </div>
          <div class="bonus-card-footer">
            <span style="color: #92400e; font-size: 11px;">Critérios em definição de produto</span>
            <span class="erp-badge erp-badge-warning text-xs">Pendente</span>
          </div>
        </div>

      </div>

      <!-- SEÇÃO 2: BÔNUS DE FASES FUTURAS -->
      <div style="margin-top: 28px; margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
          Conteúdos Especiais • Fases Futuras (Analista Júnior & Pleno)
        </h3>
      </div>

      <div class="bonus-grid">
        <div class="bonus-card locked">
          <div>
            <span class="bonus-badge locked">🔒 Analista Júnior</span>
            <div class="bonus-card-title">Kit de Diagnóstico de Exceções & Devoluções</div>
            <div class="bonus-card-desc">
              Tratativa de ordens de devolução (RE), solicitação de crédito/débito e cancelamentos tributários.
            </div>
          </div>
          <div class="bonus-card-footer">
            <span>Fase Futura</span>
            <span style="color: #64748b; font-size: 11px;">Bloqueado</span>
          </div>
        </div>

        <div class="bonus-card locked">
          <div>
            <span class="bonus-badge locked">🔒 Analista Pleno</span>
            <div class="bonus-card-title">Manual de Contratos Globais & Cenários Multicanal</div>
            <div class="bonus-card-desc">
              Gestão de fornecimento agrupado, limites avançados de crédito e governança fiscal em larga escala.
            </div>
          </div>
          <div class="bonus-card-footer">
            <span>Fase Futura</span>
            <span style="color: #64748b; font-size: 11px;">Bloqueado</span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    this.container.querySelectorAll('.btn-open-bonus').forEach(btn => {
      btn.addEventListener('click', () => {
        const bonusId = btn.getAttribute('data-bonus-id');
        this.showBonusModal(bonusId);
      });
    });
  }

  showBonusModal(bonusId) {
    let title = 'Material de Apoio';
    let content = '';

    if (bonusId === 'CHECKLIST_OTC') {
      title = 'Checklist Operacional Order-to-Cash (SD)';
      content = `
        <div style="font-size: 13px; line-height: 1.6; color: #1e293b;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a;">Sequência Transacional Mandatória:</h4>
          <ol style="margin: 0 0 16px 0; padding-left: 20px;">
            <li><strong>VA01 (Criar Ordem):</strong> Verificar Emissor (KUNNR), Área de Vendas (1000/10/01), Pedido do Cliente (BSTNK), Condições de Pagamento e Itens.</li>
            <li><strong>VKM1 (Crédito):</strong> Caso a ordem seja retida, avaliar limite e risco antes de liberar.</li>
            <li><strong>VL01N (Fornecimento):</strong> Confirmar Ponto de Expedição correspondente (1000/2000) e salvar remessa.</li>
            <li><strong>VL02N (PGI):</strong> Conferir mercadorias e executar Post Goods Issue para baixar estoque físico.</li>
            <li><strong>VF01 (Faturamento):</strong> Gerar fatura comercial F2 e conferir fluxo documental.</li>
          </ol>
        </div>
      `;
    } else if (bonusId === 'PRICING_GUIDE') {
      title = 'Guia de Preço & Impostos no Brasil';
      content = `
        <div style="font-size: 13px; line-height: 1.6; color: #1e293b;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a;">Esquema de Determinação Fiscal:</h4>
          <ul style="margin: 0 0 16px 0; padding-left: 20px;">
            <li><strong>PR00:</strong> Preço Base Bruto obrigatório por material e canal.</li>
            <li><strong>RB00:</strong> Desconto comercial percentual aplicável.</li>
            <li><strong>KF00:</strong> Frete específico (CIF: embutido / FOB: debitado do comprador).</li>
            <li><strong>ICMS (18%):</strong> Imposto sobre circulação de mercadorias calculado sobre a base líquida.</li>
            <li><strong>PIS/COFINS (9,25%):</strong> Contribuições sociais integradas ao documento de faturamento F2.</li>
          </ul>
        </div>
      `;
    } else if (bonusId === 'NAV_MAP') {
      title = 'Mapa de Navegação Rápida & Transações SD';
      content = `
        <div style="font-size: 13px; line-height: 1.6; color: #1e293b;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a;">T-Codes Essenciais do Simulador:</h4>
          <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; font-family: monospace;">
            <strong>VA01:</strong> <span>Criar Ordem de Venda</span>
            <strong>VA02:</strong> <span>Modificar Ordem de Venda</span>
            <strong>VA03:</strong> <span>Exibir Ordem & Fluxo Documental</span>
            <strong>XD03:</strong> <span>Exibir Cadastro de Clientes</span>
            <strong>MM03:</strong> <span>Exibir Cadastro de Materiais & Estoque</span>
            <strong>VK11:</strong> <span>Criar Registros de Condição de Preço</span>
            <strong>VKM1:</strong> <span>Monitor de Documentos de Venda Bloqueados por Crédito</span>
            <strong>VL01N:</strong> <span>Criar Fornecimento com Referência à Ordem</span>
            <strong>VL02N:</strong> <span>Registrar Saída de Mercadorias (PGI)</span>
            <strong>VF01:</strong> <span>Criar Documento de Faturamento (Fatura F2)</span>
          </div>
        </div>
      `;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'sap-modal-overlay active';
    backdrop.style.zIndex = '9999';
    backdrop.innerHTML = `
      <div class="sap-modal-content" style="max-width: 580px; animation: fadeIn 0.2s ease;">
        <div class="sap-modal-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">${title}</h3>
          <button id="btn-close-bonus-modal" class="btn btn-secondary btn-xs" style="font-size: 16px; padding: 2px 8px;">✕</button>
        </div>
        <div class="sap-modal-body" style="padding: 20px;">
          ${content}
        </div>
        <div class="sap-modal-footer" style="display: flex; justify-content: flex-end; padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
          <button id="btn-ok-bonus-modal" class="btn btn-primary btn-sm">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.remove();
    };

    backdrop.querySelector('#btn-close-bonus-modal').addEventListener('click', close);
    backdrop.querySelector('#btn-ok-bonus-modal').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
  }
}
