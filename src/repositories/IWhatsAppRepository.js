/**
 * Interface para o repositório do WhatsApp
 * Define o contrato para operações de dados relacionadas às sessões do WhatsApp
 */
class IWhatsAppRepository {
  /**
   * Salva o estado da sessão
   * @param {WhatsAppSession} session
   * @returns {Promise<void>}
   */
  async saveSession(session) {
    throw new Error('Method saveSession must be implemented');
  }

  /**
   * Recupera o estado da sessão
   * @param {string} sessionId
   * @returns {Promise<WhatsAppSession|null>}
   */
  async getSession(sessionId) {
    throw new Error('Method getSession must be implemented');
  }

  /**
   * Remove a sessão
   * @param {string} sessionId
   * @returns {Promise<void>}
   */
  async removeSession(sessionId) {
    throw new Error('Method removeSession must be implemented');
  }

  /**
   * Verifica se existe uma sessão ativa
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   */
  async hasActiveSession(sessionId) {
    throw new Error('Method hasActiveSession must be implemented');
  }
}

module.exports = IWhatsAppRepository;