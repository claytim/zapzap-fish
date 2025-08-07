const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const WhatsAppSession = require('../entities/WhatsAppSession');
const Group = require('../entities/Group');

/**
 * Serviço responsável pela integração com WhatsApp Web
 */
class WhatsAppService {
  constructor(whatsAppRepository, groupRepository) {
    this.whatsAppRepository = whatsAppRepository;
    this.groupRepository = groupRepository;
    this.client = null;
    this.sessionId = 'zapzap-session';
    this.eventHandlers = {
      qr: [],
      ready: [],
      authenticated: [],
      disconnected: []
    };
  }

  /**
   * Inicializa o cliente WhatsApp
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.client) {
      return;
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.sessionId
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
    await this.client.initialize();
  }

  /**
   * Configura os handlers de eventos do WhatsApp
   * @private
   */
  setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(qr);
        const session = new WhatsAppSession({
          sessionId: this.sessionId,
          qrCode: qrCodeDataURL,
          isConnected: false
        });
        
        await this.whatsAppRepository.saveSession(session);
        this.emitEvent('qr', { qrCode: qrCodeDataURL });
      } catch (error) {
        console.error('Erro ao gerar QR code:', error);
      }
    });

    this.client.on('authenticated', async () => {
      console.log('WhatsApp autenticado com sucesso');
      this.emitEvent('authenticated');
    });

    this.client.on('ready', async () => {
      try {
        const clientInfo = {
          number: this.client.info.wid.user,
          name: this.client.info.pushname || 'Usuário'
        };

        const session = new WhatsAppSession({
          sessionId: this.sessionId,
          isConnected: true,
          clientInfo
        });

        await this.whatsAppRepository.saveSession(session);
        console.log('WhatsApp conectado e pronto!');
        this.emitEvent('ready', { clientInfo });
      } catch (error) {
        console.error('Erro ao processar conexão:', error);
      }
    });

    this.client.on('disconnected', async (reason) => {
      console.log('WhatsApp desconectado:', reason);
      
      const session = await this.whatsAppRepository.getSession(this.sessionId);
      if (session) {
        session.setDisconnected();
        await this.whatsAppRepository.saveSession(session);
      }
      
      this.client = null;
      this.emitEvent('disconnected', { reason });
    });
  }

  /**
   * Busca todos os grupos do WhatsApp
   * @returns {Promise<Group[]>}
   */
  async getGroups() {
    if (!this.client || !this.client.info) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const chats = await this.client.getChats();
      const groups = chats
        .filter(chat => chat.isGroup)
        .map(chat => new Group({
          id: chat.id._serialized,
          name: chat.name,
          description: chat.description || '',
          participants: chat.participants || [],
          isGroupAdmin: chat.participants.some(p => 
            p.id._serialized === this.client.info.wid._serialized && p.isAdmin
          ),
          createdAt: new Date(chat.createdAt * 1000)
        }));

      // Salva os grupos no repositório
      await this.groupRepository.saveGroups(groups);
      
      return groups;
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      throw new Error('Falha ao buscar grupos do WhatsApp');
    }
  }

  /**
   * Verifica o status da conexão
   * @returns {Promise<Object>}
   */
  async getConnectionStatus() {
    const session = await this.whatsAppRepository.getSession(this.sessionId);
    
    return {
      isConnected: session?.isConnected || false,
      qrCode: session?.qrCode || null,
      clientInfo: session?.clientInfo || null
    };
  }

  /**
   * Desconecta o cliente WhatsApp
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
    }
    
    await this.whatsAppRepository.removeSession(this.sessionId);
  }

  /**
   * Adiciona um listener para eventos
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(handler);
    }
  }

  /**
   * Remove um listener de evento
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      const index = this.eventHandlers[event].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    }
  }

  /**
   * Emite um evento para todos os listeners
   * @private
   * @param {string} event
   * @param {*} data
   */
  emitEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Erro no handler do evento ${event}:`, error);
        }
      });
    }
  }
}

module.exports = WhatsAppService;