# ZapZap - WhatsApp Group Scanner

Uma aplicação Node.js para escanear QR code do WhatsApp e listar grupos usando uma arquitetura em camadas.

## 🚀 Funcionalidades

- Escaneamento de QR code do WhatsApp Web
- Listagem de todos os grupos do WhatsApp
- Interface web moderna e responsiva
- Arquitetura em camadas (Clean Architecture)

## 📁 Estrutura do Projeto

```
src/
├── entities/          # Entidades de domínio
├── repositories/      # Camada de dados
├── services/          # Lógica de negócio
├── controllers/       # Controladores HTTP
├── routes/            # Definição de rotas
├── middleware/        # Middlewares
├── config/            # Configurações
└── public/            # Frontend (HTML, CSS, JS)
```

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo de configuração:
   ```bash
   cp env.example .env
   ```
4. Execute a aplicação:
   ```bash
   npm run dev
   ```

## 🌐 Uso

1. Acesse `http://localhost:3000`
2. Clique em "Conectar WhatsApp"
3. Escaneie o QR code com seu WhatsApp
4. Visualize seus grupos listados automaticamente

## 🏗️ Arquitetura

Este projeto segue os princípios da Clean Architecture com separação clara de responsabilidades:

- **Entities**: Modelos de domínio
- **Repositories**: Abstração de dados
- **Services**: Casos de uso e lógica de negócio
- **Controllers**: Camada de apresentação
- **Routes**: Definição de endpoints