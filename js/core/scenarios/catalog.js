/**
 * NexusTech ERP • Catálogo de Cenários e Casos Práticos
 * Mentor: Chefe Wilson (Coordenador Comercial | Mentor SD)
 * Filosofia: "Treinar o Olhar do Trainee" (Análise e Decisão Real de Dados Comerciais)
 */

export const ScenarioCatalog = [
  {
    id: 'SCN-01',
    code: 'TRN-101',
    title: 'Estrutura Organizacional e Primeira Ordem de Venda',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 250,
    badgeReward: 'first_order',
    initialTcode: 'XD03',
    
    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem de Compra Recebida: Varejo Eletro Brasil (PO-2026-EB01)',
    briefing: 'Olá! O departamento de compras do nosso cliente corporativo Varejo Eletro Brasil acaba de enviar o pedido de compra formal nº PO-2026-EB01 para aquisição de 2 unidades do Servidor Enterprise Nexus Pro X. Como é uma venda comercial padrão no mercado nacional com entrega em São Paulo, precisamos montar a Ordem de Venda correspondente. Antes de preencher a VA01, consulte o cadastro do cliente na transação XD03 para checar a Área de Vendas (Org. Vendas, Canal e Setor), a Condição de Pagamento e os termos de frete (Incoterms). Observe atentamente as alternativas no formulário e tome as decisões comerciais corretas!',
    
    // Detalhes do Documento Comercial Recebido
    purchaseOrderDocument: {
      buyerName: 'Varejo Eletro Brasil Ltda (Matriz SP)',
      buyerCnpj: '12.345.678/0001-90',
      poNumber: 'PO-2026-EB01',
      operationType: 'Venda Mercantil Regular de Equipamentos (Mercado Interno)',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Av. das Nações Unidas, 14200 - São Paulo/SP',
      freightResponsibility: 'Frete e seguro inclusos no fornecimento por conta da NexusTech (Entrega no Destino)',
      paymentInstructions: 'Faturamento comercial conforme cadastro aprovado em conta corrente (30 dias)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Primeiro abra a transação XD03 para consultar o mestre do cliente Varejo Eletro Brasil (100045). Na aba de Vendas, observe a Organização de Vendas, o Canal de Distribuição, o Setor de Atividade, a Condição de Pagamento e o Incoterms. Depois vá até a VA01 e selecione cada campo com base nessa análise!',
    
    sapKnowledgeBridge: {
      tcode: 'VA01 / XD03',
      tables: 'VBAK (Cabeçalho da Ordem), VBAP (Itens da Ordem), KNVV (Área de Vendas do Cliente)',
      concept: 'No SAP SD, a Área de Vendas é a combinação de 3 unidades organizacionais fundamentais: Organização de Vendas (quem negocia e fatura), Canal de Distribuição (o meio comercial) e Setor de Atividade (a linha de produtos). Essa chave tripla define preços, impostos e parceiros válidos.'
    },

    objectives: [
      { id: 'check_customer', text: 'Consultar cadastro do cliente na transação XD03 e analisar a Área de Vendas', done: false },
      { id: 'set_org_structure', text: 'Definir Tipo de Ordem (OR), Org. Vendas (1000), Canal (10) e Setor (01)', done: false },
      { id: 'select_customer', text: 'Selecionar o cliente Varejo Eletro Brasil e informar o Nº do Pedido', done: false },
      { id: 'fill_terms', text: 'Selecionar Condição de Pagamento Z030 e Incoterms CIF', done: false },
      { id: 'add_item', text: 'Adicionar a linha do Servidor Enterprise Nexus Pro X com quantidade 2', done: false },
      { id: 'save_order', text: 'Simular o cálculo de preços e gravar a Ordem de Venda no sistema', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100045',
      customerPoNumber: 'PO-2026-EB01',
      paymentTerms: 'Z030',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-1001', quantity: 2, discountPercent: 0 }
      ]
    },
    completionFeedback: {
      mentorSpeech: 'Excelente trabalho! Você conferiu os dados do cliente 100045 na XD03 e emitiu a primeira ordem padrão com a Área de Vendas e os termos comerciais corretos. +250 XP.',
      whatHappened: 'Ordem para 2 unidades do MAT-1001 gravada para a PO-2026-EB01.',
      why: 'Validar a área de vendas e replicar os termos do cadastro do cliente evita divergências no atendimento e no faturamento.',
      businessImpact: 'A Varejo Eletro Brasil recebe o pedido com prazo e responsabilidade de frete alinhados ao contrato.'
    }
  },
  {
    id: 'SCN-02',
    code: 'TRN-102',
    title: 'Determinação de Preço e Desconto Comercial',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'pricing_master',
    initialTcode: 'VA01',
    
    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Negociação Atacado - TechLog Soluções (Desconto Comercial de 5%)',
    briefing: 'Excelente trabalho na emissão anterior! Agora temos uma negociação no canal de atacado. A distribuidora TechLog Soluções fechou a compra de 10 unidades do Switch Gigabit Managed (MAT-2004). Como é uma compra de volume atacadista, a gerência autorizou 5% de desconto comercial sobre a tabela. Abra a VA01, configure a área de vendas correspondente ao cliente TechLog e monte o pedido aplicando exatamente 5% de desconto na condição comercial RB00.',
    
    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-2026-042',
      operationType: 'Venda Comercial Atacado (Canal Revenda / Distribuição)',
      itemsRequested: [
        { description: 'Switch Gigabit 24 Portas Managed Layer 3', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'Rua das Indústrias, 500 - Curitiba/PR',
      freightResponsibility: 'CIF - Entrega no Centro de Distribuição do comprador',
      paymentInstructions: '15 dias líquido (Z015) com desconto comercial acordado de 5%'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Consulte o cliente TechLog (100120) na XD03 para ver o canal de distribuição (20 - Revenda / Atacado). Na VA01, selecione a Área de Vendas correta, informe a condição de pagamento Z015 e, na grade de itens, coloque o material MAT-2004 com 10 unidades e 5% de desconto.',
    
    sapKnowledgeBridge: {
      tcode: 'VA01 / VK11',
      tables: 'KONP (Condições de Preço), KOMV (Estrutura de Determinação de Preços)',
      concept: 'O cálculo de preços no SAP SD segue um Esquema de Cálculo (Pricing Procedure). A condição PR00 busca o preço base e a condição RB00 deduz o percentual comercial. O valor final é a base de cálculo para os impostos (ICMS e PIS/COFINS).'
    },

    objectives: [
      { id: 'create_order_techlog', text: 'Configurar Área de Vendas e selecionar cliente TechLog (100120)', done: false },
      { id: 'add_switch_items', text: 'Inserir 10 unidades do material MAT-2004 (Switch Gigabit)', done: false },
      { id: 'apply_discount', text: 'Aplicar 5% de desconto comercial na condição RB00', done: false },
      { id: 'verify_pricing', text: 'Confirmar condição Z015 e gravar a ordem', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '20',
      division: '01',
      customerId: '100120',
      customerPoNumber: 'PO-TL-2026-042',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2004', quantity: 10, discountPercent: 5 }
      ]
    },
    completionFeedback: {
      mentorSpeech: 'Muito bem! Você configurou o canal de atacado da TechLog, aplicou os 5% autorizados na condição RB00 e gravou o pedido com pagamento em 15 dias. +350 XP.',
      whatHappened: 'Ordem de 10 unidades do MAT-2004 gravada para a TechLog com desconto comercial de 5%.',
      why: 'A condição RB00 deve respeitar a alçada aprovada e a Z015 mantém o prazo financeiro acordado.',
      businessImpact: 'A venda por atacado segue com margem controlada e cobrança alinhada ao contrato.'
    }
  },
  {
    id: 'SCN-03',
    code: 'DSF-201',
    title: 'Chamado Crítico #1047: Diagnóstico de Bloqueio de Crédito',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 8,
    xpReward: 600,
    badgeReward: 'credit_guardian',
    initialTcode: 'XD03',
    
    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'DESAFIO COM SLA: Pedido retido da Indústria Metalúrgica Paulista S/A',
    briefing: 'Atenção, trainee! Chegou um chamado urgente da diretoria. A Metalúrgica Paulista tentou faturar um pedido de 3 Servidores Enterprise (MAT-1001), mas o sistema gerou um bloqueio comercial. Você precisa investigar a causa-raiz no cadastro do cliente (XD03), testar a emissão na VA01 para entender o bloqueio e utilizar a transação de análise de crédito VKM1 para realizar a liberação supervisionada com parecer comercial.',
    
    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '98.765.432/0001-11',
      poNumber: 'PO-MP-9011',
      operationType: 'Venda de Hardware Corporativo com Exposição Financeira',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X', quantity: 3, unit: 'UN' }
      ],
      deliveryAddress: 'Fábrica Campinas - Portão 3 Logística',
      freightResponsibility: 'FOB - Retirada na origem (CD NexusTech SP)',
      paymentInstructions: '60 dias líquido (Z060)'
    },

    mentorInitialTip: 'Orientação do Chefe Wilson (Modo Desafio): Você está no comando! Consulte a aba de Crédito do cliente 100088 na XD03 para ver o limite e os títulos em aberto. Depois crie o pedido na VA01 para constatar a retenção automática e acesse a transação VKM1 para liberar com justificativa. Mantenha a calma, você tem 8 minutos no SLA!',
    
    sapKnowledgeBridge: {
      tcode: 'VKM1 / FD32',
      tables: 'KNKK (Controle de Crédito do Cliente), VBUK / VBAK (Status de Bloqueio da Ordem)',
      concept: 'O SAP SD possui integração profunda com FI-AR (Contas a Receber). Quando o valor do pedido somado aos títulos em aberto ultrapassa o Limite de Crédito estipulado na área de controle (BR01), a ordem é gravada com bloqueio global de fornecimento (Credit Block) e só pode ser liberada na VKM1 por alguém com alçada.'
    },

    objectives: [
      { id: 'investigate_credit', text: 'Investigar limite e histórico de crédito do cliente 100088 na XD03', done: false },
      { id: 'create_blocked_order', text: 'Emitir o pedido de 3 unidades do MAT-1001 na VA01 e constatar o bloqueio', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e analisar o risco financeiro da ordem', done: false },
      { id: 'release_with_notes', text: 'Executar liberação supervisionada com parecer comercial na VKM1', done: false }
    ],

    targetCriteria: {
      action: 'CREDIT_RELEASE',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100088',
      paymentTerms: 'Z060',
      incoterms: 'FOB',
      requiresVkm1Release: true,
      items: [
        { materialId: 'MAT-1001', quantity: 3 }
      ]
    },
    completionFeedback: {
      mentorSpeech: 'Excelente atuação sob pressão! Você analisou o risco do cliente 100088, constatou o bloqueio automático da ordem de 3 servidores e liberou o documento na VKM1 com parecer comercial. +600 XP.',
      whatHappened: 'Ordem bloqueada por crédito e liberada de forma supervisionada na VKM1.',
      why: 'A retenção protege a empresa quando a exposição de crédito excede o limite aprovado; a liberação exige análise e justificativa.',
      businessImpact: 'A Metalúrgica Paulista poderá seguir com o pedido após uma decisão de crédito registrada e rastreável.'
    }
  },
  {
    id: 'SCN-04',
    code: 'TRN-201',
    title: 'Alteração de Ordem de Venda e Impacto Comercial',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'flawless_trainee',
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Aditivo Comercial Urgente: Aumento de Volume TechLog (PO-TL-2026-042)',
    briefing: 'Olá, trainee! O cliente corporativo TechLog Soluções em TI enviou uma solicitação de aditivo para o pedido que acabamos de registrar. Devido a uma nova demanda contratual no projeto de Curitiba, eles precisam aumentar a quantidade do Switch Gigabit Managed de 10 para 25 unidades. Eles solicitam a manutenção da condição comercial acordada (desconto de 5%, faturamento em 15 dias e frete CIF). Em vez de cancelarmos o pedido ou gerarmos duplicidade, localize a ordem de venda existente no sistema e utilize a transação VA02 para ajustar o volume. Não se esqueça de conferir a disponibilidade de estoque ATP e simular o recálculo dos impostos antes de gravar!',

    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-2026-042 (Aditivo 01)',
      operationType: 'Aditivo de Quantidade em Venda Comercial de Distribuição (Atacado)',
      itemsRequested: [
        { description: 'Switch Gigabit 24 Portas Managed Layer 3', quantity: 25, unit: 'UN' }
      ],
      deliveryAddress: 'Rua das Indústrias, 500 - Curitiba/PR',
      freightResponsibility: 'CIF - Entrega no Centro de Distribuição do comprador por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015) com manutenção do desconto comercial de 5%'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: No dia a dia de SD, alterações de pedidos são frequentes. Abra a transação VA02 e carregue a Ordem nº 10000042 da TechLog. Verifique se o estoque disponível (ATP de 120 UN) suporta o novo volume de 25 unidades. Em seguida, altere a quantidade na grade de posições mantendo o desconto de 5% e simule o recálculo antes de gravar!',

    sapKnowledgeBridge: {
      tcode: 'VA02 / VA03 / MM03',
      tables: 'VBAK (Cabeçalho), VBAP (Posições), VBEP (Divisão de Remessa), CDHDR / CDPOS (Documentos de Modificação)',
      concept: 'A transação VA02 permite modificar ordens em aberto sem recriar o documento. Ao alterar a quantidade, o SAP SD aciona automaticamente uma nova verificação de disponibilidade (ATP Check) e um recálculo das condições de preço (Pricing Update). Todas as alterações ficam auditadas nas tabelas CDHDR/CDPOS.'
    },

    initialDocuments: [
      {
        docType: 'SALES_ORDER',
        docNumber: '10000042',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '01',
        customerId: '100120',
        customerPoNumber: 'PO-TL-2026-042',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Curitiba',
        items: [
          { materialId: 'MAT-2004', quantity: 10, manualDiscountPercent: 5 }
        ]
      }
    ],

    objectives: [
      { id: 'access_va02', text: 'Localizar e abrir a Ordem de Venda 10000042 na transação VA02', done: false },
      { id: 'check_stock_atp', text: 'Verificar se o estoque disponível (ATP) atende ao novo volume de 25 unidades', done: false },
      { id: 'update_order_quantity', text: 'Alterar a quantidade da posição 10 para 25 unidades mantendo o desconto de 5%', done: false },
      { id: 'save_modified_order', text: 'Simular o recálculo comercial de preços/impostos e gravar a alteração na VA02', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000042',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2004', quantity: 25, discountPercent: 5 }
      ]
    },
    completionFeedback: {
      mentorSpeech: 'Boa alteração! Você atualizou a ordem 10000042 para 25 switches, preservou os 5% de desconto, o prazo Z015 e o frete CIF, e gravou o recálculo. +300 XP.',
      whatHappened: 'A quantidade da ordem 10000042 foi alterada de 10 para 25 unidades do MAT-2004.',
      why: 'A VA02 permite ajustar um pedido existente sem duplicá-lo, mantendo os termos comerciais aprovados.',
      businessImpact: 'A TechLog recebe o volume atualizado com condições contratuais e valores recalculados corretamente.'
    }
  },
  {
    id: 'SCN-05',
    code: 'TRN-103',
    title: 'Determinação de Preço e Manutenção de Condição',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'pricing_specialist',
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Novo Pedido de Infraestrutura: Expansão Óptica DataCore (PO-DC-2026-088)',
    briefing: 'Olá, trainee! O cliente corporativo DataCore Cloud & Datacenters Brasil enviou uma Ordem de Compra para aquisição de 50 unidades do Cabo de Fibra Óptica 10m Duplex LC-LC (MAT-4099), com objetivo de interconectar novos racks no data center de Barueri/SP. Trata-se de uma operação de venda direta faturada em 15 dias líquido (Z015) com frete CIF. Inicie a criação da ordem de venda na transação VA01. Caso o sistema acuse alguma inconsistência comercial durante a determinação de valores ou impeça a gravação por falta de preço, investigue a situação cadastral do produto e execute a manutenção da tabela de condições de preço antes de finalizar a emissão!',

    purchaseOrderDocument: {
      buyerName: 'DataCore Cloud & Datacenters Brasil Ltda (Barueri/SP)',
      buyerCnpj: '34.567.890/0001-12',
      poNumber: 'PO-DC-2026-088',
      operationType: 'Fornecimento de Conectividade e Cabos Ópticos (Venda Direta / B2B)',
      itemsRequested: [
        { description: 'Cabo de Fibra Óptica 10m Duplex LC-LC Patch Cord', quantity: 50, unit: 'UN' }
      ],
      deliveryAddress: 'Alameda Rio Negro, 100 - Alphaville - Barueri/SP',
      freightResponsibility: 'CIF - Entrega no Data Center por conta da NexusTech',
      paymentInstructions: '15 dias direto (Z015) - Preço de tabela corporativa acordado de R$ 65,00 por unidade'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Consulte o cliente DataCore (100180) na XD03 para conferir os dados comerciais. Na VA01, informe a Área de Vendas 1000 / 10 / 01 e insira o material MAT-4099 com 50 unidades. Se o sistema acusar erro de determinação de preço, lembre-se do conceito de Esquema de Cálculo (Pricing Procedure): o SAP precisa de um registro de condição PR00 ativo. Você pode consultar a situação do item na MM03 e criar o registro de preço de R$ 65,00 na transação VK11 antes de retornar à VA01 para gravar!',

    sapKnowledgeBridge: {
      tcode: 'VA01 / VK11 / MM03 / VA03',
      tables: 'KONH (Cabeçalho de Condição), KONP (Itens de Condição), MARA / MARC (Dados do Material), VBAK / VBAP (Ordem de Venda)',
      concept: 'A determinação de preço no SAP SD utiliza a técnica de condições (Condition Technique). Ao montar a ordem, o sistema busca o preço base PR00 na tabela de condições KONP para a combinação Org. Vendas / Canal / Material. Se o registro não existir, o pedido trava por erro de determinação. A transação VK11 é utilizada para criar e manter essas regras de preço.'
    },

    objectives: [
      { id: 'check_pricing_error', text: 'Identificar a ausência da condição de preço do material MAT-4099 na VA01 ou MM03', done: false },
      { id: 'create_pricing_record', text: 'Cadastrar o registro de condição PR00 no valor de R$ 65,00 na transação VK11', done: false },
      { id: 'create_sales_order', text: 'Emitir a Ordem de Venda de 50 unidades do MAT-4099 com preço determinado na VA01', done: false },
      { id: 'verify_created_order', text: 'Consultar o documento gerado e confirmar o valor líquido de R$ 3.250,00 na VA03', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100180',
      customerPoNumber: 'PO-DC-2026-088',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      conditionCode: 'PR00',
      targetMaterialId: 'MAT-4099',
      targetAmount: 65.00,
      targetNetValue: 3250.00,
      items: [
        { materialId: 'MAT-4099', quantity: 50, discountPercent: 0 }
      ]
    },
    completionFeedback: {
      mentorSpeech: 'Boa recuperação do fluxo! Você identificou a falta de PR00, cadastrou R$ 65,00 por unidade na VK11, emitiu a ordem na VA01 e conferiu R$ 3.250,00 líquidos na VA03. +300 XP.',
      whatHappened: 'Ordem de 50 unidades do MAT-4099 gravada e conferida com valor líquido de R$ 3.250,00.',
      why: 'O registro PR00 fornece o preço-base necessário para o cálculo comercial da ordem.',
      businessImpact: 'A DataCore recebe o pedido com preço e valor total alinhados à PO-DC-2026-088.'
    }
  },
  {
    id: 'SCN-06',
    code: 'TRN-104',
    title: 'Verificação de Disponibilidade e Ajuste Comercial',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'atp_specialist',
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem de Compra: AutoPeças Guanabara (5x Firewall UTM MAT-2050)',
    briefing: 'Olá, trainee! O cliente AutoPeças Guanabara enviou a Ordem de Compra PO-AG-2026-ATP1 solicitando 5 unidades do Firewall UTM Next-Gen 1Gbps (MAT-2050). Inicie a criação da ordem de venda na transação VA01. Durante o preenchimento, observe atentamente a coluna de disponibilidade do item. Se o sistema indicar inconsistência ou ruptura de estoque (Ruptura ATP), investigue a situação física e reservada do produto na transação MM03 para identificar o saldo livre disponível para entrega imediata (ATP). Ajuste a quantidade da ordem para o volume que pode ser atendido agora antes de efetuar a gravação!',

    purchaseOrderDocument: {
      buyerName: 'AutoPeças e Motores Guanabara S/A (Rio de Janeiro/RJ)',
      buyerCnpj: '67.890.123/0001-45',
      poNumber: 'PO-AG-2026-ATP1',
      operationType: 'Venda Direta de Equipamentos de Segurança / Redes',
      itemsRequested: [
        { description: 'Firewall UTM Next-Gen 1Gbps com Licença IPS/Antivirus', quantity: 5, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Brasil, 15000 - Rio de Janeiro/RJ',
      freightResponsibility: 'FOB - Retirada no Centro de Distribuição NexusTech SP pelo transportador do cliente',
      paymentInstructions: '30 dias direto (Z030) - Preço de tabela corporativa sem desconto adicional'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Ao preencher a VA01 com as 5 unidades solicitadas no PO, note o aviso de [Ruptura ATP] na grade. Abra a transação MM03, consulte o material MAT-2050 e examine a aba de Verificação de Disponibilidade. Veja quanto temos de Estoque Físico, quanto já está Reservado e qual é o saldo Disponível (ATP). Retorne à VA01 e ajuste a quantidade da posição exatamente para o saldo disponível!',

    sapKnowledgeBridge: {
      tcode: 'VA01 / MM03 / CO09',
      tables: 'MARD (Estoque em Depósito), MARC (Dados do Centro), VBAP (Itens da Ordem), VBEP (Divisão de Remessa)',
      concept: 'A Verificação de Disponibilidade (ATP - Available to Promise) no SAP SD garante que ordens de venda confirmem apenas a quantidade real que o centro de distribuição pode expedir. O cálculo considera: Estoque Físico (LABST) menos Reservas Existentes em outras ordens. Quando a solicitação excede o saldo livre, o analista deve ajustar a quantidade confirmada ou negociar entregas parciais.'
    },

    objectives: [
      { id: 'check_atp_error', text: 'Identificar a ruptura de disponibilidade do material MAT-2050 na VA01', done: false },
      { id: 'check_stock_mm03', text: 'Consultar a transação MM03 e identificar o saldo disponível ATP de 3 unidades', done: false },
      { id: 'create_adjusted_order', text: 'Emitir a Ordem de Venda na VA01 com a quantidade ajustada de 3 unidades', done: false },
      { id: 'verify_order', text: 'Consultar a Ordem de Venda emitida na transação VA03', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '02',
      customerId: '100750',
      customerPoNumber: 'PO-AG-2026-ATP1',
      paymentTerms: 'Z030',
      incoterms: 'FOB',
      items: [
        {
          materialId: 'MAT-2050',
          requestedQuantity: 5,
          quantity: 3,
          discountPercent: 0,
          atpFeedback: {
            mentorSpeech: 'Atenção ao estoque: o cliente solicitou 5 unidades no pedido de compra, mas o sistema acusa ruptura de disponibilidade imediata. Antes de confirmar a ordem, consulte a transação MM03 para verificar o saldo livre no depósito (ATP) e ajuste a quantidade da posição para o volume realmente disponível!',
            whatHappened: 'Tentativa de gravação com quantidade (5 UN) superior ao saldo livre de disponibilidade (ATP).',
            why: 'No SAP SD, a emissão de ordens com ruptura de estoque gera atrasos na remessa e compromete o nível de serviço.',
            businessImpact: 'Emitir quantidade acima do saldo em estoque compromete a expedição no centro de distribuição.'
          }
        }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Excelente trabalho! Você identificou a ruptura de estoque, consultou a transação MM03 e ajustou a ordem para as 3 unidades disponíveis em estoque (ATP). Essa postura evita atrasos logísticos e garante confiabilidade no atendimento comercial! Parabéns! +300 XP.',
      whatHappened: 'Ordem de venda gravada com sucesso com a quantidade ajustada de 3 unidades de MAT-2050.',
      why: 'O saldo ATP no Centro 1000 era de 3 UN (6 físicas - 3 reservadas), permitindo a confirmação exata da remessa.',
      businessImpact: 'A mercadoria será faturada e despachada imediatamente pelo CD sem divergência de inventário.'
    }
  },
  {
    id: 'SCN-07',
    code: 'TRN-105',
    title: 'Análise de Ruptura de Estoque e Suprimentos',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'atp_specialist',
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem de Compra: UltraLink Provedor (4x Fonte Redundante MAT-3090)',
    briefing: 'Olá! O provedor UltraLink nos enviou o pedido de compra PO-UL-2026-ATP2 para aquisição de 4 unidades da Fonte Redundante Hot-Plug 800W (MAT-3090). Analise as informações comerciais recebidas, certifique-se da viabilidade de atendimento de ponta a ponta e proceda com a emissão da ordem de venda na transação VA01. Ajuste a ordem de acordo com a capacidade real de atendimento imediato da nossa operação.',

    purchaseOrderDocument: {
      buyerName: 'UltraLink Provedor de Internet Banda Larga S/A (Fortaleza/CE)',
      buyerCnpj: '78.901.234/0001-56',
      poNumber: 'PO-UL-2026-ATP2',
      operationType: 'Venda de Componentes Críticos / Infraestrutura de Telecom',
      itemsRequested: [
        { description: 'Fonte Redundante Hot-Plug 800W Titanium 80Plus', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Santos Dumont, 2800 - Fortaleza/CE',
      freightResponsibility: 'CIF - Entrega no Centro Operacional do cliente por conta da NexusTech',
      paymentInstructions: '15 dias direto (Z015) conforme cadastro aprovado'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Preste muita atenção em cada detalhe comercial da ordem de compra da UltraLink. Lembre-se de validar se temos cobertura integral de estoque para o volume pedido antes de finalizar a emissão!',

    sapKnowledgeBridge: {
      tcode: 'VA01 / MM03',
      tables: 'MARC / MARD / VBAP',
      concept: 'No ambiente empresarial, ordens com quantidades acima do saldo livre geram pendências (Backorders). O analista comercial deve analisar a disponibilidade para alinhar as expectativas do cliente e emitir a ordem com a quantidade factível.'
    },

    objectives: [
      { id: 'analyze_po', text: 'Analisar a solicitação de compra da UltraLink no pedido PO-UL-2026-ATP2', done: false },
      { id: 'investigate_availability', text: 'Investigar a capacidade de entrega e estoque do componente MAT-3090', done: false },
      { id: 'create_order', text: 'Emitir a Ordem de Venda na VA01 com a quantidade de fornecimento viável (2 UN)', done: false },
      { id: 'verify_order', text: 'Consultar a ordem emitida na transação VA03', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100800',
      customerPoNumber: 'PO-UL-2026-ATP2',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        {
          materialId: 'MAT-3090',
          requestedQuantity: 4,
          quantity: 2,
          discountPercent: 0,
          atpFeedback: {
            mentorSpeech: 'Atenção comercial: a quantidade solicitada no pedido de compra (4 UN) não pode ser confirmada integralmente devido às restrições de suprimento do CD. Investigue a situação de estoque deste componente e ajuste a quantidade da ordem para o volume que temos condições de entregar de imediato!',
            whatHappened: 'A quantidade informada (4 UN) excede a capacidade de atendimento imediato do centro de distribuição.',
            why: 'A verificação de disponibilidade (ATP) analisa o estoque físico deduzido das reservas ativas.',
            businessImpact: 'Evita comprometer prazos contratuais de entrega para itens com estoque reduzido.'
          }
        }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Perfeito! Você percebeu a limitação de estoque mesmo com menos instruções e ajustou a ordem para as 2 unidades de saldo ATP livre do MAT-3090. Excelente autonomia e precisão! +300 XP.',
      whatHappened: 'Ordem de venda gravada com 2 unidades confirmadas para a UltraLink.',
      why: 'O saldo ATP era de 2 UN (5 físicas - 3 reservadas), permitindo a emissão imediata.',
      businessImpact: 'Evitou a criação de backorders e garantiu a entrega pontual da remessa.'
    }
  },
  {
    id: 'SCN-08',
    code: 'DSF-202',
    title: 'Gestão Autônoma de Disponibilidade e Atendimento',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 6,
    xpReward: 450,
    badgeReward: 'atp_master',
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'CHAMADO URGENTE: Upgrade Servidores Banco Horizonte (PO-BH-2026-D02)',
    briefing: 'Chamado prioritário! O departamento de compras do Banco Horizonte enviou a Ordem de Compra PO-BH-2026-D02 solicitando 10 unidades do Módulo de Memória ECC 64GB DDR5 (MAT-3050). Como analista responsável pela conta, processe este pedido com total autonomia técnica e comercial, garantindo que o documento seja gravado com 100% de conformidade operacional dentro do SLA estabelecido.',

    purchaseOrderDocument: {
      buyerName: 'Banco Horizonte de Investimentos S/A (São Paulo/SP)',
      buyerCnpj: '56.789.012/0001-34',
      poNumber: 'PO-BH-2026-D02',
      operationType: 'Fornecimento Corporativo Crítico / Mercado Interno',
      itemsRequested: [
        { description: 'Módulo de Memória ECC 64GB DDR5 Server Grade', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Brigadeiro Faria Lima, 3500 - São Paulo/SP',
      freightResponsibility: 'CIF - Entrega expressa na sede da instituição por conta da NexusTech',
      paymentInstructions: '30 dias líquido (Z030) - Faturamento em conta corrente aprovada'
    },

    mentorInitialTip: 'Aviso de Desafio: Este é um caso prático autônomo com controle de tempo (SLA de 6 minutos). Analise todos os aspectos do documento de compra e dos dados mestres por conta própria!',

    sapKnowledgeBridge: {
      tcode: 'VA01 / MM03',
      tables: 'MARD / VBAK / VBAP',
      concept: 'Em operações corporativas de missão crítica, a checagem autônoma de dados mestres, áreas de vendas e disponibilidade de inventário é a competência central do consultor SAP SD.'
    },

    objectives: [
      { id: 'process_demand', text: 'Processar a Ordem de Compra do Banco Horizonte com total autonomia', done: false },
      { id: 'emit_sales_order', text: 'Emitir a Ordem de Venda na VA01 em conformidade com as regras operacionais (4 UN)', done: false },
      { id: 'audit_flow', text: 'Auditar a ordem finalizada na transação VA03', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100310',
      customerPoNumber: 'PO-BH-2026-D02',
      paymentTerms: 'Z030',
      incoterms: 'CIF',
      items: [
        {
          materialId: 'MAT-3050',
          requestedQuantity: 10,
          quantity: 4,
          discountPercent: 0,
          atpFeedback: {
            mentorSpeech: 'Atenção: A quantidade informada (10 UN) não está em conformidade com as diretrizes operacionais de atendimento deste chamado. Reavalie os dados cadastrais do material e a viabilidade de fornecimento antes de tentar gravar novamente.',
            whatHappened: 'Inconsistência na quantidade do item em relação à viabilidade de fornecimento.',
            why: 'É responsabilidade do analista de SD analisar os parâmetros do documento antes da confirmação final.',
            businessImpact: 'Gera inconformidade no fluxo de remessa subsequente (VL01N).'
          }
        }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Sensacional! Você demonstrou domínio completo do processo comercial no SAP SD: identificou a capacidade de entrega autônoma de 4 unidades de memória ECC do MAT-3050 e finalizou a ordem com precisão cirúrgica dentro do tempo. Você conquistou a insígnia ATP Master! +450 XP.',
      whatHappened: 'Ordem de venda gravada com 4 unidades para o Banco Horizonte em conformidade com o saldo ATP.',
      why: 'O saldo ATP era de 4 UN (8 físicas - 4 reservadas), atendendo perfeitamente à disponibilidade.',
      businessImpact: 'Remessa liberada imediatamente sem qualquer ruptura operacional no CD.'
    }
  },
  {
    id: 'SCN-09',
    code: 'TRN-106',
    title: 'Análise e Liberação de Crédito',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'credit_analyst',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem Retida por Crédito: UltraLink Provedor (Doc 10000006)',
    briefing: 'Olá, trainee! O cliente corporativo UltraLink Provedor de Internet Banda Larga abriu um chamado informando que a Ordem de Venda nº 10000006 (6x Switch 48 Portas PoE+ MAT-2080) está retida pelo sistema e não avançou para a expedição física. Consulte a ordem na transação VA03 para confirmar a situação no Fluxo de Documentos (VBFA). Em seguida, investigue o perfil financeiro do cliente na transação XD03 e acesse a transação VKM1 para analisar a exposição comercial e realizar a liberação supervisionada com parecer comercial, concluindo sua etapa de alçada.',

    purchaseOrderDocument: {
      buyerName: 'UltraLink Provedor de Internet Banda Larga S/A (Fortaleza/CE)',
      buyerCnpj: '78.901.234/0001-56',
      poNumber: 'PO-UL-2026-055',
      operationType: 'Venda de Equipamentos de Conectividade / Redes (Venda Direta)',
      itemsRequested: [
        { description: 'Switch 48 Portas Gigabit PoE+ com 4x 10G SFP+ (MAT-2080)', quantity: 6, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Santos Dumont, 2800 - Fortaleza/CE',
      freightResponsibility: 'CIF - Entrega no Centro Operacional por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015) - Limite de Crédito Corporativo BR01'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Primeiro abra a VA03 e carregue a Ordem 10000006 para ver o status [Bloqueado por Crédito (VKM1)]. Depois abra a XD03 no cliente 100800 para checar o limite (R$ 250.000,00) e o saldo utilizado (R$ 240.000,00). Na VKM1, localize a ordem e execute a liberação comercial. Retorne à VA03 para confirmar que a remessa está pronta para expedição!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / XD03 / VKM1',
      tables: 'KNKK (Controle de Crédito), VBAK (Cabeçalho da Ordem), VBFA (Fluxo de Documentos)',
      concept: 'A integração entre SD e FI-AR garante a saúde financeira da empresa. Quando o valor da ordem somado ao saldo devedor excede o limite de crédito aprovado na área de controle (BR01), a remessa é bloqueada automaticamente. A liberação na VKM1 exige avaliação do risco e parecer formal de alçada comercial.'
    },

    objectives: [
      { id: 'check_order_va03', text: 'Localizar a Ordem de Venda 10000006 na VA03 e verificar o bloqueio no fluxo', done: false },
      { id: 'investigate_credit', text: 'Consultar dados de crédito do cliente UltraLink (100800) na transação XD03', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e analisar o motivo do bloqueio por excesso de limite', done: false },
      { id: 'release_credit_order', text: 'Executar a liberação de crédito da Ordem 10000006 com parecer supervisionado', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000006',
      customerId: '100800',
      action: 'CREDIT_RELEASE',
      requiresVkm1Release: true
    },

    completionFeedback: {
      mentorSpeech: 'Excelente condução! Você verificou o bloqueio na VA03, investigou a exposição financeira do cliente UltraLink na XD03 e efetuou a liberação com alçada comercial na VKM1. Esse é o fluxo padrão de integração entre SD e FI-AR no SAP! Parabéns! +300 XP.',
      whatHappened: 'Ordem de Venda nº 10000006 liberada do bloqueio de crédito e status atualizado para OPEN.',
      why: 'O cliente UltraLink excedeu a linha de crédito (R$ 261.759,75 > R$ 250.000,00), exigindo parecer e aprovação comercial.',
      businessImpact: 'A remessa foi destravada na VL01N, permitindo a separação e o envio dos switches para Fortaleza/CE.'
    }
  },
  {
    id: 'SCN-10',
    code: 'TRN-107',
    title: 'Diagnóstico de Restrição Cadastral',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'credit_analyst',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Bloqueio de Expedição: AutoPeças Guanabara (Doc 10000005)',
    briefing: 'Olá, trainee! O cliente AutoPeças e Motores Guanabara entrou em contato para saber por que o fornecimento de componentes da Ordem nº 10000005 está paralisado. Investigue a situação comercial do documento e do parceiro de negócios na VA03 e XD03. Identifique a causa-raiz da retenção no sistema e realize a liberação formal do bloqueio de crédito na transação VKM1 com parecer de alçada, regularizando a ordem para as etapas logísticas subsequentes.',

    purchaseOrderDocument: {
      buyerName: 'AutoPeças e Motores Guanabara S/A (Rio de Janeiro/RJ)',
      buyerCnpj: '67.890.123/0001-45',
      poNumber: 'PO-AG-2026-041',
      operationType: 'Fornecimento de Componentes de Rede e Energia',
      itemsRequested: [
        { description: 'Placa de Rede Dual Port 10G SFP+ (MAT-3080)', quantity: 5, unit: 'UN' },
        { description: 'Fonte Redundante Hot-Plug 800W Titanium (MAT-3090)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Brasil, 15000 - Rio de Janeiro/RJ',
      freightResponsibility: 'FOB - Retirada pelo transportador do comprador',
      paymentInstructions: '30 dias direto (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Observe que o valor total desta ordem (R$ 5.166,15) é relativamente baixo e está dentro do limite financeiro. Consulte a ficha do cliente na XD03 e o motivo na VKM1 para descobrir por que a ordem foi retida. Após entender que se trata de uma restrição cadastral prévia, execute a liberação supervisionada na VKM1!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / XD03 / VKM1',
      tables: 'KNKK / KNVV / VBAK',
      concept: 'Nem todo bloqueio de crédito decorre de insuficiência de limite. Clientes com restrições jurídicas, protestos fiscais ou pendências contratuais podem ser marcados com creditStatus = BLOCKED no mestre, acionando a retenção preventiva obrigatória de todas as novas ordens.'
    },

    objectives: [
      { id: 'analyze_order', text: 'Consultar a Ordem de Venda 10000005 e constatar a retenção na VA03', done: false },
      { id: 'investigate_credit', text: 'Investigar a restrição cadastral do cliente AutoPeças Guanabara (100750) na XD03', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e analisar o motivo de bloqueio cadastral', done: false },
      { id: 'release_credit_order', text: 'Executar a liberação de crédito da Ordem 10000005 na VKM1', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000005',
      customerId: '100750',
      action: 'CREDIT_RELEASE',
      requiresVkm1Release: true
    },

    completionFeedback: {
      mentorSpeech: 'Diagnóstico perfeito! Você percebeu que o bloqueio não era por falta de limite numérico, mas sim por uma trava cadastral no mestre do cliente. Liberou a ordem na VKM1 com parecer supervisionado e restabeleceu o fluxo comercial! Parabéns! +300 XP.',
      whatHappened: 'Ordem de Venda nº 10000005 liberada do bloqueio cadastral de crédito.',
      why: 'O cliente AutoPeças Guanabara possuía status cadastral de risco (BLOCKED), exigindo validação manual da alçada.',
      businessImpact: 'A expedição de placas e fontes foi autorizada para o cliente no Rio de Janeiro.'
    }
  },
  {
    id: 'SCN-11',
    code: 'DSF-203',
    title: 'Desafio Autônomo — Liberação de Crédito sob SLA',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 6,
    xpReward: 450,
    badgeReward: 'credit_master',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'CHAMADO PRIORITÁRIO: Pedido Crítico Retido - Metalúrgica Paulista (Doc 10000004)',
    briefing: 'Chamado Comercial Prioritário! A diretoria da Indústria Metalúrgica Paulista entrou em contato com a gerência geral cobrando o despacho imediato da Ordem nº 10000004 (Servidores Enterprise MAT-1001), afirmando que a linha de produção em Campinas/SP depende desses equipamentos. Como consultor SD de plantão, assuma este chamado sob controle de SLA: investigue a causa da retenção financeira da ordem e execute a aprovação formal do crédito na transação VKM1 para regularizar a liberação comercial dentro do prazo estipulado.',

    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '98.765.432/0001-11',
      poNumber: 'PO-MP-2026-030',
      operationType: 'Fornecimento Estratégico de Servidores de Automação Fabril',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Fábrica Campinas - Portão 3 Logística',
      freightResponsibility: 'FOB - Retirada pelo transportador do cliente',
      paymentInstructions: '60 dias líquido (Z060)'
    },

    mentorInitialTip: 'Aviso de Desafio: Você está no comando autônomo com controle de tempo (SLA de 6 minutos). Utilize todas as transações disponíveis para diagnosticar o status do documento e regularizar o fornecimento!',
    
    sapKnowledgeBridge: {
      tcode: 'VA03 / XD03 / VKM1',
      tables: 'KNKK / VBAK / VBFA',
      concept: 'Em operações corporativas com risco elevado, a tomada de decisão autônoma sobre a liberação de crédito pondera a criticidade do cliente frente à inadimplência e à garantia de recebimento.'
    },

    objectives: [
      { id: 'diagnose_situation', text: 'Diagnosticar a retenção da Ordem 10000004 no fluxo de documentos', done: false },
      { id: 'investigate_credit', text: 'Avaliar o risco e a exposição financeira da Metalúrgica Paulista na XD03', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e interpretar a situação de crédito misto', done: false },
      { id: 'release_credit_order', text: 'Liberar a Ordem 10000004 com parecer comercial na VKM1 dentro do SLA', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000004',
      customerId: '100088',
      action: 'CREDIT_RELEASE',
      requiresVkm1Release: true
    },

    completionFeedback: {
      mentorSpeech: 'Sensacional! Você resolveu com autonomia absoluta um dos casos mais complexos de crédito comercial do SAP: diagnosticou a retenção da Metalúrgica Paulista, investigou a exposição e liberou o pedido com alçada na VKM1 dentro do prazo de SLA. Você conquistou a insígnia Credit Master! +450 XP.',
      whatHappened: 'Ordem de Venda nº 10000004 liberada com sucesso do bloqueio de crédito sob controle de SLA.',
      why: 'O documento apresentava bloqueio misto (limite de R$ 50k com saldo comprometido de R$ 48.9k + pedido de R$ 21.6k).',
      businessImpact: 'A fábrica em Campinas/SP receberá os servidores sem interrupção na linha de produção.'
    }
  },
  {
    id: 'SCN-12',
    code: 'TRN-108',
    title: 'Criação de Remessa e Ponto de Expedição',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'delivery_specialist',
    initialTcode: 'VL01N',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Fornecimento Autorizado: Rede Hospitalar São Lucas (Doc 10000007)',
    briefing: 'Olá, trainee! A Ordem de Venda nº 10000007 foi devidamente aprovada e liberada comercialmente para faturamento. O cliente aguarda o envio dos equipamentos a partir da nossa matriz em São Paulo. Acesse a transação VL01N, informe o Ponto de Expedição 1000 (CD Central SP), carregue a Ordem 10000007, confira as posições e quantidades a fornecer e grave o documento de Fornecimento (Remessa / Outbound Delivery).',

    purchaseOrderDocument: {
      buyerName: 'Rede Hospitalar São Lucas S/A (Rio de Janeiro/RJ)',
      buyerCnpj: '23.456.789/0001-88',
      poNumber: 'PO-HSL-2026-062',
      operationType: 'Fornecimento de Infraestrutura e Expansão de Servidores',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)', quantity: 1, unit: 'UN' },
        { description: 'Memória ECC 64GB DDR5 4800MHz (MAT-3050)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Rua Voluntários da Pátria, 400 - Rio de Janeiro/RJ',
      freightResponsibility: 'CIF - Transporte por conta da NexusTech',
      paymentInstructions: '30 dias direto (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Vá até a transação VL01N, preencha o Ponto de Expedição com 1000 e a Ordem de Venda com 10000007. Clique em "Carregar Ordem" para conferir os itens na grade e, em seguida, clique em "Gerar Remessa / Fornecimento (Gravar)". O sistema criará o documento oficial na faixa 80000000!',

    sapKnowledgeBridge: {
      tcode: 'VL01N / LIKP',
      tables: 'LIKP (Cabeçalho da Remessa), LIPS (Itens da Remessa), VBFA (Fluxo de Documentos)',
      concept: 'No SAP SD, a criação da remessa (Outbound Delivery) na VL01N converte a intenção de compra da ordem de venda em uma ordem logística de movimentação física, direcionando a demanda para o Ponto de Expedição competente.'
    },

    objectives: [
      { id: 'access_vl01n', text: 'Acessar a transação de criação de remessa VL01N', done: false },
      { id: 'select_shipping_point', text: 'Selecionar o Ponto de Expedição 1000 (CD Central SP)', done: false },
      { id: 'check_order', text: 'Carregar a Ordem de Venda 10000007 e conferir as posições a fornecer', done: false },
      { id: 'create_delivery', text: 'Gravar o documento de Fornecimento / Remessa (Outbound Delivery)', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000007',
      shippingPoint: '1000',
      action: 'CREATE_DELIVERY'
    },

    completionFeedback: {
      mentorSpeech: 'Excelente trabalho! Você criou a remessa com sucesso na VL01N utilizando o Ponto de Expedição 1000. O documento gerou a autorização formal para separação física no Centro de Distribuição! +300 XP.',
      whatHappened: 'Documento de Remessa gerado com sucesso a partir da Ordem 10000007.',
      why: 'O vínculo entre a ordem de venda e a remessa (LIKP/LIPS) foi registrado no fluxo de documentos (VBFA).',
      businessImpact: 'A equipe do armazém já pode iniciar a coleta (Picking) e preparação das embalagens.'
    }
  },
  {
    id: 'SCN-13',
    code: 'TRN-109',
    title: 'Picking e Baixa Física de Estoque - PGI',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'shipping_specialist',
    initialTcode: 'VL01N',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Despacho Urgente: MinasTech Automação (Doc 10000008)',
    briefing: 'Olá, trainee! A Ordem de Venda nº 10000008 da MinasTech Automação precisa ser despachada com urgência para a filial de Belo Horizonte. Crie a remessa correspondente na transação VL01N, acerte o picking dos materiais na transação VL02N e execute a etapa crucial da logística: o Post Goods Issue (PGI / Saída de Mercadorias). Em seguida, consulte o mestre de materiais (MM03) para comprovar a redução física do estoque e verifique o fluxo atualizado na VA03.',

    purchaseOrderDocument: {
      buyerName: 'MinasTech Automação e Painéis S/A (Belo Horizonte/MG)',
      buyerCnpj: '45.678.901/0001-01',
      poNumber: 'PO-MT-2026-077',
      operationType: 'Expedição de Discos de Alta Performance para Servidores',
      itemsRequested: [
        { description: 'Disco SAS 2.4TB 10K RPM Hot-Swap (MAT-3020)', quantity: 8, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Amazonas, 4500 - Belo Horizonte/MG',
      freightResponsibility: 'CIF - Frete contratado pela NexusTech',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Primeiro crie a remessa para a ordem 10000008 na VL01N. Ao ser direcionado para a VL02N (ou acessando-a diretamente), clique em "Copiar Qtd Fornecimento para Picking" e depois no botão verde "Registrar Saída de Mercadorias (PGI)". Isso disparará o movimento MM 601 e baixará o estoque físico do depósito!',

    sapKnowledgeBridge: {
      tcode: 'VL02N / MM03 / MARD',
      tables: 'LIKP / LIPS / MARD (Saldos Físicos) / MSEG (Movimentos de Material)',
      concept: 'O Post Goods Issue (PGI) na VL02N é a transação que efetiva a saída física das mercadorias do depósito (movimento 601), reduzindo a quantidade física e encerrando a reserva da ordem de venda.'
    },

    objectives: [
      { id: 'create_delivery', text: 'Gerar a Remessa para a Ordem 10000008 na transação VL01N', done: false },
      { id: 'access_vl02n', text: 'Acessar a transação VL02N para conferência do fornecimento', done: false },
      { id: 'confirm_picking', text: 'Confirmar a separação física completa dos itens no Picking', done: false },
      { id: 'post_goods_issue', text: 'Registrar a Saída de Mercadorias (Post Goods Issue - PGI / Mov. 601)', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000008',
      action: 'POST_GOODS_ISSUE'
    },

    completionFeedback: {
      mentorSpeech: 'Sensacional! Você executou com perfeição a esteira completa de expedição no SAP SD: criou o fornecimento, validou o picking e registrou o Post Goods Issue (PGI). O movimento 601 baixou o saldo físico e encerrou a reserva! Parabéns! +300 XP.',
      whatHappened: 'Saída de Mercadorias (PGI) registrada com sucesso para a Ordem 10000008.',
      why: 'O PGI contabilizou a baixa física no estoque do CD SP e gerou o documento de material MM.',
      businessImpact: 'A transportadora foi liberada para coleta física e a ordem está pronta para faturamento na VF01.'
    }
  },
  {
    id: 'SCN-14',
    code: 'DSF-204',
    title: 'Desafio Autônomo — Expedição Crítica sob SLA',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 6,
    xpReward: 450,
    badgeReward: 'shipping_master',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'CHAMADO CRÍTICO: Despacho Imediato de Switches (Doc 10000006)',
    briefing: 'Chamado Crítico da Diretoria! O provedor UltraLink acionou a gerência informando que a Ordem de Venda nº 10000006 (6x Switches 48P PoE+ MAT-2080) precisa ser liberada e expedida imediatamente para o centro operacional de Fortaleza/CE. O chamado está sob controle de SLA (6 minutos). Como consultor SD de plantão, investigue a situação completa do documento, solucione qualquer retenção comercial que impeça o fornecimento, gere a remessa física e conclua o Post Goods Issue (PGI) dentro do prazo limite!',

    purchaseOrderDocument: {
      buyerName: 'UltraLink Provedor de Internet Banda Larga S/A (Fortaleza/CE)',
      buyerCnpj: '78.901.234/0001-56',
      poNumber: 'PO-UL-2026-055',
      operationType: 'Expedição de Emergência de Switches PoE+ para Expansão de Rede',
      itemsRequested: [
        { description: 'Switch 48 Portas Gigabit PoE+ com 4x 10G SFP+ (MAT-2080)', quantity: 6, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Santos Dumont, 2800 - Fortaleza/CE',
      freightResponsibility: 'CIF - Frete Expresso Dedicado',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Aviso de Desafio: Você está em modo autônomo com cronômetro de SLA (6 minutos). Avalie os impedimentos da ordem no fluxo de documentos e execute todas as etapas necessárias para efetivar a saída física de mercadorias!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VKM1 / VL01N / VL02N',
      tables: 'VBAK / KNKK / LIKP / LIPS / VBFA / MARD',
      concept: 'O ciclo completo Order-to-Cash (O2C) requer que bloqueios de crédito sejam avaliados na VKM1 antes da geração da remessa na VL01N e do PGI na VL02N.'
    },

    objectives: [
      { id: 'check_order_va03', text: 'Identificar a retenção da Ordem 10000006 na VA03', done: false },
      { id: 'release_credit_order', text: 'Solucionar o bloqueio de crédito comercial na VKM1', done: false },
      { id: 'create_delivery', text: 'Criar o documento de fornecimento na VL01N', done: false },
      { id: 'post_goods_issue', text: 'Confirmar picking e registrar o PGI na VL02N dentro do SLA', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000006',
      action: 'POST_GOODS_ISSUE'
    },

    completionFeedback: {
      mentorSpeech: 'Extraordinário! Você dominou de ponta a ponta o ciclo comercial e logístico do SAP SD sob pressão de SLA: identificou a trava financeira, liberou a ordem na VKM1, gerou o fornecimento na VL01N e processou a saída de mercadorias na VL02N. Você conquistou a insígnia máxima Shipping Master! +450 XP.',
      whatHappened: 'Ordem 10000006 liberada de crédito e expedida com sucesso (Remessa + PGI concluídos).',
      why: 'Todo o encadeamento SD -> FI-AR -> MM (VA03 -> VKM1 -> VL01N -> VL02N) foi perfeitamente executado.',
      businessImpact: 'Os switches foram despachados no transporte aéreo expresso, cumprindo o acordo de nível de serviço com a UltraLink.'
    }
  },
  {
    id: 'SCN-15',
    code: 'TRN-110',
    title: 'Emissão de Fatura Comercial e Fechamento O2C',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'billing_specialist',
    initialTcode: 'VF01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Faturamento Liberado: Rede Hospitalar São Lucas (Doc 10000007)',
    briefing: 'Olá, trainee! A Remessa da Ordem de Venda nº 10000007 (Rede Hospitalar São Lucas) foi devidamente separada e expedida com Saída de Mercadorias (PGI) concluída no Centro de Distribuição. Agora precisamos realizar a escrituração contábil e emitir a Fatura Comercial oficial (Tipo F2) para cobrança bancária. Acesse a transação VF01, informe o Tipo de Fatura F2, carregue a remessa expedida, confira os valores líquidos e os tributos incidentes (ICMS e PIS/COFINS) e grave o faturamento. Em seguida, consulte o resultado e o fluxo de documentos na VF03.',

    purchaseOrderDocument: {
      buyerName: 'Rede Hospitalar São Lucas S/A (Rio de Janeiro/RJ)',
      buyerCnpj: '23.456.789/0001-88',
      poNumber: 'PO-HSL-2026-062',
      operationType: 'Faturamento Comercial e Emissão de Nota Fiscal de Venda',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)', quantity: 1, unit: 'UN' },
        { description: 'Memória ECC 64GB DDR5 4800MHz (MAT-3050)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Rua Voluntários da Pátria, 400 - Rio de Janeiro/RJ',
      freightResponsibility: 'CIF - Transporte por conta da NexusTech',
      paymentInstructions: '30 dias direto (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Vá até a transação VF01, selecione o Tipo de Faturamento "F2", certifique-se de que a remessa associada à ordem 10000007 está carregada e clique em "Gravar Fatura Comercial (Post)". O sistema criará o documento na faixa 90000000 e atualizará o status da ordem para COMPLETED!',

    sapKnowledgeBridge: {
      tcode: 'VF01 / VF03 / VBRK',
      tables: 'VBRK (Cabeçalho da Fatura), VBRP (Itens da Fatura), BSID (Contas a Receber)',
      concept: 'A emissão da fatura (Billing) na VF01 é a etapa de escrituração que converte o fornecimento físico em títulos de cobrança financeira, calculando os impostos devidos e gerando a partida contábil no Contas a Receber (FI-AR).'
    },

    objectives: [
      { id: 'access_vf01', text: 'Acessar a transação de faturamento comercial VF01', done: false },
      { id: 'select_billing_type', text: 'Selecionar o Tipo de Faturamento F2 (Fatura Comercial / NF)', done: false },
      { id: 'create_invoice', text: 'Conferir o cálculo de impostos e gravar a Fatura Comercial', done: false },
      { id: 'verify_invoice', text: 'Auditar o documento faturado e o fluxo VBFA na VF03', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000007',
      billingType: 'F2',
      action: 'CREATE_INVOICE'
    },

    initialDeliveries: [
      { salesOrderNumber: '10000007', shippingPoint: '1000', autoPgi: true }
    ],

    completionFeedback: {
      mentorSpeech: 'Excelente trabalho! Você concluiu a emissão da Fatura Comercial na VF01 com total precisão tributária. O título a receber foi lançado e o ciclo Order-to-Cash da Ordem 10000007 está 100% finalizado! +300 XP.',
      whatHappened: 'Fatura Comercial F2 emitida com sucesso a partir da remessa expedida.',
      why: 'A escrituração fiscal e o lançamento financeiro em Contas a Receber (FI-AR) foram homologados no SAP.',
      businessImpact: 'A duplicata foi gerada para cobrança bancária e a empresa receberá no prazo pactuado.'
    }
  },
  {
    id: 'SCN-16',
    code: 'TRN-111',
    title: 'Diagnóstico de Pré-requisito e Bloqueio de Faturamento',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'billing_specialist',
    initialTcode: 'VF01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Rejeição de Faturamento: Sul Distribuidora (Doc 10000009)',
    briefing: 'Olá, trainee! A gerência financeira solicitou com urgência a emissão da Fatura Comercial da Ordem de Venda nº 10000009 (Sul Distribuidora). O setor de faturamento relatou que está ocorrendo uma rejeição de sistema ao tentar emitir o documento na VF01. Como consultor SD, assuma a análise, investigue a causa raiz da rejeição, execute as ações necessárias na transação correta para regularizar o processo e conclua a emissão da fatura com sucesso.',

    purchaseOrderDocument: {
      buyerName: 'Sul Distribuidora e Logística de Peças Ltda (Curitiba/PR)',
      buyerCnpj: '56.789.012/0001-23',
      poNumber: 'PO-SD-2026-089',
      operationType: 'Faturamento de Servidores e Módulos para Filial Curitiba',
      itemsRequested: [
        { description: 'Servidor Rack 2U Nexus Power (Dual AMD 128GB)', quantity: 2, unit: 'UN' },
        { description: 'Disco SSD 1.92TB Enterprise SATA (MAT-3010)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Av. das Indústrias, 1200 - Curitiba/PR',
      freightResponsibility: 'CIF - Transporte Terrestre',
      paymentInstructions: '45 dias líquido (Z045)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: No SAP SD, a emissão da Fatura F2 baseada em remessa exige que todas as etapas logísticas precedentes estejam concluídas. Se a VF01 rejeitar o documento, verifique na VL02N ou na VA03 se a remessa já possui a Saída de Mercadorias (PGI / Mov. 601) registrada!',

    sapKnowledgeBridge: {
      tcode: 'VF01 / VL02N / VBFA',
      tables: 'LIKP / VBRK / VBFA',
      concept: 'O faturamento baseado em remessa (Delivery-Related Billing) possui como pré-requisito mandatório a Saída de Mercadorias (PGI). Sem o PGI, a mercadoria não foi baixada do estoque e não pode gerar faturamento.'
    },

    objectives: [
      { id: 'access_vf01', text: 'Identificar a rejeição de faturamento da Ordem 10000009 na VF01', done: false },
      { id: 'access_vl02n', text: 'Acessar a transação VL02N e executar a Saída de Mercadorias (PGI)', done: false },
      { id: 'create_invoice', text: 'Retornar à VF01 e emitir a Fatura Comercial com sucesso', done: false },
      { id: 'verify_invoice', text: 'Consultar o encerramento do fluxo comercial na VF03', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000009',
      billingType: 'F2',
      action: 'CREATE_INVOICE'
    },

    initialDeliveries: [
      { salesOrderNumber: '10000009', shippingPoint: '1000', autoPgi: false }
    ],

    completionFeedback: {
      mentorSpeech: 'Brilhante diagnóstico! Você identificou rapidamente que o faturamento estava retido por ausência de Saída de Mercadorias (PGI), regularizou o movimento de estoque na VL02N e emitiu a Fatura Comercial com maestria! +300 XP.',
      whatHappened: 'A Remessa foi completada com PGI e a Fatura Comercial foi emitida com sucesso.',
      why: 'O princípio contábil e fiscal de confrontação de receitas e custos no SAP exige a baixa física antes do faturamento.',
      businessImpact: 'A ordem foi totalmente liquidada e a mercadoria já pode trafegar com a nota fiscal correspondente.'
    }
  },
  {
    id: 'SCN-17',
    code: 'DSF-205',
    title: 'Desafio Máximo — Ciclo Completo Order-to-Cash sob SLA',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 6,
    xpReward: 500,
    badgeReward: 'o2c_master',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'CHAMADO DIRETORIA: Fechamento O2C Urgente - Metalúrgica Paulista (Doc 10000004)',
    briefing: 'Chamado Crítico da Diretoria Executiva! A Indústria Metalúrgica Paulista S/A (Doc 10000004) aguarda com urgência o fechamento comercial e a emissão da nota fiscal para envio dos servidores de automação fabril de Campinas/SP. A ordem encontra-se parada no ambiente com retenções pendentes. Como consultor sênior de plantão, você tem 6 minutos de SLA para diagnosticar o documento, resolver todas as travas comerciais, expedir e faturar a operação ponta a ponta até a homologação final do fluxo na VF03!',

    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '98.765.432/0001-11',
      poNumber: 'PO-MP-2026-030',
      operationType: 'Processamento Integral Order-to-Cash sob SLA Executivo',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Fábrica Campinas - Portão 3 Logística',
      freightResponsibility: 'FOB - Retirada pelo transportador do cliente',
      paymentInstructions: '60 dias líquido (Z060)'
    },

    mentorInitialTip: 'Aviso de Desafio Máximo: Você está em modo 100% autônomo com cronômetro de SLA (6 minutos). Conclua a cadeia completa SD (VA03 -> VKM1 -> VL01N -> VL02N -> VF01 -> VF03) e conquiste a insígnia suprema O2C Master!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VKM1 / VL01N / VL02N / VF01 / VF03',
      tables: 'VBAK / KNKK / LIKP / LIPS / VBRK / VBRP / VBFA / MARD',
      concept: 'O ciclo Order-to-Cash (O2C) engloba todo o fluxo corporativo ponta a ponta: do pedido inicial à liquidação financeira e fiscal.'
    },

    objectives: [
      { id: 'check_order_va03', text: 'Diagnosticar a retenção da Ordem 10000004 na VA03', done: false },
      { id: 'release_credit_order', text: 'Liberar o limite de crédito retido na VKM1', done: false },
      { id: 'create_delivery', text: 'Gerar a remessa de fornecimento na VL01N', done: false },
      { id: 'post_goods_issue', text: 'Confirmar picking e registrar a Saída de Mercadorias (PGI) na VL02N', done: false },
      { id: 'create_invoice', text: 'Emitir a Fatura Comercial F2 na VF01', done: false },
      { id: 'verify_invoice', text: 'Homologar a cadeia completa do processo na VF03 dentro do SLA', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000004',
      billingType: 'F2',
      action: 'FULL_O2C'
    },

    completionFeedback: {
      mentorSpeech: 'Extraordinário e Magistral! Você executou com autonomia perfeita todo o ciclo Order-to-Cash no SAP SD sob controle rígido de SLA: desbloqueou crédito na VKM1, gerou remessa na VL01N, efetuou o PGI na VL02N e emitiu a fatura na VF01. Você alcançou o nível máximo de proficiência e conquistou a insígnia O2C Master! +500 XP.',
      whatHappened: 'Ciclo completo Order-to-Cash (O2C) finalizado com sucesso para a Ordem 10000004.',
      why: 'Todas as disciplinas do SAP SD (Vendas, Crédito, Estoque/Expedição e Faturamento/Financeiro) foram orquestradas com precisão.',
      businessImpact: 'A Metalúrgica Paulista recebeu o faturamento em conformidade fiscal e os servidores entraram em operação na fábrica sem atrasos.'
    }
  },
  {
    id: 'SCN-18',
    code: 'TRN-112',
    title: 'Emissão de Venda Corporativa Multi-Item para Setor Financeiro',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'XD03',

    sender: 'Carla Mendes (Key Account B2B | Contas Estratégicas)',
    emailSubject: 'NOVO PEDIDO: Banco Horizonte (Doc PO-BH-2026-89) - Atualização Infra Tamboré',
    briefing: 'O Banco Horizonte de Investimentos (Cliente 100310) enviou a ordem de compra formal PO-BH-2026-89 para atualização do seu datacenter secundário em Tamboré/SP. O pedido contempla 2 Servidores Rack 1U (MAT-1010) e 4 unidades de SSD Enterprise NVMe (MAT-3010). Como o parceiro possui estrutura corporativa com entrega em site técnico desacoplado da sede na Faria Lima, confira primeiro os dados cadastrais e fiscais na XD03. Em seguida, acesse a VA01 e emita a ordem com a área de vendas corporativa (1000/10/01), condição Z030 e frete CIF.',

    purchaseOrderDocument: {
      buyerName: 'Banco Horizonte de Investimentos S/A (Sede Faria Lima)',
      buyerCnpj: '78.901.234/0001-56',
      poNumber: 'PO-BH-2026-89',
      operationType: 'Venda Corporativa Multi-Item / Atualização de Datacenter',
      itemsRequested: [
        { description: 'Servidor Rack 1U Nexus Edge Entry (Single Xeon 32GB)', quantity: 2, unit: 'UN' },
        { description: 'SSD NVMe Server Grade 3.84TB U.2 Enterprise', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Banco Horizonte - Data Center Secundário Tamboré / Barueri-SP',
      freightResponsibility: 'CIF - Frete por conta do emitente NexusTech',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Inicie conferindo o parceiro 100310 na XD03 para validar a área de vendas (1000/10/01) e o local de entrega. Na VA01, insira as duas linhas de materiais com suas respectivas quantidades para calcular o pedido composto.',

    sapKnowledgeBridge: {
      tcode: 'XD03 / VA01',
      tables: 'KNA1 / KNVV / VBAK / VBAP / KONP',
      concept: 'Ordens multi-item consolidam diferentes posições (VBAP) sob um mesmo cabeçalho comercial (VBAK), rateando impostos e gerando um único compromisso de entrega.'
    },

    objectives: [
      { id: 'check_customer', text: 'Analisar o mestre do cliente 100310 na XD03', done: false },
      { id: 'access_va01', text: 'Acessar a transação VA01', done: false },
      { id: 'fill_header_sales_area', text: 'Preencher Área de Vendas 1000 / 10 / 01 e Tipo OR', done: false },
      { id: 'fill_header_commercial', text: 'Informar Cliente 100310, PO-BH-2026-89 e Condição Z030', done: false },
      { id: 'add_order_items', text: 'Inserir MAT-1010 (2 un) e MAT-3010 (4 un)', done: false },
      { id: 'simulate_pricing', text: 'Simular precificação e gravar a ordem de venda', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100310',
      customerPoNumber: 'PO-BH-2026-89',
      paymentTerms: 'Z030',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-1010', quantity: 2, discountPercent: 0 },
        { materialId: 'MAT-3010', quantity: 4, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Excelente trabalho! A ordem corporativa multi-item do Banco Horizonte foi emitida com precisão e os valores de hardware e armazenamento foram perfeitamente consolidados no SAP. +300 XP.',
      whatHappened: 'Ordem de venda multi-item criada com sucesso para o cliente 100310.',
      why: 'A consolidação de múltiplos itens em uma única ordem otimiza o frete e simplifica a escrituração contábil.',
      businessImpact: 'Os servidores e discos foram alocados com sucesso para a modernização do datacenter de Tamboré.'
    }
  },
  {
    id: 'SCN-19',
    code: 'TRN-113',
    title: 'Aplicação e Manutenção de Desconto Promocional de Atacado (RB00)',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'MM03',

    sender: 'Marcelo Ramos (Gerente de Pricing & Inteligência Comercial)',
    emailSubject: 'CAMPANHA TRIMESTRAL: Desconto Especial de Atacado - TechLog (Doc PO-TL-2026-44)',
    briefing: 'A TechLog Distribuição (Cliente 100120) está adquirindo um lote promocional de 10 unidades do Access Point Corporativo Wi-Fi 6 (MAT-2020) no Canal de Revenda (Canal 20). A gerência comercial autorizou a aplicação de um desconto negociado de 8% (Condição RB00) na posição. Antes de digitar o pedido, acesse a MM03 para conferir o saldo disponível do produto no CD. Depois, acesse a VA01, preencha o pedido e aplique o desconto comercial de 8% para calcular o valor líquido correto.',

    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-2026-44',
      operationType: 'Venda de Atacado com Desconto Promocional de 8%',
      itemsRequested: [
        { description: 'Access Point Corporativo Wi-Fi 6 Dual-Band PoE+ (MAT-2020)', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'Centro de Distribuição Curitiba/PR',
      freightResponsibility: 'CIF - Entrega garantida pela NexusTech',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Consulte o material MAT-2020 na MM03 para auditar o saldo em estoque. Em seguida, na VA01, configure a área de vendas de revenda (1000/20/01), informe o cliente 100120 e insira o desconto de 8% no item.',

    sapKnowledgeBridge: {
      tcode: 'MM03 / VA01',
      tables: 'MARC / MARD / KONP / VBAP',
      concept: 'Condições de desconto por percentual (RB00) incidem sobre o preço base (PR00), recalculando automaticamente a base de cálculo de impostos como ICMS e PIS/COFINS.'
    },

    objectives: [
      { id: 'check_material', text: 'Consultar saldo disponível de MAT-2020 na MM03', done: false },
      { id: 'access_va01', text: 'Acessar a transação VA01', done: false },
      { id: 'fill_header_sales_area', text: 'Informar Área de Vendas 1000 / 20 / 01 e Tipo OR', done: false },
      { id: 'fill_header_commercial', text: 'Informar Cliente 100120 e PO-TL-2026-44', done: false },
      { id: 'add_order_items', text: 'Inserir MAT-2020 (10 un) e aplicar desconto de 8%', done: false },
      { id: 'simulate_pricing', text: 'Simular precificação e gravar a ordem de venda', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '20',
      division: '01',
      customerId: '100120',
      customerPoNumber: 'PO-TL-2026-44',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2020', quantity: 10, discountPercent: 8 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Parabéns! Você conduziu perfeitamente a negociação de atacado, conferiu o saldo físico na MM03 e aplicou o desconto de 8% respeitando a política comercial. +300 XP.',
      whatHappened: 'Ordem de atacado criada com desconto comercial de 8% aplicado com sucesso.',
      why: 'O desconto comercial negociado foi deduzido da base tributável, mantendo a rentabilidade e a conformidade fiscal.',
      businessImpact: 'O cliente parceiro recebeu o lote de conectividade no prazo e com as condições promocionais acordadas.'
    }
  },
  {
    id: 'SCN-20',
    code: 'TRN-114',
    title: 'Análise de Disponibilidade e Alocação de Fornecimento em Centro Regional',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'MM03',

    sender: 'Renata Siqueira (Planejamento de Demanda e Suprimentos - S&OP)',
    emailSubject: 'URGENTE: Atendimento de Switches 48P para Sul Distribuidora (Doc PO-SUL-2026-12)',
    briefing: 'A Sul Distribuidora de Informática (Cliente 100240) enviou o pedido PO-SUL-2026-12 solicitando 20 unidades do Switch 48 Portas Gigabit PoE+ (MAT-2080). A equipe comercial precisa confirmar a alocação de estoque antes de confirmar o pedido. Acesse a MM03 para verificar a disponibilidade do produto no Centro 2000 (Filial Itajaí). Após certificar-se do saldo livre de 70 unidades, acesse a VA01 e registre a ordem no canal de revenda (1000/20/01) com a condição escalonada Z28D e frete CIF.',

    purchaseOrderDocument: {
      buyerName: 'Sul Distribuidora de Informática Ltda (Joinville/SC)',
      buyerCnpj: '56.789.012/0001-34',
      poNumber: 'PO-SUL-2026-12',
      operationType: 'Venda de Revenda / Atendimento por Centro Regional SC',
      itemsRequested: [
        { description: 'Switch 48 Portas Gigabit PoE+ com 4x 10G SFP+ (MAT-2080)', quantity: 20, unit: 'UN' }
      ],
      deliveryAddress: 'CD Sul Distribuição Joinville/SC',
      freightResponsibility: 'CIF - Transporte rodoviário regional',
      paymentInstructions: 'Condição escalonada 28 dias (Z28D)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Inicie na MM03 conferindo a aba Estoque Centro/Depósito do material MAT-2080. Na VA01, certifique-se de selecionar o cliente 100240, Canal 20 e o prazo Z28D.',

    sapKnowledgeBridge: {
      tcode: 'MM03 / VA01',
      tables: 'MARC / MARD / KNVV / VBAK',
      concept: 'O SAP permite que a Organização de Vendas atenda clientes a partir de centros logísticos descentralizados (Plant 2000), garantindo agilidade no frete interestadual.'
    },

    objectives: [
      { id: 'check_material', text: 'Auditar saldo e centro do material MAT-2080 na MM03', done: false },
      { id: 'access_va01', text: 'Acessar a transação VA01', done: false },
      { id: 'fill_header_sales_area', text: 'Definir Área de Vendas 1000 / 20 / 01 e Tipo OR', done: false },
      { id: 'fill_header_commercial', text: 'Informar Cliente 100240, PO-SUL-2026-12 e Prazo Z28D', done: false },
      { id: 'add_order_items', text: 'Inserir MAT-2080 (20 un)', done: false },
      { id: 'simulate_pricing', text: 'Simular precificação e gravar a ordem de venda', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '20',
      division: '01',
      customerId: '100240',
      customerPoNumber: 'PO-SUL-2026-12',
      paymentTerms: 'Z28D',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2080', quantity: 20, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Ótima análise logística! Você confirmou a disponibilidade regional na MM03 e emitiu o pedido com a parametrização precisa de prazo e canal para a região Sul. +300 XP.',
      whatHappened: 'Ordem de venda criada com sucesso para atendimento pelo Centro Regional 2000.',
      why: 'A checagem de suprimentos antes da gravação evita apontamentos de ruptura e atrasos de entrega.',
      businessImpact: 'A distribuidora parceira teve seu pedido confirmado dentro do prazo planejado pelo S&OP.'
    }
  },
  {
    id: 'SCN-21',
    code: 'TRN-115',
    title: 'Avaliação de Risco Comercial e Desbloqueio Supervisionado de Grande Conta',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VA03',

    sender: 'Patrícia Rocha (Gerência de Risco & Crédito Corporativo)',
    emailSubject: 'RETENÇÃO VKM1: Ordem 10000031 - Rede Hospitalar São Lucas',
    briefing: 'A Ordem de Venda nº 10000031, referente ao fornecimento emergencial de no-breaks hospitalares para a Rede São Lucas (Cliente 100150), foi retida pelo controle automático de crédito por atingir o teto de tolerância da esteira financeira. O comitê de crédito aprovou a alçada em caráter prioritário devido ao perfil de baixo risco (Classe A) da instituição. Acesse a VA03 para diagnosticar a ordem retida, consulte o mestre na XD03 e, em seguida, realize a liberação comercial formal na VKM1.',

    purchaseOrderDocument: {
      buyerName: 'Rede Hospitalar São Lucas S/A (Sede RJ)',
      buyerCnpj: '23.456.789/0001-01',
      poNumber: 'PO-HSL-2026-09',
      operationType: 'Liberação Supervisionada de Crédito para Atendimento Hospitalar',
      itemsRequested: [
        { description: 'Nobreak Online Dupla Conversão 10kVA Rackmount (MAT-1090)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Hospital São Lucas - Almoxarifado Central Copacabana / Rio de Janeiro-RJ',
      freightResponsibility: 'CIF - Transporte prioritário hospitalar',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Abra a VA03 para examinar o status da Ordem 10000031. Em seguida, valide o risco na XD03 e utilize a transação VKM1 para executar o release com parecer comercial favorável.',

    sapKnowledgeBridge: {
      tcode: 'VA03 / XD03 / VKM1',
      tables: 'VBAK / KNKK / VBUK',
      concept: 'A transação VKM1 centraliza a gestão de documentos de vendas bloqueados por crédito, permitindo ao gestor financeiro liberar ou rejeitar ordens com base em alçadas.'
    },

    objectives: [
      { id: 'check_order_va03', text: 'Consultar status da Ordem 10000031 na VA03', done: false },
      { id: 'check_customer', text: 'Verificar limite e histórico do cliente 100150 na XD03', done: false },
      { id: 'release_credit_order', text: 'Liberar a ordem de venda na gestão de crédito VKM1', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000031',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100150',
        customerPoNumber: 'PO-HSL-2026-09',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'Rio de Janeiro',
        items: [
          { materialId: 'MAT-1090', quantity: 2, unitPrice: 7800.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 15600.00,
        overallStatus: 'CREDIT_BLOCKED',
        creditStatus: 'BLOCKED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000031',
      customerId: '100150',
      requiresVkm1Release: true,
      action: 'CREDIT_RELEASE'
    },

    completionFeedback: {
      mentorSpeech: 'Excelente parecer financeiro! Você auditou os dados cadastrais na XD03, confirmou a idoneidade da instituição de saúde e liberou a Ordem 10000031 na VKM1 com segurança e agilidade. +300 XP.',
      whatHappened: 'Bloqueio de crédito da Ordem 10000031 removido com sucesso na VKM1.',
      why: 'O comitê de crédito deliberou favoravelmente devido ao histórico exemplar de adimplência do cliente.',
      businessImpact: 'A ordem foi liberada para expedição imediata dos no-breaks para as UTIs do hospital no Rio de Janeiro.'
    }
  },
  {
    id: 'SCN-22',
    code: 'TRN-116',
    title: 'Processamento de Remessa Logística com Frete FOB e Retirada na Origem',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VL01N',

    sender: 'Eduardo Silva (Coordenação de Logística & Expedição CD SP)',
    emailSubject: 'LOGÍSTICA: Gerar Remessa e PGI para Ordem 10000032 - AgroVale Cooperativa',
    briefing: 'A cooperativa AgroVale (Cliente 100390) agendou a retirada de sua carga no CD NexusTech SP para hoje. A Ordem de Venda nº 10000032 (5 Roteadores de Borda SD-WAN - MAT-2010) já foi aprovada comercialmente sob a modalidade de frete FOB. A coordenação de expedição precisa que você acesse a VL01N com o Ponto de Expedição 1000, gere o documento de remessa (Outbound Delivery) e, na VL02N, execute a confirmação de picking e registre a Saída de Mercadorias (PGI / Movimento 601) para que a transportadora do cliente possa carregar o caminhão.',

    purchaseOrderDocument: {
      buyerName: 'AgroVale Cooperativa Agrícola Mista (Rondonópolis/MT)',
      buyerCnpj: '90.123.456/0001-78',
      poNumber: 'PO-AGRO-2026-05',
      operationType: 'Expedição Logística FOB / Retirada pelo Transportador do Cliente',
      itemsRequested: [
        { description: 'Roteador de Borda SD-WAN Gigabit Multi-WAN (MAT-2010)', quantity: 5, unit: 'UN' }
      ],
      deliveryAddress: 'Retirada no Pátio de Cargas NexusTech CD SP',
      freightResponsibility: 'FOB - Retirada e transporte sob responsabilidade do cliente',
      paymentInstructions: '60 dias líquido (Z060)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Inicie na VL01N informando o Ponto de Expedição 1000 e o número da Ordem 10000032. Em seguida, na VL02N, confirme as quantidades separadas e clique em Registrar Saída de Mercadorias (PGI).',

    sapKnowledgeBridge: {
      tcode: 'VL01N / VL02N / VL03N',
      tables: 'LIKP / LIPS / MKPF / MSEG / VBFA',
      concept: 'O Post Goods Issue (PGI) conclui a responsabilidade física da expedição, gerando o documento contábil de material (movimento 601) e reduzindo o saldo físico do armazém.'
    },

    objectives: [
      { id: 'access_vl01n', text: 'Acessar a transação VL01N com Ponto de Expedição 1000', done: false },
      { id: 'create_delivery', text: 'Gerar o fornecimento para a Ordem 10000032', done: false },
      { id: 'access_vl02n', text: 'Acessar a transação VL02N para conferência de picking', done: false },
      { id: 'post_goods_issue', text: 'Registrar a Saída de Mercadorias (PGI / Mov. 601)', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000032',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100390',
        customerPoNumber: 'PO-AGRO-2026-05',
        paymentTerms: 'Z060',
        incoterms: 'FOB',
        incotermsLocation: 'CD NexusTech SP',
        items: [
          { materialId: 'MAT-2010', quantity: 5, unitPrice: 2400.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 12000.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000032',
      shippingPoint: '1000',
      action: 'POST_GOODS_ISSUE'
    },

    completionFeedback: {
      mentorSpeech: 'Execução logística impecável! Você criou o fornecimento na VL01N, efetuou a conferência de picking e confirmou a Saída de Mercadorias na VL02N, liberando o caminhão da cooperativa no pátio. +300 XP.',
      whatHappened: 'Remessa gerada e Saída de Mercadorias (PGI) concluída para a Ordem 10000032.',
      why: 'O movimento 601 transferiu formalmente a custódia da carga para o transportador do cliente.',
      businessImpact: 'Os roteadores de borda foram despachados pontualmente para o armazém de grãos em Rondonópolis/MT.'
    }
  },
  {
    id: 'SCN-23',
    code: 'TRN-117',
    title: 'Fechamento Fiscal e Auditoria da Escrituração Contábil O2C',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VF01',

    sender: 'Roberto Dias (Supervisor Fiscal & Tributário)',
    emailSubject: 'FECHAMENTO FISCAL: Emissão de NF e Conferência de Impostos - Ordem 10000033',
    briefing: 'A remessa da Ordem nº 10000033 (DataCore Brasil - Servidor Enterprise Dual Xeon MAT-1001) já foi fisicamente baixada no estoque pela equipe do armazém e encontra-se na doca de carregamento. O setor fiscal solicita a emissão imediata da Fatura Comercial na VF01 com o Tipo de Faturamento F2 para geração da NF-e e liberação da nota fiscal eletrônica de transporte. Após a emissão, realize a auditoria na VF03 para certificar-se de que os impostos e o título a receber foram gerados com sucesso.',

    purchaseOrderDocument: {
      buyerName: 'DataCore Cloud & Datacenters Brasil Ltda (Barueri/SP)',
      buyerCnpj: '34.567.890/0001-12',
      poNumber: 'PO-DC-2026-19',
      operationType: 'Faturamento Fiscal e Contabilização em Contas a Receber (FI-AR)',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)', quantity: 1, unit: 'UN' }
      ],
      deliveryAddress: 'DataCore DC1 - Alphaville Barueri/SP',
      freightResponsibility: 'CIF - Entrega garantida',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Acesse a VF01, selecione o Tipo de Faturamento F2 e clique em Gravar Fatura Comercial. Em seguida, acesse a VF03 para auditar o fluxo e o título a receber em FI.',

    sapKnowledgeBridge: {
      tcode: 'VF01 / VF03',
      tables: 'VBRK / VBRP / BSID / VBFA',
      concept: 'O faturamento no SAP (SD-BIL) integra vendas à contabilidade geral (FI-GL) e contas a receber (FI-AR), escriturando impostos e gerando duplicatas financeiras.'
    },

    objectives: [
      { id: 'access_vf01', text: 'Acessar a transação VF01 de faturamento', done: false },
      { id: 'select_billing_type', text: 'Selecionar Tipo de Faturamento F2 (Fatura Comercial)', done: false },
      { id: 'create_invoice', text: 'Gravar a fatura comercial para a Ordem 10000033', done: false },
      { id: 'verify_invoice', text: 'Auditar impostos e escrituração contábil na VF03', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000033',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100180',
        customerPoNumber: 'PO-DC-2026-19',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Barueri',
        items: [
          { materialId: 'MAT-1001', quantity: 1, unitPrice: 8500.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 8500.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    initialDeliveries: [
      { salesOrderNumber: '10000033', shippingPoint: '1000', autoPgi: true }
    ],

    targetCriteria: {
      targetDocNumber: '10000033',
      billingType: 'F2',
      action: 'CREATE_INVOICE'
    },

    completionFeedback: {
      mentorSpeech: 'Excelente encerramento fiscal! Você emitiu a Fatura Comercial F2 na VF01 e conferiu a escrituração contábil na VF03 com total conformidade. +300 XP.',
      whatHappened: 'Fatura Comercial e duplicata financeira geradas com sucesso para a Ordem 10000033.',
      why: 'A prévia conclusão do PGI permitiu a integração harmoniosa entre os módulos SD, MM e FI.',
      businessImpact: 'A NF-e foi transmitida à SEFAZ e o datacenter em Alphaville já pode receber o servidor com documentação 100% regular.'
    }
  },
  {
    id: 'SCN-24',
    code: 'TRN-118',
    title: 'Diagnóstico de Divergência Contratual e Regularização de Pedido na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VA02',

    sender: 'Beatriz Albuquerque (Auditoria de Contratos & Atendimento ao Cliente)',
    emailSubject: 'DIVERGÊNCIA PO: Pedido 10000034 - InovaLog Transportes (Correção de Prazo e Quantidade)',
    briefing: 'O cliente InovaLog Transportes (Cliente 100460) notificou a auditoria comercial apontando divergências na Ordem de Venda nº 10000034 gravada no sistema: o aditivo contratual PO-INOVA-2026-33 acordou a condição de pagamento Z015 (15 dias) em vez de Z030, e a quantidade de Access Points Wi-Fi 6 (MAT-2020) deve ser elevada de 2 para 5 unidades. Acesse a VA02, altere o prazo no cabeçalho para Z015 e a quantidade do item para 5 unidades. Em seguida, salve o documento e verifique na VA03 se os valores foram atualizados com sucesso.',

    purchaseOrderDocument: {
      buyerName: 'InovaLog Transportes & Logística Integrada S/A (São José dos Pinhais/PR)',
      buyerCnpj: '11.223.344/0001-99',
      poNumber: 'PO-INOVA-2026-33',
      operationType: 'Retificação Contratual e Aditivo de Quantidade em Ordem Viva',
      itemsRequested: [
        { description: 'Access Point Corporativo Wi-Fi 6 Dual-Band PoE+ (MAT-2020)', quantity: 5, unit: 'UN' }
      ],
      deliveryAddress: 'InovaLog Terminal de Cargas Aeroporto PR',
      freightResponsibility: 'CIF - Frete contratado',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Abra a Ordem 10000034 na VA02. Na aba Cabeçalho, altere a Condição de Pagamento para Z015. Na aba Posições, modifique a quantidade de 2 para 5 unidades e clique em Salvar Ordem.',

    sapKnowledgeBridge: {
      tcode: 'VA02 / VA03',
      tables: 'VBAK / VBAP / CDHDR / CDPOS',
      concept: 'A modificação de ordens no SAP SD (VA02) permite ajustes em contratos em aberto, recalculando automaticamente os impostos e atualizando o saldo reservado no MRP.'
    },

    objectives: [
      { id: 'access_va02', text: 'Carregar a Ordem 10000034 na transação VA02', done: false },
      { id: 'modify_payment_terms', text: 'Retificar a condição de pagamento do cabeçalho para Z015', done: false },
      { id: 'modify_item_quantity', text: 'Ajustar a quantidade da posição para 5 unidades', done: false },
      { id: 'save_order_modification', text: 'Salvar as alterações e verificar o recálculo do pedido', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000034',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '02',
        customerId: '100460',
        customerPoNumber: 'PO-INOVA-2026-33',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'São José dos Pinhais',
        items: [
          { materialId: 'MAT-2020', quantity: 2, unitPrice: 890.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 1780.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000034',
      paymentTerms: 'Z015',
      items: [
        { materialId: 'MAT-2020', quantity: 5 }
      ],
      action: 'SALES_ORDER_MODIFICATION'
    },

    completionFeedback: {
      mentorSpeech: 'Retificação contratual perfeita! Você ajustou o prazo de pagamento para Z015 e elevou a quantidade para 5 unidades na VA02, regularizando o pedido conforme o aditivo comercial. +300 XP.',
      whatHappened: 'Ordem de venda 10000034 alterada e recalculada com sucesso na VA02.',
      why: 'A alteração em tempo hábil evita divergências na emissão da fatura e mantém a fidelidade contratual.',
      businessImpact: 'O cliente InovaLog recebeu a confirmação do pedido retificado para instalação no terminal de cargas.'
    }
  },
  {
    id: 'SCN-25',
    code: 'DSF-206',
    title: 'Desafio de Plantão — Atendimento Crítico e Expedição sob SLA',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 7,
    xpReward: 450,
    badgeReward: 'fast_responder',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Plantão de Encerramento)',
    emailSubject: 'SLA PLANTÃO: Liberação e Faturamento Express - Hospital São Lucas (Ordem 10000035)',
    briefing: 'Chamado de Emergência do Plantão Comercial! A Rede Hospitalar São Lucas (Doc 10000035) necessita do envio imediato de 4 módulos de Memória Server Grade DDR5 (MAT-3050) para substituição em servidores críticos de UTI. O pedido encontra-se aprovado no sistema, mas você tem 7 minutos de SLA para executar todo o ciclo logístico e fiscal: auditar a ordem na VA03, gerar o fornecimento na VL01N (Ponto de Expedição 1000), confirmar o picking e registrar o PGI na VL02N, e emitir a Fatura Comercial F2 na VF01 antes do encerramento da janela do transporte aéreo!',

    purchaseOrderDocument: {
      buyerName: 'Rede Hospitalar São Lucas S/A (Copacabana/RJ)',
      buyerCnpj: '23.456.789/0001-01',
      poNumber: 'PO-HSL-URG-2026',
      operationType: 'Atendimento e Expedição Express sob Cronômetro de SLA (7 min)',
      itemsRequested: [
        { description: 'Módulo de Memória ECC 64GB DDR5 Server Grade (MAT-3050)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Hospital São Lucas - Almoxarifado Central Copacabana / Rio de Janeiro-RJ',
      freightResponsibility: 'CIF - Despacho aéreo urgente',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Aviso de Desafio de Plantão: Você está operando com cronômetro de SLA (7 minutos). Execute a esteira completa: VA03 -> VL01N -> VL02N -> VF01 e finalize o ciclo com agilidade para salvar o atendimento hospitalar!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VL01N / VL02N / VF01 / VF03',
      tables: 'VBAK / LIKP / LIPS / VBRK / VBRP / VBFA',
      concept: 'Processos de entrega expressa exigem sincronia estrita entre expedição e faturamento fiscal para que as mercadorias trafeguem sem risco de apreensão em barreiras fiscais.'
    },

    objectives: [
      { id: 'check_order_va03', text: 'Auditar a Ordem 10000035 na VA03', done: false },
      { id: 'create_delivery', text: 'Gerar remessa na VL01N com Ponto de Expedição 1000', done: false },
      { id: 'post_goods_issue', text: 'Confirmar picking e registrar PGI na VL02N', done: false },
      { id: 'create_invoice', text: 'Emitir a Fatura Comercial F2 na VF01 dentro do SLA', done: false },
      { id: 'verify_invoice', text: 'Homologar o encerramento do processo na VF03', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000035',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100150',
        customerPoNumber: 'PO-HSL-URG-2026',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'Rio de Janeiro',
        items: [
          { materialId: 'MAT-3050', quantity: 4, unitPrice: 980.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 3920.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000035',
      billingType: 'F2',
      action: 'FULL_O2C'
    },

    completionFeedback: {
      mentorSpeech: 'Desempenho espetacular sob pressão! Você conduziu todo o fluxo express de fornecimento e faturamento para a Rede Hospitalar São Lucas dentro do tempo do SLA com precisão absoluta. +450 XP.',
      whatHappened: 'Remessa, PGI e Fatura Comercial concluídos com sucesso dentro da janela de SLA de 7 minutos.',
      why: 'A rápida orquestração entre expedição e emissão fiscal garantiu o embarque da carga no voo programado.',
      businessImpact: 'Os módulos de memória chegaram ao hospital a tempo de restabelecer os sistemas de monitoramento da UTI.'
    }
  },
  {
    id: 'SCN-26',
    code: 'TRN-119',
    title: 'Identificação Cadastral de Filial na XD03 e Venda na VA01',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'XD03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'PO Corporativa: Rede Hospitalar São Lucas - Copacabana (PO-HSL-COPA-2026)',
    briefing: 'Olá, trainee! A Rede Hospitalar São Lucas enviou uma ordem de compra para aquisição de 4 unidades do SSD NVMe Server Grade (MAT-3010) para ampliação do storage da unidade de Copacabana. Como hospitais possuem múltiplos endereços e cadastros de entrega, acesse a transação XD03 e consulte o mestre do cliente 100150 para validar a Área de Vendas (1000/10/01), o endereço de entrega em Copacabana, a condição de pagamento Z030 e o Incoterms CIF. Em seguida, acesse a VA01 e emita a ordem de venda com precisão cadastral!',

    purchaseOrderDocument: {
      buyerName: 'Rede Hospitalar São Lucas S/A (Copacabana/RJ)',
      buyerCnpj: '23.456.789/0001-01',
      poNumber: 'PO-HSL-COPA-2026',
      operationType: 'Venda Corporativa Direta de Hardware Hospitalar',
      itemsRequested: [
        { description: 'SSD NVMe Server Grade 3.84TB U.2 Enterprise (MAT-3010)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Hospital São Lucas - Almoxarifado Central Copacabana / Rio de Janeiro-RJ',
      freightResponsibility: 'CIF - Entrega por conta da NexusTech no almoxarifado hospitalar',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Abra primeiro a XD03 para o cliente 100150. Na aba de Vendas, valide a Área de Vendas (1000 / 10 / 01), a Condição Z030 e o Incoterms CIF Rio de Janeiro. Depois vá para a VA01 e selecione os mesmos dados.',

    sapKnowledgeBridge: {
      tcode: 'XD03 / VA01',
      tables: 'KNA1 / KNVV / VBAK / VBAP',
      concept: 'A consulta prévia ao mestre de clientes (XD03 / KNVV) evita devoluções e cancelamentos de pedidos por divergência de endereço de entrega ou condições comerciais não homologadas.'
    },

    objectives: [
      { id: 'check_customer_xd03', text: 'Consultar dados comerciais do cliente 100150 na transação XD03', done: false },
      { id: 'set_org_structure', text: 'Preencher Área de Vendas 1000 / 10 / 01 e Tipo OR na VA01', done: false },
      { id: 'select_customer', text: 'Selecionar Cliente 100150 e informar PO-HSL-COPA-2026', done: false },
      { id: 'fill_terms', text: 'Definir Condição de Pagamento Z030 e Incoterms CIF', done: false },
      { id: 'add_item', text: 'Inserir 4 unidades do material MAT-3010 e gravar a ordem', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100150',
      customerPoNumber: 'PO-HSL-COPA-2026',
      paymentTerms: 'Z030',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-3010', quantity: 4, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Perfeita emissão cadastral! Você analisou os dados da Rede Hospitalar São Lucas na XD03 e montou a ordem na VA01 em conformidade absoluta com as regras comerciais. +300 XP.',
      whatHappened: 'Ordem de venda criada com dados mestres validados previamente na XD03.',
      why: 'A checagem preventiva no mestre de clientes garantiu consistência de área de vendas e dados de expedição.',
      businessImpact: 'O almoxarifado hospitalar receberá o lote de SSDs sem atrasos cadastrais ou fiscais.'
    }
  },
  {
    id: 'SCN-27',
    code: 'TRN-120',
    title: 'Emissão Comercial no Canal Indireto 20 (Revenda/Atacado)',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem Comercial Atacado: Sul Distribuidora (PO-SDI-2026-08)',
    briefing: 'A distribuidora parceira Sul Distribuidora de Informática enviou a ordem de compra PO-SDI-2026-08 solicitando 10 unidades de Access Point Wi-Fi 6 (MAT-2020). Como se trata de um cliente do canal indireto atacadista (Canal 20), certifique-se de configurar a Área de Vendas com Canal 20 na VA01, aplicar a condição de pagamento negociada para revendas (Z28D - 28 dias) e manter o Incoterms CIF Joinville conforme registrado no cadastro.',

    purchaseOrderDocument: {
      buyerName: 'Sul Distribuidora de Informática Ltda (Joinville/SC)',
      buyerCnpj: '56.789.012/0001-34',
      poNumber: 'PO-SDI-2026-08',
      operationType: 'Venda Comercial Atacado (Canal 20 - Revenda / Distribuição)',
      itemsRequested: [
        { description: 'Access Point Corporativo Wi-Fi 6 Dual-Band PoE+ (MAT-2020)', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'CD Sul Distribuição Joinville / SC',
      freightResponsibility: 'CIF - Entrega no CD do distribuidor por conta da NexusTech',
      paymentInstructions: '28 dias líquido (Z28D) conforme acordo comercial de atacado'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Atenção ao Canal de Distribuição na VA01! Para o cliente 100240, utilize o Canal 20 (Revenda / Atacado) e selecione a condição de pagamento Z28D no cabeçalho.',

    sapKnowledgeBridge: {
      tcode: 'VA01 / XD03',
      tables: 'KNVV / VBAK / VBAP',
      concept: 'No SAP SD, o Canal de Distribuição (VTWEG) é o elemento da Área de Vendas que segmenta políticas comerciais, listas de preços e condições de pagamento entre vendas diretas (10) e canais indiretos (20).'
    },

    objectives: [
      { id: 'set_org_structure', text: 'Configurar Área de Vendas com Canal 20 (1000 / 20 / 01) e Tipo OR na VA01', done: false },
      { id: 'select_customer', text: 'Selecionar Cliente Sul Distribuidora (100240) e informar PO-SDI-2026-08', done: false },
      { id: 'fill_terms', text: 'Definir Condição de Pagamento Z28D e Incoterms CIF', done: false },
      { id: 'add_item', text: 'Inserir 10 unidades do material MAT-2020 e gravar a ordem', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '20',
      division: '01',
      customerId: '100240',
      customerPoNumber: 'PO-SDI-2026-08',
      paymentTerms: 'Z28D',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2020', quantity: 10, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Excelente domínio do canal indireto! Você configurou o Canal 20 e os termos atacadistas Z28D com total conformidade à política comercial de distribuição. +300 XP.',
      whatHappened: 'Ordem de venda criada no canal atacadista 20 para o distribuidor Sul Informática.',
      why: 'O direcionamento correto para o canal 20 assegura o cumprimento de metas e políticas de revenda.',
      businessImpact: 'O distribuidor parceiro receberá a remessa com a condição Z28D homologada.'
    }
  },
  {
    id: 'SCN-28',
    code: 'TRN-121',
    title: 'Manutenção Preventiva de Preço Base PR00 na VK11',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'pricing_specialist',
    initialTcode: 'VK11',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Manutenção de Condição PR00 e Pedido: MinasTech (PO-MT-FIBRA-2026)',
    briefing: 'Olá! A MinasTech Automação Industrial (Cliente 100210) enviou a PO-MT-FIBRA-2026 solicitando 20 unidades de Cabo de Fibra Óptica (MAT-4099). Como este material é um item recém-cadastrado no portfólio de peças (Setor 02), ele ainda não possui registro de preço base PR00 na tabela de condições KONP. Acesse a transação VK11, crie a condição de preço PR00 no valor unitário de R$ 65,00 para a combinação Org. 1000 / Canal 10. Em seguida, acesse a VA01 e emita a ordem comercial para a MinasTech.',

    purchaseOrderDocument: {
      buyerName: 'MinasTech Automação Industrial Ltda (Belo Horizonte/MG)',
      buyerCnpj: '45.678.901/0001-23',
      poNumber: 'PO-MT-FIBRA-2026',
      operationType: 'Venda de Conectividade Industrial com Manutenção de Preço Base',
      itemsRequested: [
        { description: 'Cabo de Fibra Óptica 10m Duplex LC-LC Patch Cord (MAT-4099)', quantity: 20, unit: 'UN' }
      ],
      deliveryAddress: 'MinasTech - Centro de Engenharia e Montagem BH / MG',
      freightResponsibility: 'CIF - Frete por conta da NexusTech',
      paymentInstructions: '30 dias líquido (Z030) - Preço de tabela acordado: R$ 65,00/un'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Inicie na VK11 criando a condição PR00 para o material MAT-4099 com valor de R$ 65,00. Depois acesse a VA01 (Área 1000 / 10 / 02, Cliente 100210) e emita o pedido com 20 unidades.',

    sapKnowledgeBridge: {
      tcode: 'VK11 / VA01',
      tables: 'KONH / KONP / VBAK / VBAP',
      concept: 'Sem registro de condição PR00 ativo na tabela KONP, o esquema de cálculo de preços (Pricing Procedure) aborta a gravação da ordem por determinação incompleta. A transação VK11 alimenta esses registros mestres de preço.'
    },

    objectives: [
      { id: 'create_pricing_record', text: 'Cadastrar o registro de preço PR00 (R$ 65,00) na transação VK11', done: false },
      { id: 'set_org_structure', text: 'Configurar Área de Vendas 1000 / 10 / 02 e Tipo OR na VA01', done: false },
      { id: 'select_customer', text: 'Selecionar Cliente MinasTech (100210) e informar PO-MT-FIBRA-2026', done: false },
      { id: 'fill_terms', text: 'Definir Condição de Pagamento Z030 e Incoterms CIF', done: false },
      { id: 'add_item', text: 'Inserir 20 unidades do material MAT-4099 e gravar a ordem', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '02',
      customerId: '100210',
      customerPoNumber: 'PO-MT-FIBRA-2026',
      paymentTerms: 'Z030',
      incoterms: 'CIF',
      conditionCode: 'PR00',
      targetMaterialId: 'MAT-4099',
      targetAmount: 65.00,
      items: [
        { materialId: 'MAT-4099', quantity: 20, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Excelente atuação de ponta a ponta! Você cadastrou a regra de precificação PR00 na VK11 e em seguida gerou a ordem de venda perfeitamente precificada na VA01. +350 XP.',
      whatHappened: 'Registro de condição PR00 criado na VK11 e ordem de venda emitida na VA01.',
      why: 'A manutenção preventiva da tabela de condições elimina erros de determinação de preço nas transações de vendas.',
      businessImpact: 'A MinasTech teve seu pedido liberado imediatamente sem retenção por inconsistência de valores.'
    }
  },
  {
    id: 'SCN-30',
    code: 'TRN-123',
    title: 'Retificação de Desconto Comercial Autorizado (RB00) na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Aditivo Comercial: Aplicação de Desconto 8% na Ordem 10000050 - TechLog',
    briefing: 'Olá! A gerência comercial formalizou um aditivo para a distribuidora TechLog Soluções (Ordem nº 10000050), concedendo 8% de desconto comercial (condição RB00) em virtude da parceria anual. Acesse a transação VA02, abra a Ordem 10000050, aplique exatamente 8% de desconto comercial na posição do material MAT-2004 e salve as alterações.',

    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-RB00-REV',
      operationType: 'Aditivo de Condição Comercial em Ordem Aberta',
      itemsRequested: [
        { description: 'Switch Gigabit 24 Portas Managed Layer 3 (MAT-2004)', quantity: 15, unit: 'UN' }
      ],
      deliveryAddress: 'Centro de Distribuição Curitiba / PR',
      freightResponsibility: 'CIF - Entrega inclusa',
      paymentInstructions: '15 dias líquido (Z015) com desconto comercial homologado de 8%'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Abra a Ordem 10000050 na transação VA02. Na grade de itens, localize a linha do material MAT-2004, altere o campo Desconto (%) para 8 e clique em Salvar Ordem.',

    sapKnowledgeBridge: {
      tcode: 'VA02 / VA03',
      tables: 'VBAK / VBAP / KONP / CDHDR',
      concept: 'A condição RB00 representa descontos percentuais manuais ou automáticos negociados com clientes. Ao atualizar o percentual na VA02, o SAP SD recalcula a base tributária (ICMS/PIS/COFINS) e atualiza o total líquido da ordem.'
    },

    objectives: [
      { id: 'access_va02', text: 'Carregar a Ordem 10000050 na transação VA02', done: false },
      { id: 'apply_discount', text: 'Aplicar 8% de desconto comercial na linha do material MAT-2004', done: false },
      { id: 'save_order_modification', text: 'Salvar as alterações e verificar o recálculo do pedido', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000050',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '01',
        customerId: '100120',
        customerPoNumber: 'PO-TL-RB00-REV',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Curitiba',
        items: [
          { materialId: 'MAT-2004', quantity: 15, unitPrice: 1250.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 18750.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000050',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2004', quantity: 15, discountPercent: 8 }
      ],
      action: 'SALES_ORDER_MODIFICATION'
    },

    completionFeedback: {
      mentorSpeech: 'Retificação de desconto concluída com precisão! Você aplicou o desconto de 8% na VA02, recalculando perfeitamente a precificação comercial e os impostos da ordem. +300 XP.',
      whatHappened: 'Desconto comercial RB00 de 8% atualizado na Ordem 10000050 via VA02.',
      why: 'O recálculo automático garantiu a nova base de faturamento acordada com o distribuidor.',
      businessImpact: 'A TechLog receberá a fatura com o valor líquido ajustado conforme a negociação anual.'
    }
  },
  {
    id: 'SCN-31',
    code: 'TRN-124',
    title: 'Regularização de Incoterms e Termos de Pagamento na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Regularização Contratual: Ordem 10000052 - Metalúrgica Paulista (Z060 / FOB)',
    briefing: 'A auditoria de contratos identificou que a Ordem nº 10000052 da Indústria Metalúrgica Paulista (Cliente 100088) foi lançada com modalidade CIF e prazo Z030, em desacordo com o contrato mestre que estabelece retirada pelo comprador (FOB) e prazo estendido de 60 dias (Z060). Acesse a VA02, corrija a Condição de Pagamento para Z060 e o Incoterms para FOB no cabeçalho da ordem, e salve o documento regularizado.',

    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '98.765.432/0001-11',
      poNumber: 'PO-MP-TERMS-FIX',
      operationType: 'Regularização de Cláusulas Comerciais de Frete e Pagamento',
      itemsRequested: [
        { description: 'Servidor Rack 1U Nexus Edge Entry (Single Xeon 32GB) (MAT-1010)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Fábrica Campinas - Portão 3 Logística',
      freightResponsibility: 'FOB - Retirada na origem pelo transportador do comprador',
      paymentInstructions: '60 dias líquido (Z060) conforme contrato corporativo'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na transação VA02, abra a Ordem 10000052. No cabeçalho, altere a Condição de Pagamento para Z060 e o Incoterms para FOB. Em seguida, clique em Salvar Ordem.',

    sapKnowledgeBridge: {
      tcode: 'VA02 / XD03',
      tables: 'VBAK (Cabeçalho da Ordem), KNVV (Dados de Vendas)',
      concept: 'Campos de cabeçalho como Incoterms e Condição de Pagamento afetam diretamente o faturamento e a responsabilidade civil do frete. Divergências devem ser corrigidas na VA02 antes da emissão da remessa.'
    },

    objectives: [
      { id: 'access_va02', text: 'Carregar a Ordem 10000052 na transação VA02', done: false },
      { id: 'modify_payment_terms', text: 'Retificar a condição de pagamento do cabeçalho para Z060', done: false },
      { id: 'modify_incoterms', text: 'Retificar o Incoterms para FOB no cabeçalho', done: false },
      { id: 'save_order_modification', text: 'Salvar as alterações e confirmar a conformidade contratual', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000052',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100088',
        customerPoNumber: 'PO-MP-TERMS-FIX',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'Campinas',
        items: [
          { materialId: 'MAT-1010', quantity: 2, unitPrice: 4200.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 8400.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000052',
      paymentTerms: 'Z060',
      incoterms: 'FOB',
      items: [
        { materialId: 'MAT-1010', quantity: 2 }
      ],
      action: 'SALES_ORDER_MODIFICATION'
    },

    completionFeedback: {
      mentorSpeech: 'Regularização contratual executada com perfeição! Você alinhou a ordem aos termos FOB e Z060 na VA02, prevenindo litígios de frete e divergências de cobrança. +300 XP.',
      whatHappened: 'Condição de pagamento Z060 e frete FOB atualizados na Ordem 10000052.',
      why: 'O alinhamento tempestivo dos termos contratuais evita cobranças indevidas de frete no faturamento.',
      businessImpact: 'A Metalúrgica Paulista fará a retirada da carga conforme cronograma sem atritos contábeis.'
    }
  },
  {
    id: 'SCN-32',
    code: 'TRN-125',
    title: 'Expedição Regional no Centro Sul (Ponto de Expedição 2000)',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VL01N',

    sender: 'Eduardo Silva (Coordenação de Logística & Expedição CD Sul)',
    emailSubject: 'EXPEDIÇÃO REGIONAL: Gerar Fornecimento para Ordem 10000055 - CD Sul (Pto 2000)',
    briefing: 'A Ordem de Venda nº 10000055 referente a 2 Nobreaks Rackmount (MAT-1090) para a Sul Distribuidora tem fornecimento alocado no Centro Sul (Planta 2000). A equipe de logística precisa que você acesse a transação VL01N, informe o Ponto de Expedição 2000 (CD Sul - Curitiba) e o número da Ordem 10000055 para gerar o documento de remessa de saída correspondente.',

    purchaseOrderDocument: {
      buyerName: 'Sul Distribuidora de Informática Ltda (Joinville/SC)',
      buyerCnpj: '56.789.012/0001-34',
      poNumber: 'PO-SDI-SUL-2000',
      operationType: 'Expedição Logística Regional a partir da Planta Sul 2000',
      itemsRequested: [
        { description: 'Nobreak Online Dupla Conversão 10kVA Rackmount (MAT-1090)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'CD Sul Distribuição Joinville / SC',
      freightResponsibility: 'CIF - Transporte rodoviário regional a partir de Curitiba',
      paymentInstructions: '28 dias líquido (Z28D)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Acesse a transação VL01N. Como esta ordem é atendida pelo centro de distribuição do Sul, informe obrigatoriamente o Ponto de Expedição 2000 e o número da ordem 10000055.',

    sapKnowledgeBridge: {
      tcode: 'VL01N',
      tables: 'TVST (Pontos de Expedição), LIKP (Cabeçalho de Remessa), LIPS (Itens de Remessa)',
      concept: 'O Ponto de Expedição (VSTEL) é a unidade organizacional responsável pela expedição física da mercadoria. O SAP determina o ponto com base na condição de expedição do cliente, grupo de carregamento do material e centro fornecedor.'
    },

    objectives: [
      { id: 'access_vl01n', text: 'Acessar a transação VL01N', done: false },
      { id: 'select_shipping_point', text: 'Informar o Ponto de Expedição 2000 (CD Sul)', done: false },
      { id: 'create_delivery', text: 'Gerar o documento de remessa para a Ordem 10000055', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000055',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '01',
        customerId: '100240',
        customerPoNumber: 'PO-SDI-SUL-2000',
        paymentTerms: 'Z28D',
        incoterms: 'CIF',
        incotermsLocation: 'Joinville',
        items: [
          { materialId: 'MAT-1090', quantity: 2, unitPrice: 7800.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 15600.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000055',
      shippingPoint: '2000',
      action: 'CREATE_DELIVERY'
    },

    completionFeedback: {
      mentorSpeech: 'Remessa regional gerada com êxito! Você selecionou o Ponto de Expedição 2000 na VL01N e encaminhou a carga corretamente para o armazém regional do Sul. +300 XP.',
      whatHappened: 'Documento de remessa gerado a partir do Ponto de Expedição 2000.',
      why: 'O direcionamento logístico correto respeita a rota regional e minimiza prazos de entrega.',
      businessImpact: 'A carga de nobreaks sairá do CD Curitiba diretamente para Joinville com custo de frete reduzido.'
    }
  },
  {
    id: 'SCN-33',
    code: 'TRN-126',
    title: 'Conferência de Romaneio, Pesagem e Baixa Física (PGI) na VL02N',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VL02N',

    sender: 'Eduardo Silva (Coordenação de Logística & Expedição CD SP)',
    emailSubject: 'CONFERÊNCIA DE EXPEDIÇÃO: Confirmar Picking e PGI na Remessa 80000060',
    briefing: 'A remessa nº 80000060 (Ordem 10000058 da Varejo Eletro Brasil) já foi separada fisicamente pelos operadores de empilhadeira no CD SP. O romaneio de pesagem e conferência dos 5 switches gerenciáveis (MAT-2004) está aprovado pela doca. Acesse a transação VL02N, abra a remessa 80000060, confirme o picking das 5 unidades e clique em "Registrar Saída de Mercadorias (PGI)" para dar baixa no estoque e encerrar a etapa de expedição.',

    purchaseOrderDocument: {
      buyerName: 'Varejo Eletro Brasil Ltda (Matriz SP)',
      buyerCnpj: '12.345.678/0001-90',
      poNumber: 'PO-EB-PGI-60',
      operationType: 'Baixa Física e Fiscal de Estoque (Post Goods Issue / PGI)',
      itemsRequested: [
        { description: 'Switch Gigabit 24 Portas Managed Layer 3 (MAT-2004)', quantity: 5, unit: 'UN' }
      ],
      deliveryAddress: 'Av. das Nações Unidas, 14200 - São Paulo/SP',
      freightResponsibility: 'CIF - Transporte rodoviário fretado pela NexusTech',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Acesse a transação VL02N com a Remessa 80000060. Verifique se as 5 unidades estão conferidas e clique no botão verde "Registrar Saída de Mercadorias (PGI)".',

    sapKnowledgeBridge: {
      tcode: 'VL02N',
      tables: 'LIKP (Status de Remessa), MKPF / MSEG (Movimento Contábil 601)',
      concept: 'O Post Goods Issue (PGI) desencadeia o movimento contábil 601, transferindo a propriedade do estoque para o cliente e gerando os lançamentos contábeis de Custo das Mercadorias Vendidas (CPV).'
    },

    objectives: [
      { id: 'access_vl02n', text: 'Carregar a Remessa 80000060 na transação VL02N', done: false },
      { id: 'confirm_picking', text: 'Conferir a quantidade separada de 5 unidades', done: false },
      { id: 'post_goods_issue', text: 'Registrar a Saída de Mercadorias (PGI / Mov. 601)', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000058',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100045',
        customerPoNumber: 'PO-EB-PGI-60',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'São Paulo',
        items: [
          { materialId: 'MAT-2004', quantity: 5, unitPrice: 1250.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 6250.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    initialDeliveries: [
      {
        deliveryNumber: '80000060',
        salesOrderNumber: '10000058',
        shippingPoint: '1000',
        customerId: '100045',
        autoPgi: false,
        items: [
          { materialId: 'MAT-2004', quantity: 5 }
        ]
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000058',
      action: 'POST_GOODS_ISSUE'
    },

    completionFeedback: {
      mentorSpeech: 'Saída de mercadorias confirmada com maestria! O PGI na VL02N baixou o saldo do almoxarifado via movimento 601 e liberou o caminhão para o trajeto da entrega. +300 XP.',
      whatHappened: 'Post Goods Issue (PGI) registrado com sucesso para a Remessa 80000060.',
      why: 'O registro do PGI oficializa a saída física e contábil das mercadorias da empresa.',
      businessImpact: 'A carga segue protegida com romaneio validado e o faturamento na VF01 está liberado.'
    }
  },
  {
    id: 'SCN-34',
    code: 'TRN-127',
    title: 'Faturamento Comercial F2 de Remessa Concluída na VF01',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: null,
    initialTcode: 'VF01',

    sender: 'Beatriz Albuquerque (Auditoria Fiscal & Faturamento)',
    emailSubject: 'FATURAMENTO COMERCIAL: Emitir Fatura F2 para Remessa 80000065 - Metalúrgica Paulista',
    briefing: 'A remessa nº 80000065 da Indústria Metalúrgica Paulista (Ordem 10000062 - 1 Servidor Enterprise MAT-1001) teve a saída de mercadorias concluída na doca e está pronta para encerramento fiscal. Acesse a transação VF01, selecione o Tipo de Faturamento F2 (Fatura Comercial / NF), informe o número do documento de fornecimento 80000065 e gere a fatura comercial correspondente para faturamento e integração contábil.',

    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '98.765.432/0001-11',
      poNumber: 'PO-MP-FOB-BILL',
      operationType: 'Emissão de Fatura Comercial (Billing Type F2) para Fornecimento Concluído',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB) (MAT-1001)', quantity: 1, unit: 'UN' }
      ],
      deliveryAddress: 'Fábrica Campinas - Portão 3 Logística',
      freightResponsibility: 'FOB - Retirada na origem (sem destaque de frete pela NexusTech)',
      paymentInstructions: '60 dias líquido (Z060)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Acesse a transação VF01. Selecione o Tipo de Faturamento F2, insira o número da remessa 80000065 como documento de referência e clique em Gravar Fatura.',

    sapKnowledgeBridge: {
      tcode: 'VF01 / VF03',
      tables: 'VBRK (Cabeçalho de Faturamento), VBRP (Itens de Faturamento), BKPF (Documento Contábil FI)',
      concept: 'O faturamento (VF01) encerra a cadeia comercial em SD e gera automaticamente os lançamentos no módulo contábil e financeiro (FI-AR) em contas a receber.'
    },

    objectives: [
      { id: 'access_vf01', text: 'Acessar a transação VF01', done: false },
      { id: 'select_billing_type', text: 'Selecionar o Tipo de Faturamento F2', done: false },
      { id: 'create_invoice', text: 'Emitir a Fatura Comercial para a Remessa 80000065', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000062',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100088',
        customerPoNumber: 'PO-MP-FOB-BILL',
        paymentTerms: 'Z060',
        incoterms: 'FOB',
        incotermsLocation: 'CD NexusTech SP',
        items: [
          { materialId: 'MAT-1001', quantity: 1, unitPrice: 8500.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 8500.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    initialDeliveries: [
      {
        deliveryNumber: '80000065',
        salesOrderNumber: '10000062',
        shippingPoint: '1000',
        customerId: '100088',
        autoPgi: true,
        items: [
          { materialId: 'MAT-1001', quantity: 1 }
        ]
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000062',
      billingType: 'F2',
      action: 'CREATE_INVOICE'
    },

    completionFeedback: {
      mentorSpeech: 'Faturamento comercial emitido com precisão impecável! A Fatura F2 foi gerada na VF01, concluindo o ciclo Order-to-Cash com integração contábil completa. +300 XP.',
      whatHappened: 'Fatura Comercial F2 emitida para a remessa expedida sob modalidade FOB.',
      why: 'A emissão da fatura encerra o ciclo de fornecimento e gera os títulos a receber no financeiro.',
      businessImpact: 'A Nota Fiscal Eletrônica foi escriturada e a cobrança programada para vencimento em 60 dias.'
    }
  },
  {
    id: 'SCN-35',
    code: 'DSF-207',
    title: 'Desafio SLA: Diagnóstico Cadastral na XD03 e Expedição Urgente',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 6,
    xpReward: 450,
    badgeReward: 'fast_responder',
    initialTcode: 'XD03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'DESAFIO SLA (6 MIN): Expedição Urgente de Servidores para DataCore Cloud',
    briefing: 'Chamado de Emergência com SLA! O cliente DataCore Cloud & Datacenters (Cliente 100180) solicitou despacho urgente para a Ordem de Venda nº 10000065 (2 Servidores Rack 1U - MAT-1010) para ampliação de capacidade no data center de Alphaville. Você tem 6 minutos no cronômetro de SLA para: consultar o cadastro do parceiro na XD03 e confirmar as condições de entrega e expedição, acessar a VL01N com o Ponto de Expedição 1000 e gerar a remessa de saída correspondente antes do encerramento da janela logística!',

    purchaseOrderDocument: {
      buyerName: 'DataCore Cloud & Datacenters Brasil Ltda (Barueri/SP)',
      buyerCnpj: '34.567.890/0001-12',
      poNumber: 'PO-DC-URG-2026',
      operationType: 'Expedição Expressa sob SLA com Validação Cadastral Prévia',
      itemsRequested: [
        { description: 'Servidor Rack 1U Nexus Edge Entry (Single Xeon 32GB) (MAT-1010)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'DataCore DC1 - Alphaville Barueri / SP',
      freightResponsibility: 'CIF - Despacho expresso rodoviário dedicado',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Aviso de Desafio com SLA (6 minutos): Consulte primeiro os dados de expedição do parceiro 100180 na XD03. Em seguida, acerte o Ponto de Expedição 1000 na VL01N para a Ordem 10000065 e gere a remessa com rapidez!',

    sapKnowledgeBridge: {
      tcode: 'XD03 / VL01N',
      tables: 'KNVV / VBAK / LIKP / LIPS',
      concept: 'Em operações expressas sob pressão de SLA, a consulta cadastral prévia evita erros de despacho logístico para centros de distribuição ou filiais equivocadas.'
    },

    objectives: [
      { id: 'check_customer_xd03', text: 'Validar dados de expedição do cliente 100180 na transação XD03', done: false },
      { id: 'access_vl01n', text: 'Acessar a transação VL01N com Ponto de Expedição 1000', done: false },
      { id: 'create_delivery', text: 'Gerar a remessa para a Ordem 10000065 dentro do tempo de SLA', done: false }
    ],

    initialDocuments: [
      {
        docNumber: '10000065',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100180',
        customerPoNumber: 'PO-DC-URG-2026',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Barueri',
        items: [
          { materialId: 'MAT-1010', quantity: 2, unitPrice: 4200.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 8400.00,
        overallStatus: 'OPEN',
        creditStatus: 'APPROVED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    targetCriteria: {
      targetDocNumber: '10000065',
      customerId: '100180',
      shippingPoint: '1000',
      action: 'CREATE_DELIVERY'
    },

    completionFeedback: {
      mentorSpeech: 'Extraordinária performance sob pressão de SLA! Você validou os dados cadastrais na XD03 e gerou o fornecimento na VL01N com velocidade e precisão militar, batendo o cronômetro do chamado. +450 XP.',
      whatHappened: 'Remessa de saída criada dentro do prazo de SLA de 6 minutos para a Ordem 10000065.',
      why: 'A rápida orquestração entre consulta cadastral e geração de fornecimento garantiu a saída do veículo.',
      businessImpact: 'O datacenter da DataCore em Alphaville recebeu os novos servidores sem indisponibilidade de rede.'
    }
  },
  {
    id: 'SCN-38',
    code: 'TRN-130',
    title: 'Sobreposição de Condição de Pagamento com Alçada na VA01',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'terms_negotiator',
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem de Compra Especial com Prazo Estendido: InovaCorp (PO-INOVA-Z60)',
    briefing: 'Olá! A InovaCorp Soluções Tecnológicas fechou a aquisição de 6 unidades do Roteador de Borda SD-WAN Multi-WAN (MAT-2010). O cliente está cadastrado sob a conta 100045, cujo mestre comercial em KNVV propõe automaticamente a condição Z030 (30 dias). Porém, em negociação formal autorizada pela diretoria comercial, foi concedido o prazo especial estendido de 60 dias líquido (Z060). Abra a VA01, preencha a estrutura comercial nacional (1000/10/01), selecione o parceiro 100045, sobreponha manualmente o campo Condição de Pagamento de Z030 para Z060 no cabeçalho e lance os itens com frete CIF!',

    purchaseOrderDocument: {
      buyerName: 'InovaCorp Soluções Tecnológicas (Varejo Eletro Brasil - Conta Corp)',
      buyerCnpj: '12.345.678/0001-90',
      poNumber: 'PO-INOVA-Z60',
      operationType: 'Venda Comercial com Alçada de Prazo Estendido Autorizada',
      itemsRequested: [
        { description: 'Roteador de Borda SD-WAN Gigabit Multi-WAN (MAT-2010)', quantity: 6, unit: 'UN' }
      ],
      deliveryAddress: 'Av. das Nações Unidas, 14200 - São Paulo/SP',
      freightResponsibility: 'CIF - Entrega e seguro por conta da NexusTech',
      paymentInstructions: '60 dias líquido (Z060) - Aprovado formalmente pela Diretoria Comercial'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Ao selecionar o cliente 100045 na VA01, observe que o sistema puxa Z030 por padrão. Altere manualmente o campo ZTERM para Z060 antes de simular e gravar. Isso demonstra o domínio sobre a sobreposição de dados mestres em SD!',

    sapKnowledgeBridge: {
      tcode: 'VA01 / XD03',
      tables: 'VBAK (Cabeçalho da Ordem), KNVV (Dados de Vendas do Cliente)',
      concept: 'No SAP SD, os dados mestres do cliente (tabela KNVV) propõem valores padrão para a ordem de venda. Contudo, usuários com perfil autorizado podem sobrepor a condição de pagamento (ZTERM) ou Incoterms diretamente no cabeçalho da ordem para refletir negociações pontuais com alçada.'
    },

    objectives: [
      { id: 'set_org_structure', text: 'Configurar Área de Vendas 1000 / 10 / 01 e Tipo de Ordem OR na VA01', done: false },
      { id: 'select_customer', text: 'Selecionar Cliente corporativo (100045) e informar Pedido PO-INOVA-Z60', done: false },
      { id: 'fill_terms', text: 'Sobrepor a Condição de Pagamento padrão para Z060 conforme alçada e Incoterms CIF', done: false },
      { id: 'add_item', text: 'Inserir 6 unidades do Roteador de Borda SD-WAN (MAT-2010)', done: false },
      { id: 'save_order', text: 'Simular os preços e gravar a ordem de venda com a nova condição de pagamento', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100045',
      customerPoNumber: 'PO-INOVA-Z60',
      paymentTerms: 'Z060',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2010', quantity: 6, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Perfeita sobreposição de parâmetros comerciais! Você manteve a rastreabilidade cadastral e aplicou o prazo estendido Z060 autorizado pela diretoria, demonstrando maturidade operacional em SD. +300 XP.',
      whatHappened: 'Ordem de venda gravada com condição Z060 sobreposta manualmente ao mestre do cliente.',
      why: 'A flexibilidade de sobreposição no cabeçalho permite atender alçadas comerciais sem necessidade de alterar o cadastro permanente do cliente.',
      businessImpact: 'O cliente receberá faturamento com vencimento correto em 60 dias sem gerar retrabalho contábil ou financeiro.'
    }
  },
  {
    id: 'SCN-41',
    code: 'TRN-133',
    title: 'Diagnóstico de Bloqueio O2C: Remessa sem Baixa Travando VF01',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'o2c_troubleshooter',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Chamado do Faturamento: Remessa 80000070 Travada sem Faturamento (VF01)',
    briefing: 'Atenção, trainee! O setor de faturamento entrou em contato relatando um impasse: a Ordem de Venda nº 10000070 para a DataCore Cloud possui a Remessa 80000070 gerada, mas a transação VF01 recusa a emissão da Nota Fiscal Comercial F2, exibindo mensagem de pré-requisito pendente. Acesse a VA03 para investigar o Fluxo de Documentos (VBFA). Descubra por que a expedição física ainda não liberou o faturamento, regularize a pendência na transação correspondente e conclua a emissão da fatura F2 na VF01.',

    purchaseOrderDocument: {
      buyerName: 'DataCore Cloud & Datacenters Brasil Ltda (Barueri/SP)',
      buyerCnpj: '34.567.890/0001-12',
      poNumber: 'PO-DC-PGI-PENDING',
      operationType: 'Expedição e Faturamento Comercial de Servidores Rack 1U',
      itemsRequested: [
        { description: 'Servidor Rack 1U Nexus Edge Entry (Single Xeon 32GB) (MAT-1010)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'DataCore DC1 - Alphaville Barueri / SP',
      freightResponsibility: 'CIF - Entrega expressa por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Abra a Ordem 10000070 na VA03 e observe o status da Remessa 80000070 no fluxo de documentos. Ela está criada, mas falta a Saída de Mercadorias (PGI / Movimento MM 601). Vá até a VL02N, confirme o picking e registre o PGI. Depois volte à VF01 e gere a fatura comercial F2!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VL02N / VF01',
      tables: 'VBAK / LIKP (Cabeçalho da Remessa) / VBRK (Faturamento) / VBFA (Fluxo de Documentos)',
      concept: 'No ciclo padrão Order-to-Cash (O2C) relevante para remessa, o faturamento comercial (VF01) exige como pré-requisito mandatório a conclusão da Saída de Mercadorias (Post Goods Issue - PGI). Sem a baixa contábil do estoque físico (movimento 601), o SAP impede a geração da Nota Fiscal.'
    },

    initialDocuments: [
      {
        docNumber: '10000070',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100180',
        customerPoNumber: 'PO-DC-PGI-PENDING',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Barueri',
        items: [
          { materialId: 'MAT-1010', quantity: 2, unitPrice: 4200.00, manualDiscountPercent: 0, manualFreight: 0 }
        ],
        totalValue: 10689.00,
        netValue: 8400.00,
        taxValue: 2289.00,
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'IN_PROCESS',
        billingStatus: 'NOT_BILLED'
      }
    ],

    initialDeliveries: [
      {
        deliveryNumber: '80000070',
        salesOrderNumber: '10000070',
        shippingPoint: '1000',
        customerId: '100180',
        autoPgi: false,
        items: [
          { materialId: 'MAT-1010', quantity: 2 }
        ]
      }
    ],

    objectives: [
      { id: 'check_flow_va03', text: 'Consultar a Ordem 10000070 na VA03 e verificar o Fluxo de Documentos (VBFA)', done: false },
      { id: 'post_goods_issue', text: 'Acessar a transação VL02N e executar a Saída de Mercadorias (PGI) para a Remessa 80000070', done: false },
      { id: 'create_invoice', text: 'Acessar a transação VF01 e emitir a Fatura Comercial F2', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000070',
      billingType: 'F2',
      action: 'CREATE_INVOICE'
    },

    completionFeedback: {
      mentorSpeech: 'Diagnóstico e resolução impecáveis! Você identificou no fluxo documental a falta do PGI na expedição, realizou a baixa na VL02N e liberou o faturamento na VF01 com total conformidade. +350 XP.',
      whatHappened: 'Saída de mercadorias registrada na VL02N e fatura comercial emitida na VF01 para a ordem 10000070.',
      why: 'O faturamento depende estritamente da baixa física do estoque para manter a consistência contábil entre MM, SD e FI.',
      businessImpact: 'O cliente recebeu a Nota Fiscal Eletrônica e os produtos foram despachados legalmente com manifesto de carga.'
    }
  },
  {
    id: 'SCN-42',
    code: 'TRN-134',
    title: 'Ajuste de Preço e Desconto por Volume com Alçada na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'volume_negotiator',
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Aditivo Comercial de Grande Volume: TechLog Soluções (Ordem 10000072)',
    briefing: 'Olá, trainee! A distribuidora TechLog Soluções (Cliente 100120) enviou um aditivo comercial urgente para a Ordem de Venda nº 10000072. Eles ampliaram o pedido inicial de 20 para 60 unidades do SSD Server Grade 3.84TB (MAT-3010). Conforme nossa política comercial de atacado, pedidos acima de 50 unidades possuem alçada aprovada para concessão de 10% de desconto comercial na condição RB00. Abra a VA02, carregue a ordem 10000072, ajuste a quantidade para 60 unidades, aplique o desconto de 10%, simule o recálculo dos impostos e grave a alteração!',

    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-VOL-2026',
      operationType: 'Aditivo Comercial com Ampliação de Escala e Desconto por Volume',
      itemsRequested: [
        { description: 'SSD NVMe Server Grade 3.84TB U.2 Enterprise (MAT-3010)', quantity: 60, unit: 'UN' }
      ],
      deliveryAddress: 'Rua das Indústrias, 500 - Curitiba/PR',
      freightResponsibility: 'CIF - Centro de Distribuição Curitiba',
      paymentInstructions: '15 dias líquido (Z015) com desconto comercial de volume de 10%'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Acesse a VA02 e selecione a Ordem 10000072. Na aba de Posições, mude a quantidade de 20 para 60 e defina o desconto manual para 10%. Clique em "Recalcular Preço" para conferir a base de impostos antes de gravar.',

    sapKnowledgeBridge: {
      tcode: 'VA02 / XD03',
      tables: 'VBAK / VBAP (Posições da Ordem) / KONV (Condições de Preço da Ordem)',
      concept: 'Ao alterar posições na VA02, o SAP SD executa uma atualização do esquema de cálculo (Pricing Update). A inserção de descontos comerciais por volume (RB00) requer validação de alçadas e recalcula automaticamente o ICMS e PIS/COFINS sobre a nova base líquida.'
    },

    initialDocuments: [
      {
        docNumber: '10000072',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '01',
        customerId: '100120',
        customerPoNumber: 'PO-TL-VOL-2026',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Curitiba',
        items: [
          { materialId: 'MAT-3010', quantity: 20, manualDiscountPercent: 0 }
        ],
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'access_va02', text: 'Localizar e abrir a Ordem de Venda 10000072 na transação VA02', done: false },
      { id: 'update_order_quantity', text: 'Ajustar a quantidade da posição de 20 para 60 unidades de MAT-3010', done: false },
      { id: 'apply_volume_discount', text: 'Inserir o desconto comercial de 10% na condição RB00 conforme alçada de volume', done: false },
      { id: 'save_modified_order', text: 'Simular o recálculo de impostos e gravar a ordem alterada na VA02', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000072',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-3010', quantity: 60, discountPercent: 10 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Excelente gestão comercial! Você atualizou o volume do pedido, aplicou a política de desconto por escala e garantiu que o recálculo fiscal fosse realizado com absoluta integridade. +300 XP.',
      whatHappened: 'Ordem 10000072 alterada para 60 unidades com 10% de desconto comercial RB00.',
      why: 'Alterações de quantidade exigem recálculo automático da estrutura de preços e impostos proporcionais.',
      businessImpact: 'A venda em escala foi formalizada com margem protegida e reserva de estoque ampliada no CD.'
    }
  },
  {
    id: 'SCN-43',
    code: 'TRN-135',
    title: 'Venda Governamental com Empenho Obrigatório (BSTNK)',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 250,
    badgeReward: 'public_sector_pro',
    initialTcode: 'VA01',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Licitação e Nota de Empenho Homologada: Prefeitura Nova Esperança (EMP-2026-99881)',
    briefing: 'Olá! Vencemos o pregão eletrônico da Prefeitura Municipal de Nova Esperança (Cliente 100650) para fornecimento de 4 Servidores Enterprise Nexus Pro X (MAT-1001) para a Secretaria de Educação. No setor público (B2G), a legislação e o Tribunal de Contas exigem que o número exato da Nota de Empenho conste no campo "Nº Pedido de Compra do Cliente" (BSTNK) para fins de liquidação orçamentária e emissão do DANFE. Acesse a VA01, selecione a estrutura comercial (1000/10/01), informe o cliente 100650, preencha rigorosamente o BSTNK como "EMP-2026-99881", selecione o prazo Z060 e frete CIF e lance os 4 servidores!',

    purchaseOrderDocument: {
      buyerName: 'Prefeitura Municipal de Nova Esperança (Secretaria de Educação)',
      buyerCnpj: '55.667.788/0001-33',
      poNumber: 'EMP-2026-99881',
      operationType: 'Fornecimento para Órgão Público Municipal sob Nota de Empenho',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB) (MAT-1001)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Secretaria Municipal de Educação e Tecnologia - Nova Esperança/SP',
      freightResponsibility: 'CIF - Entrega e descarga no almoxarifado da Secretaria',
      paymentInstructions: '60 dias líquido (Z060) - Liquidação orçamentária por empenho'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: No campo "Nº Pedido do Cliente" (BSTNK), digite exatamente EMP-2026-99881. Sem essa informação idêntica ao empenho, o fiscal de contratos da Prefeitura glosará a entrega e recusará a Nota Fiscal.',

    sapKnowledgeBridge: {
      tcode: 'VA01',
      tables: 'VBAK (Campo BSTNK - Customer Purchase Order Number)',
      concept: 'Em vendas governamentais e corporativas formais, o campo BSTNK transporta a amarração jurídica do contrato para a Nota Fiscal Eletrônica (tag xPed). A divergência nesse campo inviabiliza o recebimento físico e a liquidação do contas a pagar público.'
    },

    objectives: [
      { id: 'set_org_structure', text: 'Definir Org. Vendas 1000, Canal 10, Setor 01 e Tipo OR na VA01', done: false },
      { id: 'select_customer', text: 'Selecionar Cliente Prefeitura Nova Esperança (100650) e preencher BSTNK EMP-2026-99881', done: false },
      { id: 'fill_terms', text: 'Selecionar Condição de Pagamento Z060 e Incoterms CIF', done: false },
      { id: 'add_item', text: 'Adicionar 4 unidades do Servidor Enterprise Nexus Pro X (MAT-1001)', done: false },
      { id: 'save_order', text: 'Simular os preços e gravar a ordem de venda governamental', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100650',
      customerPoNumber: 'EMP-2026-99881',
      paymentTerms: 'Z060',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-1001', quantity: 4, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Conformidade fiscal perfeita! A ordem foi emitida com a identificação formal do empenho no BSTNK, atendendo rigorosamente às exigências de contratação pública. Parabéns! +250 XP.',
      whatHappened: 'Ordem emitida para a Prefeitura de Nova Esperança com vinculação do Empenho EMP-2026-99881.',
      why: 'O número de empenho no cabeçalho garante a rastreabilidade exigida pelos órgãos de controle fiscal.',
      businessImpact: 'A entrega dos servidores será recebida pelo almoxarifado público sem risco de recusa ou glosa orçamentária.'
    }
  },
  {
    id: 'SCN-45',
    code: 'DSF-208',
    title: 'Desafio SLA: Liberação de Crédito com Parecer e Expedição Crítica',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 5,
    xpReward: 450,
    badgeReward: 'fast_credit_commander',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'DESAFIO SLA (5 MIN): Despacho Crítico com Parecer de Crédito - Metal Paulista',
    briefing: 'Chamado Urgente sob SLA de 5 minutos! A Indústria Metalúrgica Paulista (Cliente 100088) está com a produção ameaçada de parada por queima de nobreaks de data center. A Ordem de Venda nº 10000075 (2 Nobreaks 10kVA - MAT-1090) foi cadastrada, mas está retida na expedição por bloqueio de crédito na VKM1. O cronômetro de 5 minutos está correndo: consulte o bloqueio na VA03, acesse a VKM1 e aprove a liberação supervisionada com parecer comercial, crie o fornecimento na VL01N (Ponto de Expedição 1000) e registre a Saída de Mercadorias (PGI) na VL02N antes de estourar o SLA!',

    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '98.765.432/0001-11',
      poNumber: 'PO-MP-CRIT-01',
      operationType: 'Despacho Crítico com Liberação de Crédito e Expedição Imediata',
      itemsRequested: [
        { description: 'Nobreak Online Dupla Conversão 10kVA Rackmount (MAT-1090)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Fábrica Campinas - Portão 3 Logística',
      freightResponsibility: 'FOB - Coleta urgente pelo cliente',
      paymentInstructions: '60 dias líquido (Z060) - Liberação supervisionada por alçada'
    },

    mentorInitialTip: 'Aviso de Desafio com SLA (5 minutos): Inicie na VA03 para confirmar a ordem 10000075. Vá rapidamente à VKM1 e libere a ordem. Em seguida abra a VL01N com Ponto de Expedição 1000 e gere a remessa. Finalize na VL02N registrando o PGI para bater o cronômetro!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VKM1 / VL01N / VL02N',
      tables: 'VBAK / KNKK / LIKP / LIPS',
      concept: 'Em cenários de emergência operacional, a orquestração rápida entre liberação financeira de crédito (VKM1), geração do documento logístico de fornecimento (VL01N) e baixa contábil de saída (VL02N) viabiliza o atendimento sem violar as regras de governança corporativa.'
    },

    initialDocuments: [
      {
        docNumber: '10000075',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100088',
        customerPoNumber: 'PO-MP-CRIT-01',
        paymentTerms: 'Z060',
        incoterms: 'FOB',
        incotermsLocation: 'CD NexusTech SP',
        items: [
          { materialId: 'MAT-1090', quantity: 2, unitPrice: 7800.00 }
        ],
        totalValue: 19851.00,
        netValue: 15600.00,
        taxValue: 4251.00,
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'analyze_order', text: 'Consultar a Ordem 10000075 na VA03 e diagnosticar o bloqueio de crédito', done: false },
      { id: 'release_credit_order', text: 'Acessar a transação VKM1 e liberar a ordem retida com parecer comercial', done: false },
      { id: 'create_delivery', text: 'Acessar a transação VL01N e criar a remessa para a Ordem 10000075', done: false },
      { id: 'post_goods_issue', text: 'Registrar a Saída de Mercadorias (PGI) na VL02N dentro do tempo de SLA', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000075',
      shippingPoint: '1000',
      action: 'POST_GOODS_ISSUE'
    },

    completionFeedback: {
      mentorSpeech: 'Performance magistral sob pressão extrema! Você destravou o crédito na VKM1 e realizou o fornecimento e o PGI na VL01N/VL02N dentro do prazo estrito de 5 minutos, salvando a operação fabril do cliente. +450 XP.',
      whatHappened: 'Crédito liberado na VKM1, remessa gerada e PGI concluído dentro do prazo de SLA para a ordem 10000075.',
      why: 'A rápida integração entre o setor de crédito e a expedição garantiu o carregamento antes do corte logístico.',
      businessImpact: 'A Metalúrgica Paulista evitou a paralisação da sua fábrica e os equipamentos foram entregues sob protocolo de emergência.'
    }
  },
  {
    id: 'SCN-46',
    code: 'TRN-137',
    title: 'Diagnóstico de Causa Raiz: Ordem Corporativa Travada sem Expedição',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'root_cause_analyst',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Reclamação de Cliente Corporativo: AutoPeças Guanabara (Ordem 10000076)',
    briefing: 'Olá, trainee! O SAC abriu um chamado com prioridade alta: o cliente AutoPeças e Motores Guanabara (100750) relata que o pedido nº 10000076 foi emitido há 2 dias e a expedição não avançou. Acesse a transação VA03 para analisar o cabeçalho e diagnosticar a restrição ativa no status da ordem. Em seguida, acesse a transação VKM1 para tratar o bloqueio de crédito e registre a liberação supervisionada com parecer de governança.',

    purchaseOrderDocument: {
      buyerName: 'AutoPeças e Motores Guanabara S/A (Rio de Janeiro/RJ)',
      buyerCnpj: '77.889.900/0001-55',
      poNumber: 'PO-AG-PARADA-01',
      operationType: 'Investigação e Desbloqueio Comercial de Ordem Paralisada',
      itemsRequested: [
        { description: 'Placa de Rede Dual Port 10G SFP+ PCIe (MAT-3080)', quantity: 4, unit: 'UN' },
        { description: 'Fonte Redundante Hot-Plug 800W Titanium (MAT-3090)', quantity: 2, unit: 'UN' }
      ],
      deliveryAddress: 'Unidade Industrial São Cristóvão RJ',
      freightResponsibility: 'FOB - Retirada na origem pelo comprador',
      paymentInstructions: '30 dias direto (Z030) - Restrição cadastral temporária'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na VA03, verifique a aba de Status e o Fluxo de Documentos da Ordem 10000076. Você notará que o status de crédito consta como BLOCKED devido a restrições do parceiro. Abra a VKM1, analise a pendência e execute a liberação para destravar a expedição!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VKM1',
      tables: 'VBAK (Status da Ordem) / KNKK (Controle de Crédito)',
      concept: 'Muitas vezes, ordens aparentemente corretas não avançam para fornecimento porque estão retidas por travas preventivas de crédito. O consultor de SD deve saber diagnosticar na VA03 a exata natureza do bloqueio antes de acionar a área financeira ou de faturamento.'
    },

    initialDocuments: [
      {
        docNumber: '10000076',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '02',
        customerId: '100750',
        customerPoNumber: 'PO-AG-PARADA-01',
        paymentTerms: 'Z030',
        incoterms: 'FOB',
        incotermsLocation: 'Rio de Janeiro',
        items: [
          { materialId: 'MAT-3080', quantity: 4 },
          { materialId: 'MAT-3090', quantity: 2 }
        ],
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'analyze_order', text: 'Consultar a Ordem 10000076 na VA03 e verificar o bloqueio de crédito ativo', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e analisar o histórico financeiro e risco do cliente', done: false },
      { id: 'release_credit_order', text: 'Executar a liberação de crédito da Ordem 10000076 com parecer comercial supervisionado', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000076',
      customerId: '100750',
      action: 'CREDIT_RELEASE',
      requiresVkm1Release: true
    },

    completionFeedback: {
      mentorSpeech: 'Diagnóstico cirúrgico de causa raiz! Você identificou a trava financeira na VA03 e destravou o fluxo na VKM1 com parecer fundamentado, restabelecendo a confiança do cliente corporativo. +350 XP.',
      whatHappened: 'Ordem 10000076 diagnosticada e liberada do bloqueio de crédito na VKM1.',
      why: 'A liberação supervisionada formaliza a anuência comercial e reativa o documento para geração de remessa.',
      businessImpact: 'O Centro de Distribuição recebeu a ordem liberada e incluiu as placas de rede no plano de separação do dia.'
    }
  },
  {
    id: 'SCN-48',
    code: 'TRN-139',
    title: 'Diagnóstico de Erro de Preço: Condição Ausente e Recálculo na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'pricing_auditor',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem Incompleta por Falha de Precificação: MinasTech (Ordem 10000078)',
    briefing: 'Olá! Um assistente comercial registrou a Ordem de Venda nº 10000078 para o cliente MinasTech Automação (100210), mas o pedido ficou travado com status incompleto e valor total R$ 0,00. Investigue a ordem na VA03 para identificar qual material está sem determinação de preço base. Em seguida, acesse a transação VK11 e cadastre a condição de preço PR00 oficial no valor de R$ 65,00 para o Cabo de Fibra Óptica (MAT-4099). Por fim, acesse a transação VA02, recarregue a ordem 10000078 e grave as alterações para forçar o recálculo comercial de preços e tributos!',

    purchaseOrderDocument: {
      buyerName: 'MinasTech Automação Industrial Ltda (Belo Horizonte/MG)',
      buyerCnpj: '45.678.901/0001-23',
      poNumber: 'PO-MT-PRECO-ERR',
      operationType: 'Correção de Esquema de Cálculo e Atualização de Preço',
      itemsRequested: [
        { description: 'Cabo de Fibra Óptica 10m Duplex LC-LC Patch Cord (MAT-4099)', quantity: 20, unit: 'UN' }
      ],
      deliveryAddress: 'MinasTech - Centro de Engenharia e Montagem BH / MG',
      freightResponsibility: 'CIF - Entrega no destino por conta da NexusTech',
      paymentInstructions: '30 dias líquido (Z030) - Preço de tabela R$ 65,00/un'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Primeiro abra a VA03 e veja o item MAT-4099 com valor zero. Vá para a VK11, escolha Org 1000 / Canal 10, material MAT-4099, condição PR00 e valor R$ 65,00 e clique em Gravar. Depois abra a VA02 na ordem 10000078 e clique em Gravar Alterações para atualizar o documento!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VK11 / VA02',
      tables: 'KONP (Condições de Preço) / VBAK / VBAP',
      concept: 'Quando uma ordem é salva com itens sem condição de preço obrigatória (PR00), o sistema registra o documento com log de incompletude. O cadastramento posterior da condição na VK11 deve ser seguido de uma atualização de preços (Pricing Update) na VA02 para que a ordem apure o novo valor contábil.'
    },

    initialDocuments: [
      {
        docNumber: '10000078',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '02',
        customerId: '100210',
        customerPoNumber: 'PO-MT-PRECO-ERR',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'Belo Horizonte',
        items: [
          { materialId: 'MAT-4099', quantity: 20, manualDiscountPercent: 0 }
        ],
        netValue: 0.00,
        taxValue: 0.00,
        totalValue: 0.00,
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'analyze_order', text: 'Consultar a Ordem 10000078 na VA03 e identificar o preço zerado por falta de PR00', done: false },
      { id: 'create_pricing_record', text: 'Acessar a transação VK11 e cadastrar a condição PR00 (R$ 65,00) para MAT-4099', done: false },
      { id: 'access_va02', text: 'Abrir a Ordem 10000078 na transação VA02', done: false },
      { id: 'save_modified_order', text: 'Gravar a ordem na VA02 para forçar o recálculo do esquema de preços e impostos', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000078',
      targetMaterialId: 'MAT-4099',
      targetAmount: 65.00,
      targetNetValue: 1300.00,
      paymentTerms: 'Z030',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-4099', quantity: 20 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Solução magistral de ciclo de preços! Você identificou a falta de PR00 no mestre, realizou o cadastro na VK11 e forçou o recálculo na VA02, regularizando o documento contábil com maestria. +350 XP.',
      whatHappened: 'Condição PR00 cadastrada na VK11 e ordem 10000078 recalculada e salva na VA02.',
      why: 'O cadastramento da condição de preço na tabela KONP permite que o motor de precificação determine o valor bruto e liquide os impostos devidos.',
      businessImpact: 'A ordem da MinasTech foi destravada e liberada para emissão de remessa e faturamento regular.'
    }
  },
  {
    id: 'SCN-49',
    code: 'TRN-140',
    title: 'Decisão de Risco Comercial: Análise de Limite vs Histórico na XD03',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 400,
    badgeReward: 'credit_risk_master',
    initialTcode: 'XD03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Decisão de Risco Comercial e Liberação: Varejo Eletro Brasil (Ordem 10000080)',
    briefing: 'Olá, trainee! O cliente Varejo Eletro Brasil (100045) fechou um pedido de grande porte: 12 Servidores Enterprise Nexus Pro X (MAT-1001), totalizando mais de R$ 120.000,00. A ordem nº 10000080 foi retida na VKM1 por ultrapassar o limite global de crédito aprovado. Consulte os dados cadastrais e financeiros do parceiro na transação XD03. Avalie a Categoria de Risco e a pontualidade histórica do cliente. Diante do histórico exemplar de pagamentos, tome a decisão executiva na transação VKM1 e aprove a liberação supervisionada com parecer comercial fundamentado!',

    purchaseOrderDocument: {
      buyerName: 'Varejo Eletro Brasil Ltda (Matriz SP)',
      buyerCnpj: '12.345.678/0001-90',
      poNumber: 'PO-EB-EXP-105K',
      operationType: 'Análise de Risco Comercial e Alçada de Liberação de Crédito',
      itemsRequested: [
        { description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB) (MAT-1001)', quantity: 12, unit: 'UN' }
      ],
      deliveryAddress: 'Av. das Nações Unidas, 14200 - São Paulo/SP',
      freightResponsibility: 'CIF - Entrega dedicada por conta da NexusTech',
      paymentInstructions: '30 dias líquido (Z030) - Limite de Crédito BR01 Excedido'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na XD03, selecione o cliente 100045 e clique na aba Controle de Crédito. Veja que a Categoria de Risco é A (Baixo Risco) e o histórico é 100% pontual. Com essa evidência, abra a VKM1 e libere a Ordem 10000080 com segurança comercial!',

    sapKnowledgeBridge: {
      tcode: 'XD03 / VKM1',
      tables: 'KNKK (Controle de Crédito) / KNA1 / VBAK',
      concept: 'A governança de crédito no SAP SD não visa apenas travar vendas, mas permitir decisões comerciais embasadas. Clientes com Categoria de Risco A e bom histórico de pagamento podem ter ordens liberadas com parecer de alçada mesmo excedendo pontualmente a linha de crédito padrão.'
    },

    initialDocuments: [
      {
        docNumber: '10000080',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100045',
        customerPoNumber: 'PO-EB-EXP-105K',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'São Paulo',
        items: [
          { materialId: 'MAT-1001', quantity: 12, unitPrice: 8500.00 }
        ],
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'check_customer', text: 'Consultar os dados de crédito e categoria de risco do cliente 100045 na XD03', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e analisar o excesso de limite da Ordem 10000080', done: false },
      { id: 'release_credit_order', text: 'Executar a liberação de crédito da Ordem 10000080 com parecer baseado no Risco A', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000080',
      customerId: '100045',
      action: 'CREDIT_RELEASE',
      requiresVkm1Release: true
    },

    completionFeedback: {
      mentorSpeech: 'Postura executiva de alto nível! Você avaliou a exposição financeira na XD03, reconheceu a solidez do cliente de Risco A e deliberou a liberação comercial na VKM1 com segurança e equilíbrio entre receita e risco. +400 XP.',
      whatHappened: 'Ordem 10000080 liberada na VKM1 após fundamentação de baixo risco na XD03.',
      why: 'O histórico de pagamentos e a classificação de risco justificam a concessão de limite operacional temporário.',
      businessImpact: 'A NexusTech garantiu uma venda estratégica de R$ 129.000,00 sem expor a operação a inadimplência real.'
    }
  },
  {
    id: 'SCN-50',
    code: 'TRN-141',
    title: 'Diagnóstico Logístico: Remessa no Ponto de Expedição Regional',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'shipping_specialist',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Falha de Remessa Regional: Centro Sul 2000 (Ordem 10000082)',
    briefing: 'Olá, trainee! O assistente da expedição abriu um chamado urgente: a Ordem de Venda nº 10000082 para a EletroPeças Brasil (100600) está gravada e confirmada, mas ao tentar criar o fornecimento na VL01N o sistema acusa erro informando que nenhum item foi selecionado. Acesse a transação VA03 para consultar o cabeçalho e os itens da ordem. Identifique a qual Centro de Distribuição e filial os itens foram atribuídos, vá para a transação VL01N, informe o Ponto de Expedição correspondente (2000 - CD Regional Sul) e gere a remessa com sucesso!',

    purchaseOrderDocument: {
      buyerName: 'EletroPeças Brasil Ltda (Filial Sul - Porto Alegre/RS)',
      buyerCnpj: '66.778.899/0002-44',
      poNumber: 'PO-EP-REG-2000',
      operationType: 'Expedição Descentralizada em Centro de Distribuição Regional',
      itemsRequested: [
        { description: 'Disco Rígido SAS 12Gbps 16TB 7.2K RPM 3.5 pol Enterprise (MAT-3020)', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'Av. Ipiranga, 4500 - Porto Alegre/RS',
      freightResponsibility: 'CIF - Entrega regional por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na VA03, observe que a ordem está vinculada à estrutura regional. Na tela inicial da VL01N, o Ponto de Expedição proposto vem como 1000 (CD Central SP). Altere para 2000 para carregar a ordem e gerar o fornecimento!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VL01N',
      tables: 'VBAK / VBAP (Centro MARC-WERKS) / TVST (Pontos de Expedição)',
      concept: 'No SAP SD/LE, a transação VL01N filtra as ordens de venda elegíveis com base estrita no Ponto de Expedição informado na tela de seleção. Se a ordem pertencer ao Centro 2000, tentar expedir pelo Ponto 1000 resultará em lista vazia de fornecimento.'
    },

    initialDocuments: [
      {
        docNumber: '10000082',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '02',
        customerId: '100600',
        customerPoNumber: 'PO-EP-REG-2000',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Porto Alegre',
        items: [
          { materialId: 'MAT-3020', quantity: 10 }
        ],
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'check_order_va03', text: 'Consultar a Ordem 10000082 na VA03 e verificar o Centro de Distribuição alocado', done: false },
      { id: 'access_vl01n', text: 'Acessar a transação VL01N e selecionar o Ponto de Expedição 2000', done: false },
      { id: 'create_delivery', text: 'Carregar a Ordem 10000082 e gravar o documento de remessa regional', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000082',
      shippingPoint: '2000',
      action: 'CREATE_DELIVERY'
    },

    completionFeedback: {
      mentorSpeech: 'Excelente diagnóstico logístico! Você identificou a amarração do Centro regional e direcionou o Ponto de Expedição 2000 na VL01N com precisão cirúrgica. Remessa gerada! +350 XP.',
      whatHappened: 'Remessa gerada com sucesso para a Ordem 10000082 no Ponto de Expedição 2000.',
      why: 'A determinação correta do Ponto de Expedição garante o direcionamento da separação para a equipe física do Centro de Distribuição correto.',
      businessImpact: 'A carga será separada no CD Sul sem atrasos operacionais ou custos de transferência entre filiais.'
    }
  },
  {
    id: 'SCN-52',
    code: 'TRN-143',
    title: 'Adequação Contratual de Modalidade de Frete (Incoterms) na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'freight_specialist',
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Retificação de Frete em Pedido Vivo: MinasTech Automação (Ordem 10000084)',
    briefing: 'Olá! A MinasTech Automação (Cliente 100210) entrou em contato para retificar a modalidade logística da Ordem de Venda nº 10000084 (30 Cabos DAC - MAT-4050). O pedido foi gravado com frete CIF por equívoco, mas o cliente já possui contrato de retirada com transportadora própria na portaria do nosso Centro de Distribuição. Acesse a transação VA02, altere o Incoterms de CIF para FOB, atualize o local de destino para "CD Central NexusTech SP" e grave as alterações!',

    purchaseOrderDocument: {
      buyerName: 'MinasTech Automação Industrial Ltda (Belo Horizonte/MG)',
      buyerCnpj: '45.678.901/0001-23',
      poNumber: 'PO-MT-FOB-RETIRA',
      operationType: 'Retificação Cadastral de Frete e Responsabilidade de Transporte',
      itemsRequested: [
        { description: 'Cabo DAC Direct Attach Copper 10G SFP+ 3 metros (MAT-4050)', quantity: 30, unit: 'UN' }
      ],
      deliveryAddress: 'Retirada no CD Central NexusTech SP (Portaria 2)',
      freightResponsibility: 'FOB - Coleta por conta e responsabilidade do comprador',
      paymentInstructions: '30 dias líquido (Z030)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Abra a VA02 na ordem 10000084. No cabeçalho, localize o campo Incoterms e troque de CIF para FOB. Lembre-se de gravar para atualizar o documento no SAP!',

    sapKnowledgeBridge: {
      tcode: 'VA02',
      tables: 'VBAK (Campos INCO1 - Incoterms Parte 1 e INCO2 - Incoterms Parte 2)',
      concept: 'A alteração de Incoterms na ordem de venda impacta diretamente a responsabilidade jurídica sobre o frete, a determinação de seguros de carga e o destaque contábil de despesas de transporte na Nota Fiscal Eletrônica.'
    },

    initialDocuments: [
      {
        docNumber: '10000084',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100210',
        customerPoNumber: 'PO-MT-FOB-RETIRA',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'Belo Horizonte',
        items: [
          { materialId: 'MAT-4050', quantity: 30, manualDiscountPercent: 0 }
        ],
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'access_va02', text: 'Abrir a Ordem 10000084 na transação VA02', done: false },
      { id: 'update_incoterms', text: 'Alterar a modalidade de frete para FOB e atualizar o local de coleta', done: false },
      { id: 'save_modified_order', text: 'Gravar as alterações da ordem de venda no sistema', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000084',
      paymentTerms: 'Z030',
      incoterms: 'FOB',
      items: [
        { materialId: 'MAT-4050', quantity: 30 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Conformidade logística perfeita! Você atualizou o Incoterms para FOB, isentando a NexusTech do frete e alinhando o faturamento à retirada do cliente. +300 XP.',
      whatHappened: 'Ordem 10000084 retificada para frete FOB na transação VA02.',
      why: 'O ajuste correto de Incoterms evita que a transportadora emita cobrança indevida de CTRC contra a NexusTech.',
      businessImpact: 'A expedição liberará o veículo designado pelo cliente sem retenções fiscais na portaria.'
    }
  },
  {
    id: 'SCN-53',
    code: 'TRN-144',
    title: 'Consulta ATP na MM03 e Corte Responsável de Quantidade na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'atp_controller',
    initialTcode: 'MM03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Alerta de Ruptura de Estoque: Pedido TechLog Soluções (Ordem 10000086)',
    briefing: 'Atenção, trainee! A TechLog Soluções (Cliente 100120) emitiu a Ordem nº 10000086 solicitando 30 Roteadores de Borda SD-WAN (MAT-2010). O almoxarifado informou que o saldo livre está comprometido. Acesse a MM03, verifique o estoque físico e o saldo disponível para promessa (ATP) do material MAT-2010. Em seguida, acesse a transação VA02 e adeque responsavelmente a quantidade do item para 18 unidades, evitando o cancelamento integral do pedido e garantindo faturamento parcial imediato!',

    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-ATP-CORTE',
      operationType: 'Adequação Comercial por Limitação de Estoque Físico (ATP)',
      itemsRequested: [
        { description: 'Roteador de Borda SD-WAN Gigabit Multi-WAN (MAT-2010)', quantity: 30, unit: 'UN' }
      ],
      deliveryAddress: 'Rua das Indústrias, 500 - Curitiba/PR',
      freightResponsibility: 'CIF - Entrega dedicada por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na MM03, consulte o material MAT-2010 na aba Estoque/ATP. Você verá que o saldo disponível é exatamente 18 UN. Vá para a VA02, altere a quantidade de 30 para 18 na ordem 10000086 e salve!',

    sapKnowledgeBridge: {
      tcode: 'MM03 / VA02',
      tables: 'MARC / MARD (Estoque Físico) / VBAP (Quantidade Confirmada da Ordem)',
      concept: 'A verificação de disponibilidade (ATP - Available to Promise) compara as necessidades em carteira com o saldo físico em depósito. Adequar proativamente a quantidade da ordem ao teto de disponibilidade viabiliza entregas parciais acordadas sem incorrer em backorder indesejado.'
    },

    initialDocuments: [
      {
        docNumber: '10000086',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '01',
        customerId: '100120',
        customerPoNumber: 'PO-TL-ATP-CORTE',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Curitiba',
        items: [
          { materialId: 'MAT-2010', quantity: 30, manualDiscountPercent: 0 }
        ],
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'check_stock_mm03', text: 'Consultar o estoque e disponibilidade ATP do material MAT-2010 na MM03', done: false },
      { id: 'access_va02', text: 'Abrir a Ordem 10000086 na transação VA02', done: false },
      { id: 'adjust_quantity', text: 'Ajustar a quantidade da posição para 18 unidades conforme saldo ATP disponível', done: false },
      { id: 'save_modified_order', text: 'Gravar a alteração da ordem de venda com recálculo comercial', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000086',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2010', quantity: 18 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Sensibilidade comercial e operacional impecável! Você consultou o estoque na MM03 e readequou a ordem para 18 unidades na VA02, garantindo o envio imediato e mantendo a confiança do parceiro. +350 XP.',
      whatHappened: 'Ordem 10000086 ajustada para 18 unidades na VA02 conforme disponibilidade ATP.',
      why: 'O corte responsável evita travamentos no armazém por falta de saldo físico.',
      businessImpact: 'O cliente receberá o primeiro lote hoje mesmo e a operação preservou a margem de receita.'
    }
  },
  {
    id: 'SCN-55',
    code: 'DSF-209',
    title: 'Desafio SLA: Investigação Autônoma de Gargalo no Fechamento Fiscal',
    mode: 'CHALLENGE',
    levelRequired: 1,
    slaMinutes: 5,
    xpReward: 450,
    badgeReward: 'fiscal_troubleshooter',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Plantão de Fechamento sob SLA: Fatura Pendente DataCore (Ordem 10000088)',
    briefing: 'Alerta da Diretoria Financeira: "Estamos no fechamento do corte fiscal e a fatura da Ordem nº 10000088 (DataCore Cloud) precisa ser emitida impreterivelmente nos próximos 5 minutos! O setor de faturamento relata que a VF01 recusa o documento alegando pré-requisito pendente". O cronômetro de 5 minutos está ativo: diagnostique a causa raiz no fluxo documental da VA03, vá à transação responsável pela pendência logística e emita a Fatura F2 na VF01 antes de estourar o prazo!',

    purchaseOrderDocument: {
      buyerName: 'DataCore Cloud & Datacenters Brasil Ltda (Barueri/SP)',
      buyerCnpj: '34.567.890/0001-12',
      poNumber: 'PO-DC-SLA-F2',
      operationType: 'Fechamento Fiscal Emergencial sob SLA de Contrato Corporativo',
      itemsRequested: [
        { description: 'Switch 48 Portas Gigabit PoE+ com 4x 10G SFP+ (MAT-2080)', quantity: 3, unit: 'UN' }
      ],
      deliveryAddress: 'DataCore DC1 - Alphaville Barueri / SP',
      freightResponsibility: 'CIF - Entrega expressa por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015)'
    },

    mentorInitialTip: 'Dica do Chefe Wilson sob SLA: Abra a VA03 e veja o fluxo da ordem 10000088. A remessa 80000088 existe mas o PGI não foi registrado! Corra para a VL02N, confirme o picking e registre a Saída de Mercadorias. Em seguida, acesse a VF01 e grave a fatura F2 antes do tempo acabar!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VL02N / VF01',
      tables: 'VBAK / LIKP / VBRK / VBFA',
      concept: 'Em ciclos de faturamento O2C baseados em remessa, a ausência de baixa contábil de estoque (movimento 601 / PGI) bloqueia a emissão da Nota Fiscal. Diagnosticar rapidamente a ausência do PGI destrava o processo de faturamento em plantões críticos.'
    },

    initialDocuments: [
      {
        docNumber: '10000088',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100180',
        customerPoNumber: 'PO-DC-SLA-F2',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Barueri',
        items: [
          { materialId: 'MAT-2080', quantity: 3, unitPrice: 3200.00 }
        ],
        totalValue: 12216.00,
        netValue: 9600.00,
        taxValue: 2616.00,
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'IN_PROCESS',
        billingStatus: 'NOT_BILLED'
      }
    ],

    initialDeliveries: [
      {
        deliveryNumber: '80000088',
        salesOrderNumber: '10000088',
        shippingPoint: '1000',
        customerId: '100180',
        autoPgi: false,
        items: [
          { materialId: 'MAT-2080', quantity: 3 }
        ]
      }
    ],

    objectives: [
      { id: 'check_flow_va03', text: 'Investigar o Fluxo de Documentos (VBFA) da Ordem 10000088 na VA03', done: false },
      { id: 'post_goods_issue', text: 'Acessar a transação VL02N e efetuar a Saída de Mercadorias (PGI) da Remessa 80000088', done: false },
      { id: 'create_invoice', text: 'Acessar a transação VF01 e concluir a emissão da Fatura Comercial F2 sob SLA', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000088',
      billingType: 'F2',
      action: 'CREATE_INVOICE'
    },

    completionFeedback: {
      mentorSpeech: 'Performance espetacular sob pressão de fechamento! Você identificou a falta do PGI, registrou a baixa na VL02N e emitiu a fatura na VF01 com total conformidade e antes do término do SLA. Parabéns! +450 XP.',
      whatHappened: 'Gargalo de expedição diagnosticado, PGI executado e Fatura F2 emitida para a ordem 10000088 dentro do SLA.',
      why: 'A baixa de mercadorias no almoxarifado destravou os pré-requisitos contábeis de faturamento.',
      businessImpact: 'A receita foi reconhecida no fechamento contábil e a entrega foi desembaraçada fiscalmente.'
    }
  },
  {
    id: 'SCN-58',
    code: 'TRN-148',
    title: 'Retificação Contratual de Prazo e Quantidade em Pedido Vivo na VA02',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'contract_modifier',
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Aditivo Contratual Duplo: Mineração Serra Azul (Ordem 10000090)',
    briefing: 'Olá! A Mineração Serra Azul (Cliente 100210) aprovou um aditivo comercial para a Ordem de Venda nº 10000090. Eles ampliaram a quantidade de Switches Gigabit (MAT-2004) de 5 para 12 unidades. Em contrapartida pelo volume adicional, a gerência concedeu a extensão do prazo de pagamento para Z015 (15 dias líquido). Acesse a transação VA02, abra a ordem 10000090, atualize a quantidade da posição para 12 unidades, altere a Condição de Pagamento no cabeçalho para Z015, simule o recálculo dos impostos e salve a ordem!',

    purchaseOrderDocument: {
      buyerName: 'MinasTech Automação Industrial Ltda (Mineração Serra Azul - 100210)',
      buyerCnpj: '45.678.901/0001-23',
      poNumber: 'PO-MSA-ADITIVO-12',
      operationType: 'Aditivo Contratual Bilateral com Ampliação de Escala e Prazo',
      itemsRequested: [
        { description: 'Switch Gigabit 24 Portas Managed Layer 3 (MAT-2004)', quantity: 12, unit: 'UN' }
      ],
      deliveryAddress: 'Unidade de Triagem e Britagem - Serra Azul / MG',
      freightResponsibility: 'CIF - Entrega no destino por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015) - Prazo especial de aditivo'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na VA02, lembre-se de alterar dois campos: na aba Cabeçalho, mude o prazo para Z015; na aba Posições, mude a quantidade para 12. Clique em Simular para conferir os totais e grave as alterações.',

    sapKnowledgeBridge: {
      tcode: 'VA02',
      tables: 'VBAK (Campo ZTERM - Condição de Pagamento) / VBAP (Campo KMGNG - Quantidade)',
      concept: 'Aditivos contratuais que alteram simultaneamente prazo financeiro e escala física exigem atualização combinada de cabeçalho e item na VA02. O sistema recalcula automaticamente a base tributária e atualiza o planejamento de entregas.'
    },

    initialDocuments: [
      {
        docNumber: '10000090',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100210',
        customerPoNumber: 'PO-MSA-ADITIVO-12',
        paymentTerms: 'Z030',
        incoterms: 'CIF',
        incotermsLocation: 'Belo Horizonte',
        items: [
          { materialId: 'MAT-2004', quantity: 5, manualDiscountPercent: 0 }
        ],
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'access_va02', text: 'Carregar a Ordem 10000090 na transação VA02', done: false },
      { id: 'update_header_terms', text: 'Alterar a Condição de Pagamento no cabeçalho para Z015', done: false },
      { id: 'update_item_quantity', text: 'Alterar a quantidade da posição de 5 para 12 unidades', done: false },
      { id: 'save_modified_order', text: 'Gravar a ordem com as alterações contratuais confirmadas', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000090',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2004', quantity: 12 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Retificação contratual executada com maestria! O prazo foi ajustado para Z015 e a quantidade ampliada para 12 unidades com recálculo financeiro impecável. +350 XP.',
      whatHappened: 'Ordem 10000090 atualizada na VA02 com prazo Z015 e 12 unidades de switches.',
      why: 'A alteração em pedido vivo mantém o histórico de negociação sem necessidade de cancelar o documento.',
      businessImpact: 'A fábrica receberá os 12 equipamentos sob as novas regras de faturamento acordadas.'
    }
  },
  {
    id: 'SCN-60',
    code: 'TRN-150',
    title: 'Venda Corporativa com Emissor Matriz Centralizador na VA01',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'corp_governance',
    initialTcode: 'XD03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Ordem de Compra Corporativa Centralizada: DataCore Cloud (PO-DC-CORP-CENTRAL)',
    briefing: 'Olá, trainee! A filial regional da DataCore Cloud solicitou a aquisição de 10 Roteadores SD-WAN (MAT-2010). No entanto, o Contrato Guarda-Chuva corporativo exige que todas as ordens de compra sejam formalmente emitidas e faturadas contra a Matriz pagadora central (Cliente 100180 - DataCore Cloud Matriz Barueri/SP). Consulte na XD03 os dados cadastrais da matriz. Em seguida, acesse a VA01, selecione a Área de Vendas 1000/10/01, informe a conta matriz 100180, informe o pedido PO-DC-CORP-CENTRAL, selecione prazo Z015 e frete CIF e lance os 10 roteadores!',

    purchaseOrderDocument: {
      buyerName: 'DataCore Cloud & Datacenters Brasil Ltda (Matriz Barueri/SP)',
      buyerCnpj: '34.567.890/0001-12',
      poNumber: 'PO-DC-CORP-CENTRAL',
      operationType: 'Venda Corporativa com Faturamento Centralizado na Matriz',
      itemsRequested: [
        { description: 'Roteador de Borda SD-WAN Gigabit Multi-WAN (MAT-2010)', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'DataCore DC1 - Alphaville Barueri / SP',
      freightResponsibility: 'CIF - Entrega e seguro por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015) - Faturamento centralizado'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Inicie na XD03 e confira a razão social e endereço da matriz 100180. Ao abrir a VA01, garanta que o cliente selecionado seja 100180 e preencha exatamente o PO PO-DC-CORP-CENTRAL!',

    sapKnowledgeBridge: {
      tcode: 'XD03 / VA01',
      tables: 'KNA1 / KNVV (Estrutura de Clientes) / VBAK (Emissor da Ordem)',
      concept: 'Em clientes de grande porte, as compras regionais são frequentemente centralizadas na holding ou matriz fiscal para consolidação de contas a pagar e controle unificado de limite de crédito corporativo.'
    },

    objectives: [
      { id: 'check_customer_xd03', text: 'Consultar os dados cadastrais da Matriz 100180 na transação XD03', done: false },
      { id: 'set_org_structure', text: 'Configurar a Área de Vendas 1000 / 10 / 01 na transação VA01', done: false },
      { id: 'select_customer', text: 'Selecionar o cliente matriz 100180 e preencher o pedido PO-DC-CORP-CENTRAL', done: false },
      { id: 'add_items', text: 'Lançar 10 unidades do Roteador SD-WAN (MAT-2010) com frete CIF e prazo Z015', done: false },
      { id: 'save_order', text: 'Simular os preços e gravar a ordem de venda corporativa', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_SUBMISSION',
      orderType: 'OR',
      salesOrg: '1000',
      distChannel: '10',
      division: '01',
      customerId: '100180',
      customerPoNumber: 'PO-DC-CORP-CENTRAL',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2010', quantity: 10, discountPercent: 0 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Governança corporativa irrepreensível! A emissão centralizada contra a matriz 100180 cumpre à risca as diretrizes do contrato guarda-chuva. Parabéns! +300 XP.',
      whatHappened: 'Ordem gravada com sucesso vinculada à matriz pagadora central DataCore Cloud.',
      why: 'A centralização de faturamento assegura o fluxo regular de cobrança e conciliação financeira corporativa.',
      businessImpact: 'A ordem seguirá para faturamento direto na conta centralizadora sem risco de glosa contábil.'
    }
  },
  {
    id: 'SCN-61',
    code: 'TRN-151',
    title: 'Liberação de Ordem Retida por Crédito na VKM1 após Análise de Alçada',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 350,
    badgeReward: 'credit_governance',
    initialTcode: 'VA03',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Comprovação de Adiantamento Financeiro: Metalúrgica Paulista (Ordem 10000092)',
    briefing: 'Olá! A Indústria Metalúrgica Paulista (Cliente 100088) teve a Ordem nº 10000092 (4 Nobreaks 10kVA - MAT-1090) retida preventivamente por bloqueio de crédito na VKM1, pois o valor de R$ 38.000,00 excede a linha cadastrada. Contudo, o cliente apresentou comprovante de depósito de 50% de entrada (Sinal Financeiro via TED). A gerência autorizou a liberação assistida. Acesse a VA03 para diagnosticar a ordem retida, vá até a transação VKM1 e clique em Liberar Ordem para concluir a liberação de alçada comercial!',

    purchaseOrderDocument: {
      buyerName: 'Indústria Metalúrgica Paulista S/A (Campinas/SP)',
      buyerCnpj: '23.456.789/0001-01',
      poNumber: 'PO-MP-SINAL-50',
      operationType: 'Liberação de Crédito Condicionada a Comprovante de Adiantamento',
      itemsRequested: [
        { description: 'Nobreak Online Dupla Conversão 10kVA Rackmount (MAT-1090)', quantity: 4, unit: 'UN' }
      ],
      deliveryAddress: 'Rod. Dom Pedro I, km 135 - Campinas/SP',
      freightResponsibility: 'FOB - Retirada na portaria da NexusTech',
      paymentInstructions: '60 dias líquido (Z060) - 50% antecipado via TED'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Primeiro veja na VA03 o status da ordem 10000092 retida por crédito. Abra a VKM1, localize a ordem retida na tabela e clique em "Liberar Ordem" com segurança!',

    sapKnowledgeBridge: {
      tcode: 'VA03 / VKM1',
      tables: 'VBAK / KNKK (Controle de Crédito) / VKM1 (Tabela de Ordens Retidas)',
      concept: 'Em negociações corporativas com risco ou estouro de limite, a exigência de adiantamento financeiro amortiza a exposição e fundamenta a liberação por alçada executiva na VKM1, permitindo a continuidade logística sem vulnerabilidade de caixa.'
    },

    initialDocuments: [
      {
        docNumber: '10000092',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '01',
        customerId: '100088',
        customerPoNumber: 'PO-MP-SINAL-50',
        paymentTerms: 'Z060',
        incoterms: 'FOB',
        incotermsLocation: 'Campinas',
        items: [
          { materialId: 'MAT-1090', quantity: 4, unitPrice: 7800.00 }
        ],
        totalValue: 39702.00,
        netValue: 31200.00,
        taxValue: 8502.00,
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'check_order_va03', text: 'Consultar a Ordem 10000092 na VA03 e verificar o bloqueio de crédito ativo', done: false },
      { id: 'access_vkm1', text: 'Acessar a transação VKM1 e localizar a ordem retida', done: false },
      { id: 'release_credit_order', text: 'Executar a ação Liberar Ordem para a Ordem 10000092 na transação VKM1', done: false }
    ],

    targetCriteria: {
      targetDocNumber: '10000092',
      customerId: '100088',
      action: 'CREDIT_RELEASE',
      requiresVkm1Release: true
    },

    completionFeedback: {
      mentorSpeech: 'Liberação de crédito impecável! A análise de alçada e a liberação na VKM1 garantiram a conformidade com as regras de governança e liberaram o pedido para faturamento. +350 XP.',
      whatHappened: 'Ordem 10000092 liberada na VKM1 com base em sinal financeiro comprovado.',
      why: 'A mitigação do risco financeiro por sinal de 50% autoriza a alçada executiva de liberação.',
      businessImpact: 'A fábrica de Campinas receberá os nobreaks no prazo programado sem exposição financeira.'
    }
  },
  {
    id: 'SCN-64',
    code: 'TRN-154',
    title: 'Retificação de Pedido Reprovado com Adequação de Margem e Preço',
    mode: 'TRAINING',
    levelRequired: 1,
    slaMinutes: null,
    xpReward: 300,
    badgeReward: 'margin_guardian',
    initialTcode: 'VA02',

    sender: 'Chefe Wilson (Coordenador Comercial | Mentor SD)',
    emailSubject: 'Alerta de Margem Negativa: Retificação de Desconto TechLog (Ordem 10000094)',
    briefing: 'Olá, trainee! A controladoria comercial barrou a Ordem nº 10000094 para a TechLog Soluções (100120): o vendedor aplicou um desconto excessivo de 15% na condição RB00 para 10 Switches Gigabit (MAT-2004), estourando a alçada de rentabilidade. A gerência determinou a readequação imediata do desconto para exatamente 5%, que é o teto máximo permitido para esse lote. Abra a VA02 na ordem 10000094, reduza o desconto manual de 15% para 5% na posição, simule o recálculo dos impostos e salve a ordem retificada!',

    purchaseOrderDocument: {
      buyerName: 'TechLog Soluções em TI e Distribuição (Curitiba/PR)',
      buyerCnpj: '45.112.890/0002-34',
      poNumber: 'PO-TL-MARGEM-5PCT',
      operationType: 'Readequação Comercial de Desconto por Política de Rentabilidade',
      itemsRequested: [
        { description: 'Switch Gigabit 24 Portas Managed Layer 3 (MAT-2004)', quantity: 10, unit: 'UN' }
      ],
      deliveryAddress: 'Rua das Indústrias, 500 - Curitiba/PR',
      freightResponsibility: 'CIF - Entrega no destino por conta da NexusTech',
      paymentInstructions: '15 dias líquido (Z015) - Desconto comercial readequado para 5%'
    },

    mentorInitialTip: 'Dica do Chefe Wilson: Na VA02, abra a ordem 10000094. Na aba de Posições, mude o percentual de desconto de 15 para 5. Clique em Simular para conferir o novo valor líquido e salve a ordem.',

    sapKnowledgeBridge: {
      tcode: 'VA02',
      tables: 'VBAP (Itens da Ordem) / KONV (Condição RB00 - Desconto Manual Comercial)',
      concept: 'No SAP SD, descontos manuais concedidos fora das alçadas comerciais cadastradas podem ser reprovados no workflow de aprovação e exigir retificação direta pelo operador na VA02 para restabelecer a margem saudável da venda.'
    },

    initialDocuments: [
      {
        docNumber: '10000094',
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '20',
        division: '01',
        customerId: '100120',
        customerPoNumber: 'PO-TL-MARGEM-5PCT',
        paymentTerms: 'Z015',
        incoterms: 'CIF',
        incotermsLocation: 'Curitiba',
        items: [
          { materialId: 'MAT-2004', quantity: 10, manualDiscountPercent: 15 }
        ],
        overallStatus: 'OPEN',
        creditStatus: 'RELEASED',
        deliveryStatus: 'NOT_DELIVERED',
        billingStatus: 'NOT_BILLED'
      }
    ],

    objectives: [
      { id: 'access_va02', text: 'Carregar a Ordem 10000094 na transação VA02', done: false },
      { id: 'adjust_discount', text: 'Reduzir o desconto comercial na posição para 5% conforme alçada', done: false },
      { id: 'save_modified_order', text: 'Gravar a ordem com o recálculo de preço e tributos aprovado', done: false }
    ],

    targetCriteria: {
      action: 'SALES_ORDER_MODIFICATION',
      targetDocNumber: '10000094',
      paymentTerms: 'Z015',
      incoterms: 'CIF',
      items: [
        { materialId: 'MAT-2004', quantity: 10, discountPercent: 5 }
      ]
    },

    completionFeedback: {
      mentorSpeech: 'Defesa de margem executada com sucesso! Você readequou o desconto para 5%, restabelecendo o lucro da operação e liberando a ordem para faturamento regular. Parabéns! +300 XP.',
      whatHappened: 'Ordem 10000094 retificada com desconto de 5% e margem comercial preservada.',
      why: 'O respeito às alçadas comerciais protege a saúde financeira e a rentabilidade corporativa.',
      businessImpact: 'A ordem foi liberada da trava de auditoria e seguirá para faturamento com rentabilidade positiva.'
    }
  }
];

