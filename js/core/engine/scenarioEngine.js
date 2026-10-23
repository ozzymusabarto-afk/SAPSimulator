/**
 * NexusTech ERP • Motor de Execução de Cenários (Scenario Engine)
 * Mentor: Chefe Wilson (Coordenador Comercial | Mentor SD)
 * Lógica Pedagógica: Treinar o Olhar do Trainee com Feedback Progressivo
 */

import { ScenarioCatalog } from '../scenarios/catalog.js';
import { db } from './erpDatabase.js';
import { trainee } from './traineeEngine.js';
import { traineeRepository } from '../repository/traineeRepository.js';
import { AttemptOutcome } from '../models/journey.js';

class ScenarioEngine {
  constructor() {
    this.activeScenario = null;
    this.slaRemainingSeconds = 0;
    this.slaTimerInterval = null;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  getActiveScenario() {
    return this.activeScenario;
  }

  /**
   * F4-B: Seleciona a próxima missão pendente usando seleção inteligente balanceada.
   * Regras:
   *  1. Missões FULL_O2C só aparecem quando >= 80% das demais estão concluídas.
   *  2. Evita repetir o mesmo tipo de ação duas vezes consecutivas (quando há opções).
   *  3. Usa hash determinístico do userId + n° de missões concluídas como seed,
   *     garantindo variedade entre trainees mas reprodutibilidade dentro da mesma sessão.
   *  4. Fallback: retorna linearmente se não houver candidatos elegíveis.
   */
  getCurrentPendingScenario() {
    const completed = trainee.getCompletedScenarios();
    const currentStage = trainee.getProfile()?.stageId || 'TRAINEE';
    const pending = ScenarioCatalog.filter(s => {
      if (completed.includes(s.id)) return false;
      const stage = s.stageId || (s.levelRequired <= 1 ? 'TRAINEE' : 'ANALISTA_JUNIOR_SD');
      return stage === currentStage;
    });

    if (pending.length === 0) {
      // O ciclo Trainee mantém o comportamento legado de exibir o último
      // caso para prática livre; fases futuras não devem receber conteúdo de
      // outra carreira por engano.
      return currentStage === 'TRAINEE'
        ? ScenarioCatalog[ScenarioCatalog.length - 1]
        : null;
    }

    // Regra 1: FULL_O2C só disponível quando >= 80% do catálogo concluído
    const nonFullO2cTotal = ScenarioCatalog.filter(s => s.targetCriteria?.action !== 'FULL_O2C').length;
    const nonFullO2cDone  = completed.filter(id => {
      const s = ScenarioCatalog.find(x => x.id === id);
      return s && s.targetCriteria?.action !== 'FULL_O2C';
    }).length;
    const fullO2cUnlocked = nonFullO2cDone / nonFullO2cTotal >= 0.8;

    let candidates = pending.filter(s => fullO2cUnlocked || s.targetCriteria?.action !== 'FULL_O2C');
    if (candidates.length === 0) candidates = pending; // fallback

    // Regra 2: Evita repetir o mesmo tipo de ação consecutivo (quando há alternativas)
    const lastCompleted = completed.length > 0
      ? ScenarioCatalog.find(s => s.id === completed[completed.length - 1])
      : null;
    const lastAction = lastCompleted?.targetCriteria?.action || null;

    const diverseCandidates = lastAction
      ? candidates.filter(s => s.targetCriteria?.action !== lastAction)
      : candidates;
    const lastDifficulty = lastCompleted?.difficulty || null;
    const difficultyCandidates = lastDifficulty
      ? diverseCandidates.filter(s => (s.difficulty || 'OPERACIONAL') !== lastDifficulty)
      : diverseCandidates;
    const pool = difficultyCandidates.length > 0
      ? difficultyCandidates
      : (diverseCandidates.length > 0 ? diverseCandidates : candidates);

    // Regra 3: Seed determinística userId + progresso para pseudo-aleatoriedade controlada
    const userId = trainee.getProfile()?.journey?.userId || 'default';
    const seed   = this._hashSeed(userId + ':' + completed.length);
    const idx    = Math.abs(seed) % pool.length;

    return pool[idx];
  }

  /**
   * Gera um inteiro a partir de uma string usando FNV-1a (mesma lógica do authService).
   * @param {string} str
   * @returns {number}
   */
  _hashSeed(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0; // unsigned 32-bit
  }

  /**
   * Retorna o ID da solicitação que deve ser carregada na inicialização do simulador:
   * 1. A missão que já foi iniciada e está em andamento (persistida em activeScenarioId);
   * 2. Caso a missão salva já tenha sido concluída ou não exista, a próxima missão pendente da trilha.
   */
  getCurrentActiveOrPendingScenarioId() {
    const savedActiveState = traineeRepository.getActiveScenarioState();
    const candidateId = savedActiveState?.scenarioId || trainee.getActiveScenarioId();
    if (candidateId && ScenarioCatalog.some(s => s.id === candidateId)) {
      if (!trainee.isScenarioCompleted(candidateId)) {
        return candidateId;
      }
    }
    const pending = this.getCurrentPendingScenario();
    return pending ? pending.id : (ScenarioCatalog[0]?.id || 'SCN-01');
  }

  /**
   * Inicia explicitamente a próxima solicitação pendente da trilha oficial
   */
  startNextScenario() {
    const nextScenario = this.getCurrentPendingScenario();
    if (nextScenario) {
      this.startScenario(nextScenario.id);
      return this.activeScenario;
    }
    return null;
  }

  /**
   * Inicia um cenário pelo ID
   * @param {string} scenarioId
   */
  startScenario(scenarioId) {
    const previousActiveState = traineeRepository.getActiveScenarioState();
    const raw = ScenarioCatalog.find(s => s.id === scenarioId) || ScenarioCatalog[0];
    const customerAnalysisRewarded = Boolean(
      previousActiveState?.scenarioId === raw.id && previousActiveState.customerAnalysisRewarded
    );

    // Se já havia um cenário ativo diferente e não concluído, registra abandono
    if (
      this.activeScenario &&
      this.activeScenario.id !== raw.id &&
      !trainee.isScenarioCompleted(this.activeScenario.id)
    ) {
      trainee.recordAttempt({
        scenarioId: this.activeScenario.id,
        outcome: AttemptOutcome.ABANDONED,
        performanceScore: 0,
        xpGranted: 0,
        mistakesLogged: [{ field: 'SYSTEM', message: 'Missão interrompida para início de outra solicitação.' }]
      });
    }

    this.activeScenario = JSON.parse(JSON.stringify(raw));
    this.activeScenario.customerAnalysisRewarded = customerAnalysisRewarded;
    
    // Atualiza a missão ativa salva no perfil do trainee e no repositório de retomada
    trainee.setActiveScenarioId(this.activeScenario.id);
    traineeRepository.saveActiveScenarioState({
      scenarioId: this.activeScenario.id,
      code: this.activeScenario.code,
      title: this.activeScenario.title,
      initialTcode: this.activeScenario.initialTcode || 'VA01',
      startedAt: Date.now(),
      customerAnalysisRewarded
    });

    db.resetDatabase();
    if (this.activeScenario.initialDocuments && Array.isArray(this.activeScenario.initialDocuments)) {
      db.seedScenarioDocuments(this.activeScenario.initialDocuments);
    }
    if (this.activeScenario.initialDeliveries && Array.isArray(this.activeScenario.initialDeliveries)) {
      for (const delReq of this.activeScenario.initialDeliveries) {
        const res = db.createDelivery(delReq);
        if (res.success && delReq.autoPgi) {
          db.postGoodsIssue(res.delivery.deliveryNumber);
        }
      }
    }

    trainee.startScenarioSession();

    if (this.activeScenario.mode === 'CHALLENGE' && this.activeScenario.slaMinutes) {
      this.slaRemainingSeconds = this.activeScenario.slaMinutes * 60;
      this.startSlaTimer();
    } else {
      this.stopSlaTimer();
      this.slaRemainingSeconds = 0;
    }

    trainee.logAction(
      'Atividade Iniciada',
      `[${this.activeScenario.code}] ${this.activeScenario.title} • Orientado pelo Chefe Wilson`,
      'INFO'
    );

    this.notify();
    return this.activeScenario;
  }

  startSlaTimer() {
    this.stopSlaTimer();
    this.slaTimerInterval = setInterval(() => {
      if (this.slaRemainingSeconds > 0) {
        this.slaRemainingSeconds--;
        this.notify();
      } else {
        this.stopSlaTimer();
        this.handleSlaExpired();
      }
    }, 1000);
  }

  stopSlaTimer() {
    if (this.slaTimerInterval) {
      clearInterval(this.slaTimerInterval);
      this.slaTimerInterval = null;
    }
  }

  handleSlaExpired() {
    trainee.recordSla(false);
    trainee.logAction('Aviso de SLA', `O tempo estimado para o chamado [${this.activeScenario.code}] expirou. Você ainda pode concluir a atividade!`, 'WARN');
    this.notify();
  }

  completeObjective(objectiveId) {
    if (!this.activeScenario) return;
    const obj = this.activeScenario.objectives.find(o => o.id === objectiveId);
    if (obj && !obj.done) {
      obj.done = true;
      this.notify();
    }
  }

  areActiveScenarioObjectivesComplete() {
    const objectives = this.activeScenario?.objectives;
    return Array.isArray(objectives) && objectives.length > 0 && objectives.every(objective => objective.done);
  }

  completeObjectives(objectiveIds = []) {
    for (const objectiveId of objectiveIds) this.completeObjective(objectiveId);
  }

  completeActiveScenarioIfReady(actionName, summary) {
    const scenario = this.activeScenario;
    if (!scenario || !this.areActiveScenarioObjectivesComplete()) return false;

    const isRedo = trainee.isScenarioCompleted(scenario.id);
    const xpEarned = isRedo ? 0 : (scenario.xpReward || 300);
    if (!isRedo) trainee.addXp(xpEarned, `Conclusão do chamado [${scenario.code}] ${scenario.title}`);
    trainee.recordAction(true, actionName, summary);
    if (!isRedo && scenario.badgeReward) trainee.unlockBadge(scenario.badgeReward);
    trainee.completeScenario(scenario.id, scenario.title, summary, xpEarned);
    return true;
  }

  /**
   * Validação interativa da análise de dados do cliente na XD03
   */
  validateCustomerAnalysis(customerId) {
    const scenario = this.activeScenario;
    if (!scenario) return { isValid: true };

    const target = scenario.targetCriteria || {};
    const expectedCustomerId = target.customerId || scenario.initialDocuments?.[0]?.customerId || null;

    if (!expectedCustomerId || customerId === expectedCustomerId) {
      this.completeObjective('check_customer');
      this.completeObjective('check_customer_xd03');
      this.completeObjective('investigate_credit');

      if (!scenario.customerAnalysisRewarded) {
        trainee.addXp(30, `Consulta precisa do cadastro do cliente ${customerId} na XD03`);
        trainee.recordAction(true, 'Consulta Mestre de Clientes', `Cliente ${customerId} analisado na XD03`);
        scenario.customerAnalysisRewarded = true;
        const activeState = traineeRepository.getActiveScenarioState();
        if (activeState?.scenarioId === scenario.id) {
          traineeRepository.saveActiveScenarioState({ ...activeState, customerAnalysisRewarded: true });
        }
      }

      const salesOrg = target.salesOrg || '1000';
      const distChannel = target.distChannel || '10';
      const division = target.division || '01';
      const paymentTerms = target.paymentTerms || 'Z030';
      const incoterms = target.incoterms || 'CIF';

      return {
        isValid: true,
        feedback: {
          mentorSpeech: `Excelente análise! Você conferiu com precisão os dados cadastrais do cliente ${customerId}. Na tabela KNVV podemos ver a Área de Vendas (${salesOrg}/${distChannel}/${division}), a Condição de Pagamento (${paymentTerms}) e o Incoterms (${incoterms}).`,
          whatHappened: `Cliente ${customerId} consultado com sucesso na transação XD03.`,
          why: 'No SAP SD, a validação cadastral prévia evita erros de faturamento e devoluções fiscais.',
          businessImpact: 'Garante que os prazos e responsabilidades de frete acordados em contrato sejam fielmente replicados na ordem de venda.'
        }
      };
    }

    return {
      isValid: false,
      feedback: {
        mentorSpeech: `Atenção: Você está visualizando o cliente ${customerId}, mas a solicitação do chamado é para análise do cliente ${expectedCustomerId}. Selecione o cliente correto no menu de consulta da XD03 e confira os dados comerciais.`,
        whatHappened: `Cliente selecionado na consulta: ${customerId}. Cliente solicitado pelo chamado: ${expectedCustomerId}.`,
        why: 'Cada cliente possui sua própria área de vendas (KNVV) e perfil financeiro.',
        businessImpact: 'Consultar dados de outro cliente pode levar à aplicação indevida de prazos ou limites de crédito incompatíveis.'
      }
    };
  }

  validateMaterialAnalysis(materialId) {
    const scenario = this.activeScenario;
    if (!scenario) return { isValid: true };

    const target = scenario.targetCriteria || {};
    const expectedMaterials = [
      ...(target.items || []).map(item => item.materialId),
      target.targetMaterialId
    ].filter(Boolean);
    if (expectedMaterials.length && !expectedMaterials.includes(materialId)) {
      return {
        isValid: false,
        mentorSpeech: `A missão solicita a análise de ${expectedMaterials.join(' ou ')}; o material consultado foi ${materialId}.`
      };
    }

    const priceRecord = db.getPricingRecord(
      materialId,
      target.salesOrg || '1000',
      target.distChannel || '10',
      target.conditionCode || 'PR00'
    );
    const material = db.getMaterial(materialId);
    if (!(Number(priceRecord?.amount ?? material?.basePrice ?? 0) > 0)) {
      this.completeObjective('check_pricing_error');
    }

    this.completeObjectives([
      'check_stock_atp', 'check_stock_mm03', 'check_material', 'investigate_availability'
    ]);
    return { isValid: true, material: db.getMaterial(materialId) };
  }

  validatePurchaseOrderAnalysis(poNumber) {
    const scenario = this.activeScenario;
    if (!scenario) return { isValid: true };
    const expectedPo = scenario.purchaseOrderDocument?.poNumber || scenario.targetCriteria?.customerPoNumber;
    if (expectedPo && poNumber !== expectedPo) {
      return { isValid: false, mentorSpeech: `O chamado solicita a análise do pedido ${expectedPo}; o documento informado foi ${poNumber}.` };
    }
    this.completeObjectives(['analyze_po', 'process_demand']);
    return { isValid: true, poNumber: expectedPo || poNumber };
  }

  validateSalesOrderInspection(docNumber) {
    const scenario = this.activeScenario;
    const order = db.getSalesOrder(docNumber);
    if (!order) return { isValid: false, mentorSpeech: `Ordem de venda ${docNumber} não encontrada na VA03.` };

    const targetDoc = scenario?.targetCriteria?.targetDocNumber;
    if (targetDoc && targetDoc !== order.docNumber) {
      return { isValid: false, mentorSpeech: `A missão solicita a ordem ${targetDoc}; a ordem exibida é ${order.docNumber}.` };
    }

    const targetNetValue = scenario?.targetCriteria?.targetNetValue;
    const firstPriceDiagnosis = scenario?.objectives?.some(objective => objective.id === 'analyze_order' && !objective.done);
    if (targetNetValue !== undefined && !(firstPriceDiagnosis && Number(order.netValue) === 0) && Math.abs(Number(order.netValue) - Number(targetNetValue)) > 0.01) {
      return {
        isValid: false,
        order,
        mentorSpeech: `O valor líquido da ordem é R$ ${Number(order.netValue).toFixed(2)}, mas a missão espera R$ ${Number(targetNetValue).toFixed(2)}. Confira o preço e o recálculo antes de concluir a análise.`
      };
    }

    this.completeObjectives([
      'check_order_va03', 'check_flow_va03', 'analyze_order', 'diagnose_situation',
      'verify_document_flow', 'verify_created_order', 'verify_order', 'audit_flow'
    ]);
    const completed = this.completeActiveScenarioIfReady(
      'Inspeção de Ordem VA03',
      `Ordem ${order.docNumber} conferida na VA03 • Valor líquido R$ ${Number(order.netValue || 0).toFixed(2)}`
    );
    return {
      isValid: true,
      completed,
      order,
      mentorSpeech: completed
        ? (scenario.completionFeedback?.mentorSpeech || `Ordem ${order.docNumber} conferida na VA03. Missão concluída! +${scenario.xpReward || 300} XP.`)
        : `Ordem ${order.docNumber} localizada e analisada na VA03. Consulte os objetivos restantes para continuar.`
    };
  }

  /**
   * Valida o envio de Ordem de Venda na VA01 com feedback pedagógico rigoroso e amigável do Chefe Wilson
   * @param {Object} orderData
   * @returns {Object} { isValid, mentorSpeech, whatHappened, why, businessImpact, fieldError, activeTabHint }
   */
  validateSalesOrderSubmission(orderData) {
    const scenario = this.activeScenario;
    if (!scenario) {
      return {
        isValid: true,
        mentorSpeech: 'Muito bem! Ordem criada com sucesso.',
        whatHappened: 'Ordem de venda criada no sistema.',
        why: 'Todos os campos foram devidamente preenchidos.',
        businessImpact: 'A ordem seguirá para processamento padrão no centro de distribuição.'
      };
    }

    const target = scenario.targetCriteria;
    const isSalesOrderSubmissionMission = target.action === 'SALES_ORDER_SUBMISSION' ||
      scenario.validationRules?.actionType === 'SALES_ORDER_SUBMISSION';
    const isCreditReleaseMission = target.action === 'CREDIT_RELEASE' ||
      scenario.validationRules?.actionType === 'CREDIT_RELEASE';

    const prerequisiteGroups = [
      { enabled: target.requiresCustomerAnalysis, ids: ['check_customer', 'check_customer_xd03', 'investigate_credit'], label: 'consulta e reconciliação do Business Partner' },
      { enabled: target.requiresPoAnalysis, ids: ['analyze_po', 'process_demand'], label: 'análise da PO e dos parceiros' },
      { enabled: target.requiresMaterialAnalysis, ids: ['check_material', 'check_stock_mm03', 'check_stock_atp', 'investigate_availability'], label: 'análise do material e da disponibilidade' },
      { enabled: target.requiresPricingEvidence, ids: ['check_pricing_error', 'simulate_pricing'], label: 'evidência de pricing' }
    ];
    for (const group of prerequisiteGroups) {
      if (!group.enabled) continue;
      const objective = scenario.objectives.find(item => group.ids.includes(item.id));
      if (objective && !objective.done) {
        return {
          isValid: false,
          fieldError: 'prerequisite',
          activeTabHint: 'HEADER',
          mentorSpeech: `Antes de gravar, conclua a ${group.label}. A ordem não deve ser criada com dados não reconciliados.`,
          whatHappened: `A etapa de ${group.label} ainda não foi registrada na missão.`,
          why: 'No fluxo S/4HANA, a decisão comercial precisa estar baseada em dados de parceiro, produto, preço e disponibilidade conferidos.',
          businessImpact: 'Evita criar uma ordem com parceiro, preço, quantidade, prazo ou risco incorretos.'
        };
      }
    }

    if (!isSalesOrderSubmissionMission && !isCreditReleaseMission) {
      return {
        isValid: true,
        mentorSpeech: 'A VA01 está disponível para a operação. Como a missão atual pede outra etapa do processo, esta gravação não altera o progresso nem concede a recompensa da missão.',
        whatHappened: 'A gravação da ordem pode prosseguir como operação SAP independente; os objetivos da missão permanecem pendentes.',
        why: 'O progresso de uma missão depende da ação solicitada no chamado, mesmo quando outra operação comercial é válida.',
        businessImpact: 'A ordem pode ser registrada sem concluir indevidamente uma missão de faturamento, expedição ou modificação.'
      };
    }

    // 1. Validação do Tipo de Ordem (Doc. Type)
    if (!orderData.orderType) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Tipo de Ordem não selecionado');
      return {
        isValid: false,
        fieldError: 'orderType',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Boa tentativa! Mas antes de prosseguir, observe o campo "Tipo de Ordem". Como se trata de uma venda regular de mercadorias no mercado nacional, qual tipo de documento devemos utilizar?',
        whatHappened: 'O campo Tipo de Ordem (Doc. Type) ficou em branco.',
        why: 'O tipo de ordem determina o controle de cópia, o tipo de faturamento e se haverá movimento físico de mercadorias.',
        businessImpact: 'Sem tipo de ordem definido, o sistema não pode carregar as regras de numeração e controle do documento.'
      };
    }

    if (target.orderType && orderData.orderType !== target.orderType) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Tipo de Ordem incorreto: ${orderData.orderType}`);
      return {
        isValid: false,
        fieldError: 'orderType',
        activeTabHint: 'HEADER',
        mentorSpeech: `Atenção à finalidade da operação: você escolheu ${orderData.orderType}, mas esta operação é uma venda comercial padrão com saída física de mercadorias. Tipos como QT (Cotação) ou RE (Devolução) possuem finalidades contratuais diferentes. Selecione o tipo padrão de venda (OR/TA) e tente novamente!`,
        whatHappened: `Tipo de Ordem selecionado: ${orderData.orderType}. Tipo correto esperado: ${target.orderType} (OR/TA - Ordem Padrão).`,
        why: 'No SAP SD, o tipo OR/TA (Standard Order) é o padrão para ordens de venda com compromisso de entrega e faturamento.',
        businessImpact: 'Lançar com tipo incorreto (ex: QT) não gera necessidade de remessa nem reserva de estoque no CD.'
      };
    }

    // 2. Validação da Organização de Vendas
    if (!orderData.salesOrg) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Organização de Vendas não selecionada');
      return {
        isValid: false,
        fieldError: 'salesOrg',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Observe a estrutura organizacional: a Organização de Vendas está em branco. Qual das unidades de vendas da NexusTech é responsável pelo mercado nacional em reais (BRL)?',
        whatHappened: 'O campo Organização de Vendas (VKORG) não foi selecionado.',
        why: 'A Organização de Vendas é o nível organizacional mais alto de SD e responde juridicamente pelos contratos de venda.',
        businessImpact: 'Sem Org. Vendas, a ordem não pode ser atribuída à empresa contábil BR10 nem emitir Nota Fiscal.'
      };
    }

    if (target.salesOrg && orderData.salesOrg !== target.salesOrg) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Organização de Vendas incorreta: ${orderData.salesOrg}`);
      return {
        isValid: false,
        fieldError: 'salesOrg',
        activeTabHint: 'HEADER',
        mentorSpeech: `Veja só: você selecionou a Org. Vendas ${orderData.salesOrg}. Como o cliente está localizado no Brasil e a operação é faturada em Reais (BRL), devemos direcionar para a unidade de Vendas Nacionais (1000). Altere esse campo no cabeçalho e vamos em frente!`,
        whatHappened: `Organização de Vendas selecionada: ${orderData.salesOrg}. Organização correta: ${target.salesOrg} (NexusTech Vendas Nacionais).`,
        why: 'Vendas para o mercado interno brasileiro são geridas pela Org. Vendas 1000.',
        businessImpact: 'Direcionar para Org. de Exportação (2000) travaria o documento na emissão de impostos locais (ICMS/PIS/COFINS).'
      };
    }

    // 3. Validação do Canal de Distribuição
    if (!orderData.distChannel) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Canal de Distribuição não selecionado');
      return {
        isValid: false,
        fieldError: 'distChannel',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Quase lá! Falta selecionar o Canal de Distribuição. Este cliente corporativo é atendido via Venda Direta / B2B (Canal 10) ou por Revenda Atacadista (Canal 20)? Dê uma olhada no cadastro dele na XD03!',
        whatHappened: 'O campo Canal de Distribuição (VTWEG) está vazio.',
        why: 'O canal de distribuição define a estratégia de comercialização e a lista de preços aplicável.',
        businessImpact: 'Sem canal definido, o sistema não consegue determinar as condições de preço nem os descontos de tabela.'
      };
    }

    if (target.distChannel && orderData.distChannel !== target.distChannel) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Canal de Distribuição incorreto: ${orderData.distChannel}`);
      return {
        isValid: false,
        fieldError: 'distChannel',
        activeTabHint: 'HEADER',
        mentorSpeech: `Boa tentativa! Mas repare no perfil do cliente: você selecionou o Canal ${orderData.distChannel}, porém este cliente está cadastrado no Canal ${target.distChannel} (${target.distChannel === '10' ? 'Venda Direta / B2B' : 'Revenda / Atacado'}). Confira na transação XD03 na aba Vendas e ajuste o canal!`,
        whatHappened: `Canal selecionado: ${orderData.distChannel}. Canal correto: ${target.distChannel}.`,
        why: 'O canal de distribuição precisa coincidir com a área de vendas em que o cliente foi criado (tabela KNVV).',
        businessImpact: 'Divergência de canal impede o aproveitamento de condições comerciais e bloqueia o pedido por área de vendas inválida.'
      };
    }

    // 4. Validação do Setor de Atividade
    if (!orderData.division) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Setor de Atividade não selecionado');
      return {
        isValid: false,
        fieldError: 'division',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Falta apenas o Setor de Atividade no bloco organizacional. Como estamos vendendo Servidores Enterprise (Hardware), qual setor de atividade abrange essa linha de produtos?',
        whatHappened: 'O campo Setor de Atividade (SPART) está em branco.',
        why: 'O setor de atividade agrupa materiais ou serviços com características comerciais e fiscais similares.',
        businessImpact: 'A ausência do setor impede a montagem da Área de Vendas completa (Org/Canal/Setor).'
      };
    }

    if (target.division && orderData.division !== target.division) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Setor de Atividade incorreto: ${orderData.division}`);
      return {
        isValid: false,
        fieldError: 'division',
        activeTabHint: 'HEADER',
        mentorSpeech: `Atenção à linha do produto: você marcou o Setor de Atividade ${orderData.division}. O produto pedido é um Servidor Enterprise (Hardware de Rede), pertencente ao Setor 01. Corrija o setor de atividade no cabeçalho!`,
        whatHappened: `Setor de Atividade selecionado: ${orderData.division}. Setor correto: ${target.division} (01 - Equipamentos & Hardware de Rede).`,
        why: 'O setor 01 engloba os equipamentos de TI da NexusTech.',
        businessImpact: 'Cadastrar no setor de peças (02) ou serviços (03) gera classificação contábil e fiscal distorcida.'
      };
    }

    this.completeObjective('set_org_structure');

    // 5. Validação de Seleção do Cliente (Sold-to Party / KUNNR)
    if (!orderData.customerId) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Emissor da ordem não selecionado');
      return {
        isValid: false,
        fieldError: 'customerId',
        activeTabHint: 'HEADER',
        mentorSpeech: 'A estrutura organizacional está perfeita! Agora precisamos selecionar quem é o cliente (Emissor da Ordem). Dê uma olhada no campo Emissor da Ordem e escolha o cliente indicado no chamado.',
        whatHappened: 'O campo Emissor da Ordem (KUNNR) ficou em branco.',
        why: 'No SAP SD, a ordem de venda não pode ser criada sem a definição do parceiro comercial principal (função Sold-to Party - SP).',
        businessImpact: 'Sem emissor definido, o sistema não tem como gerar nota fiscal, calcular impostos locais ou endereçar a entrega física.'
      };
    }

    if (target.customerId && orderData.customerId !== target.customerId) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Cliente divergente: ${orderData.customerId}`);
      return {
        isValid: false,
        fieldError: 'customerId',
        activeTabHint: 'HEADER',
        mentorSpeech: `Quase lá! Você selecionou o cliente ${orderData.customerId}, mas o pedido de compra que recebemos é da empresa ${target.customerId} (Varejo Eletro Brasil). Selecione o cliente correto no menu de emissor!`,
        whatHappened: `Cliente selecionado: ${orderData.customerId}. Cliente solicitado no chamado: ${target.customerId}.`,
        why: 'A ordem deve corresponder exatamente ao cliente solicitante para que os dados fiscais e de endereço sejam carregados corretamente.',
        businessImpact: 'Se enviado para o cliente errado, a mercadoria será recusada na portaria de recebimento com custos de frete reverso.'
      };
    }

    this.completeObjective('select_customer');

    // 6. Validação do Nº Pedido de Compra do Cliente (BSTNK)
    if (!orderData.customerPoNumber || orderData.customerPoNumber.trim() === '') {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Nº do Pedido de Compra do Cliente em branco');
      return {
        isValid: false,
        fieldError: 'customerPoNumber',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Importante: Não se esqueça de preencher o "Nº Pedido de Compra do Cliente" (campo BSTNK). No documento de compra enviado pelo cliente, consta o número do pedido. Preencha esse campo para garantir a rastreabilidade fiscal!',
        whatHappened: 'O campo Nº Pedido de Compra do Cliente (BSTNK) está vazio.',
        why: 'No SAP SD, o campo BSTNK armazena a numeração da Purchase Order do cliente para ser impressa no DANFE/Nota Fiscal.',
        businessImpact: 'Sem o número do pedido na NF, o departamento de recebimento do cliente não consegue dar entrada física na mercadoria.'
      };
    }

    if (target.customerPoNumber && orderData.customerPoNumber.trim() !== target.customerPoNumber.trim()) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Nº do Pedido de Compra divergente: ${orderData.customerPoNumber}`);
      return {
        isValid: false,
        fieldError: 'customerPoNumber',
        activeTabHint: 'HEADER',
        mentorSpeech: `Atenção ao Nº Pedido do Cliente (BSTNK): você informou "${orderData.customerPoNumber}", mas o documento da solicitação exige exatamente "${target.customerPoNumber}". Corrija o número do pedido/empenho no cabeçalho e tente novamente!`,
        whatHappened: `Nº Pedido de Compra do Cliente (BSTNK) divergente. Informado: "${orderData.customerPoNumber}". Esperado: "${target.customerPoNumber}".`,
        why: 'O campo BSTNK vincula formalmente a ordem de venda ao contrato/empenho do cliente para fins contábeis e fiscais no DANFE.',
        businessImpact: 'Divergência no número de pedido/empenho gera recusa do recebimento na portaria e glosa orçamentária no faturamento.'
      };
    }

    // 7. Validação da Condição de Pagamento (ZTERM)
    if (!orderData.paymentTerms) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Condição de pagamento em branco');
      return {
        isValid: false,
        fieldError: 'paymentTerms',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Atenção a este detalhe: a Condição de Pagamento não foi selecionada. Lembre-se do que verificamos na XD03 na aba Vendas para este cliente e selecione a condição combinada em contrato.',
        whatHappened: 'O campo Condição de Pagamento (ZTERM) não foi selecionado.',
        why: 'A condição de pagamento define as datas de vencimento dos títulos no módulo financeiro (FI-AR).',
        businessImpact: 'Sem condição de pagamento, o faturamento fica bloqueado no setor de contas a receber.'
      };
    }

    if (target.paymentTerms && orderData.paymentTerms !== target.paymentTerms) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Condição de pagamento incorreta: ${orderData.paymentTerms}`);
      return {
        isValid: false,
        fieldError: 'paymentTerms',
        activeTabHint: 'HEADER',
        mentorSpeech: `Boa tentativa! Você selecionou a condição ${orderData.paymentTerms}, mas o cliente possui a condição ${target.paymentTerms} (${target.paymentTerms === 'Z030' ? '30 dias líquido' : target.paymentTerms}) cadastrada no mestre comercial. Ajuste a condição de pagamento e tente novamente, você está no caminho certo!`,
        whatHappened: `Condição selecionada: ${orderData.paymentTerms}. Condição correta cadastrada: ${target.paymentTerms}.`,
        why: `O cliente possui condição negociada ${target.paymentTerms} registrada na tabela KNVV.`,
        businessImpact: 'O cliente receberá boletos com prazos divergentes do acordado em proposta comercial, gerando atritos financeiros e insatisfação.'
      };
    }

    // 8. Validação do Incoterms
    if (!orderData.incoterms) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Incoterms em branco');
      return {
        isValid: false,
        fieldError: 'incoterms',
        activeTabHint: 'HEADER',
        mentorSpeech: 'Falta selecionar o Incoterms (modalidade de frete). O cliente solicitou entrega no destino por nossa conta (CIF) ou retirada no CD (FOB/EXW)? Dê uma olhada no chamado!',
        whatHappened: 'O campo Incoterms não foi selecionado.',
        why: 'O Incoterms define quem arca com o frete e seguro e onde ocorre a transferência de posse da mercadoria.',
        businessImpact: 'Divergência no Incoterms gera cobrança indevida de frete ou recusa de transporte pela transportadora.'
      };
    }

    if (target.incoterms && orderData.incoterms !== target.incoterms) {
      trainee.recordAction(false, 'Tentativa de Gravação', `Incoterms incorreto: ${orderData.incoterms}`);
      return {
        isValid: false,
        fieldError: 'incoterms',
        activeTabHint: 'HEADER',
        mentorSpeech: `Estamos quase lá! O cliente solicitou a modalidade de frete ${target.incoterms} (Custo, Seguro e Frete por nossa conta), mas no formulário está marcado ${orderData.incoterms}. Altere o Incoterms no cabeçalho e tente mais uma vez!`,
        whatHappened: `Incoterms informado: ${orderData.incoterms}. Incoterms correto: ${target.incoterms}.`,
        why: 'O Incoterms CIF estipula que a NexusTech é responsável pelo frete até o endereço do cliente.',
        businessImpact: 'Marcar FOB faria o cliente ser cobrado pelo frete indevidamente na transportadora.'
      };
    }

    this.completeObjective('fill_terms');

    // 9. Verifica se existe uma condição de preço válida para cada material-alvo.
    // Um material sem PR00 e sem preço-base não pode gerar uma ordem de valor zero.
    for (const targetItem of target.items || []) {
      const pricingRecord = db.getPricingRecord(
        targetItem.materialId,
        target.salesOrg || orderData.salesOrg || '1000',
        target.distChannel || orderData.distChannel || '10',
        target.conditionCode || 'PR00'
      );
      const material = db.getMaterial(targetItem.materialId);
      const useLegacyBasePriceFallback = !target.requiresPricingEvidence && !target.requiresPricingApproval;
      const unitPrice = Number(pricingRecord?.amount ?? (useLegacyBasePriceFallback ? material?.basePrice : 0) ?? 0);
      if (!(unitPrice > 0)) {
        this.completeObjective('check_pricing_error');
        return {
          isValid: false,
          fieldError: 'items',
          activeTabHint: 'ITEMS',
          mentorSpeech: `Não há condição de preço PR00 ativa para o material ${targetItem.materialId}. Analise a falta de preço e cadastre o registro correto na VK11 antes de gravar a ordem.`,
          whatHappened: `A determinação de preço do material ${targetItem.materialId} resultou em valor unitário zero.`,
          why: 'O registro de condição PR00 precisa existir na área de vendas antes da gravação da ordem.',
          businessImpact: 'Sem preço válido, o valor da ordem e os impostos ficariam incorretos.'
        };
      }

      if (
        target.targetMaterialId === targetItem.materialId &&
        target.targetAmount !== undefined &&
        Math.abs(unitPrice - Number(target.targetAmount)) > 0.005
      ) {
        return {
          isValid: false,
          fieldError: 'items',
          activeTabHint: 'ITEMS',
          mentorSpeech: `O preço unitário de ${targetItem.materialId} é R$ ${unitPrice.toFixed(2)}, mas o chamado exige R$ ${Number(target.targetAmount).toFixed(2)} na condição ${target.conditionCode || 'PR00'}. Corrija o registro na VK11.`,
          whatHappened: `Preço unitário encontrado: R$ ${unitPrice.toFixed(2)}. Preço esperado: R$ ${Number(target.targetAmount).toFixed(2)}.`,
          why: 'A ordem precisa utilizar o preço comercial autorizado no chamado.',
          businessImpact: 'Uma condição divergente altera o valor líquido, os impostos e a cobrança ao cliente.'
        };
      }
    }

    // 10. Validação dos Itens / Materiais e Quantidades
    if (!orderData.items || orderData.items.length === 0 || !orderData.items[0].materialId) {
      trainee.recordAction(false, 'Tentativa de Gravação', 'Nenhum material adicionado nas posições');
      return {
        isValid: false,
        fieldError: 'items',
        activeTabHint: 'ITEMS',
        mentorSpeech: 'O cabeçalho está perfeito! Agora precisamos preencher a posição de venda (linha de produto). Na aba "2. Posições / Itens", selecione o material solicitado e informe a quantidade.',
        whatHappened: 'A grade de posições não possui nenhum material válido selecionado.',
        why: 'Uma ordem de venda precisa de pelo menos uma posição com material cadastrado (MATNR) e quantidade pedida.',
        businessImpact: 'Ordem sem posições não pode gerar separação física no armazém nem faturamento.'
      };
    }

    if (target.items && target.items.length > 0) {
      for (const targetItem of target.items) {
        const matchingItem = orderData.items.find(i => i.materialId === targetItem.materialId);
        
        if (!matchingItem) {
          trainee.recordAction(false, 'Tentativa de Gravação', `Material ${targetItem.materialId} ausente`);
          const expectedMat = db.getMaterial(targetItem.materialId);
          const materialDescription = expectedMat ? expectedMat.description : targetItem.materialId;
          return {
            isValid: false,
            fieldError: 'items',
            activeTabHint: 'ITEMS',
            mentorSpeech: `Você adicionou um produto, mas o pedido de compra solicita o item ${materialDescription} (${targetItem.materialId}). Selecione o produto correto na lista de materiais e envie novamente!`,
            whatHappened: `O material ${targetItem.materialId} não foi inserido na ordem.`,
            why: 'O código do material identifica com precisão o SKU e a tributação correspondente.',
            businessImpact: 'Enviar o produto errado para o cliente gerará devolução e custos adicionais de logística reversa.'
          };
        }

        if (Number(matchingItem.quantity) <= 0) {
          trainee.recordAction(false, 'Tentativa de Gravação', 'Quantidade zerada');
          return {
            isValid: false,
            fieldError: 'items',
            activeTabHint: 'ITEMS',
            mentorSpeech: `Não se esqueça de informar a quantidade pedida para o item ${targetItem.materialId}. A quantidade deve ser maior que zero!`,
            whatHappened: 'A quantidade pedida está zerada ou em branco.',
            why: 'A quantidade é o multiplicador da condição de preço base PR00 e da reserva de estoque.',
            businessImpact: 'Impossibilita o cálculo do valor líquido e a reserva de estoque no CD.'
          };
        }

        // Validação pedagógica de ruptura ATP (quando o trainee tenta gravar a quantidade original do pedido)
        if (targetItem.requestedQuantity !== undefined && Number(matchingItem.quantity) === Number(targetItem.requestedQuantity)) {
          trainee.recordAction(false, 'Tentativa de Gravação', `Quantidade acima do ATP: ${matchingItem.quantity}`);
          if (targetItem.atpFeedback) {
            this.completeObjective('check_atp_error');
            return {
              isValid: false,
              fieldError: 'items',
              activeTabHint: 'ITEMS',
              ...targetItem.atpFeedback
            };
          }
        }

        if (Number(matchingItem.quantity) !== Number(targetItem.quantity)) {
          trainee.recordAction(false, 'Tentativa de Gravação', `Quantidade informada ${matchingItem.quantity} vs esperada ${targetItem.quantity}`);
          return {
            isValid: false,
            fieldError: 'items',
            activeTabHint: 'ITEMS',
            mentorSpeech: `Muito bom! Mas confira a quantidade: o cliente solicitou ${targetItem.quantity} unidades do produto no pedido de compra, mas você digitou ${matchingItem.quantity}. Corrija a quantidade e tente novamente!`,
            whatHappened: `Quantidade informada: ${matchingItem.quantity} UN. Quantidade solicitada: ${targetItem.quantity} UN.`,
            why: 'A quantidade na ordem deve ser idêntica à ordem de compra aprovada pelo cliente.',
            businessImpact: 'Divergência na quantidade gera faturamento incorreto e reclamações na portaria de entrega.'
          };
        }

        // Validação de Desconto Comercial %
        if (targetItem.discountPercent !== undefined) {
          const appliedDiscount = Number(matchingItem.manualDiscountPercent) || 0;
          if (appliedDiscount !== targetItem.discountPercent) {
            trainee.recordAction(false, 'Tentativa de Gravação', `Desconto comercial divergente: ${appliedDiscount}% vs ${targetItem.discountPercent}%`);
            return {
              isValid: false,
              fieldError: 'items',
              activeTabHint: 'ITEMS',
              mentorSpeech: `Quase tudo certo! Mas verifique o desconto comercial: para esta operação, o desconto deve ser de exatamente ${targetItem.discountPercent}%, e você informou ${appliedDiscount}%. Ajuste o percentual de desconto no item e grave a ordem!`,
              whatHappened: `Desconto aplicado: ${appliedDiscount}%. Desconto autorizado pela gerência: ${targetItem.discountPercent}%.`,
              why: 'No SAP SD, a condição RB00 deve refletir fielmente a alçada comercial negociada.',
              businessImpact: 'Desconto menor gera refaturamento por insatisfação; desconto maior sem alçada corrói a margem de lucro da empresa.'
            };
          }
        }
      }
      const expectedMaterialIds = new Set(target.items.map(item => item.materialId));
      const extraItem = orderData.items.find(item => !expectedMaterialIds.has(item.materialId));
      if (extraItem) {
        trainee.recordAction(false, 'Tentativa de Gravação', `Material extra: ${extraItem.materialId}`);
        return {
          isValid: false,
          fieldError: 'items',
          activeTabHint: 'ITEMS',
          mentorSpeech: `A posição ${extraItem.materialId} não consta na PO nem no escopo da missão. Remova o item ou registre uma alteração comercial formal antes de salvar.`,
          whatHappened: `Material não solicitado incluído na ordem: ${extraItem.materialId}.`,
          why: 'Uma ordem S/4HANA deve manter rastreabilidade entre demanda, item e parceiro.',
          businessImpact: 'Itens extras podem gerar faturamento, estoque e expedição indevidos.'
        };
      }
    }

    if (target.targetNetValue !== undefined && Math.abs(Number(orderData.netValue) - Number(target.targetNetValue)) > 0.01) {
      return {
        isValid: false,
        fieldError: 'items',
        activeTabHint: 'ITEMS',
        mentorSpeech: `O valor líquido da ordem é R$ ${Number(orderData.netValue || 0).toFixed(2)}, mas o chamado exige R$ ${Number(target.targetNetValue).toFixed(2)}. Confira preço, quantidade e desconto antes de gravar.`,
        whatHappened: `Valor líquido informado: R$ ${Number(orderData.netValue || 0).toFixed(2)}. Valor esperado: R$ ${Number(target.targetNetValue).toFixed(2)}.`,
        why: 'O valor líquido precisa refletir o preço unitário, as quantidades e as condições comerciais do chamado.',
        businessImpact: 'Uma ordem com valor incorreto cria divergência de cobrança e tributação.'
      };
    }

    if (isCreditReleaseMission) {
      const customer = db.getCustomer(orderData.customerId);
      const projectedCredit = customer ? (Number(customer.creditUsed) || 0) + (Number(orderData.totalValue) || 0) : 0;
      const willBeCreditBlocked = Boolean(customer && (
        customer.creditStatus === 'BLOCKED' || projectedCredit > Number(customer.creditLimit || 0)
      ));
      if (target.requiresVkm1Release && !willBeCreditBlocked) {
        trainee.recordAction(false, 'Tentativa de Gravação', 'A ordem não atingiria o bloqueio de crédito exigido pela missão');
        return {
          isValid: false,
          fieldError: 'items',
          activeTabHint: 'ITEMS',
          mentorSpeech: 'A ordem precisa ultrapassar o limite de crédito para seguir para a análise na VKM1. Revise cliente, quantidade e valores conforme o chamado.',
          whatHappened: 'Com os valores informados, o sistema não aplicaria o bloqueio de crédito esperado.',
          why: 'A missão exige observar o bloqueio automático antes de emitir o parecer de crédito.',
          businessImpact: 'Sem bloqueio ativo, não existe ordem pendente na VKM1 para liberar.'
        };
      }

      return {
        isValid: true,
        mentorSpeech: 'Pedido validado para gravação. Após salvar, confirme o bloqueio de crédito e prossiga para a VKM1 para concluir a liberação supervisionada.',
        whatHappened: 'Os dados comerciais da ordem foram conferidos; a liberação de crédito ainda é uma etapa pendente.',
        why: 'Uma ordem acima do limite permanece retida até receber parecer formal de crédito.',
        businessImpact: 'A expedição só poderá começar após a liberação correta na VKM1.'
      };
    }
    // A gravação satisfaz apenas os objetivos executados na VA01. Consultas e
    // cadastros prévios (XD03, MM03, VK11) e inspeções (VA03) ficam pendentes.
    this.completeObjectives([
      'set_org_structure', 'select_customer', 'fill_terms', 'add_item', 'save_order',
      'create_order_techlog', 'add_switch_items', 'apply_discount', 'verify_pricing',
      'access_va01', 'fill_header_sales_area', 'fill_header_commercial', 'add_order_items',
      'create_sales_order', 'create_adjusted_order', 'create_order',
      'emit_sales_order', 'audit_flow', 'add_items'
    ]);

    const summaryText = `Ordem OR • Org ${orderData.salesOrg}/${orderData.distChannel}/${orderData.division} • Cliente ${orderData.customerId} • ${orderData.items.length} itens • Total: R$ ${(orderData.totalValue || 0).toFixed(2)}`;
    const completed = this.completeActiveScenarioIfReady('Gravação de Ordem de Venda', summaryText);
    if (!completed) trainee.recordAction(true, 'Gravação de Ordem de Venda', summaryText);
    const pending = scenario.objectives.filter(objective => !objective.done);

    return {
      isValid: true,
      completed,
      mentorSpeech: completed
        ? (scenario.completionFeedback?.mentorSpeech || `Ordem ${orderData.customerPoNumber} gravada com sucesso. Missão concluída! +${scenario.xpReward || 300} XP.`)
        : `Ordem gravada com sucesso, mas a missão continua. Conclua também: ${pending.map(objective => objective.text).join('; ')}.`,
      whatHappened: completed
        ? (scenario.completionFeedback?.whatHappened || 'Ordem de venda emitida com 100% de conformidade aos dados mestres e às regras comerciais.')
        : `Ordem gravada; ${pending.length} objetivo(s) da missão continuam pendentes.`,
      why: scenario.completionFeedback?.why || 'A missão só é homologada depois que cada etapa prevista no chamado for executada.',
      businessImpact: scenario.completionFeedback?.businessImpact || 'A ordem seguirá para o próximo passo do fluxo comercial após a conferência dos objetivos pendentes.'
    };
  }

  /**
   * Valida a modificação de uma Ordem de Venda na VA02 de forma genérica e data-driven
   * @param {string} docNumber
   * @param {Object} updatedOrderData
   * @returns {Object} { isValid, mentorSpeech, whatHappened, why, businessImpact, fieldError, activeTabHint }
   */
  validateSalesOrderModification(docNumber, updatedOrderData) {
    const scenario = this.activeScenario;
    if (!scenario || !scenario.targetCriteria) {
      return {
        isValid: true,
        mentorSpeech: 'Alterações gravadas com sucesso no sistema.',
        whatHappened: `Ordem nº ${docNumber} atualizada com os novos parâmetros.`,
        why: 'Campos comerciais atualizados conforme solicitado.',
        businessImpact: 'Os novos volumes e condições serão refletidos no faturamento e remessa.'
      };
    }

    const target = scenario.targetCriteria;

    // 1. Validação de Documento Correto (caso o cenário exija uma ordem específica)
    if (target.targetDocNumber && docNumber !== target.targetDocNumber) {
      trainee.recordAction(false, 'Tentativa de Modificação', `Ordem incorreta selecionada: ${docNumber}`);
      return {
        isValid: false,
        fieldError: 'docNumber',
        activeTabHint: 'HEADER',
        mentorSpeech: `Atenção: Você está modificando a ordem ${docNumber}, mas a solicitação do cliente é para alterar a ordem ${target.targetDocNumber}. Selecione o documento correto no topo da transação!`,
        whatHappened: `Ordem modificada: ${docNumber}. Ordem solicitada pelo chamado: ${target.targetDocNumber}.`,
        why: 'Alterar a ordem de outro pedido gera divergências fiscais com clientes distintos.',
        businessImpact: 'Risco de faturamento indevido para o cliente não relacionado.'
      };
    }

    // 2. Validação de Condição de Pagamento (se exigida alteração)
    if (target.paymentTerms && updatedOrderData.paymentTerms !== target.paymentTerms) {
      trainee.recordAction(false, 'Tentativa de Modificação', `Condição ZTERM divergente: ${updatedOrderData.paymentTerms}`);
      return {
        isValid: false,
        fieldError: 'paymentTerms',
        activeTabHint: 'HEADER',
        mentorSpeech: `Boa tentativa! Mas verifique a condição de pagamento: a renegociação estipula ${target.paymentTerms}, e o formulário está com ${updatedOrderData.paymentTerms}. Ajuste esse campo no cabeçalho e tente novamente!`,
        whatHappened: `Condição informada: ${updatedOrderData.paymentTerms}. Condição esperada: ${target.paymentTerms}.`,
        why: 'A condição de pagamento determina os vencimentos das faturas.',
        businessImpact: 'Divergência gera boletos com prazos incompatíveis com o acordado.'
      };
    }

    // 3. Validação de Incoterms (se exigido)
    if (target.incoterms && updatedOrderData.incoterms !== target.incoterms) {
      trainee.recordAction(false, 'Tentativa de Modificação', `Incoterms divergente: ${updatedOrderData.incoterms}`);
      return {
        isValid: false,
        fieldError: 'incoterms',
        activeTabHint: 'HEADER',
        mentorSpeech: `Atenção à modalidade de frete: para esta alteração, o Incoterms acordado é ${target.incoterms}. Corrija no cabeçalho antes de gravar!`,
        whatHappened: `Incoterms informado: ${updatedOrderData.incoterms}. Esperado: ${target.incoterms}.`,
        why: 'O Incoterms define responsabilidade sobre frete e seguro.',
        businessImpact: 'Erro no Incoterms gera cobrança indevida de frete.'
      };
    }

    if (target.incotermsLocation && updatedOrderData.incotermsLocation !== target.incotermsLocation) {
      return {
        isValid: false,
        fieldError: 'incotermsLocation',
        activeTabHint: 'HEADER',
        mentorSpeech: `O local nomeado do Incoterms deve ser ${target.incotermsLocation}. Confira o cabeçalho antes de gravar.`,
        whatHappened: `Local informado: ${updatedOrderData.incotermsLocation || 'não informado'}. Local esperado: ${target.incotermsLocation}.`,
        why: 'O código do Incoterms sem o local nomeado não descreve completamente o ponto contratual da entrega.',
        businessImpact: 'Evita interpretar incorretamente responsabilidade, risco e transporte em documentos posteriores.'
      };
    }
    if (target.incotermsVersion && updatedOrderData.incotermsVersion !== undefined && updatedOrderData.incotermsVersion !== target.incotermsVersion) {
      return {
        isValid: false,
        fieldError: 'incotermsVersion',
        activeTabHint: 'HEADER',
        mentorSpeech: `Use a versão de Incoterms ${target.incotermsVersion} definida na referência comercial.`,
        whatHappened: `Versão informada: ${updatedOrderData.incotermsVersion || 'não informada'}. Versão esperada: ${target.incotermsVersion}.`,
        why: 'A versão da regra pode alterar responsabilidades e interpretação do termo.',
        businessImpact: 'Evita persistir uma condição comercial ambígua no pedido.'
      };
    }
    // 4. Validação de Itens, Quantidades e Descontos
    if (target.items && target.items.length > 0) {
      for (const targetItem of target.items) {
        const matchingItem = updatedOrderData.items.find(i => i.materialId === targetItem.materialId);

        if (!matchingItem) {
          const expectedMat = db.getMaterial(targetItem.materialId);
          const matDesc = expectedMat ? expectedMat.description : targetItem.materialId;
          trainee.recordAction(false, 'Tentativa de Modificação', `Material ${targetItem.materialId} ausente`);
          return {
            isValid: false,
            fieldError: 'items',
            activeTabHint: 'ITEMS',
            mentorSpeech: `Atenção: A ordem precisa conter a linha do item ${matDesc} (${targetItem.materialId}). Verifique a grade de posições!`,
            whatHappened: `Material ${targetItem.materialId} não encontrado na ordem.`,
            why: 'A posição deve conter o SKU correto.',
            businessImpact: 'A ausência do item impede a entrega do produto.'
          };
        }

        if (targetItem.quantity !== undefined && Number(matchingItem.quantity) !== Number(targetItem.quantity)) {
          const expectedMat = db.getMaterial(targetItem.materialId);
          const matDesc = expectedMat ? expectedMat.description : targetItem.materialId;
          trainee.recordAction(false, 'Tentativa de Modificação', `Qtd informada ${matchingItem.quantity} vs esperada ${targetItem.quantity}`);
          return {
            isValid: false,
            fieldError: 'items',
            activeTabHint: 'ITEMS',
            mentorSpeech: `Quase lá! Mas confira a quantidade: a nova solicitação do cliente é de ${targetItem.quantity} unidades para o item ${matDesc}, mas você informou ${matchingItem.quantity}. Ajuste a quantidade na posição e grave novamente!`,
            whatHappened: `Quantidade informada: ${matchingItem.quantity} UN. Quantidade solicitada: ${targetItem.quantity} UN.`,
            why: 'A quantidade na ordem deve ser idêntica ao volume renegociado.',
            businessImpact: 'Quantidade divergente gera separação física incorreta no estoque.'
          };
        }

        if (targetItem.discountPercent !== undefined) {
          const appliedDiscount = Number(matchingItem.manualDiscountPercent) || 0;
          if (appliedDiscount !== targetItem.discountPercent) {
            trainee.recordAction(false, 'Tentativa de Modificação', `Desconto divergente: ${appliedDiscount}% vs ${targetItem.discountPercent}%`);
            return {
              isValid: false,
              fieldError: 'items',
              activeTabHint: 'ITEMS',
              mentorSpeech: `Atenção ao desconto comercial: para esta operação, o percentual de desconto deve ser de ${targetItem.discountPercent}%, e você informou ${appliedDiscount}%. Ajuste o percentual e tente mais uma vez!`,
              whatHappened: `Desconto informado: ${appliedDiscount}%. Desconto autorizado: ${targetItem.discountPercent}%.`,
              why: 'O desconto comercial na condição RB00 deve seguir a alçada negociada.',
              businessImpact: 'Desconto incorreto impacta a margem de contribuição da venda.'
            };
          }
        }
      }
    }

    for (const targetItem of target.items || []) {
      const pricingRecord = db.getPricingRecord(
        targetItem.materialId,
        target.salesOrg || updatedOrderData.salesOrg || '1000',
        target.distChannel || updatedOrderData.distChannel || '10',
        target.conditionCode || 'PR00'
      );
      const material = db.getMaterial(targetItem.materialId);
      const unitPrice = Number(pricingRecord?.amount ?? material?.basePrice ?? 0);
      if (!(unitPrice > 0)) {
        return {
          isValid: false,
          fieldError: 'items',
          activeTabHint: 'ITEMS',
          mentorSpeech: `O material ${targetItem.materialId} continua sem preço PR00 ativo. Cadastre a condição correta na VK11 antes de recalcular a ordem.`,
          whatHappened: `A ordem ${docNumber} ainda não possui um preço unitário válido para ${targetItem.materialId}.`,
          why: 'A atualização de uma ordem deve recalcular as condições de preço antes de persistir o documento.',
          businessImpact: 'Sem PR00, a ordem permanece com valor incorreto e não pode seguir para faturamento.'
        };
      }
      if (target.targetMaterialId === targetItem.materialId && target.targetAmount !== undefined && Math.abs(unitPrice - Number(target.targetAmount)) > 0.005) {
        return {
          isValid: false,
          fieldError: 'items',
          activeTabHint: 'ITEMS',
          mentorSpeech: `O preço PR00 de ${targetItem.materialId} é R$ ${unitPrice.toFixed(2)}, mas o chamado exige R$ ${Number(target.targetAmount).toFixed(2)}. Corrija o registro na VK11 antes de salvar.`,
          whatHappened: `Preço encontrado: R$ ${unitPrice.toFixed(2)}. Preço solicitado: R$ ${Number(target.targetAmount).toFixed(2)}.`,
          why: 'O recálculo deve usar a condição comercial autorizada no chamado.',
          businessImpact: 'Um preço incorreto contamina o valor líquido e os tributos do documento.'
        };
      }
    }
    if (target.targetNetValue !== undefined && Math.abs(Number(updatedOrderData.netValue) - Number(target.targetNetValue)) > 0.01) {
      return {
        isValid: false,
        fieldError: 'items',
        activeTabHint: 'ITEMS',
        mentorSpeech: `Após o recálculo, o valor líquido ficou em R$ ${Number(updatedOrderData.netValue || 0).toFixed(2)}; o chamado exige R$ ${Number(target.targetNetValue).toFixed(2)}. Revise preço, quantidade e desconto.`,
        whatHappened: `Valor líquido calculado na ordem: R$ ${Number(updatedOrderData.netValue || 0).toFixed(2)}. Esperado: R$ ${Number(target.targetNetValue).toFixed(2)}.`,
        why: 'O valor líquido deve refletir o preço PR00 ativo e as quantidades negociadas.',
        businessImpact: 'Valor divergente causa cobrança e integração fiscal incorretas.'
      };
    }

    const isModificationMission = target.action === 'SALES_ORDER_MODIFICATION' ||
      scenario.validationRules?.actionType === 'SALES_ORDER_MODIFICATION';
    if (!isModificationMission) {
      return {
        isValid: true,
        mentorSpeech: 'A alteração da ordem foi validada. Esta operação não faz parte do objetivo da missão atual; consulte as metas do Chefe Wilson para continuar.',
        whatHappened: `A ordem ${docNumber} passou pela validação da VA02, sem avançar os objetivos da missão atual.`,
        why: 'O progresso da missão depende da ação indicada no chamado, mesmo quando outra transação comercial é válida.',
        businessImpact: 'A alteração comercial pode ser salva sem registrar uma conclusão indevida nem conceder a recompensa da missão.'
      };
    }

    this.completeObjectives([
      'access_va02', 'modify_payment_terms', 'modify_incoterms', 'modify_item_quantity',
      'update_order_quantity', 'apply_discount', 'apply_volume_discount', 'update_incoterms',
      'adjust_quantity', 'update_header_terms', 'update_item_quantity', 'adjust_discount',
      'save_order_modification', 'save_modified_order', 'check_stock_atp'
    ]);

    const summaryText = `Ordem ${docNumber} alterada • Total: R$ ${Number(updatedOrderData.totalValue || 0).toFixed(2)}`;
    const completed = this.completeActiveScenarioIfReady('Modificação de Ordem de Venda', summaryText);
    if (!completed) trainee.recordAction(true, 'Modificação de Ordem de Venda', summaryText);
    const pending = scenario.objectives.filter(objective => !objective.done);

    return {
      isValid: true,
      completed,
      mentorSpeech: completed
        ? (scenario.completionFeedback?.mentorSpeech || `Excelente trabalho! Você regularizou a ordem ${docNumber} conforme as condições comerciais solicitadas. Muito bem! +${scenario.xpReward || 300} XP.`)
        : `Ordem ${docNumber} atualizada. A missão continua; conclua também: ${pending.map(objective => objective.text).join('; ')}.`,
      whatHappened: completed
        ? (scenario.completionFeedback?.whatHappened || `Ordem de venda nº ${docNumber} alterada com 100% de conformidade às regras de negócio.`)
        : `Ordem de venda nº ${docNumber} atualizada; ${pending.length} objetivo(s) continuam pendentes.`,
      why: scenario.completionFeedback?.why ||
        'As alterações comerciais e o recálculo do esquema de preços foram validados com precisão.',
      businessImpact: scenario.completionFeedback?.businessImpact ||
        'O fluxo comercial seguirá com as condições atualizadas na ordem.'
    };
  }

  /**
   * Validação interativa da criação de Fornecimento / Remessa na VL01N
   */
  validateDeliveryCreation(shippingPoint, salesOrderNumber, deliveryData) {
    const scenario = this.activeScenario;
    if (!scenario || !scenario.targetCriteria) {
      return {
        isValid: true,
        mentorSpeech: 'Remessa criada com sucesso na transação VL01N.',
        whatHappened: `Documento de fornecimento nº ${deliveryData?.deliveryNumber} gerado para a ordem ${salesOrderNumber}.`,
        why: 'Ponto de expedição e parâmetros de fornecimento validados.',
        businessImpact: 'A ordem avançou para a etapa de picking e conferência no CD.'
      };
    }

    const target = scenario.targetCriteria;

    // 1. Validação de Ordem Correta
    if (target.targetDocNumber && salesOrderNumber !== target.targetDocNumber) {
      trainee.recordAction(false, 'Tentativa de Remessa', `Ordem divergente: ${salesOrderNumber} vs ${target.targetDocNumber}`);
      return {
        isValid: false,
        mentorSpeech: `Atenção: Você informou a ordem ${salesOrderNumber}, mas o chamado solicita a remessa para a ordem ${target.targetDocNumber}. Ajuste o número da ordem de venda!`,
        whatHappened: `Ordem informada: ${salesOrderNumber}. Ordem esperada: ${target.targetDocNumber}.`,
        why: 'Criar remessa para ordem divergente compromete o cronograma de entrega de outro cliente.',
        businessImpact: 'Risco de envio indevido e atraso no atendimento ao cliente prioritário.'
      };
    }

    // 2. Validação de Ponto de Expedição
    if (target.shippingPoint && shippingPoint !== target.shippingPoint) {
      trainee.recordAction(false, 'Tentativa de Remessa', `Ponto de expedição divergente: ${shippingPoint}`);
      return {
        isValid: false,
        mentorSpeech: `Atenção ao Ponto de Expedição: para esta operação deve ser utilizado o Ponto de Expedição ${target.shippingPoint} (CD Central SP), e você informou ${shippingPoint}.`,
        whatHappened: `Ponto de expedição informado: ${shippingPoint}. Esperado: ${target.shippingPoint}.`,
        why: 'O Ponto de Expedição determina o local físico de onde a carga será despachada.',
        businessImpact: 'Direcionamento incorreto de frota e perda de rastreabilidade logística.'
      };
    }

    if (target.targetMaterialId && deliveryData) {
      const item = deliveryData.items?.find(entry => entry.materialId === target.targetMaterialId);
      if (!item || (target.targetQuantity !== undefined && Number(item.deliveryQuantity) !== Number(target.targetQuantity))) {
        return {
          isValid: false,
          fieldError: 'deliveryItems',
          mentorSpeech: `A entrega precisa conter ${target.targetQuantity ?? 'a quantidade solicitada'} unidade(s) de ${target.targetMaterialId}.`,
          whatHappened: `A remessa não corresponde ao item/quantidade esperados para a ordem ${salesOrderNumber}.`,
          why: 'A outbound delivery deve manter rastreabilidade entre ordem, material e quantidade.',
          businessImpact: 'Evita criar uma remessa para item ou volume diferente do pedido.'
        };
      }
    }
    this.completeObjective('access_vl01n');
    this.completeObjective('create_delivery');
    this.completeObjective('check_order');
    this.completeObjective('select_shipping_point');

    // A remessa só conclui a missão se as etapas anteriores também estiverem feitas.
    if (target.action === 'CREATE_DELIVERY') {
      const summaryText = `Remessa ${deliveryData?.deliveryNumber} criada • Ponto de Exp. ${shippingPoint} • Ordem ${salesOrderNumber}`;
      const completed = this.completeActiveScenarioIfReady('Criação de Remessa VL01N', summaryText);
      if (!completed) trainee.recordAction(true, 'Criação de Remessa VL01N', summaryText);
      const pending = scenario.objectives.filter(objective => !objective.done);

      return {
        isValid: true,
        completed,
        mentorSpeech: completed
          ? (scenario.completionFeedback?.mentorSpeech || `Muito bem! Remessa nº ${deliveryData?.deliveryNumber} gerada com sucesso a partir da ordem ${salesOrderNumber}. Atividade concluída! +${scenario.xpReward || 300} XP.`)
          : `Remessa ${deliveryData?.deliveryNumber} criada; a missão continua. Conclua também: ${pending.map(objective => objective.text).join('; ')}.`,
        whatHappened: completed
          ? (scenario.completionFeedback?.whatHappened || `Documento de Remessa nº ${deliveryData?.deliveryNumber} criado no mandante 800.`)
          : `Documento de remessa criado; ${pending.length} objetivo(s) da missão continuam pendentes.`,
        why: scenario.completionFeedback?.why || 'Ponto de expedição e vínculos comerciais foram devidamente estabelecidos.',
        businessImpact: scenario.completionFeedback?.businessImpact || 'Os itens foram liberados para separação e expedição no Centro de Distribuição.'
      };
    }

    // Etapa intermediária de cenários compostos (ex: POST_GOODS_ISSUE ou FULL_O2C)
    return {
      isValid: true,
      mentorSpeech: `Muito bem! O documento de remessa nº ${deliveryData?.deliveryNumber} foi gerado com sucesso na VL01N. A etapa de criação do fornecimento está concluída. Agora prossiga para a transação VL02N para realizar o picking e registrar a Saída de Mercadorias (PGI)!`,
      whatHappened: `Documento de Remessa nº ${deliveryData?.deliveryNumber} criado no mandante 800 para a Ordem ${salesOrderNumber}.`,
      why: 'O documento de fornecimento (LIKP/LIPS) formaliza a solicitação de separação física dos itens no Centro de Distribuição.',
      businessImpact: 'A carga foi autorizada para manuseio. A próxima etapa física é a conferência de picking e o registro do PGI na VL02N.'
    };
  }

  /**
   * Validação interativa da Saída de Mercadorias (PGI / Post Goods Issue) na VL02N
   */
  validatePostGoodsIssue(deliveryNumber, deliveryData) {
    const scenario = this.activeScenario;
    if (!scenario || !scenario.targetCriteria) {
      return {
        isValid: true,
        mentorSpeech: 'Saída de Mercadorias (PGI) registrada com sucesso.',
        whatHappened: `PGI executado para a remessa ${deliveryNumber}. Estoque físico baixado no depósito.`,
        why: 'Movimento 601 processado com sucesso.',
        businessImpact: 'A ordem está concluída na expedição e liberada para emissão da fatura (VF01).'
      };
    }

    const target = scenario.targetCriteria;
    if (target.targetDeliveryNumber && deliveryNumber !== target.targetDeliveryNumber) {
      return {
        isValid: false,
        mentorSpeech: `A missão solicita a remessa ${target.targetDeliveryNumber}; a remessa informada foi ${deliveryNumber}.`,
        whatHappened: `Remessa processada: ${deliveryNumber}. Remessa esperada: ${target.targetDeliveryNumber}.`,
        why: 'O PGI deve ser registrado no documento correto e vinculado à ordem solicitada.',
        businessImpact: 'Evita baixa física em uma remessa de outro cliente ou operação.'
      };
    }
    if (target.targetMaterialId && deliveryData) {
      const item = deliveryData.items?.find(entry => entry.materialId === target.targetMaterialId);
      if (!item || (target.targetQuantity !== undefined && Number(item.deliveryQuantity) !== Number(target.targetQuantity))) {
        return {
          isValid: false,
          mentorSpeech: `A remessa precisa conter ${target.targetQuantity ?? 'a quantidade solicitada'} unidade(s) de ${target.targetMaterialId}.`,
          whatHappened: 'Item ou quantidade da remessa divergente do chamado.',
          why: 'O PGI deve baixar exatamente o item e o volume conferidos.',
          businessImpact: 'Evita baixa física incorreta no estoque.'
        };
      }
    }

    // Se o cenário tem alvo de documento de ordem específico, checa
    if (target.targetDocNumber && deliveryData && deliveryData.salesOrderNumber !== target.targetDocNumber) {
      trainee.recordAction(false, 'Tentativa de PGI', `PGI em remessa não vinculada à ordem alvo: ${deliveryData.salesOrderNumber}`);
      return {
        isValid: false,
        mentorSpeech: `Atenção: A remessa ${deliveryNumber} pertence à ordem ${deliveryData.salesOrderNumber}, mas o chamado é para atender a ordem ${target.targetDocNumber}.`,
        whatHappened: `Remessa processada: ${deliveryNumber} (Ordem: ${deliveryData.salesOrderNumber}). Ordem esperada: ${target.targetDocNumber}.`,
        why: 'O despacho de mercadoria deve corresponder à ordem solicitada no chamado.',
        businessImpact: 'Risco de baixa física indevida no estoque para cliente não prioritário.'
      };
    }

    this.completeObjective('access_vl02n');
    this.completeObjective('confirm_picking');
    this.completeObjective('post_goods_issue');
    this.completeObjective('verify_document_flow');
    this.completeObjective('verify_stock_deduction');

    // Se o cenário é de PGI/Expedição (ex: TRN-109, DSF-204, TRN-116, TRN-126, DSF-208)
    if (target.action === 'POST_GOODS_ISSUE' || target.action === 'FULL_SHIPPING' || scenario.validationRules?.actionType === 'POST_GOODS_ISSUE') {
      const summaryText = `PGI registrado para Remessa ${deliveryNumber} • Movimento 601 • Baixa física concluída`;
      const completed = this.completeActiveScenarioIfReady('Registro de PGI VL02N', summaryText);
      if (!completed) trainee.recordAction(true, 'Registro de PGI VL02N', summaryText);
      const pending = scenario.objectives.filter(objective => !objective.done);

      return {
        isValid: true,
        completed,
        mentorSpeech: completed
          ? (scenario.completionFeedback?.mentorSpeech || `Excelente trabalho! Você realizou o picking e registrou o Post Goods Issue (PGI) na transação VL02N. O estoque físico foi devidamente baixado e a remessa está concluída! +${scenario.xpReward || 300} XP.`)
          : `PGI registrado para a remessa ${deliveryNumber}; a missão continua. Conclua também: ${pending.map(objective => objective.text).join('; ')}.`,
        whatHappened: completed
          ? (scenario.completionFeedback?.whatHappened || `Saída de mercadorias registrada com sucesso para a Remessa nº ${deliveryNumber}.`)
          : `Saída de mercadorias registrada; ${pending.length} objetivo(s) da missão continuam pendentes.`,
        why: scenario.completionFeedback?.why || 'O movimento 601 baixou o estoque físico e encerrou a reserva no CD.',
        businessImpact: scenario.completionFeedback?.businessImpact || 'A carga foi despachada para transporte e o chamado foi finalizado com sucesso!'
      };
    }

    // Etapa intermediária de cenários de faturamento ou FULL_O2C (ex: SCN-17, SCN-25, SCN-41, SCN-55)
    return {
      isValid: true,
      mentorSpeech: `Excelente trabalho! O picking e a Saída de Mercadorias (PGI) foram registrados com sucesso na VL02N. O estoque físico foi baixado (Movimento 601) e a remessa ${deliveryNumber} foi liberada para faturamento. Agora acerte a emissão da Fatura Comercial na transação VF01!`,
      whatHappened: `PGI executado para a Remessa nº ${deliveryNumber}. Estoque físico baixado no depósito.`,
      why: 'O movimento MM 601 baixa fisicamente o inventário e encerra a etapa logística, deixando o documento pronto para escrituração fiscal.',
      businessImpact: 'A carga física foi expedida. A próxima etapa operacional é gerar a fatura comercial e o título a receber na transação VF01.'
    };
  }

  /**
   * Validação interativa da criação de Fatura Comercial (Billing) na VF01
   */
  completeInvoiceMission(scenario, billingType, invoiceData) {
    if (!scenario || !scenario.objectives?.every(objective => objective.done)) return false;

    const isRedo = trainee.isScenarioCompleted(scenario.id);
    const xpEarned = isRedo ? 0 : (scenario.xpReward || 300);
    if (!isRedo) trainee.addXp(xpEarned, `Conclusão do chamado de faturamento [${scenario.code}] ${scenario.title}`);
    trainee.recordAction(true, 'Emissão de Fatura VF01', `Fatura ${invoiceData?.invoiceNumber} emitida para a ordem ${invoiceData?.salesOrderNumber}`);
    if (!isRedo && scenario.badgeReward) trainee.unlockBadge(scenario.badgeReward);

    const summaryText = `Fatura ${invoiceData?.invoiceNumber} (Tipo ${billingType}) emitida • Total R$ ${invoiceData?.totalValue?.toFixed(2)} • Ciclo Concluído`;
    trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);
    return true;
  }

  validateInvoiceVerification(invoiceNumber) {
    const scenario = this.activeScenario;
    if (!scenario) return { isValid: true, completed: false };

    const invoice = db.getInvoice(invoiceNumber);
    const target = scenario.targetCriteria || {};
    if (!invoice) {
      return { isValid: false, completed: false, mentorSpeech: `A fatura ${invoiceNumber} não foi localizada na VF03.` };
    }
    if (target.targetDocNumber && invoice.salesOrderNumber !== target.targetDocNumber) {
      return { isValid: false, completed: false, mentorSpeech: `A fatura selecionada pertence à ordem ${invoice.salesOrderNumber}; a missão solicita a ordem ${target.targetDocNumber}.` };
    }
    if (target.billingType && invoice.billingType !== target.billingType) {
      return { isValid: false, completed: false, mentorSpeech: `Tipo de faturamento ${invoice.billingType} divergente; a missão solicita ${target.billingType}.` };
    }

    this.completeObjective('verify_invoice');
    this.completeObjective('verify_document_flow');
    const completed = this.completeInvoiceMission(scenario, invoice.billingType, invoice);
    return {
      isValid: true,
      completed,
      mentorSpeech: completed
        ? (scenario.completionFeedback?.mentorSpeech || `Fatura ${invoice.invoiceNumber} conferida na VF03. Missão concluída.`)
        : `Fatura ${invoice.invoiceNumber} aberta na VF03. Confira o fluxo documental e conclua as etapas restantes da missão.`
    };
  }

  validateInvoiceCreation(billingType, referenceDoc, invoiceData) {
    const scenario = this.activeScenario;
    if (!scenario || !scenario.targetCriteria) {
      return {
        isValid: true,
        mentorSpeech: 'Fatura emitida com sucesso na transação VF01.',
        whatHappened: `Documento de faturamento nº ${invoiceData?.invoiceNumber} gerado no sistema.`,
        why: 'Integração entre SD, MM e FI concluída.',
        businessImpact: 'A duplicata financeira foi gerada no contas a receber.'
      };
    }

    const target = scenario.targetCriteria;
    if (target.requiresDeliveryReference && !invoiceData?.deliveryNumber) {
      return {
        isValid: false,
        mentorSpeech: 'O documento de faturamento precisa estar relacionado a uma outbound delivery. Selecione a remessa antes de continuar.',
        whatHappened: 'Nenhuma remessa foi informada como referência do billing.',
        why: 'O fluxo de produto físico mantém rastreabilidade entre ordem, entrega, PGI e faturamento.',
        businessImpact: 'Evita faturamento desacoplado da expedição e cobrança de uma operação ainda não expedida.'
      };
    }

    if (target.targetDeliveryNumber && invoiceData?.deliveryNumber !== target.targetDeliveryNumber) {
      return {
        isValid: false,
        mentorSpeech: `A fatura precisa usar a remessa ${target.targetDeliveryNumber} como referência.`,
        whatHappened: `Remessa informada no billing: ${invoiceData?.deliveryNumber || 'não informada'}.`,
        why: 'O documento de faturamento deve manter o vínculo com a entrega e o PGI corretos.',
        businessImpact: 'Evita faturar uma entrega diferente da solicitada ou criar billing sem rastreabilidade.'
      };
    }
    // 1. Validação do Tipo de Faturamento
    if (target.billingType && billingType !== target.billingType) {
      trainee.recordAction(false, 'Tentativa de Faturamento', `Tipo de fatura divergente: ${billingType}`);
      return {
        isValid: false,
        mentorSpeech: `Atenção: Para esta operação deve ser utilizado o Tipo de Faturamento ${target.billingType} (Fatura Comercial / NF), e você informou ${billingType}.`,
        whatHappened: `Tipo de faturamento informado: ${billingType}. Esperado: ${target.billingType}.`,
        why: 'O tipo de faturamento define a regra de escrituração contábil e tributária no SAP.',
        businessImpact: 'Risco de inconsistência fiscal no livro de saídas e na emissão da NF-e.'
      };
    }

    // 2. Validação da Ordem ou Remessa Alvo
    if (target.targetDocNumber && invoiceData && invoiceData.salesOrderNumber !== target.targetDocNumber) {
      trainee.recordAction(false, 'Tentativa de Faturamento', `Faturamento de ordem divergente: ${invoiceData.salesOrderNumber}`);
      return {
        isValid: false,
        mentorSpeech: `Atenção: A fatura foi gerada para a ordem ${invoiceData.salesOrderNumber}, mas a solicitação é para faturar a ordem ${target.targetDocNumber}.`,
        whatHappened: `Ordem faturada: ${invoiceData.salesOrderNumber}. Ordem solicitada: ${target.targetDocNumber}.`,
        why: 'O faturamento deve corresponder estritamente ao pedido e à remessa aprovada pelo cliente.',
        businessImpact: 'Cobrança indevida emitida contra cliente não relacionado.'
      };
    }

    this.completeObjective('access_vf01');
    this.completeObjective('select_billing_type');
    this.completeObjective('create_invoice');

    // Emissão da fatura só encerra a missão quando todos os objetivos já foram cumpridos.
    let missionCompleted = false;
    if (target.action === 'CREATE_INVOICE' || target.action === 'FULL_O2C' || scenario.validationRules?.actionType === 'INVOICE_CREATION') {
      missionCompleted = this.completeInvoiceMission(scenario, billingType, invoiceData);
    }

    const invoiceAuditPending = scenario.objectives?.some(objective => objective.id === 'verify_invoice' && !objective.done);
    const stepSpeech = invoiceAuditPending
      ? `Fatura ${invoiceData?.invoiceNumber} emitida com sucesso. Abra a VF03, confira o documento e confirme a análise para concluir a missão.`
      : `Fatura ${invoiceData?.invoiceNumber} emitida. Consulte as metas restantes no painel do Chefe Wilson para concluir a missão.`;

    return {
      isValid: true,
      mentorSpeech: missionCompleted
        ? (scenario.completionFeedback?.mentorSpeech || `Fatura Comercial nº ${invoiceData?.invoiceNumber} gerada com sucesso! Missão concluída. +${scenario.xpReward || 300} XP.`)
        : stepSpeech,
      whatHappened: missionCompleted
        ? (scenario.completionFeedback?.whatHappened || `Fatura nº ${invoiceData?.invoiceNumber} criada e integrada ao financeiro.`)
        : `Fatura nº ${invoiceData?.invoiceNumber} criada; a missão permanece em andamento.`,
      why: missionCompleted
        ? (scenario.completionFeedback?.why || 'Os impostos e valores da remessa foram devidamente escriturados.')
        : 'A emissão da fatura é uma etapa do processo; os objetivos restantes ainda precisam ser conferidos.',
      businessImpact: missionCompleted
        ? (scenario.completionFeedback?.businessImpact || 'O título a receber foi lançado e a cobrança está programada conforme a condição de pagamento acordada.')
        : 'A fatura foi registrada. Conclua a auditoria solicitada para homologar a missão.'
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
