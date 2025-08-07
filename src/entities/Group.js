/**
 * Entidade Group - Representa um grupo do WhatsApp
 */
class Group {
  constructor({ id, name, description, participants, isGroupAdmin, createdAt }) {
    this.id = id;
    this.name = name;
    this.description = description || '';
    this.participants = participants || [];
    this.isGroupAdmin = isGroupAdmin || false;
    this.createdAt = createdAt || new Date();
  }

  /**
   * Valida se o grupo é válido
   * @returns {boolean}
   */
  isValid() {
    return this.id && this.name && this.participants.length > 0;
  }

  /**
   * Retorna o número de participantes
   * @returns {number}
   */
  getParticipantCount() {
    return this.participants.length;
  }

  /**
   * Converte para formato JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      participantCount: this.getParticipantCount(),
      isGroupAdmin: this.isGroupAdmin,
      createdAt: this.createdAt
    };
  }
}

module.exports = Group;