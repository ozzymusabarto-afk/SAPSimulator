/**
 * NexusTech ERP • Base Inicial de Ordens de Venda (Initial Sales Orders / VBAK / VBAP / VBFA)
 */

export const InitialSalesOrders = [
  // 1. Ordem 10000001 • COMPLETED • Varejo Eletro Brasil (SP) • Servidor Enterprise
  {
    docNumber: '10000001',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100045',
    customerPoNumber: 'PO-EB-2026-001',
    paymentTerms: 'Z030',
    incoterms: 'CIF',
    incotermsLocation: 'São Paulo',
    orderDate: '2026-02-10T10:30:00Z',
    items: [
      { materialId: 'MAT-1001', quantity: 2 }
    ],
    overallStatus: 'COMPLETED',
    creditStatus: 'RELEASED',
    deliveryStatus: 'COMPLETED',
    billingStatus: 'COMPLETED',
    documentFlow: [
      { type: 'ORDER', number: '10000001', status: 'COMPLETED', date: '10/02/2026' },
      { type: 'DELIVERY', number: '80000010', status: 'COMPLETED', date: '12/02/2026' },
      { type: 'INVOICE', number: '90000010', status: 'COMPLETED', date: '14/02/2026' }
    ]
  },

  // 2. Ordem 10000002 • COMPLETED • TechLog Soluções (Curitiba) • Switch Gigabit com desconto
  {
    docNumber: '10000002',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '20',
    division: '01',
    customerId: '100120',
    customerPoNumber: 'PO-TL-2026-012',
    paymentTerms: 'Z015',
    incoterms: 'CIF',
    incotermsLocation: 'Curitiba',
    orderDate: '2026-03-05T14:15:00Z',
    items: [
      { materialId: 'MAT-2004', quantity: 8, manualDiscountPercent: 5 }
    ],
    overallStatus: 'COMPLETED',
    creditStatus: 'RELEASED',
    deliveryStatus: 'COMPLETED',
    billingStatus: 'COMPLETED',
    documentFlow: [
      { type: 'ORDER', number: '10000002', status: 'COMPLETED', date: '05/03/2026' },
      { type: 'DELIVERY', number: '80000015', status: 'COMPLETED', date: '07/03/2026' },
      { type: 'INVOICE', number: '90000015', status: 'COMPLETED', date: '09/03/2026' }
    ]
  },

  // 3. Ordem 10000003 • COMPLETED • Multi-Item (Storage + SSDs) • DataCore Cloud
  {
    docNumber: '10000003',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100180',
    customerPoNumber: 'PO-DC-2026-019',
    paymentTerms: 'Z015',
    incoterms: 'CIF',
    incotermsLocation: 'Barueri',
    orderDate: '2026-03-20T09:00:00Z',
    items: [
      { materialId: 'MAT-1050', quantity: 1 },
      { materialId: 'MAT-3010', quantity: 4 }
    ],
    overallStatus: 'COMPLETED',
    creditStatus: 'RELEASED',
    deliveryStatus: 'COMPLETED',
    billingStatus: 'COMPLETED',
    documentFlow: [
      { type: 'ORDER', number: '10000003', status: 'COMPLETED', date: '20/03/2026' },
      { type: 'DELIVERY', number: '80000022', status: 'COMPLETED', date: '22/03/2026' },
      { type: 'INVOICE', number: '90000022', status: 'COMPLETED', date: '25/03/2026' }
    ]
  },

  // 4. Ordem 10000004 • CREDIT_BLOCKED • Metalúrgica Paulista (Campinas) • Cliente com Bloqueio
  {
    docNumber: '10000004',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100088',
    customerPoNumber: 'PO-MP-2026-030',
    paymentTerms: 'Z060',
    incoterms: 'FOB',
    incotermsLocation: 'CD NexusTech SP',
    orderDate: '2026-04-02T11:45:00Z',
    items: [
      { materialId: 'MAT-1001', quantity: 2 }
    ]
  },

  // 5. Ordem 10000005 • CREDIT_BLOCKED • Multi-Item (Placas de Rede + Fontes) • AutoPeças Guanabara
  {
    docNumber: '10000005',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '02',
    customerId: '100750',
    customerPoNumber: 'PO-AG-2026-041',
    paymentTerms: 'Z030',
    incoterms: 'FOB',
    incotermsLocation: 'Rio de Janeiro',
    orderDate: '2026-04-15T16:20:00Z',
    items: [
      { materialId: 'MAT-3080', quantity: 5 },
      { materialId: 'MAT-3090', quantity: 2 }
    ]
  },

  // 6. Ordem 10000006 • CREDIT_BLOCKED • UltraLink Provedor • Limite de Crédito Excedido
  {
    docNumber: '10000006',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100800',
    customerPoNumber: 'PO-UL-2026-055',
    paymentTerms: 'Z015',
    incoterms: 'CIF',
    incotermsLocation: 'Fortaleza',
    orderDate: '2026-05-03T10:10:00Z',
    items: [
      { materialId: 'MAT-2080', quantity: 6 }
    ]
  },

  // 7. Ordem 10000007 • OPEN • Multi-Item (Servidor + Memórias) • Rede Hospitalar São Lucas
  {
    docNumber: '10000007',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100150',
    customerPoNumber: 'PO-HSL-2026-062',
    paymentTerms: 'Z030',
    incoterms: 'CIF',
    incotermsLocation: 'Rio de Janeiro',
    orderDate: '2026-05-18T08:40:00Z',
    items: [
      { materialId: 'MAT-1001', quantity: 1 },
      { materialId: 'MAT-3050', quantity: 4 }
    ]
  },

  // 8. Ordem 10000008 • OPEN • MinasTech Automação (BH) • Discos SAS
  {
    docNumber: '10000008',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '02',
    customerId: '100210',
    customerPoNumber: 'PO-MT-2026-077',
    paymentTerms: 'Z030',
    incoterms: 'CIF',
    incotermsLocation: 'Belo Horizonte',
    orderDate: '2026-05-25T15:00:00Z',
    items: [
      { materialId: 'MAT-3020', quantity: 8 }
    ]
  },

  // 9. Ordem 10000009 • OPEN • Multi-Item (Switches + Transceivers) • Sul Distribuidora
  {
    docNumber: '10000009',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '20',
    division: '01',
    customerId: '100240',
    customerPoNumber: 'PO-SD-2026-085',
    paymentTerms: 'Z28D',
    incoterms: 'CIF',
    incotermsLocation: 'Joinville',
    orderDate: '2026-06-02T13:30:00Z',
    items: [
      { materialId: 'MAT-2004', quantity: 15, manualDiscountPercent: 5 },
      { materialId: 'MAT-4020', quantity: 30 }
    ]
  },

  // 10. Ordem 10000010 • OPEN • MegaByte E-commerce (SP) • Access Points Wi-Fi 6
  {
    docNumber: '10000010',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '30',
    division: '01',
    customerId: '100270',
    customerPoNumber: 'PO-MB-2026-091',
    paymentTerms: 'Z001',
    incoterms: 'EXW',
    incotermsLocation: 'CD NexusTech SP',
    orderDate: '2026-06-10T11:00:00Z',
    items: [
      { materialId: 'MAT-2020', quantity: 20 }
    ]
  },

  // 11. Ordem 10000011 • OPEN • Multi-Item (Racks 42U + PDUs) • Banco Horizonte
  {
    docNumber: '10000011',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100310',
    customerPoNumber: 'PO-BH-2026-103',
    paymentTerms: 'Z030',
    incoterms: 'CIF',
    incotermsLocation: 'São Paulo',
    orderDate: '2026-06-20T17:15:00Z',
    items: [
      { materialId: 'MAT-5010', quantity: 2 },
      { materialId: 'MAT-5050', quantity: 4 }
    ]
  },

  // 12. Ordem 10000012 • OPEN • Construfort Obras e Engenharia • Nobreak Online 10kVA
  {
    docNumber: '10000012',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100350',
    customerPoNumber: 'PO-CF-2026-118',
    paymentTerms: 'Z060',
    incoterms: 'CIF',
    incotermsLocation: 'Brasília',
    orderDate: '2026-07-01T09:30:00Z',
    items: [
      { materialId: 'MAT-1090', quantity: 1 }
    ]
  },

  // 13. Ordem 10000013 • CANCELLED • AgroVale Cooperativa Agrícola • Roteadores de Borda
  {
    docNumber: '10000013',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100390',
    customerPoNumber: 'PO-AV-2026-125',
    paymentTerms: 'Z060',
    incoterms: 'FOB',
    incotermsLocation: 'CD NexusTech SP',
    orderDate: '2026-07-08T14:00:00Z',
    items: [
      { materialId: 'MAT-2010', quantity: 2 }
    ],
    overallStatus: 'CANCELLED',
    creditStatus: 'RELEASED',
    deliveryStatus: 'NOT_DELIVERED',
    billingStatus: 'NOT_BILLED'
  },

  // 14. Ordem 10000014 • OPEN • Multi-Item (Cabos Cat6 + Access Points) • Nordeste Telecom
  {
    docNumber: '10000014',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '20',
    division: '01',
    customerId: '100420',
    customerPoNumber: 'PO-NT-2026-134',
    paymentTerms: 'Z030',
    incoterms: 'CIF',
    incotermsLocation: 'Salvador',
    orderDate: '2026-07-15T10:45:00Z',
    items: [
      { materialId: 'MAT-4010', quantity: 10 },
      { materialId: 'MAT-2020', quantity: 15 }
    ]
  },

  // 15. Ordem 10000015 • OPEN • InovaLog Transportes • SSDs Server Grade
  {
    docNumber: '10000015',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '02',
    customerId: '100460',
    customerPoNumber: 'PO-IL-2026-149',
    paymentTerms: 'Z015',
    incoterms: 'CIF',
    incotermsLocation: 'Curitiba',
    orderDate: '2026-07-22T16:00:00Z',
    items: [
      { materialId: 'MAT-3010', quantity: 6 }
    ]
  },

  // 16. Ordem 10000016 • OPEN • Multi-Item (Discos SAS + Placas de Rede) • EletroPeças Brasil
  {
    docNumber: '10000016',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '20',
    division: '02',
    customerId: '100600',
    customerPoNumber: 'PO-EP-2026-160',
    paymentTerms: 'Z015',
    incoterms: 'CIF',
    incotermsLocation: 'Porto Alegre',
    orderDate: '2026-08-01T11:20:00Z',
    items: [
      { materialId: 'MAT-3020', quantity: 10 },
      { materialId: 'MAT-3080', quantity: 12 }
    ]
  },

  // 17. Ordem 10000017 • OPEN • Prefeitura Nova Esperança • Servidores 1U
  {
    docNumber: '10000017',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100650',
    customerPoNumber: 'PO-PM-2026-173',
    paymentTerms: 'Z060',
    incoterms: 'CIF',
    incotermsLocation: 'Nova Esperança',
    orderDate: '2026-08-05T09:10:00Z',
    items: [
      { materialId: 'MAT-1010', quantity: 3 }
    ]
  },

  // 18. Ordem 10000018 • OPEN • NexusRetail Lojas • Switches Gigabit
  {
    docNumber: '10000018',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '30',
    division: '01',
    customerId: '100700',
    customerPoNumber: 'PO-NR-2026-184',
    paymentTerms: 'Z001',
    incoterms: 'CIF',
    incotermsLocation: 'Recife',
    orderDate: '2026-08-12T13:50:00Z',
    items: [
      { materialId: 'MAT-2004', quantity: 5 }
    ]
  },

  // 19. Ordem 10000019 • OPEN • Multi-Item (Firewall + Switch 48P + Cabos DAC) • DataCore Cloud
  {
    docNumber: '10000019',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100180',
    customerPoNumber: 'PO-DC-2026-192',
    paymentTerms: 'Z015',
    incoterms: 'CIF',
    incotermsLocation: 'Barueri',
    orderDate: '2026-08-18T15:30:00Z',
    items: [
      { materialId: 'MAT-2050', quantity: 1 },
      { materialId: 'MAT-2080', quantity: 2 },
      { materialId: 'MAT-4050', quantity: 4 }
    ]
  },

  // 20. Ordem 10000020 • CANCELLED • Varejo Eletro Brasil • Servidor 1U
  {
    docNumber: '10000020',
    orderType: 'OR',
    salesOrg: '1000',
    distChannel: '10',
    division: '01',
    customerId: '100045',
    customerPoNumber: 'PO-EB-2026-200',
    paymentTerms: 'Z030',
    incoterms: 'CIF',
    incotermsLocation: 'São Paulo',
    orderDate: '2026-08-22T10:00:00Z',
    items: [
      { materialId: 'MAT-1010', quantity: 1 }
    ],
    overallStatus: 'CANCELLED',
    creditStatus: 'RELEASED',
    deliveryStatus: 'NOT_DELIVERED',
    billingStatus: 'NOT_BILLED'
  }
];
