/**
 * Controller responsável pelos endpoints relacionados ao WhatsApp
 */
class WhatsAppController {
  constructor(whatsAppService) {
    this.whatsAppService = whatsAppService;
  }

  /**
   * Inicia a conexão com WhatsApp
   * @param {Object} req
   * @param {Object} res
   */
  async connect(req, res) {
    try {
      await this.whatsAppService.initialize();
      
      res.json({
        success: true,
        message: 'Iniciando conexão com WhatsApp...',
        data: null
      });
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Verifica o status da conexão
   * @param {Object} req
   * @param {Object} res
   */
  async getStatus(req, res) {
    try {
      const status = await this.whatsAppService.getConnectionStatus();
      
      res.json({
        success: true,
        message: 'Status recuperado com sucesso',
        data: status
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Desconecta do WhatsApp
   * @param {Object} req
   * @param {Object} res
   */
  async disconnect(req, res) {
    try {
      await this.whatsAppService.disconnect();
      
      res.json({
        success: true,
        message: 'Desconectado com sucesso',
        data: null
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Busca os grupos do WhatsApp
   * @param {Object} req
   * @param {Object} res
   */
  async fetchGroups(req, res) {
    try {
      const groups = await this.whatsAppService.getGroups();
      
      res.json({
        success: true,
        message: 'Grupos recuperados com sucesso',
        data: {
          groups: groups.map(group => group.toJSON()),
          count: groups.length
        }
      });
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      
      if (error.message.includes('não está conectado')) {
        res.status(400).json({
          success: false,
          message: 'WhatsApp não está conectado',
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          error: error.message
        });
      }
    }
  }
}

module.exports = WhatsAppController;