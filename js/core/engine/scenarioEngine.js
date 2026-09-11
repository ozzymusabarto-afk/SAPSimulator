/**
 * NexusTech ERP • Motor de Execução de Cenários (Scenario Engine)
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 * Lógica Pedagógica: Treinar o Olhar do Trainee com Feedback Progressivo
 */

import { ScenarioCatalog } from '../scenarios/catalog.js';
import { db } from './erpDatabase.js';
import { trainee } from './traineeEngine.js';

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
   * Retorna a próxima solicitação/missão pendente da trilha oficial
   * com base na ordem do ScenarioCatalog e nas missões já concluídas pelo trainee.
   */
  getCurrentPendingScenario() {
    const completed = trainee.getCompletedScenarios();
    const pending = ScenarioCatalog.find(s => !completed.includes(s.id));
    return pending || ScenarioCatalog[ScenarioCatalog.length - 1];
  }

  /**
   * Retorna o ID da solicitação que deve ser carregada na inicialização do simulador:
   * 1. A missão que já foi iniciada e está em andamento (persistida em activeScenarioId);
   * 2. Caso a missão salva já tenha sido concluída ou não exista, a próxima missão pendente da trilha.
   */
  getCurrentActiveOrPendingScenarioId() {
    const savedActiveId = trainee.getActiveScenarioId();
    if (savedActiveId && ScenarioCatalog.some(s => s.id === savedActiveId)) {
      if (!trainee.isScenarioCompleted(savedActiveId)) {
        return savedActiveId;
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
    const raw = ScenarioCatalog.find(s => s.id === scenarioId) || ScenarioCatalog[0];
    this.activeScenario = JSON.parse(JSON.stringify(raw));
    
    // Atualiza a missão ativa salva no perfil do trainee
    trainee.setActiveScenarioId(this.activeScenario.id);

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
      `[${this.activeScenario.code}] ${this.activeScenario.title} • Orientado pelo Sr. Wilson`,
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

  /**
   * Validação interativa da análise de dados do cliente na XD03
   */
  validateCustomerAnalysis(customerId) {
    const scenario = this.activeScenario;
    if (!scenario) return { isValid: true };

    const target = scenario.targetCriteria;
    if (target.customerId && customerId === target.customerId) {
      this.completeObjective('check_customer');
      this.completeObjective('investigate_credit');

      trainee.addXp(30, `Consulta precisa do cadastro do cliente ${customerId} na XD03`);
      trainee.recordAction(true, 'Consulta Mestre de Clientes', `Cliente ${customerId} analisado na XD03`);

      return {
        isValid: true,
        feedback: {
          mentorSpeech: `Excelente análise! Você conferiu com precisão os dados cadastrais do cliente ${customerId}. Na tabela KNVV podemos ver a Área de Vendas (${target.salesOrg}/${target.distChannel}/${target.division}), a Condição de Pagamento (${target.paymentTerms}) e o Incoterms (${target.incoterms}). Agora vamos para a VA01 selecionar cada um desses parâmetros!`,
          whatHappened: `Cliente ${customerId} consultado com sucesso na transação XD03.`,
          why: 'No SAP SD, a validação cadastral prévia evita erros de faturamento e devoluções fiscais.',
          businessImpact: 'Garante que os prazos e responsabilidades de frete acordados em contrato sejam fielmente replicados na ordem de venda.'
        }
      };
    }

    return {
      isValid: false,
      feedback: {
        mentorSpeech: `Atenção: Você está visualizando o cliente ${customerId}, mas o chamado do cliente solicita análise do parceiro ${target.customerId}. Selecione o cliente correto no menu superior da XD03 e confira os dados comerciais.`,
        whatHappened: `Cliente selecionado na consulta: ${customerId}. Cliente solicitado pelo chamado: ${target.customerId}.`,
        why: 'Cada cliente possui sua própria área de vendas (KNVV) e perfil financeiro.',
        businessImpact: 'Consultar dados de outro cliente pode levar à aplicação indevida de prazos ou limites de crédito incompatíveis.'
      }
    };
  }

  /**
   * Valida o envio de Ordem de Venda na VA01 com feedback pedagógico rigoroso e amigável do Sr. Wilson
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

    // 9. Validação dos Itens / Materiais e Quantidades
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
    }

    // TUDO CORRETO! Concessão de XP e Registro Positivo
    if (scenario.objectives && Array.isArray(scenario.objectives)) {
      scenario.objectives.forEach(obj => {
        this.completeObjective(obj.id);
      });
    }

    const xpEarned = scenario.xpReward;
    trainee.addXp(xpEarned, `Conclusão com sucesso do chamado [${scenario.code}] ${scenario.title}`);
    trainee.recordAction(true, 'Gravação de Ordem de Venda', `Ordem de venda criada com 100% de conformidade`);
    
    if (scenario.badgeReward) {
      trainee.unlockBadge(scenario.badgeReward);
    }

    const summaryText = `Ordem OR • Org 1000/10/01 • Cliente ${orderData.customerId} • ${orderData.items.length} itens • Total: R$ ${(orderData.totalValue || 0).toFixed(2)}`;
    trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);

    return {
      isValid: true,
      mentorSpeech: (scenario.completionFeedback && scenario.completionFeedback.mentorSpeech) || `Isso! Muito bem! Você analisou os dados com olhar clínico e determinou com perfeição a Área de Vendas, o cliente, as condições comerciais e a grade de materiais. Essa é a postura profissional que forma um excelente consultor de SAP SD! Parabéns! +${xpEarned} XP.`,
      whatHappened: (scenario.completionFeedback && scenario.completionFeedback.whatHappened) || 'Ordem de venda emitida com 100% de conformidade aos dados mestres e às regras comerciais.',
      why: (scenario.completionFeedback && scenario.completionFeedback.why) || 'Área de vendas (1000/10/01), dados mestres de parceiro (SP/SH/BP/PY), condições de pagamento (Z030), Incoterms (CIF) e itens foram perfeitamente alinhados.',
      businessImpact: (scenario.completionFeedback && scenario.completionFeedback.businessImpact) || 'A ordem seguirá diretamente para o picking no Centro de Distribuição sem retenções ou retrabalhos fiscais.'
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

    // TUDO CORRETO NA MODIFICAÇÃO!
    if (scenario.objectives && Array.isArray(scenario.objectives)) {
      scenario.objectives.forEach(obj => {
        this.completeObjective(obj.id);
      });
    }

    const xpEarned = scenario.xpReward || 200;
    trainee.addXp(xpEarned, `Conclusão com sucesso do chamado [${scenario.code}] ${scenario.title}`);
    trainee.recordAction(true, 'Modificação de Ordem de Venda', `Ordem ${docNumber} atualizada com 100% de conformidade`);

    if (scenario.badgeReward) {
      trainee.unlockBadge(scenario.badgeReward);
    }

    const summaryText = `Ordem ${docNumber} alterada com sucesso • Total: R$ ${updatedOrderData.totalValue.toFixed(2)}`;
    trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);

    return {
      isValid: true,
      mentorSpeech: `Excelente trabalho! Você analisou o pedido de alteração, ajustou as quantidades e manteve o cálculo comercial e os impostos perfeitamente alinhados. Muito bem! +${xpEarned} XP.`,
      whatHappened: `Ordem de venda nº ${docNumber} alterada com 100% de conformidade às regras de negócio.`,
      why: 'Quantidades, condições comerciais e recálculo do esquema de preços foram validados com precisão.',
      businessImpact: 'O Centro de Distribuição atualizará a reserva de estoque e o faturamento emitirá a Nota Fiscal com os novos valores.'
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

    this.completeObjective('access_vl01n');
    this.completeObjective('create_delivery');
    this.completeObjective('check_order');
    this.completeObjective('select_shipping_point');

    // Se o objetivo final do cenário for exclusivamente a criação da remessa (ex: TRN-108)
    if (target.action === 'CREATE_DELIVERY') {
      if (scenario.objectives && Array.isArray(scenario.objectives)) {
        scenario.objectives.forEach(obj => this.completeObjective(obj.id));
      }

      const xpEarned = scenario.xpReward || 300;
      trainee.addXp(xpEarned, `Conclusão do chamado de remessa [${scenario.code}] ${scenario.title}`);
      trainee.recordAction(true, 'Criação de Remessa VL01N', `Remessa ${deliveryData?.deliveryNumber} criada para a ordem ${salesOrderNumber}`);

      if (scenario.badgeReward) {
        trainee.unlockBadge(scenario.badgeReward);
      }

      const summaryText = `Remessa ${deliveryData?.deliveryNumber} criada • Ponto de Exp. ${shippingPoint} • Ordem ${salesOrderNumber}`;
      trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);
    }

    return {
      isValid: true,
      mentorSpeech: scenario.completionFeedback?.mentorSpeech || `Muito bem! Remessa nº ${deliveryData?.deliveryNumber} gerada com sucesso a partir da ordem ${salesOrderNumber}. O documento já consta no Fluxo de Documentos (VBFA).`,
      whatHappened: scenario.completionFeedback?.whatHappened || `Documento de Remessa nº ${deliveryData?.deliveryNumber} criado no mandante 800.`,
      why: scenario.completionFeedback?.why || 'Ponto de expedição 1000 e vínculos comerciais foram devidamente estabelecidos.',
      businessImpact: scenario.completionFeedback?.businessImpact || 'Os itens foram liberados para separação e picking no Centro de Distribuição.'
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

    // Se o cenário é de PGI/Expedição (ex: TRN-109, DSF-204)
    if (target.action === 'POST_GOODS_ISSUE' || target.action === 'FULL_SHIPPING' || scenario.validationRules?.actionType === 'POST_GOODS_ISSUE') {
      if (scenario.objectives && Array.isArray(scenario.objectives)) {
        scenario.objectives.forEach(obj => this.completeObjective(obj.id));
      }

      const xpEarned = scenario.xpReward || 300;
      trainee.addXp(xpEarned, `Conclusão do chamado de expedição [${scenario.code}] ${scenario.title}`);
      trainee.recordAction(true, 'Registro de PGI VL02N', `Saída de mercadorias confirmada para a remessa ${deliveryNumber}`);

      if (scenario.badgeReward) {
        trainee.unlockBadge(scenario.badgeReward);
      }

      const summaryText = `PGI registrado para Remessa ${deliveryNumber} • Movimento 601 • Baixa física concluída`;
      trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);
    }

    return {
      isValid: true,
      mentorSpeech: scenario.completionFeedback?.mentorSpeech || `Excelente trabalho! Você realizou o picking e registrou o Post Goods Issue (PGI) na transação VL02N. O estoque físico foi devidamente baixado e a remessa está concluída! +${scenario.xpReward || 300} XP.`,
      whatHappened: scenario.completionFeedback?.whatHappened || `Saída de mercadorias registrada com sucesso para a Remessa nº ${deliveryNumber}.`,
      why: scenario.completionFeedback?.why || 'O movimento 601 baixou o estoque físico e encerrou a reserva no CD.',
      businessImpact: scenario.completionFeedback?.businessImpact || 'A carga foi despachada para transporte e o documento está liberado para o faturamento (VF01).'
    };
  }

  /**
   * Validação interativa da criação de Fatura Comercial (Billing) na VF01
   */
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
    this.completeObjective('verify_invoice');

    // Se o cenário é de faturamento (ex: TRN-110, TRN-111, DSF-205)
    if (target.action === 'CREATE_INVOICE' || target.action === 'FULL_O2C' || scenario.validationRules?.actionType === 'INVOICE_CREATION') {
      if (scenario.objectives && Array.isArray(scenario.objectives)) {
        scenario.objectives.forEach(obj => this.completeObjective(obj.id));
      }

      const xpEarned = scenario.xpReward || 300;
      trainee.addXp(xpEarned, `Conclusão do chamado de faturamento [${scenario.code}] ${scenario.title}`);
      trainee.recordAction(true, 'Emissão de Fatura VF01', `Fatura ${invoiceData?.invoiceNumber} emitida para a ordem ${invoiceData?.salesOrderNumber}`);

      if (scenario.badgeReward) {
        trainee.unlockBadge(scenario.badgeReward);
      }

      const summaryText = `Fatura ${invoiceData?.invoiceNumber} (Tipo ${billingType}) emitida • Total R$ ${invoiceData?.totalValue?.toFixed(2)} • Ciclo Concluído`;
      trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);
    }

    return {
      isValid: true,
      mentorSpeech: scenario.completionFeedback?.mentorSpeech || `Excelente trabalho! Fatura Comercial nº ${invoiceData?.invoiceNumber} gerada com sucesso! O ciclo comercial Order-to-Cash (O2C) foi integralmente concluído com êxito! +${scenario.xpReward || 300} XP.`,
      whatHappened: scenario.completionFeedback?.whatHappened || `Fatura nº ${invoiceData?.invoiceNumber} criada e integrada ao financeiro.`,
      why: scenario.completionFeedback?.why || 'Os impostos e valores da remessa foram devidamente escriturados.',
      businessImpact: scenario.completionFeedback?.businessImpact || 'O título a receber foi lançado e a cobrança está programada conforme a condição de pagamento acordada.'
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
