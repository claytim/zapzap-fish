require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Middlewares customizados
const errorHandler = require('../middleware/errorHandler');
const RateLimiter = require('../middleware/rateLimiter');

// Configuração das rotas
const createWhatsAppRoutes = require('../routes/whatsappRoutes');
const createGroupRoutes = require('../routes/groupRoutes');

/**
 * Configura e retorna o servidor Express
 * @param {DependencyContainer} container
 * @returns {express.Application}
 */
function createServer(container) {
  const app = express();

  // Rate Limiter
  const rateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

  // Middlewares de segurança e utilidade
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    }
  }));
  
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  app.use(rateLimiter.middleware());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Servir arquivos estáticos
  app.use(express.static(path.join(__dirname, '../public')));

  // Rotas da API
  app.use('/api/whatsapp', createWhatsAppRoutes(container.get('whatsAppController')));
  app.use('/api/groups', createGroupRoutes(container.get('groupController')));

  // Rota de health check
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Servidor funcionando corretamente',
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      }
    });
  });

  // Rota para servir o frontend na raiz
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Handler para rotas não encontradas
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada',
      error: `A rota ${req.originalUrl} não existe`
    });
  });

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorHandler);

  return app;
}

module.exports = createServer;