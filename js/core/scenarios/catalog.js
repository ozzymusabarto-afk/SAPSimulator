/**
 * NexusTech ERP • Catálogo de Cenários e Casos Práticos
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
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
    
    sender: 'Sr. Wilson (Coordenador Comercial | Mentor SD)',
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

    mentorInitialTip: 'Dica do Sr. Wilson: Primeiro abra a transação XD03 para consultar o mestre do cliente Varejo Eletro Brasil (100045). Na aba de Vendas, observe a Organização de Vendas, o Canal de Distribuição, o Setor de Atividade, a Condição de Pagamento e o Incoterms. Depois vá até a VA01 e selecione cada campo com base nessa análise!',
    
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
    
    sender: 'Sr. Wilson (Coordenador Comercial | Mentor SD)',
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

    mentorInitialTip: 'Dica do Sr. Wilson: Consulte o cliente TechLog (100120) na XD03 para ver o canal de distribuição (20 - Revenda / Atacado). Na VA01, selecione a Área de Vendas correta, informe a condição de pagamento Z015 e, na grade de itens, coloque o material MAT-2004 com 10 unidades e 5% de desconto.',
    
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
    
    sender: 'Sr. Wilson (Coordenador Comercial | Mentor SD)',
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

    mentorInitialTip: 'Orientação do Sr. Wilson (Modo Desafio): Você está no comando! Consulte a aba de Crédito do cliente 100088 na XD03 para ver o limite e os títulos em aberto. Depois crie o pedido na VA01 para constatar a retenção automática e acesse a transação VKM1 para liberar com justificativa. Mantenha a calma, você tem 8 minutos no SLA!',
    
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
    }
  }
];
