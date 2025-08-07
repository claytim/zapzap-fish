/**
 * Middleware simples de rate limiting
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 15 * 60 * 1000) { // 100 requests per 15 minutes
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Limpa registros expirados
      this.cleanExpiredRequests(now);
      
      // Verifica se o IP já tem registros
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }
      
      const userRequests = this.requests.get(key);
      
      // Filtra apenas requests dentro da janela de tempo
      const requestsInWindow = userRequests.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      // Verifica se excedeu o limite
      if (requestsInWindow.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil(this.windowMs / 1000)
        });
      }
      
      // Adiciona a requisição atual
      requestsInWindow.push(now);
      this.requests.set(key, requestsInWindow);
      
      // Adiciona headers informativos
      res.set({
        'X-RateLimit-Limit': this.maxRequests,
        'X-RateLimit-Remaining': this.maxRequests - requestsInWindow.length,
        'X-RateLimit-Reset': new Date(now + this.windowMs).toISOString()
      });
      
      next();
    };
  }

  cleanExpiredRequests(now) {
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

module.exports = RateLimiter;