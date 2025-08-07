// Importações das dependências
const InMemoryGroupRepository = require('../repositories/InMemoryGroupRepository');
const InMemoryWhatsAppRepository = require('../repositories/InMemoryWhatsAppRepository');
const WhatsAppService = require('../services/WhatsAppService');
const GroupService = require('../services/GroupService');
const WhatsAppController = require('../controllers/WhatsAppController');
const GroupController = require('../controllers/GroupController');

/**
 * Container de dependências - Padrão Dependency Injection
 * Centraliza a criação e gerenciamento de todas as dependências
 */
class DependencyContainer {
  constructor() {
    this.dependencies = new Map();
    this.setupDependencies();
  }

  /**
   * Configura todas as dependências
   * @private
   */
  setupDependencies() {
    // Repositories
    this.dependencies.set('groupRepository', new InMemoryGroupRepository());
    this.dependencies.set('whatsAppRepository', new InMemoryWhatsAppRepository());

    // Services
    this.dependencies.set('whatsAppService', new WhatsAppService(
      this.get('whatsAppRepository'),
      this.get('groupRepository')
    ));
    
    this.dependencies.set('groupService', new GroupService(
      this.get('groupRepository')
    ));

    // Controllers
    this.dependencies.set('whatsAppController', new WhatsAppController(
      this.get('whatsAppService')
    ));
    
    this.dependencies.set('groupController', new GroupController(
      this.get('groupService')
    ));
  }

  /**
   * Recupera uma dependência pelo nome
   * @param {string} name
   * @returns {*}
   */
  get(name) {
    if (!this.dependencies.has(name)) {
      throw new Error(`Dependência '${name}' não encontrada`);
    }
    return this.dependencies.get(name);
  }

  /**
   * Registra uma nova dependência
   * @param {string} name
   * @param {*} dependency
   */
  register(name, dependency) {
    this.dependencies.set(name, dependency);
  }

  /**
   * Lista todas as dependências registradas
   * @returns {string[]}
   */
  listDependencies() {
    return Array.from(this.dependencies.keys());
  }

  /**
   * Verifica se uma dependência existe
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.dependencies.has(name);
  }
}

// Singleton instance
let container = null;

/**
 * Retorna a instância única do container
 * @returns {DependencyContainer}
 */
function getContainer() {
  if (!container) {
    container = new DependencyContainer();
  }
  return container;
}

module.exports = { DependencyContainer, getContainer };