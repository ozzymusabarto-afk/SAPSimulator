/**
 * Nexus ERP Lab • SD Practice Environment
 * Mapeamento Desacoplado de Competências (Competency Map)
 * Módulo: js/core/models/competencyMap.js
 * 
 * Correlaciona os 54 cenários oficiais aos 7 pilares de competência operacional,
 * sem introduzir qualquer alteração no catalog.js ou nos motores transacionais.
 */

import { CompetencyId } from './journey.js';

export const CompetencyMetadata = Object.freeze({
  [CompetencyId.MASTER_DATA]: {
    id: CompetencyId.MASTER_DATA,
    title: 'Dados Mestres (Clientes & Materiais)',
    shortTitle: 'Dados Mestres',
    tcodes: ['XD03', 'MM03'],
    description: 'Governança cadastral de clientes (KNA1/KNVV) e materiais (MARA/MARC/MARD).'
  },
  [CompetencyId.ORDER_MGMT]: {
    id: CompetencyId.ORDER_MGMT,
    title: 'Gestão de Ordens de Venda',
    shortTitle: 'Ordens de Venda',
    tcodes: ['VA01', 'VA02', 'VA03'],
    description: 'Criação e modificação de ordens padrão (OR), itens, parceiros e motivos de recusa.'
  },
  [CompetencyId.PRICING]: {
    id: CompetencyId.PRICING,
    title: 'Preço & Determinação Fiscal',
    shortTitle: 'Preço & Impostos',
    tcodes: ['VK11', 'VA01', 'VA02'],
    description: 'Condições de preço (PR00, RB00, KF00) e cálculo fiscal (ICMS, PIS, COFINS).'
  },
  [CompetencyId.ATP]: {
    id: CompetencyId.ATP,
    title: 'Verificação de Disponibilidade (ATP)',
    shortTitle: 'Disponibilidade (ATP)',
    tcodes: ['MM03', 'VA01', 'VA02'],
    description: 'Controle de saldo físico vs. disponível, reservas e confirmação de datas/quantidades.'
  },
  [CompetencyId.CREDIT]: {
    id: CompetencyId.CREDIT,
    title: 'Gestão & Liberação de Crédito',
    shortTitle: 'Gestão de Crédito',
    tcodes: ['VKM1', 'VA03'],
    description: 'Análise de exposição financeira, bloqueios de risco e liberação de ordens na VKM1.'
  },
  [CompetencyId.SHIPPING]: {
    id: CompetencyId.SHIPPING,
    title: 'Expedição & Fornecimento',
    shortTitle: 'Expedição & Remessa',
    tcodes: ['VL01N', 'VL02N', 'VL03N'],
    description: 'Determinação de ponto de expedição, criação de fornecimento e confirmação de PGI.'
  },
  [CompetencyId.BILLING]: {
    id: CompetencyId.BILLING,
    title: 'Faturamento & Documentos Fiscais',
    shortTitle: 'Faturamento Fiscal',
    tcodes: ['VF01', 'VF02', 'VF03'],
    description: 'Geração de fatura F2, fluxo de documentos e tratativa de estornos fiscais.'
  }
});

/**
 * Mapeamento formal de cada um dos 54 cenários oficiais aos 7 pilares,
 * alinhado à competência pedagógica efetivamente exercitada em cada chamado.
 */
export const ScenarioCompetencyMap = Object.freeze({
  'SCN-01': [CompetencyId.ORDER_MGMT, CompetencyId.MASTER_DATA],
  'SCN-02': [CompetencyId.PRICING, CompetencyId.ORDER_MGMT],
  'SCN-03': [CompetencyId.CREDIT, CompetencyId.ORDER_MGMT],
  'SCN-04': [CompetencyId.ORDER_MGMT, CompetencyId.ATP],
  'SCN-05': [CompetencyId.PRICING, CompetencyId.ORDER_MGMT],
  'SCN-06': [CompetencyId.ATP, CompetencyId.SHIPPING],
  'SCN-07': [CompetencyId.ATP, CompetencyId.SHIPPING],
  'SCN-08': [CompetencyId.ATP, CompetencyId.BILLING],
  'SCN-09': [CompetencyId.CREDIT, CompetencyId.BILLING],
  'SCN-10': [CompetencyId.CREDIT, CompetencyId.MASTER_DATA],
  'SCN-11': [CompetencyId.CREDIT, CompetencyId.MASTER_DATA],
  'SCN-12': [CompetencyId.SHIPPING, CompetencyId.PRICING],
  'SCN-13': [CompetencyId.SHIPPING, CompetencyId.CREDIT],
  'SCN-14': [CompetencyId.SHIPPING, CompetencyId.ATP],
  'SCN-15': [CompetencyId.BILLING, CompetencyId.ORDER_MGMT],
  'SCN-16': [CompetencyId.BILLING, CompetencyId.PRICING],
  'SCN-17': [CompetencyId.ORDER_MGMT, CompetencyId.SHIPPING],
  'SCN-18': [CompetencyId.ORDER_MGMT, CompetencyId.BILLING],
  'SCN-19': [CompetencyId.PRICING, CompetencyId.ORDER_MGMT],
  'SCN-20': [CompetencyId.ATP, CompetencyId.ORDER_MGMT],
  'SCN-21': [CompetencyId.CREDIT, CompetencyId.MASTER_DATA],
  'SCN-22': [CompetencyId.SHIPPING, CompetencyId.PRICING],
  'SCN-23': [CompetencyId.BILLING, CompetencyId.CREDIT],
  'SCN-24': [CompetencyId.ORDER_MGMT, CompetencyId.SHIPPING],
  'SCN-25': [CompetencyId.ORDER_MGMT, CompetencyId.BILLING],
  'SCN-26': [CompetencyId.MASTER_DATA, CompetencyId.ORDER_MGMT],
  'SCN-27': [CompetencyId.ORDER_MGMT, CompetencyId.SHIPPING],
  'SCN-28': [CompetencyId.PRICING],
  'SCN-30': [CompetencyId.PRICING, CompetencyId.ORDER_MGMT],
  'SCN-31': [CompetencyId.ORDER_MGMT, CompetencyId.SHIPPING],
  'SCN-32': [CompetencyId.SHIPPING, CompetencyId.BILLING],
  'SCN-33': [CompetencyId.SHIPPING, CompetencyId.MASTER_DATA],
  'SCN-34': [CompetencyId.BILLING, CompetencyId.CREDIT],
  'SCN-35': [CompetencyId.SHIPPING, CompetencyId.PRICING],
  'SCN-36': [CompetencyId.ATP, CompetencyId.ORDER_MGMT],
  'SCN-37': [CompetencyId.MASTER_DATA, CompetencyId.ORDER_MGMT],
  'SCN-39': [CompetencyId.CREDIT, CompetencyId.MASTER_DATA],
  'SCN-40': [CompetencyId.BILLING, CompetencyId.SHIPPING],
  'SCN-38': [CompetencyId.ORDER_MGMT, CompetencyId.PRICING],
  'SCN-41': [CompetencyId.BILLING, CompetencyId.SHIPPING],
  'SCN-42': [CompetencyId.PRICING],
  'SCN-43': [CompetencyId.ORDER_MGMT],
  'SCN-45': [CompetencyId.SHIPPING, CompetencyId.ATP],
  'SCN-46': [CompetencyId.CREDIT, CompetencyId.PRICING],
  'SCN-48': [CompetencyId.PRICING],
  'SCN-49': [CompetencyId.CREDIT, CompetencyId.ATP],
  'SCN-50': [CompetencyId.SHIPPING, CompetencyId.ORDER_MGMT],
  'SCN-52': [CompetencyId.ORDER_MGMT, CompetencyId.PRICING],
  'SCN-53': [CompetencyId.ATP, CompetencyId.MASTER_DATA],
  'SCN-55': [CompetencyId.BILLING, CompetencyId.SHIPPING],
  'SCN-58': [CompetencyId.ORDER_MGMT, CompetencyId.PRICING],
  'SCN-60': [CompetencyId.MASTER_DATA, CompetencyId.ORDER_MGMT],
  'SCN-61': [CompetencyId.CREDIT, CompetencyId.ORDER_MGMT],
  'SCN-64': [CompetencyId.PRICING, CompetencyId.ORDER_MGMT]
});

/**
 * Retorna a lista de IDs de competência vinculados a um cenário.
 * @param {string} scenarioId
 * @returns {string[]}
 */
export function getCompetenciesForScenario(scenarioId) {
  return ScenarioCompetencyMap[scenarioId] || [CompetencyId.ORDER_MGMT];
}

/**
 * Retorna todos os cenários oficiais associados a uma competência específica.
 * @param {string} competencyId
 * @returns {string[]}
 */
export function getScenariosForCompetency(competencyId) {
  const result = [];
  for (const [scnId, compList] of Object.entries(ScenarioCompetencyMap)) {
    if (compList.includes(competencyId)) {
      result.push(scnId);
    }
  }
  return result;
}
