/**
 * Controller responsável pelos endpoints relacionados aos grupos
 */
class GroupController {
  constructor(groupService) {
    this.groupService = groupService;
  }

  /**
   * Lista todos os grupos
   * @param {Object} req
   * @param {Object} res
   */
  async getAll(req, res) {
    try {
      const groups = await this.groupService.getAllGroups();
      
      res.json({
        success: true,
        message: 'Grupos recuperados com sucesso',
        data: {
          groups,
          count: groups.length
        }
      });
    } catch (error) {
      console.error('Erro ao listar grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Busca um grupo por ID
   * @param {Object} req
   * @param {Object} res
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const group = await this.groupService.getGroupById(id);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo não encontrado',
          data: null
        });
      }
      
      res.json({
        success: true,
        message: 'Grupo encontrado',
        data: group
      });
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Pesquisa grupos por nome
   * @param {Object} req
   * @param {Object} res
   */
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Termo de pesquisa deve ter pelo menos 2 caracteres',
          data: null
        });
      }
      
      const groups = await this.groupService.searchGroups(q.trim());
      
      res.json({
        success: true,
        message: 'Pesquisa realizada com sucesso',
        data: {
          groups,
          count: groups.length,
          searchTerm: q.trim()
        }
      });
    } catch (error) {
      console.error('Erro ao pesquisar grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Retorna estatísticas dos grupos
   * @param {Object} req
   * @param {Object} res
   */
  async getStats(req, res) {
    try {
      const stats = await this.groupService.getGroupStats();
      
      res.json({
        success: true,
        message: 'Estatísticas recuperadas com sucesso',
        data: stats
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Remove todos os grupos do cache
   * @param {Object} req
   * @param {Object} res
   */
  async clear(req, res) {
    try {
      await this.groupService.clearGroups();
      
      res.json({
        success: true,
        message: 'Grupos removidos com sucesso',
        data: null
      });
    } catch (error) {
      console.error('Erro ao limpar grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = GroupController;