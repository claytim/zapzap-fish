const IWhatsAppRepository = require('./IWhatsAppRepository');
const WhatsAppSession = require('../entities/WhatsAppSession');

/**
 * Implementação em memória do repositório do WhatsApp
 */
class InMemoryWhatsAppRepository extends IWhatsAppRepository {
  constructor() {
    super();
    this.sessions = new Map();
  }

  /**
   * Salva o estado da sessão
   * @param {WhatsAppSession} session
   * @returns {Promise<void>}
   */
  async saveSession(session) {
    if (session instanceof WhatsAppSession) {
      this.sessions.set(session.sessionId, session);
    }
  }

  /**
   * Recupera o estado da sessão
   * @param {string} sessionId
   * @returns {Promise<WhatsAppSession|null>}
   */
  async getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Remove a sessão
   * @param {string} sessionId
   * @returns {Promise<void>}
   */
  async removeSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Verifica se existe uma sessão ativa
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   */
  async hasActiveSession(sessionId) {
    const session = await this.getSession(sessionId);
    return session && session.isConnected;
  }

  /**
   * Lista todas as sessões
   * @returns {Promise<WhatsAppSession[]>}
   */
  async getAllSessions() {
    return Array.from(this.sessions.values());
  }

  /**
   * Remove todas as sessões
   * @returns {Promise<void>}
   */
  async clear() {
    this.sessions.clear();
  }
}

module.exports = InMemoryWhatsAppRepository;