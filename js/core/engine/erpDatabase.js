/**
 * NexusTech ERP • Banco de Dados Simulado em Memória (ERP State)
 * Guarda e manipula ordens de venda, clientes, materiais e condições
 */

import { InitialCustomers } from '../domain/customers.js';
import { InitialMaterials } from '../domain/materials.js';
import { InitialPricingRecords } from '../domain/pricing.js';

class ErpDatabase {
  constructor() {
    this.customers = JSON.parse(JSON.stringify(InitialCustomers));
    this.materials = JSON.parse(JSON.stringify(InitialMaterials));
    this.pricingRecords = JSON.parse(JSON.stringify(InitialPricingRecords));
    
    // Ordens de Venda Simuladas (Tabelas VBAK / VBAP)
    this.salesOrders = [];
    this.nextOrderNumber = 10000001;

    // Remessas / Fornecimentos (Tabela LIKP)
    this.deliveries = [];
    this.nextDeliveryNumber = 80000001;

    // Faturas / Faturamento (Tabela VBRK)
    this.invoices = [];
    this.nextInvoiceNumber = 90000001;

    // Ordens Bloqueadas por Crédito (VKM1)
    this.creditBlockedOrders = [];

    this.listeners = [];
  }

  /**
   * Inscreve um ouvinte para alterações no estado do ERP
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // --- Métodos de Clientes ---
  getCustomer(id) {
    return this.customers.find(c => c.id === id) || null;
  }

  getAllCustomers() {
    return this.customers;
  }

  // --- Métodos de Materiais ---
  getMaterial(id) {
    return this.materials.find(m => m.id === id) || null;
  }

  getAllMaterials() {
    return this.materials;
  }

  updateMaterialStock(materialId, quantityDeduction) {
    const mat = this.getMaterial(materialId);
    if (mat) {
      mat.stockAvailable = Math.max(0, mat.stockAvailable - quantityDeduction);
      mat.stockReserved += quantityDeduction;
      this.notify();
    }
  }

  // --- Métodos de Condições de Preço ---
  getPricingRecord(materialId, salesOrg = '1000', distChannel = '10', conditionCode = 'PR00') {
    return this.pricingRecords.find(p => 
      p.materialId === materialId &&
      p.salesOrg === salesOrg &&
      p.distChannel === distChannel &&
      p.conditionCode === conditionCode
    ) || null;
  }

  addOrUpdatePricingRecord(record) {
    const index = this.pricingRecords.findIndex(p => 
      p.materialId === record.materialId &&
      p.salesOrg === record.salesOrg &&
      p.distChannel === record.distChannel &&
      p.conditionCode === record.conditionCode
    );

    if (index >= 0) {
      this.pricingRecords[index] = { ...this.pricingRecords[index], ...record };
    } else {
      this.pricingRecords.push(record);
    }

    // Se for PR00, atualiza flag do material
    if (record.conditionCode === 'PR00') {
      const mat = this.getMaterial(record.materialId);
      if (mat) {
        mat.basePrice = record.amount;
        mat.hasPricingCondition = true;
      }
    }

    this.notify();
  }

  // --- Métodos de Ordens de Venda (VA01 / VA03) ---
  createSalesOrder(orderData) {
    const docNumber = String(this.nextOrderNumber++);
    const newOrder = {
      docNumber,
      orderType: orderData.orderType || 'OR',
      salesOrg: orderData.salesOrg || '1000',
      distChannel: orderData.distChannel || '10',
      division: orderData.division || '01',
      customerId: orderData.customerId,
      customerPoNumber: orderData.customerPoNumber || '',
      paymentTerms: orderData.paymentTerms,
      incoterms: orderData.incoterms,
      incotermsLocation: orderData.incotermsLocation || '',
      orderDate: orderData.orderDate || new Date().toISOString(),
      items: orderData.items || [],
      netValue: orderData.netValue || 0,
      taxValue: orderData.taxValue || 0,
      totalValue: orderData.totalValue || 0,
      overallStatus: 'OPEN', // OPEN, CREDIT_BLOCKED, COMPLETED, CANCELLED
      creditStatus: 'NOT_CHECKED',
      deliveryStatus: 'NOT_DELIVERED',
      billingStatus: 'NOT_BILLED',
      documentFlow: [
        { type: 'ORDER', number: docNumber, status: 'OPEN', date: new Date().toLocaleDateString('pt-BR') }
      ]
    };

    // Verificação de Limite de Crédito
    const customer = this.getCustomer(orderData.customerId);
    if (customer) {
      const projectedCredit = customer.creditUsed + newOrder.totalValue;
      if (projectedCredit > customer.creditLimit || customer.creditStatus === 'BLOCKED') {
        newOrder.overallStatus = 'CREDIT_BLOCKED';
        newOrder.creditStatus = 'BLOCKED';
        this.creditBlockedOrders.push({
          orderDocNumber: docNumber,
          customer,
          totalValue: newOrder.totalValue,
          blockedDate: new Date().toLocaleDateString('pt-BR'),
          reason: `Limite de Crédito Excedido (Utilizado: R$ ${customer.creditUsed.toFixed(2)} + Pedido: R$ ${newOrder.totalValue.toFixed(2)} > Limite: R$ ${customer.creditLimit.toFixed(2)})`
        });
      } else {
        newOrder.creditStatus = 'RELEASED';
        customer.creditUsed += newOrder.totalValue;
      }
    }

    this.salesOrders.push(newOrder);
    this.notify();
    return newOrder;
  }

  getSalesOrder(docNumber) {
    return this.salesOrders.find(o => o.docNumber === docNumber) || null;
  }

  getAllSalesOrders() {
    return this.salesOrders;
  }

  // --- Liberação de Crédito Comercial (VKM1) ---
  releaseCreditOrder(docNumber, managerNotes = 'Liberado por alçada comercial') {
    const order = this.getSalesOrder(docNumber);
    if (!order) return false;

    order.overallStatus = 'OPEN';
    order.creditStatus = 'RELEASED_MANUAL';
    order.creditReleaseNotes = managerNotes;

    this.creditBlockedOrders = this.creditBlockedOrders.filter(b => b.orderDocNumber !== docNumber);
    this.notify();
    return true;
  }

  // Reset total para estado inicial do treinamento
  resetDatabase() {
    this.customers = JSON.parse(JSON.stringify(InitialCustomers));
    this.materials = JSON.parse(JSON.stringify(InitialMaterials));
    this.pricingRecords = JSON.parse(JSON.stringify(InitialPricingRecords));
    this.salesOrders = [];
    this.deliveries = [];
    this.invoices = [];
    this.creditBlockedOrders = [];
    this.nextOrderNumber = 10000001;
    this.notify();
  }
}

export const db = new ErpDatabase();
