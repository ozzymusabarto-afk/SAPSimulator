/**
 * NexusTech ERP • Esquema de Cálculo de Preços (Pricing Procedure / V/08 / KONP / VK11)
 */

export const ConditionTypes = [
  {
    code: 'PR00',
    name: 'Preço Base do Material (Tabela Padrão)',
    type: 'BASE_PRICE',
    calcType: 'FIXED_PER_UNIT',
    isMandatory: true,
    description: 'Preço de tabela registrado no mestre ou na transação VK11.'
  },
  {
    code: 'RB00',
    name: 'Desconto Comercial (%)',
    type: 'DISCOUNT',
    calcType: 'PERCENTAGE',
    isMandatory: false,
    description: 'Desconto comercial negociado com o cliente (negativo).'
  },
  {
    code: 'KF00',
    name: 'Frete Fixo por Item',
    type: 'SURCHARGE',
    calcType: 'FIXED_AMOUNT',
    isMandatory: false,
    description: 'Taxa de frete quando a modalidade for CIF ou entrega especial.'
  },
  {
    code: 'MWST',
    name: 'ICMS (Imposto Estadual / 18%)',
    type: 'TAX',
    calcType: 'PERCENTAGE',
    rate: 0.18,
    isMandatory: true,
    description: 'Imposto sobre Circulação de Mercadorias e Serviços.'
  },
  {
    code: 'PIS_COF',
    name: 'PIS/COFINS (Tributo Federal / 9.25%)',
    type: 'TAX',
    calcType: 'PERCENTAGE',
    rate: 0.0925,
    isMandatory: true,
    description: 'Programa de Integração Social e Contribuição para Financiamento da Seguridade Social.'
  }
];

export const InitialPricingRecords = [
  { materialId: 'MAT-1001', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 8500.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2004', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 1250.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2004', salesOrg: '1000', distChannel: '20', conditionCode: 'PR00', amount: 1250.00, validTo: '31.12.2028' },
  { materialId: 'MAT-3050', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 980.00, validTo: '31.12.2028' },
  { materialId: 'MAT-1010', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 4200.00, validTo: '31.12.2028' },
  { materialId: 'MAT-1050', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 16500.00, validTo: '31.12.2028' },
  { materialId: 'MAT-1090', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 7800.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2010', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 2400.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2020', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 890.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2020', salesOrg: '1000', distChannel: '20', conditionCode: 'PR00', amount: 890.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2050', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 5400.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2080', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 2850.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2080', salesOrg: '1000', distChannel: '20', conditionCode: 'PR00', amount: 2850.00, validTo: '31.12.2028' },
  { materialId: 'MAT-3010', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 1450.00, validTo: '31.12.2028' },
  { materialId: 'MAT-3020', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 1150.00, validTo: '31.12.2028' },
  { materialId: 'MAT-3080', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 620.00, validTo: '31.12.2028' },
  { materialId: 'MAT-3090', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 480.00, validTo: '31.12.2028' },
  { materialId: 'MAT-4010', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 390.00, validTo: '31.12.2028' },
  { materialId: 'MAT-4020', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 110.00, validTo: '31.12.2028' },
  { materialId: 'MAT-4020', salesOrg: '1000', distChannel: '20', conditionCode: 'PR00', amount: 110.00, validTo: '31.12.2028' },
  { materialId: 'MAT-4050', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 95.00, validTo: '31.12.2028' },
  { materialId: 'MAT-5010', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 3200.00, validTo: '31.12.2028' },
  { materialId: 'MAT-5050', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 1180.00, validTo: '31.12.2028' }
  // Nota: MAT-4099 intencionalmente não possui registro de PR00 para simular erro de precificação (VK11)
];
