/**
 * Interface para o repositório de grupos
 * Define o contrato para operações de dados relacionadas aos grupos
 */
class IGroupRepository {
  /**
   * Busca todos os grupos
   * @returns {Promise<Group[]>}
   */
  async findAll() {
    throw new Error('Method findAll must be implemented');
  }

  /**
   * Busca um grupo por ID
   * @param {string} id
   * @returns {Promise<Group|null>}
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Salva uma lista de grupos
   * @param {Group[]} groups
   * @returns {Promise<void>}
   */
  async saveGroups(groups) {
    throw new Error('Method saveGroups must be implemented');
  }

  /**
   * Remove todos os grupos
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('Method clear must be implemented');
  }
}

module.exports = IGroupRepository;