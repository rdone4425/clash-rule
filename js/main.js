// 主应用程序入口文件
import { ClashConfigManager } from './modules/config-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { ProxyGroupManager } from './modules/proxy-group-manager.js';
import { RuleManager } from './modules/rule-manager.js';
import { ProviderManager } from './modules/provider-manager.js';
import { ValidationManager } from './modules/validation-manager.js';
import { ConfigValidator } from './modules/config-validator.js';

class ClashConfigApp {
    constructor() {
        this.configManager = new ClashConfigManager();
        this.uiManager = new UIManager();
        this.proxyGroupManager = new ProxyGroupManager();
        this.ruleManager = new RuleManager();
        this.providerManager = new ProviderManager();
        this.validationManager = new ValidationManager();
        this.configValidator = new ConfigValidator();
        
        this.currentConfig = this.getDefaultConfig();
        this.init();
    }

    async init() {
        try {
            // 初始化UI管理器
            this.uiManager.init();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            // 加载默认配置
            await this.loadDefaultConfig();
            
            // 渲染初始界面
            this.renderInterface();
            
            console.log('Clash配置管理器初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }

    bindEventListeners() {
        // 标签切换
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 导入配置
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importConfig();
        });

        // 导出配置
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportConfig();
        });

        // 预览配置
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.previewConfig();
        });

        // 添加提供商
        document.getElementById('addProviderBtn').addEventListener('click', () => {
            this.providerManager.showAddProviderModal();
        });

        // 添加代理组
        document.getElementById('addGroupBtn').addEventListener('click', () => {
            this.proxyGroupManager.showAddGroupModal();
        });

        // 添加规则
        document.getElementById('addRuleBtn').addEventListener('click', () => {
            this.ruleManager.showAddRuleModal();
        });

        // 配置操作按钮
        this.bindConfigActionButtons();

        // 模态框关闭
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.uiManager.closeModal(e.target.closest('.modal'));
            });
        });

        // 表单变化监听
        this.bindFormChangeListeners();

        // 绑定全局事件监听器
        this.bindGlobalEventListeners();
    }

    bindFormChangeListeners() {
        // 通用设置表单
        const generalInputs = ['mode', 'logLevel', 'port', 'socksPort'];
        generalInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateGeneralConfig();
                });
            }
        });

        // DNS设置表单
        const dnsInputs = ['defaultNameserver', 'nameserver', 'fakeIpFilter'];
        dnsInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateDnsConfig();
                });
            }
        });
    }

    bindConfigActionButtons() {
        // 验证配置
        const validateBtn = document.getElementById('validateConfigBtn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => {
                this.validateConfig();
            });
        }

        // 预览配置
        const previewBtn = document.getElementById('previewConfigBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewConfig();
            });
        }

        // 导出配置
        const exportBtn = document.getElementById('exportConfigBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportConfig();
            });
        }

        // 导入配置
        const importBtn = document.getElementById('importConfigBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importConfig();
            });
        }
    }

    bindGlobalEventListeners() {
        // 监听通知事件
        document.addEventListener('showNotification', (e) => {
            const { message, type } = e.detail;
            this.uiManager.showNotification(message, type);
        });

        // 监听确认对话框事件
        document.addEventListener('showConfirm', (e) => {
            const { message, onConfirm, onCancel } = e.detail;
            this.uiManager.showConfirm(message, onConfirm, onCancel);
        });

        // 监听配置更新事件
        document.addEventListener('configUpdate', (e) => {
            const { type, data } = e.detail;
            this.handleConfigUpdate(type, data);
        });
    }

    switchTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容区域
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 根据标签加载相应内容
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        switch (tabName) {
            case 'general':
                this.loadGeneralSettings();
                break;
            case 'dns':
                this.loadDnsSettings();
                break;
            case 'providers':
                await this.providerManager.loadProviders();
                break;
            case 'groups':
                await this.proxyGroupManager.loadGroups();
                break;
            case 'rules':
                await this.ruleManager.loadRules();
                break;
        }
    }

    loadGeneralSettings() {
        const config = this.currentConfig;
        document.getElementById('mode').value = config.mode || 'rule';
        document.getElementById('logLevel').value = config['log-level'] || 'info';
        document.getElementById('port').value = config.port || 7890;
        document.getElementById('socksPort').value = config['socks-port'] || 7891;
    }

    loadDnsSettings() {
        const dns = this.currentConfig.dns || {};
        
        if (dns['default-nameserver']) {
            document.getElementById('defaultNameserver').value = 
                Array.isArray(dns['default-nameserver']) 
                    ? dns['default-nameserver'].join('\n')
                    : dns['default-nameserver'];
        }
        
        if (dns.nameserver) {
            document.getElementById('nameserver').value = 
                Array.isArray(dns.nameserver) 
                    ? dns.nameserver.join('\n')
                    : dns.nameserver;
        }
        
        if (dns['fake-ip-filter']) {
            document.getElementById('fakeIpFilter').value = 
                Array.isArray(dns['fake-ip-filter']) 
                    ? dns['fake-ip-filter'].join('\n')
                    : dns['fake-ip-filter'];
        }
    }

    updateGeneralConfig() {
        this.currentConfig.mode = document.getElementById('mode').value;
        this.currentConfig['log-level'] = document.getElementById('logLevel').value;
        this.currentConfig.port = parseInt(document.getElementById('port').value);
        this.currentConfig['socks-port'] = parseInt(document.getElementById('socksPort').value);
        
        this.validateAndSave();
    }

    updateDnsConfig() {
        if (!this.currentConfig.dns) {
            this.currentConfig.dns = {};
        }
        
        const defaultNs = document.getElementById('defaultNameserver').value;
        if (defaultNs.trim()) {
            this.currentConfig.dns['default-nameserver'] = defaultNs.split('\n').filter(line => line.trim());
        }
        
        const nameserver = document.getElementById('nameserver').value;
        if (nameserver.trim()) {
            this.currentConfig.dns.nameserver = nameserver.split('\n').filter(line => line.trim());
        }
        
        const fakeIpFilter = document.getElementById('fakeIpFilter').value;
        if (fakeIpFilter.trim()) {
            this.currentConfig.dns['fake-ip-filter'] = fakeIpFilter.split('\n').filter(line => line.trim());
        }
        
        this.validateAndSave();
    }

    async validateAndSave() {
        try {
            const isValid = await this.validationManager.validateConfig(this.currentConfig);
            if (isValid) {
                this.configManager.saveConfig(this.currentConfig);
                this.showSuccess('配置已保存');
            }
        } catch (error) {
            console.error('配置验证失败:', error);
            this.showError('配置验证失败: ' + error.message);
        }
    }

    async importConfig() {
        try {
            const config = await this.configManager.importConfig();
            if (config) {
                this.currentConfig = config;
                this.renderInterface();
                this.showSuccess('配置导入成功');
            }
        } catch (error) {
            console.error('导入配置失败:', error);
            this.showError('导入配置失败: ' + error.message);
        }
    }

    async exportConfig() {
        try {
            await this.configManager.exportConfig(this.currentConfig);
            this.showSuccess('配置导出成功');
        } catch (error) {
            console.error('导出配置失败:', error);
            this.showError('导出配置失败: ' + error.message);
        }
    }

    previewConfig() {
        try {
            const yamlContent = this.configManager.generateYaml(this.currentConfig);
            this.uiManager.showPreview(yamlContent);
        } catch (error) {
            console.error('生成预览失败:', error);
            this.showError('生成预览失败: ' + error.message);
        }
    }

    async loadDefaultConfig() {
        try {
            const savedConfig = this.configManager.loadConfig();
            if (savedConfig) {
                this.currentConfig = savedConfig;
            }
        } catch (error) {
            console.warn('加载保存的配置失败，使用默认配置:', error);
        }
    }

    renderInterface() {
        // 重新渲染所有界面组件
        this.loadGeneralSettings();
        this.loadDnsSettings();
        this.providerManager.renderProviders();
        this.proxyGroupManager.renderGroups();
        this.ruleManager.renderRules();
    }

    getDefaultConfig() {
        return {
            mode: 'rule',
            'log-level': 'info',
            port: 7890,
            'socks-port': 7891,
            dns: {
                'default-nameserver': ['119.29.29.29', '223.5.5.5'],
                nameserver: ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
                'fake-ip-filter': ['"*"', '"+.lan"', '"+.local"']
            },
            'proxy-providers': {},
            'proxy-groups': [],
            rules: [],
            'rule-providers': {}
        };
    }

    showSuccess(message) {
        this.uiManager.showNotification(message, 'success');
    }

    showError(message) {
        this.uiManager.showNotification(message, 'error');
    }

    showWarning(message) {
        this.uiManager.showNotification(message, 'warning');
    }

    /**
     * 验证配置
     */
    async validateConfig() {
        try {
            // 显示加载状态
            const validateBtn = document.getElementById('validateConfigBtn');
            const originalText = validateBtn.textContent;
            validateBtn.textContent = '🔍 验证中...';
            validateBtn.disabled = true;

            // 生成当前配置
            const config = this.configManager.generateConfig(this.currentConfig);

            // 执行验证
            const validationResult = this.configValidator.validateConfig(config);

            // 生成验证报告
            const report = this.configValidator.generateReport();

            // 显示验证结果
            this.showValidationResult(validationResult, report);

        } catch (error) {
            console.error('配置验证失败:', error);
            this.uiManager.showNotification('配置验证失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            const validateBtn = document.getElementById('validateConfigBtn');
            validateBtn.textContent = '🔍 验证配置';
            validateBtn.disabled = false;
        }
    }

    /**
     * 显示验证结果
     * @param {Object} validationResult - 验证结果
     * @param {string} report - 验证报告
     */
    showValidationResult(validationResult, report) {
        const modalHtml = `
            <div id="validationModal" class="modal active">
                <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
                    <div class="modal-header">
                        <h3>
                            ${validationResult.overall ? '✅ 配置验证通过' : '❌ 配置验证失败'}
                        </h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto;">
                        <div class="validation-summary">
                            ${this.createValidationSummary(validationResult)}
                        </div>
                        <div class="validation-report">
                            <h4>详细报告</h4>
                            <pre style="white-space: pre-wrap; font-size: 12px; line-height: 1.4;">${report}</pre>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${validationResult.overall ?
                            '<button id="proceedExportBtn" class="btn btn-primary">继续导出配置</button>' :
                            '<button id="fixIssuesBtn" class="btn btn-warning">修复问题</button>'
                        }
                        <button class="modal-close btn btn-secondary">关闭</button>
                    </div>
                </div>
            </div>
        `;

        // 移除现有模态框
        const existingModal = document.getElementById('validationModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定事件
        this.bindValidationModalEvents(validationResult);
    }

    /**
     * 创建验证摘要
     * @param {Object} validationResult - 验证结果
     * @returns {string} 摘要HTML
     */
    createValidationSummary(validationResult) {
        const errorCount = [
            ...validationResult.proxyGroups,
            ...validationResult.rules,
            ...validationResult.ruleProviders
        ].filter(issue => issue.type === 'error').length;

        const warningCount = [
            ...validationResult.proxyGroups,
            ...validationResult.rules,
            ...validationResult.ruleProviders
        ].filter(issue => issue.type === 'warning').length;

        return `
            <div class="validation-stats">
                <div class="stat-item ${errorCount === 0 ? 'success' : 'error'}">
                    <span class="stat-number">${errorCount}</span>
                    <span class="stat-label">错误</span>
                </div>
                <div class="stat-item ${warningCount === 0 ? 'success' : 'warning'}">
                    <span class="stat-number">${warningCount}</span>
                    <span class="stat-label">警告</span>
                </div>
                <div class="stat-item info">
                    <span class="stat-number">${validationResult.proxyGroups.length + validationResult.rules.length + validationResult.ruleProviders.length - errorCount - warningCount}</span>
                    <span class="stat-label">信息</span>
                </div>
            </div>
        `;
    }

    /**
     * 绑定验证模态框事件
     * @param {Object} validationResult - 验证结果
     */
    bindValidationModalEvents(validationResult) {
        // 关闭按钮
        document.querySelectorAll('#validationModal .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('validationModal').remove();
            });
        });

        // 继续导出按钮
        const proceedBtn = document.getElementById('proceedExportBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                document.getElementById('validationModal').remove();
                this.exportConfig();
            });
        }

        // 修复问题按钮
        const fixBtn = document.getElementById('fixIssuesBtn');
        if (fixBtn) {
            fixBtn.addEventListener('click', () => {
                document.getElementById('validationModal').remove();
                this.uiManager.showNotification('请根据验证报告修复配置问题', 'info');
            });
        }
    }

    /**
     * 处理配置更新事件
     * @param {string} type - 更新类型
     * @param {any} data - 更新数据
     */
    handleConfigUpdate(type, data) {
        switch (type) {
            case 'proxy-groups':
                this.currentConfig['proxy-groups'] = data;
                break;
            case 'proxy-providers':
                this.currentConfig['proxy-providers'] = data;
                break;
            case 'rules':
                this.currentConfig.rules = data.rules;
                this.currentConfig['rule-providers'] = data.ruleProviders;
                break;
        }

        // 保存配置
        this.configManager.saveConfig(this.currentConfig);
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.clashApp = new ClashConfigApp();
});
