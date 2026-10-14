/**
 * NexusTech ERP • Ranking View Component
 * Classificação dos Trainees por XP, Missões e Acurácia
 */

import { Icons } from '../../utils/icons.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { traineeRepository } from '../../core/repository/traineeRepository.js';
import { ScenarioCatalog } from '../../core/scenarios/catalog.js';

export class RankingViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'ranking-view';
  }

  setParams() { this.render(); }

  render() {
    const profile = trainee.getProfile();
    const completed = (profile.completedScenarios || []).length;
    const totalMissions = ScenarioCatalog.length;
    const xp = profile.totalCareerXp || 0;
    const accuracy = profile.accuracy || 100;
    const badges = (profile.badges || []).length;
    const name = profile.name || 'Trainee SD';

    // Monta leaderboard local: o usuário atual + trainees simulados com dados plausíveis
    // Em produção, esses dados viriam de um backend. No ambiente local, exibimos o progresso real
    // do usuário e posições de referência para dar contexto motivacional.
    const leaderboard = this._buildLeaderboard({ name, xp, completed, accuracy, badges });

    this.container.innerHTML = `
      <!-- Cabeçalho -->
      <div class="transaction-header-bar" style="margin-bottom: 20px;">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">${Icons.award}</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Ranking de Trainees — Nexus ERP Lab</div>
            <div class="text-xs text-muted">Classificação por XP, Missões Concluídas e Acurácia Operacional</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-ranking-back">
            ${Icons.chevronLeft} Painel
          </button>
        </div>
      </div>

      <!-- Aviso de ambiente local -->
      <div class="erp-card" style="background: var(--erp-blue-subtle); border: 1px solid var(--erp-border-subtle); margin-bottom: 20px; padding: 12px 16px; display: flex; align-items: center; gap: 10px;">
        ${Icons.lightbulb}
        <span class="text-sm" style="color: var(--erp-navy-800);">
          <strong>Ambiente local:</strong> Você está na posição de referência entre o ranking simulado.
          Em produção com backend integrado, o ranking exibirá todos os trainees da sua turma em tempo real.
        </span>
      </div>

      <!-- Pódio Top 3 -->
      <div class="ranking-podium">
        ${leaderboard.slice(0, 3).map((entry, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          const classes = ['gold', 'silver', 'bronze'];
          const isMe = entry.isMe;
          return `
            <div class="ranking-podium-card ${classes[i]}" style="${isMe ? 'box-shadow: 0 0 0 2px var(--erp-blue-primary);' : ''}">
              <div class="ranking-podium-medal">${medals[i]}</div>
              <div style="font-weight: 700; font-size: 13px; color: var(--erp-navy-900); margin-bottom: 4px;">
                ${entry.name} ${isMe ? '<span class="erp-badge erp-badge-primary" style="font-size:9px;">VOCÊ</span>' : ''}
              </div>
              <div style="font-size: 11px; color: var(--erp-text-muted); margin-bottom: 6px;">${entry.role}</div>
              <div style="font-size: 18px; font-weight: 800; color: var(--erp-blue-primary);">${entry.xp.toLocaleString('pt-BR')} XP</div>
              <div style="font-size: 11px; color: var(--erp-text-muted); margin-top: 2px;">${entry.completed}/${totalMissions} missões</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Tabela completa -->
      <div class="erp-card" style="margin-bottom: 24px;">
        <div class="erp-card-header">
          <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Classificação Completa</span>
          <span class="text-xs text-muted">${leaderboard.length} participantes</span>
        </div>
        <div style="overflow-x: auto;">
          <div class="ranking-table-row header">
            <span>#</span>
            <span>Trainee</span>
            <span style="text-align:right">XP</span>
            <span style="text-align:right">Missões</span>
            <span style="text-align:right">Acurácia</span>
          </div>
          ${leaderboard.map((entry, i) => `
            <div class="ranking-table-row ${entry.isMe ? 'me' : ''}">
              <span style="font-weight: 700; color: ${i < 3 ? 'var(--erp-blue-primary)' : 'var(--erp-text-muted)'};">
                ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <span>
                <div style="font-weight: ${entry.isMe ? '700' : '500'}; font-size: 13px;">${entry.name} ${entry.isMe ? '← você' : ''}</div>
                <div style="font-size: 11px; color: var(--erp-text-muted);">${entry.role}</div>
              </span>
              <span style="text-align:right; font-weight: 600; font-family: var(--font-mono);">${entry.xp.toLocaleString('pt-BR')}</span>
              <span style="text-align:right; font-family: var(--font-mono);">${entry.completed}/${totalMissions}</span>
              <span style="text-align:right; font-family: var(--font-mono); color: ${entry.accuracy >= 80 ? 'var(--erp-green-success)' : entry.accuracy >= 60 ? '#f59e0b' : '#e11d48'};">${entry.accuracy}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Seu desempenho detalhado -->
      <div class="erp-card">
        <div class="erp-card-header">
          <span style="font-weight: 700; font-size: 13.5px; color: var(--erp-navy-900);">Seu Desempenho</span>
          <span class="erp-badge erp-badge-primary">${profile.role}</span>
        </div>
        <div class="erp-card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
            ${[
              { label: 'XP Total', value: `${xp.toLocaleString('pt-BR')} XP`, color: 'var(--erp-blue-primary)' },
              { label: 'Missões', value: `${completed} / ${totalMissions}`, color: 'var(--erp-green-success)' },
              { label: 'Acurácia', value: `${accuracy}%`, color: accuracy >= 80 ? 'var(--erp-green-success)' : '#f59e0b' },
              { label: 'Insígnias', value: `${badges} / 5`, color: '#f59e0b' },
              { label: 'Ações OK', value: profile.successfulActions || 0, color: 'var(--erp-green-success)' },
              { label: 'SLA Desafios', value: `${profile.slaSuccessCount || 0} / ${profile.slaTotalChallenges || 0}`, color: '#8b5cf6' }
            ].map(item => `
              <div style="background: var(--erp-surface-subtle); border-radius: 8px; padding: 12px 14px; border: 1px solid var(--erp-border-subtle);">
                <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">${item.label}</div>
                <div style="font-size: 20px; font-weight: 800; color: ${item.color}; font-family: var(--font-mono);">${item.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    return this.container;
  }

  _buildLeaderboard({ name, xp, completed, accuracy, badges }) {
    // Posições de referência simuladas para dar contexto motivacional em ambiente local
    const references = [
      { name: 'Ana Ribeiro',     role: 'Trainee SD',          xp: 8200,  completed: 24, accuracy: 94, badges: 3 },
      { name: 'Carlos Mendes',   role: 'Trainee SD',          xp: 7100,  completed: 21, accuracy: 89, badges: 2 },
      { name: 'Fernanda Lima',   role: 'Analista Júnior SD',  xp: 14500, completed: 50, accuracy: 97, badges: 5 },
      { name: 'Gabriel Torres',  role: 'Trainee SD',          xp: 4800,  completed: 14, accuracy: 82, badges: 1 },
      { name: 'Helena Castro',   role: 'Trainee SD',          xp: 6300,  completed: 18, accuracy: 91, badges: 2 },
      { name: 'Ivan Souza',      role: 'Trainee SD',          xp: 2900,  completed: 8,  accuracy: 75, badges: 0 },
      { name: 'Julia Pereira',   role: 'Analista Júnior SD',  xp: 17200, completed: 50, accuracy: 99, badges: 5 },
      { name: 'Lucas Oliveira',  role: 'Trainee SD',          xp: 3500,  completed: 10, accuracy: 78, badges: 1 },
    ];

    const myEntry = { name, role: 'Você', xp, completed, accuracy, badges, isMe: true };
    const all = [...references.map(r => ({ ...r, isMe: false })), myEntry];
    return all.sort((a, b) => b.xp - a.xp || b.completed - a.completed);
  }

  _bindEvents() {
    const backBtn = this.container.querySelector('#btn-ranking-back');
    if (backBtn) backBtn.onclick = () => this.onNavigate('DASHBOARD');
  }

  getElement() { return this.container; }
}
