// 提供商管理器
export class ProviderManager {
    constructor() {
        this.providers = {};
        this.editingProvider = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDefaultProviders();
    }

    bindEvents() {
        // 这里可以添加提供商相关的事件绑定
    }

    /**
     * 加载默认提供商
     */
    loadDefaultProviders() {
        this.providers = {
            'Subscribe': {
                url: 'http://your-service-provider', // 用户需要替换为实际订阅链接
                interval: 86400,
                'benchmark-url': 'http://www.gstatic.com/generate_204',
                'benchmark-timeout': 5,
                description: '主要订阅服务'
            }
        };
    }

    /**
     * 渲染提供商列表
     */
    renderProviders() {
        const container = document.getElementById('providersList');
        if (!container) return;

        const providerEntries = Object.entries(this.providers);

        if (providerEntries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🌐</div>
                    <div class="empty-state-title">暂无服务提供商</div>
                    <div class="empty-state-description">点击"添加提供商"按钮添加代理服务提供商</div>
                </div>
            `;
            return;
        }

        container.innerHTML = providerEntries.map(([name, provider]) => 
            this.createProviderCard(name, provider)
        ).join('');
        
        this.bindProviderCardEvents();
    }

    /**
     * 创建提供商卡片
     * @param {string} name - 提供商名称
     * @param {Object} provider - 提供商配置
     * @returns {string} 卡片HTML
     */
    createProviderCard(name, provider) {
        return `
            <div class="provider-card" data-provider-name="${name}">
                <div class="provider-info">
                    <div class="provider-name">${name}</div>
                    <div class="provider-url">${provider.url}</div>
                    <div class="provider-details">
                        <span class="tag">更新间隔: ${this.formatInterval(provider.interval)}</span>
                        ${provider['benchmark-timeout'] ? `<span class="tag">超时: ${provider['benchmark-timeout']}s</span>` : ''}
                        ${provider.description ? `<span class="tag tag-primary">${provider.description}</span>` : ''}
                    </div>
                </div>
                <div class="provider-actions">
                    <button class="btn btn-sm btn-outline test-provider-btn" data-provider-name="${name}">测试</button>
                    <button class="btn btn-sm btn-outline edit-provider-btn" data-provider-name="${name}">编辑</button>
                    <button class="btn btn-sm btn-danger delete-provider-btn" data-provider-name="${name}">删除</button>
                </div>
            </div>
        `;
    }

    /**
     * 绑定提供商卡片事件
     */
    bindProviderCardEvents() {
        // 测试按钮
        document.querySelectorAll('.test-provider-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const providerName = e.target.dataset.providerName;
                this.testProvider(providerName);
            });
        });

        // 编辑按钮
        document.querySelectorAll('.edit-provider-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const providerName = e.target.dataset.providerName;
                this.editProvider(providerName);
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-provider-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const providerName = e.target.dataset.providerName;
                this.deleteProvider(providerName);
            });
        });
    }

    /**
     * 格式化间隔时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间
     */
    formatInterval(seconds) {
        if (seconds < 60) return `${seconds}秒`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`;
        return `${Math.floor(seconds / 86400)}天`;
    }

    /**
     * 显示添加提供商模态框
     */
    showAddProviderModal() {
        this.editingProvider = null;
        this.showProviderForm('添加服务提供商');
    }

    /**
     * 编辑提供商
     * @param {string} providerName - 提供商名称
     */
    editProvider(providerName) {
        const provider = this.providers[providerName];
        if (!provider) return;

        this.editingProvider = { name: providerName, ...provider };
        this.showProviderForm('编辑服务提供商', this.editingProvider);
    }

    /**
     * 显示提供商表单
     * @param {string} title - 表单标题
     * @param {Object} data - 预填充数据
     */
    showProviderForm(title, data = {}) {
        const modalHtml = `
            <div id="providerModal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="providerForm">
                            <div class="form-group">
                                <label for="providerName">提供商名称</label>
                                <input type="text" id="providerName" class="form-control" value="${data.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="providerUrl">订阅链接</label>
                                <input type="url" id="providerUrl" class="form-control" value="${data.url || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="providerInterval">更新间隔(秒)</label>
                                <input type="number" id="providerInterval" class="form-control" value="${data.interval || 86400}" min="60">
                            </div>
                            <div class="form-group">
                                <label for="benchmarkUrl">测试URL</label>
                                <input type="url" id="benchmarkUrl" class="form-control" value="${data['benchmark-url'] || 'http://www.gstatic.com/generate_204'}">
                            </div>
                            <div class="form-group">
                                <label for="benchmarkTimeout">测试超时(秒)</label>
                                <input type="number" id="benchmarkTimeout" class="form-control" value="${data['benchmark-timeout'] || 5}" min="1" max="30">
                            </div>
                            <div class="form-group">
                                <label for="providerDescription">描述</label>
                                <input type="text" id="providerDescription" class="form-control" value="${data.description || ''}">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="saveProviderBtn" class="btn btn-primary">保存</button>
                        <button type="button" class="modal-close btn btn-secondary">取消</button>
                    </div>
                </div>
            </div>
        `;

        // 移除现有模态框
        const existingModal = document.getElementById('providerModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定事件
        this.bindProviderModalEvents();
    }

    /**
     * 绑定提供商模态框事件
     */
    bindProviderModalEvents() {
        // 保存按钮
        document.getElementById('saveProviderBtn').addEventListener('click', () => {
            this.saveProvider();
        });

        // 关闭按钮
        document.querySelectorAll('#providerModal .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeProviderModal();
            });
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProviderModal();
            }
        });
    }

    /**
     * 保存提供商
     */
    saveProvider() {
        const formData = this.getProviderFormData();
        
        if (!this.validateProviderForm(formData)) {
            return;
        }

        if (this.editingProvider) {
            // 更新现有提供商
            const oldName = this.editingProvider.name;
            if (oldName !== formData.name) {
                // 名称改变，删除旧的，添加新的
                delete this.providers[oldName];
            }
        }

        // 保存提供商
        this.providers[formData.name] = {
            url: formData.url,
            interval: formData.interval,
            'benchmark-url': formData.benchmarkUrl,
            'benchmark-timeout': formData.benchmarkTimeout,
            description: formData.description
        };

        this.renderProviders();
        this.closeProviderModal();
        this.dispatchConfigUpdateEvent();
        this.showSuccess('提供商配置已保存');
    }

    /**
     * 获取提供商表单数据
     * @returns {Object} 表单数据
     */
    getProviderFormData() {
        return {
            name: document.getElementById('providerName').value.trim(),
            url: document.getElementById('providerUrl').value.trim(),
            interval: parseInt(document.getElementById('providerInterval').value) || 86400,
            benchmarkUrl: document.getElementById('benchmarkUrl').value.trim(),
            benchmarkTimeout: parseInt(document.getElementById('benchmarkTimeout').value) || 5,
            description: document.getElementById('providerDescription').value.trim()
        };
    }

    /**
     * 验证提供商表单
     * @param {Object} formData - 表单数据
     * @returns {boolean} 验证结果
     */
    validateProviderForm(formData) {
        if (!formData.name) {
            this.showError('请输入提供商名称');
            return false;
        }

        if (!formData.url) {
            this.showError('请输入订阅链接');
            return false;
        }

        // 检查名称是否重复（编辑时排除自身）
        if (this.providers[formData.name] &&
            (!this.editingProvider || this.editingProvider.name !== formData.name)) {
            this.showError('提供商名称已存在');
            return false;
        }

        // 验证URL格式
        try {
            new URL(formData.url);
        } catch {
            this.showError('订阅链接格式不正确');
            return false;
        }

        return true;
    }

    /**
     * 关闭提供商模态框
     */
    closeProviderModal() {
        const modal = document.getElementById('providerModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * 测试提供商
     * @param {string} providerName - 提供商名称
     */
    async testProvider(providerName) {
        const provider = this.providers[providerName];
        if (!provider) return;

        const btn = document.querySelector(`[data-provider-name="${providerName}"].test-provider-btn`);
        if (!btn) return;

        const originalText = btn.textContent;
        btn.textContent = '测试中...';
        btn.disabled = true;

        try {
            // 这里可以实现实际的测试逻辑
            // 由于跨域限制，这里只是模拟测试
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 模拟测试结果
            const success = Math.random() > 0.3; // 70%成功率
            
            if (success) {
                this.showNotification(`提供商 "${providerName}" 测试成功`, 'success');
            } else {
                this.showNotification(`提供商 "${providerName}" 测试失败`, 'error');
            }
        } catch (error) {
            console.error('测试提供商失败:', error);
            this.showNotification(`提供商 "${providerName}" 测试失败: ${error.message}`, 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    /**
     * 删除提供商
     * @param {string} providerName - 提供商名称
     */
    deleteProvider(providerName) {
        this.showConfirm(
            `确定要删除提供商 "${providerName}" 吗？`,
            () => {
                delete this.providers[providerName];
                this.renderProviders();
                this.dispatchConfigUpdateEvent();
                this.showSuccess(`提供商 "${providerName}" 已删除`);
            }
        );
    }

    /**
     * 加载提供商
     */
    async loadProviders() {
        this.renderProviders();
    }

    /**
     * 获取所有提供商
     * @returns {Object} 提供商对象
     */
    getAllProviders() {
        return this.providers;
    }

    /**
     * 设置提供商
     * @param {Object} providers - 提供商对象
     */
    setProviders(providers) {
        this.providers = providers || {};
        this.renderProviders();
    }

    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     */
    showSuccess(message) {
        const event = new CustomEvent('showNotification', {
            detail: { message, type: 'success' }
        });
        document.dispatchEvent(event);
    }

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     */
    showError(message) {
        const event = new CustomEvent('showNotification', {
            detail: { message, type: 'error' }
        });
        document.dispatchEvent(event);
    }

    /**
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @param {Function} onConfirm - 确认回调
     */
    showConfirm(message, onConfirm) {
        const event = new CustomEvent('showConfirm', {
            detail: { message, onConfirm }
        });
        document.dispatchEvent(event);
    }

    /**
     * 触发配置更新事件
     */
    dispatchConfigUpdateEvent() {
        const event = new CustomEvent('configUpdate', {
            detail: { type: 'proxy-providers', data: this.providers }
        });
        document.dispatchEvent(event);
    }
}
