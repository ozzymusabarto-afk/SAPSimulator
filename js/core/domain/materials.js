/**
 * NexusTech ERP • Mestre de Materiais (Material Master Data / MM03 / MARA / MARC / MARD)
 */

export const InitialMaterials = [
  {
    id: 'MAT-1001',
    description: 'Servidor Enterprise Nexus Pro X (Dual Xeon 64GB)',
    materialGroup: '001', // Hardware Servidores
    baseUnit: 'UN',
    salesOrg: '1000',
    distChannel: '10',
    plantId: '1000', // CD SP
    storageLocation: 'DEP1',
    
    // Preço Base Padrão (Condição PR00)
    basePrice: 8500.00,
    hasPricingCondition: true,
    
    // Estoque Físico e ATP (Available to Promise)
    stockPhysical: 45,
    stockReserved: 10,
    stockAvailable: 35, // ATP = 35 UN
    
    taxClassification: '1 (Tributação Integral ICMS/IPI)',
    ncm: '8471.50.10',
    ean: '7891234567890',
    weightKg: 18.5
  },
  {
    id: 'MAT-2004',
    description: 'Switch Gigabit 24 Portas Managed Layer 3',
    materialGroup: '002', // Redes & Telecom
    baseUnit: 'UN',
    salesOrg: '1000',
    distChannel: '10',
    plantId: '1000',
    storageLocation: 'DEP1',
    
    basePrice: 1250.00,
    hasPricingCondition: true,
    
    stockPhysical: 140,
    stockReserved: 20,
    stockAvailable: 120, // ATP = 120 UN
    
    taxClassification: '1',
    ncm: '8517.62.59',
    ean: '7891234567891',
    weightKg: 3.2
  },
  {
    id: 'MAT-3050',
    description: 'Módulo de Memória ECC 64GB DDR5 Server Grade',
    materialGroup: '003', // Componentes Críticos
    baseUnit: 'UN',
    salesOrg: '1000',
    distChannel: '10',
    plantId: '1000',
    storageLocation: 'DEP2',
    
    basePrice: 980.00,
    hasPricingCondition: true,
    
    // Estoque Baixo (Gatilho para Cenário de Ruptura de Estoque / Verificação de Disponibilidade ATP)
    stockPhysical: 8,
    stockReserved: 4,
    stockAvailable: 4, // Apenas 4 disponíveis! Se o cliente pedir 10, gerará erro de ATP
    
    taxClassification: '1',
    ncm: '8473.30.42',
    ean: '7891234567892',
    weightKg: 0.15
  },
  {
    id: 'MAT-4099',
    description: 'Cabo de Fibra Óptica 10m Duplex LC-LC Patch Cord',
    materialGroup: '004', // Acessórios & Cabos
    baseUnit: 'UN',
    salesOrg: '1000',
    distChannel: '10',
    plantId: '1000',
    storageLocation: 'DEP1',
    
    // Erro de Precificação (Gatilho: Material novo sem registro de condição VK11 / PR00)
    basePrice: 0.00,
    hasPricingCondition: false,
    expectedPrice: 65.00, // Preço correto que o trainee precisa registrar na VK11 ou ajustar
    
    stockPhysical: 500,
    stockReserved: 50,
    stockAvailable: 450,
    
    taxClassification: '1',
    ncm: '8544.70.10',
    ean: '7891234567893',
    weightKg: 0.25
  }
];
