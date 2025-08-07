/**
 * Entidade WhatsAppSession - Representa uma sessão do WhatsApp
 */
class WhatsAppSession {
  constructor({ sessionId, qrCode, isConnected, clientInfo }) {
    this.sessionId = sessionId;
    this.qrCode = qrCode || null;
    this.isConnected = isConnected || false;
    this.clientInfo = clientInfo || null;
    this.connectedAt = this.isConnected ? new Date() : null;
  }

  /**
   * Marca a sessão como conectada
   * @param {Object} clientInfo - Informações do cliente
   */
  setConnected(clientInfo) {
    this.isConnected = true;
    this.clientInfo = clientInfo;
    this.connectedAt = new Date();
    this.qrCode = null; // Remove QR code após conexão
  }

  /**
   * Marca a sessão como desconectada
   */
  setDisconnected() {
    this.isConnected = false;
    this.clientInfo = null;
    this.connectedAt = null;
  }

  /**
   * Define um novo QR code
   * @param {string} qrCode
   */
  setQRCode(qrCode) {
    this.qrCode = qrCode;
    this.isConnected = false;
  }

  /**
   * Converte para formato JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      sessionId: this.sessionId,
      qrCode: this.qrCode,
      isConnected: this.isConnected,
      clientInfo: this.clientInfo,
      connectedAt: this.connectedAt
    };
  }
}

module.exports = WhatsAppSession;