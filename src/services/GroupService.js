/**
 * Serviço responsável pela lógica de negócio dos grupos
 */
class GroupService {
  constructor(groupRepository) {
    this.groupRepository = groupRepository;
  }

  /**
   * Busca todos os grupos
   * @returns {Promise<Object[]>}
   */
  async getAllGroups() {
    try {
      const groups = await this.groupRepository.findAll();
      return groups.map(group => group.toJSON());
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      throw new Error('Falha ao recuperar grupos');
    }
  }

  /**
   * Busca um grupo por ID
   * @param {string} groupId
   * @returns {Promise<Object|null>}
   */
  async getGroupById(groupId) {
    try {
      const group = await this.groupRepository.findById(groupId);
      return group ? group.toJSON() : null;
    } catch (error) {
      console.error('Erro ao buscar grupo por ID:', error);
      throw new Error('Falha ao recuperar grupo');
    }
  }

  /**
   * Filtra grupos por nome
   * @param {string} searchTerm
   * @returns {Promise<Object[]>}
   */
  async searchGroups(searchTerm) {
    try {
      const groups = await this.groupRepository.findAll();
      const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredGroups.map(group => group.toJSON());
    } catch (error) {
      console.error('Erro ao pesquisar grupos:', error);
      throw new Error('Falha ao pesquisar grupos');
    }
  }

  /**
   * Retorna estatísticas dos grupos
   * @returns {Promise<Object>}
   */
  async getGroupStats() {
    try {
      const groups = await this.groupRepository.findAll();
      
      const stats = {
        totalGroups: groups.length,
        adminGroups: groups.filter(group => group.isGroupAdmin).length,
        totalParticipants: groups.reduce((sum, group) => sum + group.getParticipantCount(), 0),
        averageParticipants: 0,
        largestGroup: null,
        smallestGroup: null
      };

      if (groups.length > 0) {
        stats.averageParticipants = Math.round(stats.totalParticipants / groups.length);
        
        const sortedBySize = groups.sort((a, b) => b.getParticipantCount() - a.getParticipantCount());
        stats.largestGroup = {
          name: sortedBySize[0].name,
          participants: sortedBySize[0].getParticipantCount()
        };
        stats.smallestGroup = {
          name: sortedBySize[sortedBySize.length - 1].name,
          participants: sortedBySize[sortedBySize.length - 1].getParticipantCount()
        };
      }

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw new Error('Falha ao calcular estatísticas dos grupos');
    }
  }

  /**
   * Remove todos os grupos do cache
   * @returns {Promise<void>}
   */
  async clearGroups() {
    try {
      await this.groupRepository.clear();
    } catch (error) {
      console.error('Erro ao limpar grupos:', error);
      throw new Error('Falha ao limpar grupos');
    }
  }
}

module.exports = GroupService;