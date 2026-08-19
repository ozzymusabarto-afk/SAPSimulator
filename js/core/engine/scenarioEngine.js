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
   * Inicia um cenário pelo ID
   * @param {string} scenarioId
   */
  startScenario(scenarioId) {
    const raw = ScenarioCatalog.find(s => s.id === scenarioId) || ScenarioCatalog[0];
    this.activeScenario = JSON.parse(JSON.stringify(raw));
    
    db.resetDatabase();
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
      if (scenario.id === 'SCN-03') {
        this.completeObjective('investigate_credit');
      }

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
          return {
            isValid: false,
            fieldError: 'items',
            activeTabHint: 'ITEMS',
            mentorSpeech: `Você adicionou um produto, mas o pedido de compra solicita o Servidor Enterprise Pro X (${targetItem.materialId}). Selecione o produto correto na lista de materiais e envie novamente!`,
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
    this.completeObjective('add_item');
    this.completeObjective('save_order');
    if (scenario.id === 'SCN-02') {
      this.completeObjective('apply_discount');
      this.completeObjective('verify_pricing');
    }

    const xpEarned = scenario.xpReward;
    trainee.addXp(xpEarned, `Conclusão com sucesso do chamado [${scenario.code}] ${scenario.title}`);
    trainee.recordAction(true, 'Gravação de Ordem de Venda', `Ordem de venda criada com 100% de conformidade`);
    
    if (scenario.badgeReward) {
      trainee.unlockBadge(scenario.badgeReward);
    }

    const summaryText = `Ordem OR • Org 1000/10/01 • Cliente ${orderData.customerId} • ${orderData.items.length} itens • Total: R$ ${orderData.totalValue.toFixed(2)}`;
    trainee.completeScenario(scenario.id, scenario.title, summaryText, xpEarned);

    return {
      isValid: true,
      mentorSpeech: `Isso! Muito bem! Você analisou os dados com olhar clínico e determinou com perfeição a Área de Vendas, o cliente, as condições comerciais e a grade de materiais. Essa é a postura profissional que forma um excelente consultor de SAP SD! Parabéns! +${xpEarned} XP.`,
      whatHappened: 'Ordem de venda emitida com 100% de conformidade aos dados mestres e às regras comerciais.',
      why: 'Área de vendas (1000/10/01), dados mestres de parceiro (SP/SH/BP/PY), condições de pagamento (Z030), Incoterms (CIF) e itens foram perfeitamente alinhados.',
      businessImpact: 'A ordem seguirá diretamente para o picking no Centro de Distribuição sem retenções ou retrabalhos fiscais.'
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
