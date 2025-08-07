/**
 * Arquivo principal da aplicação ZapZap
 * Responsável por inicializar o servidor e configurar as dependências
 */

const { getContainer } = require('./config/dependencies');
const createServer = require('./config/server');

// Configurações do ambiente
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Inicializa a aplicação
 */
async function startApplication() {
  try {
    console.log('🚀 Iniciando ZapZap...');
    
    // Inicializa o container de dependências
    const container = getContainer();
    console.log('📦 Container de dependências configurado');
    
    // Cria o servidor Express
    const app = createServer(container);
    console.log('⚙️  Servidor Express configurado');
    
    // Inicia o servidor
    const server = app.listen(PORT, () => {
      console.log(`🌟 ZapZap rodando em http://localhost:${PORT}`);
      console.log(`🔧 Ambiente: ${NODE_ENV}`);
      console.log('📱 Acesse a aplicação no navegador para conectar ao WhatsApp');
    });

    // Tratamento de sinais para shutdown graceful
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recebido. Iniciando shutdown graceful...');
      gracefulShutdown(server, container);
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT recebido. Iniciando shutdown graceful...');
      gracefulShutdown(server, container);
    });

    // Tratamento de erros não capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Erro não capturado:', error);
      gracefulShutdown(server, container);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promise rejeitada não tratada:', reason);
      console.error('Promise:', promise);
      gracefulShutdown(server, container);
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

/**
 * Realiza shutdown graceful da aplicação
 * @param {*} server 
 * @param {*} container 
 */
async function gracefulShutdown(server, container) {
  console.log('🔄 Iniciando processo de shutdown...');
  
  try {
    // Fecha o servidor HTTP
    server.close(() => {
      console.log('🚫 Servidor HTTP fechado');
    });

    // Desconecta do WhatsApp se conectado
    if (container.has('whatsAppService')) {
      const whatsAppService = container.get('whatsAppService');
      await whatsAppService.disconnect();
      console.log('📱 WhatsApp desconectado');
    }

    console.log('✅ Shutdown concluído com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante shutdown:', error);
    process.exit(1);
  }
}

// Inicia a aplicação se este arquivo for executado diretamente
if (require.main === module) {
  startApplication();
}

module.exports = { startApplication, gracefulShutdown };