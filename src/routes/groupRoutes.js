const express = require('express');
const router = express.Router();

/**
 * Cria as rotas dos grupos
 * @param {GroupController} groupController
 * @returns {express.Router}
 */
function createGroupRoutes(groupController) {
  // GET /api/groups - Lista todos os grupos
  router.get('/', (req, res) => groupController.getAll(req, res));

  // GET /api/groups/search?q=termo - Pesquisa grupos por nome
  router.get('/search', (req, res) => groupController.search(req, res));

  // GET /api/groups/stats - Estatísticas dos grupos
  router.get('/stats', (req, res) => groupController.getStats(req, res));

  // GET /api/groups/:id - Busca grupo por ID
  router.get('/:id', (req, res) => groupController.getById(req, res));

  // DELETE /api/groups - Remove todos os grupos do cache
  router.delete('/', (req, res) => groupController.clear(req, res));

  return router;
}

module.exports = createGroupRoutes;