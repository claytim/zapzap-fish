const IGroupRepository = require('./IGroupRepository');
const Group = require('../entities/Group');

/**
 * Implementação em memória do repositório de grupos
 */
class InMemoryGroupRepository extends IGroupRepository {
  constructor() {
    super();
    this.groups = new Map();
  }

  /**
   * Busca todos os grupos
   * @returns {Promise<Group[]>}
   */
  async findAll() {
    return Array.from(this.groups.values());
  }

  /**
   * Busca um grupo por ID
   * @param {string} id
   * @returns {Promise<Group|null>}
   */
  async findById(id) {
    return this.groups.get(id) || null;
  }

  /**
   * Salva uma lista de grupos
   * @param {Group[]} groups
   * @returns {Promise<void>}
   */
  async saveGroups(groups) {
    groups.forEach(group => {
      if (group instanceof Group && group.isValid()) {
        this.groups.set(group.id, group);
      }
    });
  }

  /**
   * Salva um único grupo
   * @param {Group} group
   * @returns {Promise<void>}
   */
  async save(group) {
    if (group instanceof Group && group.isValid()) {
      this.groups.set(group.id, group);
    }
  }

  /**
   * Remove todos os grupos
   * @returns {Promise<void>}
   */
  async clear() {
    this.groups.clear();
  }

  /**
   * Conta o total de grupos
   * @returns {Promise<number>}
   */
  async count() {
    return this.groups.size;
  }
}

module.exports = InMemoryGroupRepository;