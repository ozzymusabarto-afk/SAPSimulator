/**
 * NexusTech ERP • Dashboard View Component
 * Visão Geral de Carreira, KPIs e Central de Chamados (Treinamento vs Desafio)
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
  }

  render() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();

    this.container.innerHTML = `
      <!-- Hero de Boas-Vindas e Carreira -->
      <div class="dashboard-hero">
        <div class="dashboard-hero-content">
          <div class="hero-profile-info">
            <div class="hero-avatar">${levelInfo.level}</div>
            <div>
              <div class="hero-title">${profile.name} • ${profile.role}</div>
              <div class="hero-subtitle">Módulo SAP SD • NexusTech Distribuidora S/A • Mentor: Sr. Wilson</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="text-xs text-light" style="margin-bottom: 4px;">PROGRESSO PARA O PRÓXIMO NÍVEL</div>
            <div style="font-size: 14px; font-weight: 700; color: #38bdf8;">
              ${profile.xp} / ${levelInfo.nextMinXp} XP (${levelInfo.progressPercent}%)
            </div>
          </div>
        </div>
      </div>

      <!-- Grade de KPIs Operacionais -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div>
            <div class="kpi-label">Acurácia de Aprendizagem</div>
            <div class="kpi-value ${profile.accuracy >= 80 ? 'text-success' : 'text-warning'}">
              ${profile.accuracy}%
            </div>
          </div>
          <div class="kpi-icon">${Icons.award}</div>
        </div>

        <div class="kpi-card">
          <div>
            <div class="kpi-label">Total de Ações</div>
            <div class="kpi-value">${profile.totalActions}</div>
          </div>
          <div class="kpi-icon">${Icons.fileText}</div>
        </div>

        <div class="kpi-card">
          <div>
            <div class="kpi-label">Pontualidade (SLA)</div>
            <div class="kpi-value text-primary">
              ${profile.slaTotalChallenges > 0 
                ? `${Math.round((profile.slaSuccessCount / profile.slaTotalChallenges) * 100)}%` 
                : '100%'}
            </div>
          </div>
          <div class="kpi-icon">${Icons.clock}</div>
        </div>

        <div class="kpi-card">
          <div>
            <div class="kpi-label">Cenários Concluídos</div>
            <div class="kpi-value text-success">${profile.completedScenarios.length} / ${ScenarioCatalog.length}</div>
          </div>
          <div class="kpi-icon">${Icons.check}</div>
        </div>
      </div>

      <!-- Central de Chamados & Cenários de Negócio -->
      <div class="erp-card" style="margin-bottom: 20px;">
        <div class="erp-card-header">
          <div style="font-weight: 700; font-size: 14px; color: var(--erp-navy-900);">
            Central de Atividades & Chamados Comerciais (Sr. Wilson)
          </div>
          <span class="text-xs text-muted">Selecione uma atividade para iniciar sua capacitação prática</span>
        </div>
        <div class="erp-card-body">
          <div class="scenarios-section">
            ${ScenarioCatalog.map(scenario => {
              const isCompleted = profile.completedScenarios.includes(scenario.id);
              const isChallenge = scenario.mode === 'CHALLENGE';

              return `
                <div class="scenario-card">
                  <div class="scenario-meta">
                    <div class="scenario-tags">
                      <span class="erp-badge erp-badge-code">${scenario.code}</span>
                      <span class="erp-badge ${isChallenge ? 'erp-badge-danger' : 'erp-badge-primary'}">
                        ${isChallenge ? `${Icons.alertTriangle} Modo Desafio (${scenario.slaMinutes} min SLA)` : `${Icons.lightbulb} Modo Treinamento Guiado`}
                      </span>
                      <span class="erp-badge erp-badge-success text-xs font-mono">+${scenario.xpReward} XP</span>
                      ${isCompleted ? `<span class="erp-badge erp-badge-success">${Icons.check} Concluído</span>` : ''}
                    </div>
                    <div class="scenario-title">${scenario.title}</div>
                    <div class="scenario-desc">${scenario.briefing}</div>
                  </div>
                  <div>
                    <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm start-scenario-btn" data-scenario-id="${scenario.id}">
                      ${isCompleted ? `${Icons.refresh} Refazer Atividade` : `${Icons.play} Iniciar Atividade`}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Registro de Tarefas Concluídas & Auditoria -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        
        <!-- Histórico de Tarefas Concluídas (Tentativas, Tempo e XP) -->
        <div class="erp-card">
          <div class="erp-card-header">
            <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Histórico de Tarefas Concluídas</span>
            <span class="text-xs text-muted">Tempo & Tentativas</span>
          </div>
          <div class="erp-card-body" style="max-height: 280px; overflow-y: auto;">
            ${profile.completedTasksLog && profile.completedTasksLog.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${profile.completedTasksLog.map(task => `
                  <div style="background-color: var(--erp-surface-subtle); border-radius: 4px; padding: 8px 12px; border: 1px solid var(--erp-border-subtle);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
                      <span style="font-weight: 600; font-size: 12px; color: var(--erp-navy-900);">${task.scenarioTitle}</span>
                      <span class="erp-badge erp-badge-success text-xs font-mono">+${task.xpEarned} XP</span>
                    </div>
                    <div style="font-size: 11px; color: var(--erp-text-muted); margin-bottom: 4px;">
                      ${task.correctAnswerSummary}
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; color: var(--erp-text-light); font-family: var(--font-mono);">
                      <span>Tempo: ${task.timeSpentSeconds}s</span>
                      <span>Tentativas: ${task.attempts}</span>
                      <span>Concluído às: ${task.completedAt}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="text-align: center; padding: 24px; color: var(--erp-text-muted); font-size: 12px;">
                Nenhuma tarefa concluída ainda. Inicie sua primeira atividade para registrar seu histórico!
              </div>
            `}
          </div>
        </div>

        <!-- Trilha de Auditoria / Histórico de Decisões -->
        <div class="erp-card">
          <div class="erp-card-header">
            <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Registro de Auditoria & Decisões</span>
          </div>
          <div class="erp-card-body" style="max-height: 280px; overflow-y: auto;">
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

      </div>

      <!-- Insígnias Conquistadas -->
      <div class="erp-card">
        <div class="erp-card-header">
          <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Insígnias de Competência Profissional SD</span>
        </div>
        <div class="erp-card-body" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          ${AvailableBadges.map(badge => {
            const isUnlocked = profile.badges.includes(badge.id);
            return `
              <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 6px; border: 1px solid var(--erp-border-subtle); opacity: ${isUnlocked ? '1' : '0.45'}; background-color: ${isUnlocked ? 'var(--erp-green-bg)' : 'transparent'};">
                <div style="width: 32px; height: 32px; border-radius: 6px; background-color: ${isUnlocked ? '#ffffff' : 'var(--erp-surface-subtle)'}; color: ${isUnlocked ? 'var(--erp-green-success)' : 'var(--erp-text-light)'}; display: flex; align-items: center; justify-content: center; box-shadow: var(--erp-shadow-xs);">
                  ${Icons[badge.icon] || Icons.award}
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 12px; color: var(--erp-navy-900);">${badge.title}</div>
                  <div style="font-size: 10.5px; color: var(--erp-text-muted);">${badge.desc}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    this.container.querySelectorAll('.start-scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-scenario-id');
        if (id) {
          scenarioEngine.startScenario(id);
          this.onNavigate('VA01');
        }
      });
    });
  }

  getElement() {
    return this.container;
  }
}
