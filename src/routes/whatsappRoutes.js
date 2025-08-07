const express = require('express');
const router = express.Router();

/**
 * Cria as rotas do WhatsApp
 * @param {WhatsAppController} whatsAppController
 * @returns {express.Router}
 */
function createWhatsAppRoutes(whatsAppController) {
  // POST /api/whatsapp/connect - Inicia conexão com WhatsApp
  router.post('/connect', (req, res) => whatsAppController.connect(req, res));

  // GET /api/whatsapp/status - Verifica status da conexão
  router.get('/status', (req, res) => whatsAppController.getStatus(req, res));

  // DELETE /api/whatsapp/disconnect - Desconecta do WhatsApp
  router.delete('/disconnect', (req, res) => whatsAppController.disconnect(req, res));

  // POST /api/whatsapp/groups/fetch - Busca grupos do WhatsApp
  router.post('/groups/fetch', (req, res) => whatsAppController.fetchGroups(req, res));

  return router;
}

module.exports = createWhatsAppRoutes;