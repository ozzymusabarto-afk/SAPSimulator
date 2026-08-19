/**
 * NexusTech ERP • Mestre de Clientes (Customer Master Data / XD03 / KNVV)
 */

export const InitialCustomers = [
  {
    id: '100045',
    name: 'Varejo Eletro Brasil Ltda',
    tradeName: 'Eletro Brasil',
    cnpj: '12.345.678/0001-90',
    city: 'São Paulo',
    state: 'SP',
    salesOrg: '1000',
    distChannel: '10', // Venda Direta / Corporativo
    division: '01',    // Equipamentos
    customerGroup: '01', // Varejo Corporativo
    currency: 'BRL',
    
    // Funções de Parceiro (Partner Functions - SD)
    partners: {
      soldToParty: { id: '100045', name: 'Varejo Eletro Brasil Ltda (Matriz SP)' }, // SP (Emissor)
      shipToParty: { id: '100045', name: 'Varejo Eletro Brasil Ltda (CD SP - Lapa)' }, // SH (Recebedor Mercadoria)
      billToParty: { id: '100045', name: 'Varejo Eletro Brasil Ltda (Financeiro SP)' }, // BP (Recebedor Fatura)
      payer: { id: '100045', name: 'Varejo Eletro Brasil Ltda' } // PY (Pagador)
    },

    // Dados Comerciais e Financeiros
    paymentTerms: 'Z030', // 30 dias líquido
    incoterms: 'CIF',
    incotermsLocation: 'São Paulo',
    priceGroup: '01', // Preço Corporativo
    
    // Gestão de Crédito
    creditLimit: 120000.00,
    creditUsed: 24500.00,
    creditStatus: 'OK',
    riskCategory: 'A (Baixo Risco)',
    notes: 'Cliente premium com excelente histórico de pontualidade de pagamentos.'
  },
  {
    id: '100088',
    name: 'Indústria Metalúrgica Paulista S/A',
    tradeName: 'Metal Paulista',
    cnpj: '98.765.432/0001-11',
    city: 'Campinas',
    state: 'SP',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerGroup: '02', // Indústria
    currency: 'BRL',
    
    partners: {
      soldToParty: { id: '100088', name: 'Indústria Metalúrgica Paulista S/A' },
      shipToParty: { id: '100088', name: 'Fábrica Campinas - Portão 3 Logística' },
      billToParty: { id: '100088', name: 'Metal Paulista - Dep. Contábil' },
      payer: { id: '100088', name: 'Metal Paulista S/A' }
    },

    paymentTerms: 'Z060', // 60 dias
    incoterms: 'FOB',
    incotermsLocation: 'CD NexusTech SP',
    priceGroup: '02',
    
    // Crédito Estourado / Bloqueado (Gatilho para Cenário de Desafio #1047)
    creditLimit: 50000.00,
    creditUsed: 48900.00,
    creditStatus: 'BLOCKED',
    riskCategory: 'C (Alto Risco / Atrasos Recentes)',
    notes: 'Atenção: Cliente possui faturas pendentes em atraso. Qualquer novo pedido acima de R$ 1.100,00 causará bloqueio automático na VKM1.'
  },
  {
    id: '100120',
    name: 'TechLog Soluções em TI e Distribuição',
    tradeName: 'TechLog Brasil',
    cnpj: '45.112.890/0002-34',
    city: 'Curitiba',
    state: 'PR',
    salesOrg: '1000',
    distChannel: '20', // Revenda / Atacado
    division: '01',
    customerGroup: '03', // Atacado
    currency: 'BRL',
    
    partners: {
      soldToParty: { id: '100120', name: 'TechLog Soluções em TI' },
      shipToParty: { id: '100120', name: 'Centro de Distribuição Curitiba' },
      billToParty: { id: '100120', name: 'TechLog Financeiro' },
      payer: { id: '100120', name: 'TechLog Soluções em TI' }
    },

    paymentTerms: 'Z015', // 15 dias líquido
    incoterms: 'CIF',
    incotermsLocation: 'Curitiba',
    priceGroup: '03', // Preço Atacadista (Desconto de Tabela 5%)
    
    creditLimit: 300000.00,
    creditUsed: 110000.00,
    creditStatus: 'OK',
    riskCategory: 'B (Médio Risco)',
    notes: 'Grande volume de compras mensais. Exige cumprimento rigoroso de divisão de remessa.'
  }
];
