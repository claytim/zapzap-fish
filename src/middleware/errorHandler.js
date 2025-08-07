/**
 * Middleware para tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado pelo middleware:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      error: err.message
    });
  }

  // Erro de sintaxe JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido',
      error: 'Formato de dados inválido'
    });
  }

  // Erro 404 - Rota não encontrada
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Recurso não encontrado',
      error: 'A rota solicitada não existe'
    });
  }

  // Erro interno do servidor (padrão)
  res.status(err.status || 500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
};

module.exports = errorHandler;