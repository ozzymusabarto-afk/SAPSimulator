/**
 * NexusTech ERP • Formatters & Utilities
 */

export const Formatters = {
  /**
   * Formata valor para Real Brasileiro (BRL)
   * @param {number} value
   * @returns {string}
   */
  currency(value) {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Formata percentual (ex: 0.15 -> 15%)
   * @param {number} value
   * @returns {string}
   */
  percent(value) {
    if (value === undefined || value === null) return '0%';
    return `${(value * 100).toFixed(1).replace('.0', '')}%`;
  },

  /**
   * Formata número de documento padrão SAP (ex: 10000023)
   * @param {number|string} docNum
   * @param {number} padLength
   * @returns {string}
   */
  documentNumber(docNum, padLength = 8) {
    if (!docNum) return '';
    return String(docNum).padStart(padLength, '0');
  },

  /**
   * Formata data para o padrão corporativo brasileiro (DD.MM.AAAA)
   * @param {Date|string} date
   * @returns {string}
   */
  date(date = new Date()) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  },

  /**
   * Formata tempo em minutos/segundos para o timer de SLA (ex: 07:42)
   * @param {number} totalSeconds
   * @returns {string}
   */
  timer(totalSeconds) {
    if (totalSeconds < 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
};
