/**
 * ZapZap Frontend JavaScript
 * Gerencia a interface do usuário e comunicação com a API
 */

class ZapZapApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.isConnected = false;
        this.groups = [];
        this.filteredGroups = [];
        this.pollingInterval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.checkInitialStatus();
        
        console.log('🚀 ZapZap App inicialized');
    }

    /**
     * Inicializa referências aos elementos DOM
     */
    initializeElements() {
        // Status elements
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        
        // Buttons
        this.connectBtn = document.getElementById('connect-btn');
        this.disconnectBtn = document.getElementById('disconnect-btn');
        this.fetchGroupsBtn = document.getElementById('fetch-groups-btn');
        this.clearGroupsBtn = document.getElementById('clear-groups-btn');
        
        // Sections
        this.connectionSection = document.getElementById('connection-section');
        this.groupsSection = document.getElementById('groups-section');
        
        // QR Code
        this.qrContainer = document.getElementById('qr-container');
        this.qrImage = document.getElementById('qr-image');
        
        // Connection info
        this.connectionInfo = document.getElementById('connection-info');
        this.userName = document.getElementById('user-name');
        this.userNumber = document.getElementById('user-number');
        
        // Groups
        this.searchInput = document.getElementById('search-input');
        this.groupsList = document.getElementById('groups-list');
        this.loadingGroups = document.getElementById('loading-groups');
        this.noGroups = document.getElementById('no-groups');
        this.groupsContainer = document.getElementById('groups-container');
        
        // Stats
        this.statsContainer = document.getElementById('stats-container');
        this.totalGroups = document.getElementById('total-groups');
        this.adminGroups = document.getElementById('admin-groups');
        this.totalParticipants = document.getElementById('total-participants');
        this.avgParticipants = document.getElementById('avg-participants');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');
        
        // Toast container
        this.toastContainer = document.getElementById('toast-container');
    }

    /**
     * Vincula eventos aos elementos
     */
    bindEvents() {
        this.connectBtn.addEventListener('click', () => this.connectWhatsApp());
        this.disconnectBtn.addEventListener('click', () => this.disconnectWhatsApp());
        this.fetchGroupsBtn.addEventListener('click', () => this.fetchGroups());
        this.clearGroupsBtn.addEventListener('click', () => this.clearGroups());
        
        this.searchInput.addEventListener('input', (e) => this.searchGroups(e.target.value));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.searchInput.focus();
                        break;
                }
            }
        });
    }

    /**
     * Verifica o status inicial da conexão
     */
    async checkInitialStatus() {
        try {
            const response = await this.apiCall('/whatsapp/status');
            this.updateConnectionStatus(response.data);
        } catch (error) {
            console.error('Erro ao verificar status inicial:', error);
            this.showToast('Erro ao verificar status da conexão', 'error');
        }
    }

    /**
     * Conecta ao WhatsApp
     */
    async connectWhatsApp() {
        try {
            this.showLoading('Iniciando conexão com WhatsApp...');
            this.connectBtn.disabled = true;
            
            await this.apiCall('/whatsapp/connect', 'POST');
            this.showToast('Conexão iniciada! Aguarde o QR code...', 'info');
            
            // Inicia polling para verificar status
            this.startStatusPolling();
            
        } catch (error) {
            console.error('Erro ao conectar:', error);
            this.showToast('Erro ao iniciar conexão', 'error');
            this.connectBtn.disabled = false;
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Desconecta do WhatsApp
     */
    async disconnectWhatsApp() {
        try {
            this.showLoading('Desconectando...');
            this.disconnectBtn.disabled = true;
            
            await this.apiCall('/whatsapp/disconnect', 'DELETE');
            
            this.updateConnectionStatus({
                isConnected: false,
                qrCode: null,
                clientInfo: null
            });
            
            this.showToast('Desconectado com sucesso', 'success');
            this.stopStatusPolling();
            
        } catch (error) {
            console.error('Erro ao desconectar:', error);
            this.showToast('Erro ao desconectar', 'error');
            this.disconnectBtn.disabled = false;
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Busca grupos do WhatsApp
     */
    async fetchGroups() {
        try {
            this.showLoading('Buscando grupos...');
            this.fetchGroupsBtn.disabled = true;
            this.showGroupsLoading(true);
            
            const response = await this.apiCall('/whatsapp/groups/fetch', 'POST');
            this.groups = response.data.groups;
            this.filteredGroups = [...this.groups];
            
            this.renderGroups();
            this.updateStats();
            
            this.showToast(`${this.groups.length} grupos encontrados!`, 'success');
            
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
            this.showToast(error.message || 'Erro ao buscar grupos', 'error');
        } finally {
            this.hideLoading();
            this.fetchGroupsBtn.disabled = false;
            this.showGroupsLoading(false);
        }
    }

    /**
     * Limpa cache de grupos
     */
    async clearGroups() {
        try {
            await this.apiCall('/groups', 'DELETE');
            this.groups = [];
            this.filteredGroups = [];
            this.renderGroups();
            this.updateStats();
            this.showToast('Cache de grupos limpo', 'success');
        } catch (error) {
            console.error('Erro ao limpar grupos:', error);
            this.showToast('Erro ao limpar cache', 'error');
        }
    }

    /**
     * Pesquisa grupos por nome
     */
    searchGroups(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredGroups = [...this.groups];
        } else {
            this.filteredGroups = this.groups.filter(group =>
                group.name.toLowerCase().includes(term)
            );
        }
        
        this.renderGroups();
    }

    /**
     * Atualiza o status da conexão
     */
    updateConnectionStatus(status) {
        this.isConnected = status.isConnected;
        
        // Atualiza indicador de status
        this.statusIndicator.className = 'status-indicator';
        if (status.isConnected) {
            this.statusIndicator.classList.add('connected');
            this.statusText.textContent = 'Conectado';
        } else if (status.qrCode) {
            this.statusIndicator.classList.add('connecting');
            this.statusText.textContent = 'Aguardando escaneamento';
        } else {
            this.statusIndicator.classList.add('disconnected');
            this.statusText.textContent = 'Desconectado';
        }
        
        // Atualiza botões
        this.connectBtn.style.display = status.isConnected ? 'none' : 'inline-flex';
        this.disconnectBtn.style.display = status.isConnected ? 'inline-flex' : 'none';
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = false;
        
        // Atualiza QR code
        if (status.qrCode && !status.isConnected) {
            this.qrImage.src = status.qrCode;
            this.qrContainer.style.display = 'block';
            this.connectionInfo.style.display = 'none';
        } else {
            this.qrContainer.style.display = 'none';
        }
        
        // Atualiza informações do usuário
        if (status.isConnected && status.clientInfo) {
            this.userName.textContent = `Nome: ${status.clientInfo.name}`;
            this.userNumber.textContent = `Número: ${status.clientInfo.number}`;
            this.connectionInfo.style.display = 'block';
            this.groupsSection.style.display = 'block';
        } else {
            this.connectionInfo.style.display = 'none';
            if (!status.qrCode) {
                this.groupsSection.style.display = 'none';
            }
        }
    }

    /**
     * Renderiza a lista de grupos
     */
    renderGroups() {
        if (this.filteredGroups.length === 0) {
            this.groupsList.innerHTML = '';
            this.noGroups.style.display = 'block';
            return;
        }
        
        this.noGroups.style.display = 'none';
        
        const groupsHtml = this.filteredGroups.map(group => `
            <div class="group-card">
                <div class="group-header">
                    <div>
                        <div class="group-name">${this.escapeHtml(group.name)}</div>
                        <div class="group-badges">
                            <span class="badge ${group.isGroupAdmin ? 'badge-admin' : 'badge-member'}">
                                ${group.isGroupAdmin ? '👑 Admin' : '👤 Membro'}
                            </span>
                        </div>
                    </div>
                </div>
                ${group.description ? `
                    <div class="group-description">
                        ${this.escapeHtml(group.description)}
                    </div>
                ` : ''}
                <div class="group-stats">
                    <div class="participant-count">
                        <span>👥</span>
                        <span>${group.participantCount} participantes</span>
                    </div>
                    <div class="group-date">
                        ${this.formatDate(group.createdAt)}
                    </div>
                </div>
            </div>
        `).join('');
        
        this.groupsList.innerHTML = groupsHtml;
    }

    /**
     * Atualiza estatísticas
     */
    updateStats() {
        if (this.groups.length === 0) {
            this.statsContainer.style.display = 'none';
            return;
        }
        
        const adminGroups = this.groups.filter(g => g.isGroupAdmin).length;
        const totalParticipants = this.groups.reduce((sum, g) => sum + g.participantCount, 0);
        const avgParticipants = Math.round(totalParticipants / this.groups.length);
        
        this.totalGroups.textContent = this.groups.length;
        this.adminGroups.textContent = adminGroups;
        this.totalParticipants.textContent = totalParticipants;
        this.avgParticipants.textContent = avgParticipants;
        
        this.statsContainer.style.display = 'grid';
    }

    /**
     * Inicia polling do status
     */
    startStatusPolling() {
        this.stopStatusPolling(); // Para qualquer polling anterior
        
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await this.apiCall('/whatsapp/status');
                this.updateConnectionStatus(response.data);
                
                // Para o polling se conectado
                if (response.data.isConnected) {
                    this.stopStatusPolling();
                    this.showToast('WhatsApp conectado com sucesso!', 'success');
                }
            } catch (error) {
                console.error('Erro no polling de status:', error);
            }
        }, 2000); // Verifica a cada 2 segundos
    }

    /**
     * Para o polling do status
     */
    stopStatusPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Mostra/esconde loading dos grupos
     */
    showGroupsLoading(show) {
        this.loadingGroups.style.display = show ? 'flex' : 'none';
        this.groupsList.style.display = show ? 'none' : 'block';
    }

    /**
     * Mostra overlay de loading
     */
    showLoading(text = 'Processando...') {
        this.loadingText.textContent = text;
        this.loadingOverlay.style.display = 'flex';
    }

    /**
     * Esconde overlay de loading
     */
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    /**
     * Mostra notificação toast
     */
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 4px;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                ${type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
            <div>${this.escapeHtml(message)}</div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Remove automaticamente
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
        
        // Remove ao clicar
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        });
    }

    /**
     * Faz chamada para a API
     */
    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erro na requisição');
        }
        
        return result;
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Formata data
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Adiciona animação slideOut ao CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.zapzapApp = new ZapZapApp();
});

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    if (window.zapzapApp) {
        window.zapzapApp.stopStatusPolling();
    }
});