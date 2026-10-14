/**
 * NexusTech ERP • Dashboard View Component
 * Mesa de Trabalho do Trainee SD, KPIs Operacionais e Histórico de Chamados
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 */

import { Icons } from '../../utils/icons.js';
import { Formatters } from '../../utils/formatters.js';
import { trainee, AvailableBadges } from '../../core/engine/traineeEngine.js';
import { ScenarioCatalog } from '../../core/scenarios/catalog.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';

export class DashboardViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'dashboard-view';
    this.isHistoryExpanded = true;
  }

  render() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();
    const completedScenarios = profile.completedScenarios || [];
    const allCompleted = ScenarioCatalog.length > 0 && ScenarioCatalog.every(s => completedScenarios.includes(s.id));

    // Determina a solicitação ativa atual
    let currentScenario = scenarioEngine.getActiveScenario();
    if (!currentScenario) {
      currentScenario = scenarioEngine.getCurrentPendingScenario() || ScenarioCatalog[0];
    }

    const isCurrentCompleted = currentScenario && completedScenarios.includes(currentScenario.id);
    const isChallenge = currentScenario && currentScenario.mode === 'CHALLENGE';
    const targetRoute = currentScenario ? (currentScenario.initialTcode || 'VA01') : 'VA01';

    // Recupera log de conclusão se a missão atual já foi finalizada
    const currentTaskLog = isCurrentCompleted && profile.completedTasksLog
      ? profile.completedTasksLog.find(t => t.scenarioId === currentScenario.id)
      : null;

    this.container.innerHTML = `
      <!-- Hero Banner com Chief Wilson (Direção de Arte Oficial) -->
      <div class="dashboard-hero-banner">
        <div class="hero-left-column">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            NEXUS ERP LAB • SD PRACTICE ENVIRONMENT
          </div>
          <h1 class="hero-main-title">Bem-vindo ao Nexus ERP Lab!</h1>
          <p class="hero-tagline">SD Practice Environment • Aprenda na prática. Conquiste seu espaço.</p>
          <p class="hero-description">
            Execute processos reais de Vendas e Distribuição de ponta a ponta (Order-to-Cash).
            Domine transações comerciais, liberação de crédito, remessas e faturamento com a mentoria contínua do Chefe Wilson.
          </p>
          <div class="hero-actions">
            <button id="btn-hero-see-missions" class="btn-hero-primary" title="Explorar e atender solicitações comerciais">
              ${Icons.target} Ver minhas missões
            </button>
            <div class="hero-mentor-indicator">
              <span class="text-xs text-light">Orientação com:</span>
              <strong style="color: #ffffff; font-size: 12.5px;">Chefe Wilson • Mentor SAP</strong>
            </div>
          </div>
        </div>

        <div class="hero-right-column">
          <div class="chief-wilson-hero-card">
            <div class="chief-wilson-portrait-wrapper">
              <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson - Mentor SAP" class="chief-wilson-portrait" />
              <div class="chief-wilson-status-indicator" title="Chefe Wilson está online">
                <span class="status-indicator-dot"></span> Online
              </div>
            </div>
            <div class="chief-wilson-dialogue-box">
              <div class="dialogue-header">
                <span class="dialogue-name">Chefe Wilson</span>
                <span class="dialogue-title">Mentor SAP</span>
              </div>
              <p class="dialogue-speech">
                "Olá, <strong>${profile.name}</strong>! Nosso foco é excelência operacional. Acompanho seu progresso em cada transação no ERP. Bom trabalho!"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grade de 4 KPIs Oficiais -->
      <div class="kpi-grid">
        <!-- 1. Missões Ativas -->
        <div class="kpi-card">
          <div>
            <div class="kpi-label">Missões Ativas</div>
            <div class="kpi-value text-primary">${ScenarioCatalog.length}</div>
            <div class="kpi-subtext">Cenários de formação prática</div>
          </div>
          <div class="kpi-icon kpi-icon-primary">${Icons.target}</div>
        </div>

        <!-- 2. Concluídas -->
        <div class="kpi-card">
          <div>
            <div class="kpi-label">Concluídas</div>
            <div class="kpi-value text-success">${completedScenarios.length}</div>
            <div class="kpi-subtext">
              ${completedScenarios.length === 0 ? 'Aguardando 1ª conclusão' : `${Math.round((completedScenarios.length / ScenarioCatalog.length) * 100)}% da formação finalizada`}
            </div>
          </div>
          <div class="kpi-icon kpi-icon-success">${Icons.star}</div>
        </div>

        <!-- 3. XP Acumulado -->
        <div class="kpi-card">
          <div>
            <div class="kpi-label">XP Acumulado</div>
            <div class="kpi-value text-warning">${profile.xp.toLocaleString('pt-BR')}</div>
            <div class="kpi-subtext">Próximo nível: ${levelInfo.nextMinXp.toLocaleString('pt-BR')} XP</div>
          </div>
          <div class="kpi-icon kpi-icon-warning">${Icons.trophy}</div>
        </div>

        <!-- 4. Nível Trainee -->
        <div class="kpi-card">
          <div>
            <div class="kpi-label">Nível Trainee</div>
            <div class="kpi-value text-primary">Nível ${levelInfo.level}</div>
            <div class="kpi-subtext">${profile.role}</div>
          </div>
          <div class="kpi-icon kpi-icon-info">${Icons.crown}</div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MESA DE TRABALHO: SOLICITAÇÃO ATUAL DO DIA -->
      <!-- ========================================== -->
      ${allCompleted ? `
        <!-- Painel de Ciclo 100% Concluído: FORMAÇÃO CONCLUÍDA COM EXCELÊNCIA -->
        <div class="erp-card" id="completion-summary-card" style="margin-bottom: 20px; border-top: 4px solid var(--erp-green-success); background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);">
          <div class="erp-card-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span style="font-weight: 700; font-size: 14px; color: var(--erp-navy-900);">
                Mesa de Trabalho • Encerramento da Formação
              </span>
              <span class="erp-badge erp-badge-success" style="font-weight: 700;">
                ${Icons.check} FORMAÇÃO CONCLUÍDA COM EXCELÊNCIA
              </span>
            </div>
            <span class="text-xs text-success font-mono font-bold">
              ${ScenarioCatalog.length} / ${ScenarioCatalog.length} Casos Operacionais Homologados
            </span>
          </div>

          <div class="erp-card-body" style="padding: 16px;">
            <div style="display: flex; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
              <div style="width: 52px; height: 52px; border-radius: 50%; overflow: hidden; border: 2px solid #0070f2; flex-shrink: 0; box-shadow: var(--erp-shadow-sm);">
                <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 4px;">
                  Parecer Final do Mentor • Chefe Wilson (Mentor SAP)
                </div>
                <div style="font-size: 13.5px; color: var(--erp-navy-900); line-height: 1.6; background-color: #ffffff; padding: 14px 16px; border-radius: 6px; border: 1px solid #bbf7d0; box-shadow: var(--erp-shadow-xs);">
                  <p style="margin: 0 0 10px 0;">
                    Parabéns, <strong>${profile.name}</strong>! Você concluiu oficialmente todas as ${ScenarioCatalog.length} solicitações da formação prática em Vendas e Distribuição (SD) na NexusTech.
                  </p>
                  <p style="margin: 0 0 10px 0;">
                    Durante essa jornada, você não apenas preencheu formulários no ERP. Você analisou clientes, ordens de venda (VA01/VA02), condições comerciais e tabela de preços (VK11/PR00), gestão e liberação de crédito (VKM1), disponibilidade de estoque e ATP (MM03), remessa e separação física (VL01N/VL02N/PGI) e escrituração de faturamento fiscal (VF01/VF03).
                  </p>
                  <p style="margin: 0;">
                    Mais importante: você aprendeu a observar o impacto de cada decisão no fluxo de suprimentos da distribuidora. A partir daqui, continue utilizando o Histórico abaixo para treinar e consolidar sua segurança operacional. Excelente trabalho!
                  </p>
                </div>
              </div>
            </div>

            <!-- Resumo Executivo: Minha Jornada -->
            <div style="margin-bottom: 20px;">
              <div style="font-weight: 700; font-size: 12.5px; color: var(--erp-navy-900); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                ${Icons.fileText} Minha Jornada de Formação (Resumo Executivo)
              </div>

              <div class="dashboard-metrics-grid">
                <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">Missões Concluídas</div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--erp-green-success); margin-top: 3px;">${ScenarioCatalog.length} / ${ScenarioCatalog.length} (100%)</div>
                </div>
                <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">XP Total Acumulado</div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--erp-navy-900); margin-top: 3px;">${profile.xp} XP</div>
                </div>
                <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">Ações no Sistema</div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--erp-navy-900); margin-top: 3px;">${profile.totalActions} registradas</div>
                </div>
                <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">Acurácia Geral</div>
                  <div style="font-size: 15px; font-weight: 700; color: ${profile.accuracy >= 80 ? 'var(--erp-green-success)' : 'var(--erp-amber-warning)'}; margin-top: 3px;">${profile.accuracy}%</div>
                </div>
              </div>

              <!-- Transações Praticadas no Ciclo SD -->
              <div style="background-color: var(--erp-surface-subtle); border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px;">
                <div style="font-size: 11px; font-weight: 700; color: var(--erp-navy-900); text-transform: uppercase; margin-bottom: 8px;">
                  Transações SAP SD Praticadas e Homologadas:
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  <span class="erp-badge erp-badge-code">VA01 • Criação de Ordens</span>
                  <span class="erp-badge erp-badge-code">VA02 • Modificação de Pedidos</span>
                  <span class="erp-badge erp-badge-code">VA03 • Consulta e Fluxo VBFA</span>
                  <span class="erp-badge erp-badge-code">XD03 • Cadastro de Clientes</span>
                  <span class="erp-badge erp-badge-code">MM03 • Mestre de Materiais / ATP</span>
                  <span class="erp-badge erp-badge-code">VK11 • Condições de Preço PR00</span>
                  <span class="erp-badge erp-badge-code">VKM1 • Gestão de Risco de Crédito</span>
                  <span class="erp-badge erp-badge-code">VL01N • Fornecimento e Expedição</span>
                  <span class="erp-badge erp-badge-code">VL02N • Picking e Baixa PGI</span>
                  <span class="erp-badge erp-badge-code">VL03N • Romaneio de Carga</span>
                  <span class="erp-badge erp-badge-code">VF01 • Faturamento Comercial F2</span>
                  <span class="erp-badge erp-badge-code">VF02 • Modificação de Faturas</span>
                  <span class="erp-badge erp-badge-code">VF03 • Auditoria Fiscal e Contábil</span>
                </div>
              </div>
            </div>

            <!-- Chamada para Ação: Continuar Praticando no Histórico -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
              <div style="font-size: 12.5px; color: var(--erp-text-muted); line-height: 1.45; flex: 1; min-width: 240px;">
                <strong style="color: var(--erp-navy-900);">Treinamento Contínuo Disponível.</strong><br/>
                Todas as ${ScenarioCatalog.length} atividades permanecem arquivadas no Histórico abaixo para consulta, revisão e treino livre a qualquer momento.
              </div>
              <button id="btn-scroll-to-history" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 600; font-size: 12.5px;">
                ${Icons.refresh} Continuar Praticando no Histórico
              </button>
            </div>
          </div>
        </div>
      ` : currentScenario ? `
        <!-- Card Principal da Mesa de Trabalho: Solicitação Comercial -->
        <div class="erp-card" style="margin-bottom: 20px; border-top: 4px solid ${isCurrentCompleted ? 'var(--erp-green-success)' : 'var(--erp-blue-primary)'}; background: ${isCurrentCompleted ? 'linear-gradient(180deg, #f8fdf9 0%, #ffffff 100%)' : '#ffffff'};">
          <div class="erp-card-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span style="font-weight: 700; font-size: 14px; color: var(--erp-navy-900);">
                ${isCurrentCompleted ? 'Mesa de Trabalho • Relatório de Atividade Homologada' : 'Mesa de Trabalho • Solicitação Comercial Atual'}
              </span>
              <span class="erp-badge ${isCurrentCompleted ? 'erp-badge-success' : 'erp-badge-primary'}" style="font-weight: 700;">
                ${isCurrentCompleted ? `${Icons.check} MISSÃO CONCLUÍDA` : 'Em Atendimento'}
              </span>
            </div>
            <span class="text-xs text-muted font-mono">
              Mentor: Chefe Wilson (Mentor SAP)
            </span>
          </div>

          <div class="erp-card-body">
            <!-- Cabeçalho do Chamado -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--erp-border-subtle);">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                  <span class="erp-badge erp-badge-code">${currentScenario.code}</span>
                  <span class="erp-badge ${isChallenge ? 'erp-badge-danger' : 'erp-badge-primary'}">
                    ${isChallenge ? `${Icons.alertTriangle} Modo Desafio (${currentScenario.slaMinutes} min SLA)` : `${Icons.lightbulb} Treinamento Guiado`}
                  </span>
                  <span class="erp-badge erp-badge-success text-xs font-mono font-bold">+${currentScenario.xpReward} XP Conquistados</span>
                </div>
                <h3 style="font-size: 16px; font-weight: 700; color: var(--erp-navy-900); margin: 0;">
                  ${currentScenario.title}
                </h3>
              </div>

              <!-- Ação Principal Superior -->
              <div>
                ${isCurrentCompleted ? `
                  <button id="receive-next-scenario-btn" class="btn btn-success receive-next-btn" style="padding: 10px 18px; font-weight: 700; box-shadow: var(--erp-shadow-sm);">
                    ${Icons.chevronRight} Receber Próxima Solicitação
                  </button>
                ` : `
                  <button id="start-active-scenario-btn" class="btn btn-primary" style="padding: 10px 18px; font-weight: 600; box-shadow: var(--erp-shadow-sm);">
                    ${Icons.play} Atender Solicitação no SAP
                  </button>
                `}
              </div>
            </div>

            <!-- Parecer e Relatório Estruturado quando Concluída -->
            ${isCurrentCompleted ? `
              <!-- Feedback do Mentor Chefe Wilson -->
              <div style="background-color: var(--erp-green-bg); border-left: 4px solid var(--erp-green-success); border-radius: 6px; padding: 14px 16px; margin-bottom: 18px; border: 1px solid #bbf7d0;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #166534; margin-bottom: 6px;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; overflow: hidden; border: 1px solid #15803d; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  Parecer do Mentor • Chefe Wilson (Mentor SAP):
                </div>
                <div style="font-size: 13px; color: #14532d; line-height: 1.5; font-weight: 500;">
                  ${currentScenario.completionFeedback?.mentorSpeech || 'Excelente trabalho! Você concluiu a atividade com total conformidade operacional às diretrizes de Vendas e Distribuição da NexusTech.'}
                </div>
              </div>

              <!-- Relatório de Desempenho da Atividade -->
              <div style="margin-bottom: 18px;">
                <div style="font-weight: 700; font-size: 12.5px; color: var(--erp-navy-900); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                  ${Icons.fileText} Relatório de Desempenho da Atividade
                </div>

                <!-- Grade de Métricas Reais de Execução -->
                <div class="dashboard-metrics-grid">
                  <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 10px 12px;">
                    <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">Status</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--erp-green-success); margin-top: 2px;">100% Homologado</div>
                  </div>
                  <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 10px 12px;">
                    <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">XP Conquistado</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--erp-navy-900); margin-top: 2px;">+${currentTaskLog?.xpEarned || currentScenario.xpReward} XP</div>
                  </div>
                  <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 10px 12px;">
                    <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">Tempo de Execução</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--erp-navy-900); margin-top: 2px; font-family: var(--font-mono);">${currentTaskLog?.timeSpentSeconds ? currentTaskLog.timeSpentSeconds + 's' : '-'}</div>
                  </div>
                  <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 10px 12px;">
                    <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600;">Tentativas / Horário</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--erp-navy-900); margin-top: 2px; font-family: var(--font-mono);">${currentTaskLog?.attempts || 1} tentativa(s) • ${currentTaskLog?.completedAt || 'Hoje'}</div>
                  </div>
                </div>

                <!-- Detalhamento dos Pontos Avaliados (Feedback Estruturado do Supervisor) -->
                <div style="background-color: var(--erp-surface-subtle); border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
                  <div style="background-color: #ffffff; border-left: 3px solid var(--erp-green-success); border-radius: 4px; padding: 10px 14px; border-top: 1px solid var(--erp-border-subtle); border-right: 1px solid var(--erp-border-subtle); border-bottom: 1px solid var(--erp-border-subtle);">
                    <div style="font-weight: 700; font-size: 11.5px; color: var(--erp-green-success); margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
                      ${Icons.check} 1. Você Executou Bem (Resolução Operacional):
                    </div>
                    <div style="font-size: 12.5px; color: var(--erp-navy-900); line-height: 1.5;">
                      ${currentScenario.completionFeedback?.whatHappened || currentTaskLog?.correctAnswerSummary || 'A operação foi concluída e validada em conformidade com as diretrizes comerciais do SAP SD.'}
                    </div>
                  </div>

                  <div style="background-color: #ffffff; border-left: 3px solid var(--erp-amber-warning); border-radius: 4px; padding: 10px 14px; border-top: 1px solid var(--erp-border-subtle); border-right: 1px solid var(--erp-border-subtle); border-bottom: 1px solid var(--erp-border-subtle);">
                    <div style="font-weight: 700; font-size: 11.5px; color: var(--erp-amber-warning); margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
                      ${Icons.bookOpen} 2. Preste Atenção (Conceito e Regra SAP SD):
                    </div>
                    <div style="font-size: 12.5px; color: var(--erp-text-muted); line-height: 1.5;">
                      ${currentScenario.completionFeedback?.why || currentScenario.sapKnowledgeBridge?.concept || 'Processamento integrado no ERP respeitando os dados mestres e fluxos de documentos.'}
                    </div>
                  </div>

                  <div style="background-color: #ffffff; border-left: 3px solid var(--erp-blue-primary); border-radius: 4px; padding: 10px 14px; border-top: 1px solid var(--erp-border-subtle); border-right: 1px solid var(--erp-border-subtle); border-bottom: 1px solid var(--erp-border-subtle);">
                    <div style="font-weight: 700; font-size: 11.5px; color: var(--erp-blue-primary); margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
                      ${Icons.award} 3. Para Continuar Evoluindo (Impacto no Negócio Real):
                    </div>
                    <div style="font-size: 12.5px; color: var(--erp-text-muted); line-height: 1.5;">
                      ${currentScenario.completionFeedback?.businessImpact || 'Fluxo documental regularizado e liberado para as etapas subsequentes do atendimento ao cliente.'}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fechamento e Chamada para Avanço -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                <div style="font-size: 12.5px; color: var(--erp-text-muted); line-height: 1.45; flex: 1; min-width: 240px;">
                  <strong style="color: var(--erp-navy-900);">Atividade Homologada no Histórico de Formação.</strong><br/>
                  Esta missão foi arquivada. Quando estiver pronto para assumir o próximo chamado comercial, clique no botão ao lado.
                </div>
                <button id="receive-next-scenario-btn-footer" class="btn btn-success receive-next-btn" style="padding: 11px 22px; font-weight: 700; font-size: 13px; box-shadow: var(--erp-shadow-sm); flex-shrink: 0;">
                  ${Icons.chevronRight} Receber Próxima Solicitação
                </button>
              </div>
            ` : `
              <!-- Briefing Formal (Quando em andamento) -->
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 600; font-size: 12px; color: var(--erp-navy-900); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Descrição da Demanda Comercial:
                </div>
                <div style="font-size: 13px; color: var(--erp-text-main); line-height: 1.55; background-color: var(--erp-surface-subtle); padding: 12px; border-radius: 6px; border: 1px solid var(--erp-border-subtle);">
                  ${currentScenario.briefing}
                </div>
              </div>

              <!-- Detalhes Comerciais Anexos (Documento PO) -->
              ${currentScenario.purchaseOrderDocument ? `
                <div style="background-color: #ffffff; border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 12px; color: var(--erp-navy-900);">
                      ${Icons.fileText} Documento Anexo: ${currentScenario.purchaseOrderDocument.poNumber || 'Pedido Comercial'}
                    </span>
                    <span class="text-xs text-muted">${currentScenario.purchaseOrderDocument.operationType || 'Operação Mercantil'}</span>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: var(--erp-text-muted);">
                    <div><strong>Cliente:</strong> ${currentScenario.purchaseOrderDocument.buyerName}</div>
                    <div><strong>CNPJ:</strong> ${currentScenario.purchaseOrderDocument.buyerCnpj}</div>
                    <div><strong>Cond. Pagamento:</strong> ${currentScenario.purchaseOrderDocument.paymentInstructions || 'Padrão'}</div>
                    <div><strong>Frete:</strong> ${currentScenario.purchaseOrderDocument.freightResponsibility || 'CIF'}</div>
                  </div>
                </div>
              ` : ''}

              <!-- Dica Inicial do Chefe Wilson (quando em andamento) -->
              ${currentScenario.mentorInitialTip ? `
                <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--erp-blue-primary); background-color: var(--erp-blue-bg); padding: 10px 12px; border-radius: 4px; border: 1px solid #bfdbfe;">
                  <div style="flex-shrink: 0; margin-top: 1px;">${Icons.lightbulb}</div>
                  <div>${currentScenario.mentorInitialTip}</div>
                </div>
              ` : ''}
            `}

          </div>
        </div>
      ` : ''}

      <!-- ======================================================== -->
      <!-- HISTÓRICO DE ATIVIDADES CONCLUÍDAS & REVISÃO RECOLHÍVEL -->
      <!-- ======================================================== -->
      <div class="erp-card" style="margin-bottom: 20px;">
        <div class="erp-card-header" style="cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;" id="toggle-history-header">
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">
              Histórico de Atividades Concluídas & Revisão
            </span>
            <span class="erp-badge erp-badge-success text-xs font-mono">
              ${completedScenarios.length} Concluída(s)
            </span>
          </div>
          <button id="toggle-history-btn" class="btn btn-secondary btn-xs" style="pointer-events: none;">
            ${this.isHistoryExpanded ? `${Icons.chevronDown} Recolher` : `${Icons.chevronRight} Expandir`}
          </button>
        </div>

        <div id="history-content-container" class="erp-card-body" style="display: ${this.isHistoryExpanded ? 'block' : 'none'}; padding-top: 10px;">
          ${completedScenarios.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${ScenarioCatalog.filter(s => completedScenarios.includes(s.id)).map(scenario => {
                const log = (profile.completedTasksLog || []).find(t => t.scenarioId === scenario.id);
                const isChallenge = scenario.mode === 'CHALLENGE';

                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background-color: var(--erp-surface-subtle); border-radius: 4px; padding: 10px 14px; border: 1px solid var(--erp-border-subtle); transition: background-color 0.15s ease;">
                    <div style="flex: 1; min-width: 0; padding-right: 12px;">
                      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 3px;">
                        <span class="erp-badge erp-badge-code text-xs">${scenario.code}</span>
                        <span style="font-weight: 600; font-size: 12.5px; color: var(--erp-navy-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          ${scenario.title}
                        </span>
                        <span class="erp-badge erp-badge-success text-xs font-mono">+${scenario.xpReward} XP</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: var(--erp-text-muted); font-family: var(--font-mono);">
                        <span>${log && log.completedAt ? `Concluído às: ${log.completedAt}` : 'Concluído'}</span>
                        ${log && log.timeSpentSeconds ? `<span>Tempo: ${log.timeSpentSeconds}s</span>` : ''}
                        ${log && log.attempts ? `<span>Tentativas: ${log.attempts}</span>` : ''}
                      </div>
                    </div>
                    <div>
                      <button class="btn btn-secondary btn-xs redo-scenario-btn" data-scenario-id="${scenario.id}" title="Refazer esta missão prática no simulador">
                        ${Icons.refresh} Refazer Atividade
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 20px; color: var(--erp-text-muted); font-size: 12px;">
              Nenhuma atividade concluída ainda. Atenda sua primeira solicitação para registrar seu histórico de formação!
            </div>
          `}
        </div>
      </div>

      <!-- ============================================== -->
      <!-- REGISTRO DE AUDITORIA & INSÍGNIAS DE CARREIRA  -->
      <!-- ============================================== -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">

        <!-- Trilha de Auditoria / Histórico de Decisões -->
        <div class="erp-card">
          <div class="erp-card-header">
            <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Registro de Auditoria & Decisões</span>
            <span class="text-xs text-muted">Log do Trainee</span>
          </div>
          <div class="erp-card-body" style="max-height: 240px; overflow-y: auto;">
            <div class="audit-history-list">
              ${profile.auditLog.map(log => `
                <div class="audit-item">
                  <div>
                    <div style="font-weight: 600; font-size: 12px; color: var(--erp-navy-900);">
                      ${log.action}
                    </div>
                    <div style="font-size: 11px; color: var(--erp-text-muted);">
                      ${log.description}
                    </div>
                  </div>
                  <span class="audit-time">${log.timestamp}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Insígnias Conquistadas -->
        <div class="erp-card">
          <div class="erp-card-header">
            <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Insígnias Profissionais SD</span>
            <span class="text-xs text-muted">${profile.badges.length} / ${AvailableBadges.length} Conquistadas</span>
          </div>
          <div class="erp-card-body" style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto;">
            ${AvailableBadges.map(badge => {
              const isUnlocked = profile.badges.includes(badge.id);
              return `
                <div style="display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--erp-border-subtle); opacity: ${isUnlocked ? '1' : '0.45'}; background-color: ${isUnlocked ? 'var(--erp-green-bg)' : 'transparent'};">
                  <div style="width: 28px; height: 28px; border-radius: 4px; background-color: ${isUnlocked ? '#ffffff' : 'var(--erp-surface-subtle)'}; color: ${isUnlocked ? 'var(--erp-green-success)' : 'var(--erp-text-light)'}; display: flex; align-items: center; justify-content: center; box-shadow: var(--erp-shadow-xs); flex-shrink: 0;">
                    ${Icons[badge.icon] || Icons.award}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 11.5px; color: var(--erp-navy-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${badge.title}</div>
                    <div style="font-size: 10px; color: var(--erp-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${badge.desc}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // Botão de Hero: "Ver minhas missões"
    const heroSeeMissionsBtn = this.container.querySelector('#btn-hero-see-missions');
    if (heroSeeMissionsBtn) {
      heroSeeMissionsBtn.addEventListener('click', () => {
        const target = this.container.querySelector('#completion-summary-card') || this.container.querySelector('.erp-card');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Botão: "Atender Solicitação no SAP"
    const startActiveBtn = this.container.querySelector('#start-active-scenario-btn');
    if (startActiveBtn) {
      startActiveBtn.addEventListener('click', () => {
        // F2-C: Loading state — evita duplo clique e dá feedback visual imediato
        startActiveBtn.disabled = true;
        startActiveBtn.innerHTML = `<span class="erp-spinner" style="display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:erp-spin 0.6s linear infinite;margin-right:6px;"></span> Abrindo Transação...`;

        // Pequeno delay para garantir que o browser renderize o loading antes de navegar
        setTimeout(() => {
          const currentScenario = scenarioEngine.getActiveScenario() || scenarioEngine.getCurrentPendingScenario() || ScenarioCatalog[0];
          if (currentScenario) {
            const targetRoute = currentScenario.initialTcode || 'VA01';
            scenarioEngine.startScenario(currentScenario.id);
            this.onNavigate(targetRoute);
          } else {
            startActiveBtn.disabled = false;
            startActiveBtn.innerHTML = `${Icons.play} Atender Solicitação no SAP`;
          }
        }, 80);
      });
    }

    // Botões: "Receber Próxima Solicitação" (topo e rodapé)
    this.container.querySelectorAll('.receive-next-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        scenarioEngine.startNextScenario();
        this.render();
      });
    });

    // Alternador de recolhimento do Histórico
    const toggleHeader = this.container.querySelector('#toggle-history-header');
    if (toggleHeader) {
      toggleHeader.addEventListener('click', () => {
        this.isHistoryExpanded = !this.isHistoryExpanded;
        const content = this.container.querySelector('#history-content-container');
        const btn = this.container.querySelector('#toggle-history-btn');
        if (content) content.style.display = this.isHistoryExpanded ? 'block' : 'none';
        if (btn) btn.innerHTML = this.isHistoryExpanded ? `${Icons.chevronDown} Recolher` : `${Icons.chevronRight} Expandir`;
      });
    }

    // Botão: "Continuar Praticando no Histórico"
    const scrollToHistoryBtn = this.container.querySelector('#btn-scroll-to-history');
    if (scrollToHistoryBtn) {
      scrollToHistoryBtn.addEventListener('click', () => {
        this.isHistoryExpanded = true;
        this.render();
        const historyHeader = this.container.querySelector('#toggle-history-header');
        if (historyHeader) {
          historyHeader.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Botões: "Refazer Atividade" no Histórico
    this.container.querySelectorAll('.redo-scenario-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const scenarioId = btn.getAttribute('data-scenario-id');
        if (scenarioId) {
          const targetScenario = ScenarioCatalog.find(s => s.id === scenarioId);
          const targetRoute = targetScenario ? (targetScenario.initialTcode || 'VA01') : 'VA01';
          scenarioEngine.startScenario(scenarioId);
          this.onNavigate(targetRoute);
        }
      });
    });
  }

  getElement() {
    return this.container;
  }
}
