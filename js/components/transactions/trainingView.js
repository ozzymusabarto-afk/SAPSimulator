/**
 * Nexus ERP Lab • SD Practice Environment
 * Componente de Visualização: Treinamento (Practice Hub)
 * Arquivo: js/components/transactions/trainingView.js
 * 
 * Permite praticar e repetir missões direcionadas pelas competências e pelo parecer do Chefe Wilson.
 * Não duplica missões no catálogo, registra novas tentativas e concede +0 XP em repetições.
 */

import { Icons } from '../../utils/icons.js';
import { ScenarioCatalog } from '../../core/scenarios/catalog.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { traineeRepository } from '../../core/repository/traineeRepository.js';
import { CompetencyId } from '../../core/models/journey.js';
import { CompetencyMetadata, ScenarioCompetencyMap, getCompetenciesForScenario } from '../../core/models/competencyMap.js';

export class TrainingViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'training-view institutional-view-container';
    this.selectedCompetencyFilter = 'ALL';
  }

  render() {
    const profile = trainee.getProfile();
    const matrix = trainee.getCompetencyMatrix();
    const diagnostic = trainee.getLatestDiagnostic();
    const completedScenarios = profile.completedScenarios || [];

    // Filtra cenários com base no pilar selecionado
    const filteredScenarios = ScenarioCatalog.filter(scenario => {
      if (this.selectedCompetencyFilter === 'ALL') return true;
      const comps = getCompetenciesForScenario(scenario.id);
      return comps.includes(this.selectedCompetencyFilter);
    });

    // Identifica quais competências foram sinalizadas para reforço
    const reinforcementIds = Object.values(matrix)
      .filter(c => c.needsReinforcement)
      .map(c => c.competencyId);

    this.container.innerHTML = `
      <!-- Header do Treinamento -->
      <div class="view-header-banner" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
        <div class="view-header-content">
          <div class="view-header-tag" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
            ${Icons.target} Hub de Prática & Reforço Operacional
          </div>
          <h1 class="view-header-title">Área de Treinamento e Prática</h1>
          <p class="view-header-subtitle">
            Repita cenários comerciais e refine sua consistência nos pontos onde o Chefe Wilson identificou necessidade de reforço.
            As execuções no laboratório registram novas tentativas no seu histórico, <strong>sem conceder novo XP vitalício</strong>
            e sem resetar sua jornada oficial.
          </p>
        </div>
        <div style="flex-shrink: 0; display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.06); padding: 12px 18px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" style="width: 42px; height: 42px; border-radius: 50%; border: 2px solid #fbbf24;" />
          <div style="font-size: 12px;">
            <strong style="color: #ffffff; display: block;">Chefe Wilson orienta:</strong>
            <span style="color: #cbd5e1;">
              ${reinforcementIds.length > 0
                ? `Foque nos ${reinforcementIds.length} pilares com alerta de reforço abaixo.`
                : 'Excelente assertividade. Continue praticando para manter a maestria.'}
            </span>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros por Competência -->
      <div class="training-filter-bar">
        <span style="font-size: 12px; font-weight: 700; color: #334155; margin-right: 4px;">Filtrar por Competência:</span>
        <button class="training-filter-btn ${this.selectedCompetencyFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">
          Todos os Pilares (${ScenarioCatalog.length} Cenários)
        </button>
        ${Object.values(CompetencyMetadata).map(meta => {
          const isWarn = reinforcementIds.includes(meta.id);
          return `
            <button class="training-filter-btn ${this.selectedCompetencyFilter === meta.id ? 'active' : ''}" data-filter="${meta.id}">
              ${isWarn ? '⚠ ' : ''}${meta.shortTitle}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Grid de Missões Direcionadas para Treinamento -->
      <div class="training-scenarios-grid">
        ${filteredScenarios.map(scenario => {
          const isCompleted = completedScenarios.includes(scenario.id);
          const attemptCount = traineeRepository.getAttemptCount(scenario.id);
          const comps = getCompetenciesForScenario(scenario.id);
          const hasReinforcementPillar = comps.some(c => reinforcementIds.includes(c));

          return `
            <div class="training-scenario-card ${hasReinforcementPillar ? 'needs-reinforcement' : ''}" style="${hasReinforcementPillar ? 'border-left: 4px solid #f59e0b;' : ''}">
              <div>
                <div class="training-scenario-header">
                  <span class="training-scenario-code">${scenario.code || scenario.id}</span>
                  <div style="display: flex; gap: 6px;">
                    <span class="tcode-pill">${scenario.initialTcode || 'VA01'}</span>
                    <span class="erp-badge ${isCompleted ? 'erp-badge-success' : 'erp-badge-warning'}" style="font-size: 10px;">
                      ${isCompleted ? 'Concluída' : 'Pendente'}
                    </span>
                  </div>
                </div>

                <div class="training-scenario-title">${scenario.title}</div>
                <div class="training-scenario-desc">${scenario.briefing || scenario.description || ''}</div>

                <div class="training-scenario-tags" style="margin-top: 10px;">
                  ${comps.map(c => {
                    const meta = CompetencyMetadata[c];
                    const isWarn = reinforcementIds.includes(c);
                    return `
                      <span class="training-tag ${isWarn ? 'badge-reinforcement' : ''}" style="${isWarn ? 'background: #fef3c7; color: #92400e; font-weight: 600;' : ''}">
                        ${isWarn ? '⚠ ' : ''}${meta ? meta.shortTitle : c}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>

              <div class="training-action-row">
                <span style="font-size: 11.5px; color: #64748b;">
                  Tentativas registradas: <strong>${attemptCount}</strong>
                </span>
                <button class="training-action-btn btn-start-practice" data-scenario-id="${scenario.id}" data-tcode="${scenario.initialTcode || 'VA01'}">
                  ${Icons.play} Praticar Cenário
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  startTrainingScenario(scenarioId) {
    const scenario = ScenarioCatalog.find(s => s.id === scenarioId);
    const tcode = (scenario && scenario.initialTcode) ? scenario.initialTcode : 'VA01';
    scenarioEngine.startScenario(scenarioId);
    this.onNavigate(tcode);
  }

  bindEvents() {
    // Filtros de Competência
    this.container.querySelectorAll('.training-filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.selectedCompetencyFilter = filter;
        this.render();
      });
    });

    // Botão de Iniciar Prática
    this.container.querySelectorAll('.btn-start-practice').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenarioId = btn.getAttribute('data-scenario-id');
        if (scenarioId) {
          this.startTrainingScenario(scenarioId);
        }
      });
    });
  }
}
