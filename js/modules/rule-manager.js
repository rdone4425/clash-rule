// 规则管理器
export class RuleManager {
    constructor() {
        this.rules = [];
        this.ruleProviders = {};
        this.filteredRules = [];
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDefaultRules();
        this.loadAvailableRules();
    }

    bindEvents() {
        // 搜索框
        const searchInput = document.getElementById('ruleSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterRules();
            });
        }

        // 切换规则浏览器按钮
        const toggleBtn = document.getElementById('toggleRuleBrowserBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleRuleBrowser();
            });
        }

        // 规则浏览器搜索
        const browserSearchInput = document.getElementById('ruleBrowserSearch');
        if (browserSearchInput) {
            browserSearchInput.addEventListener('input', (e) => {
                this.filterRuleBrowser(e.target.value);
            });
        }

        // 批量操作按钮
        const toggleBatchBtn = document.getElementById('toggleBatchModeBtn');
        if (toggleBatchBtn) {
            toggleBatchBtn.addEventListener('click', () => {
                this.toggleBatchMode();
            });
        }

        // 批量操作相关按钮
        this.bindBatchOperationEvents();
    }

    /**
     * 加载默认规则
     */
    loadDefaultRules() {
        // 使用新的规则源
        this.rules = [
            'RULE-SET,category-ai-!cn,AI',
            'RULE-SET,youtube,YouTube',
            'RULE-SET,netflix,NETFLIX',
            'RULE-SET,disney,Disney+',
            'RULE-SET,category-emby,Emby',
            'RULE-SET,tiktok,TikTok',
            'RULE-SET,bahamut,TaiWan',
            'RULE-SET,biliintl,Streaming',
            'RULE-SET,bilibili,bilibili',
            'RULE-SET,spotify,Spotify',
            'RULE-SET,netease,NetEaseMusic',
            'RULE-SET,category-entertainment,Streaming',
            'RULE-SET,telegram,Telegram',
            'RULE-SET,github,Proxy',
            'RULE-SET,twitter,X',
            'RULE-SET,apple,Apple',
            'RULE-SET,google,Google',
            'RULE-SET,microsoft,Microsoft',
            'RULE-SET,category-games,Games',
            'RULE-SET,gfw,Proxy',
            'RULE-SET,cn,DIRECT',
            'GEOIP,LAN,DIRECT',
            'GEOIP,CN,DIRECT',
            'MATCH,Final'
        ];

        // 使用新的规则源 - 更全面的规则库
        this.ruleProviders = {
            'category-ai-!cn': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/category-ai-!cn.yaml'
            },
            'youtube': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/youtube.yaml'
            },
            'netflix': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/netflix.yaml'
            },
            'disney': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/disney.yaml'
            },
            'category-emby': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/category-emby.yaml'
            },
            'tiktok': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/tiktok.yaml'
            },
            'bahamut': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/bahamut.yaml'
            },
            'biliintl': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/biliintl.yaml'
            },
            'bilibili': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/bilibili.yaml'
            },
            'spotify': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/spotify.yaml'
            },
            'netease': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/netease.yaml'
            },
            'category-entertainment': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/category-entertainment.yaml'
            },
            'telegram': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/telegram.yaml'
            },
            'github': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/github.yaml'
            },
            'twitter': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/twitter.yaml'
            },
            'apple': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/apple.yaml'
            },
            'google': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/google.yaml'
            },
            'microsoft': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/microsoft.yaml'
            },
            'category-games': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/category-games.yaml'
            },
            'gfw': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/gfw.yaml'
            },
            'cn': {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: 'https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/cn.yaml'
            }
        };

        this.filteredRules = [...this.rules];

        // 初始化批量操作状态
        this.batchMode = false;
        this.selectedRules = new Set();
    }

    /**
     * 切换规则浏览器面板
     */
    toggleRuleBrowser() {
        const panel = document.getElementById('ruleBrowserPanel');
        const btn = document.getElementById('toggleRuleBrowserBtn');

        if (!panel || !btn) return;

        const isVisible = panel.style.display !== 'none';

        if (isVisible) {
            panel.style.display = 'none';
            btn.textContent = '规则库';
            btn.classList.remove('active');
        } else {
            panel.style.display = 'block';
            btn.textContent = '隐藏规则库';
            btn.classList.add('active');

            // 如果还没有加载规则浏览器内容，则加载
            if (!this.ruleBrowserLoaded) {
                this.renderRuleBrowser();
            }
        }
    }

    /**
     * 加载可用规则列表
     */
    async loadAvailableRules() {
        try {
            // 从您的规则列表获取所有可用规则
            const response = await fetch('https://raw.githubusercontent.com/rdone4425/guize/main/geosite_files_output/yaml_files_complete.txt');
            const text = await response.text();

            // 解析规则名称（去掉.yaml扩展名）
            this.availableRules = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && line.endsWith('.yaml'))
                .map(line => line.replace('.yaml', ''))
                .sort();

            console.log(`已加载 ${this.availableRules.length} 个可用规则`);

            // 如果规则浏览器已经打开，重新渲染
            if (document.getElementById('ruleBrowserPanel').style.display !== 'none') {
                this.renderRuleBrowser();
            }
        } catch (error) {
            console.warn('加载可用规则失败，使用默认列表:', error);
            // 备用规则列表
            this.availableRules = [
                'category-ai-!cn', 'youtube', 'netflix', 'disney', 'spotify', 'tiktok',
                'bilibili', 'telegram', 'twitter', 'google', 'microsoft', 'apple',
                'github', 'category-games', 'gfw', 'cn'
            ];
        }
    }

    /**
     * 渲染规则浏览器
     */
    renderRuleBrowser() {
        const container = document.getElementById('ruleBrowserContent');
        if (!container) return;

        if (!this.availableRules || this.availableRules.length === 0) {
            container.innerHTML = '<div class="loading-message">正在加载规则库...</div>';
            return;
        }

        // 按类别分组规则
        const categories = this.categorizeRules(this.availableRules);

        let html = '<div class="rule-categories">';

        Object.entries(categories).forEach(([category, rules]) => {
            if (rules.length > 0) {
                html += `
                    <div class="rule-category">
                        <div class="rule-category-title">
                            ${category} <span class="rule-count">(${rules.length})</span>
                        </div>
                        <div class="rule-category-items">
                `;

                rules.forEach(rule => {
                    html += `
                        <button type="button" class="rule-item-btn" data-rule="${rule}" title="点击添加规则">
                            ${rule}
                        </button>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        container.innerHTML = html;

        // 绑定点击事件
        this.bindRuleBrowserEvents();
        this.ruleBrowserLoaded = true;
    }

    /**
     * 分类规则
     * @param {Array} rules - 规则数组
     * @returns {Object} 分类后的规则
     */
    categorizeRules(rules) {
        const categories = {
            '🤖 AI服务': [],
            '🎬 流媒体': [],
            '💬 社交媒体': [],
            '🏢 科技公司': [],
            '🎮 游戏': [],
            '🛒 购物': [],
            '💰 金融': [],
            '📚 教育': [],
            '📰 新闻': [],
            '🇨🇳 中国服务': [],
            '🚫 广告拦截': [],
            '🌐 其他': []
        };

        rules.forEach(rule => {
            const ruleLower = rule.toLowerCase();

            if (ruleLower.includes('ai') || ruleLower.includes('openai') || ruleLower.includes('anthropic') || ruleLower.includes('perplexity')) {
                categories['🤖 AI服务'].push(rule);
            } else if (['youtube', 'netflix', 'disney', 'spotify', 'tiktok', 'bilibili', 'biliintl', 'bahamut', 'hbo', 'primevideo', 'hulu', 'twitch', 'emby'].some(keyword => ruleLower.includes(keyword))) {
                categories['🎬 流媒体'].push(rule);
            } else if (['twitter', 'facebook', 'instagram', 'telegram', 'discord', 'reddit', 'linkedin', 'social'].some(keyword => ruleLower.includes(keyword))) {
                categories['💬 社交媒体'].push(rule);
            } else if (['google', 'microsoft', 'apple', 'github', 'amazon', 'meta', 'adobe'].some(keyword => ruleLower.includes(keyword))) {
                categories['🏢 科技公司'].push(rule);
            } else if (ruleLower.includes('game') || ['steam', 'epic', 'ubisoft', 'ea', 'blizzard', 'nintendo', 'playstation', 'xbox'].some(keyword => ruleLower.includes(keyword))) {
                categories['🎮 游戏'].push(rule);
            } else if (['shop', 'ecommerce', 'ebay', 'alibaba', 'jd', 'pinduoduo'].some(keyword => ruleLower.includes(keyword))) {
                categories['🛒 购物'].push(rule);
            } else if (['finance', 'paypal', 'visa', 'mastercard', 'bank'].some(keyword => ruleLower.includes(keyword))) {
                categories['💰 金融'].push(rule);
            } else if (['education', 'coursera', 'udemy', 'edx', 'khan'].some(keyword => ruleLower.includes(keyword))) {
                categories['📚 教育'].push(rule);
            } else if (['bbc', 'cnn', 'reuters', 'bloomberg', 'nytimes', 'guardian', 'news'].some(keyword => ruleLower.includes(keyword))) {
                categories['📰 新闻'].push(rule);
            } else if (ruleLower === 'cn' || ['baidu', 'tencent', 'bytedance', 'sina', 'sohu', 'netease', 'china', 'chinese'].some(keyword => ruleLower.includes(keyword))) {
                categories['🇨🇳 中国服务'].push(rule);
            } else if (ruleLower.includes('ads') || ruleLower.includes('ad-')) {
                categories['🚫 广告拦截'].push(rule);
            } else {
                categories['🌐 其他'].push(rule);
            }
        });

        // 移除空分类
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });

        return categories;
    }

    /**
     * 格式化目标显示
     * @param {string} target - 目标代理组
     * @returns {string} 格式化后的显示文本
     */
    formatTargetDisplay(target) {
        // 添加图标来区分不同类型的目标
        const targetIcons = {
            'DIRECT': '🔗 直连',
            'REJECT': '🚫 拒绝',
            'PASS': '⏭️ 跳过'
        };

        return targetIcons[target] || `🎯 ${target}`;
    }

    /**
     * 获取目标样式类
     * @param {string} target - 目标代理组
     * @returns {string} CSS类名
     */
    getTargetClass(target) {
        if (target === 'DIRECT') return 'target-direct';
        if (target === 'REJECT') return 'target-reject';
        if (target === 'PASS') return 'target-pass';
        return 'target-proxy';
    }

    /**
     * 绑定规则浏览器事件
     */
    bindRuleBrowserEvents() {
        // 规则项点击事件
        document.querySelectorAll('.rule-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ruleName = e.target.dataset.rule;
                this.addRuleFromBrowser(ruleName);
            });
        });
    }

    /**
     * 从浏览器添加规则
     * @param {string} ruleName - 规则名称
     */
    addRuleFromBrowser(ruleName) {
        // 生成规则字符串，智能推断目标代理组
        const target = this.getSmartTarget(ruleName);
        const ruleString = `RULE-SET,${ruleName},${target}`;

        // 检查规则是否已存在
        if (this.rules.includes(ruleString)) {
            this.showError(`规则 "${ruleString}" 已存在`);
            return;
        }

        // 添加规则
        this.rules.push(ruleString);

        // 自动添加到规则提供商（如果不存在）
        if (!this.ruleProviders[ruleName]) {
            this.ruleProviders[ruleName] = {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: `https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/${ruleName}.yaml`
            };
        }

        // 更新显示
        this.filterRules();
        this.dispatchConfigUpdateEvent();
        this.showSuccess(`已添加规则: ${ruleString}`);
    }

    /**
     * 智能推断目标代理组
     * @param {string} ruleName - 规则名称
     * @returns {string} 目标代理组名称
     */
    getSmartTarget(ruleName) {
        const ruleLower = ruleName.toLowerCase();

        // AI服务 - 匹配实际的代理组名称
        if (ruleLower.includes('ai') || ruleLower.includes('openai') || ruleLower.includes('anthropic')) {
            return 'AI';
        }

        // 流媒体服务 - 使用实际的代理组名称
        if (ruleLower.includes('youtube')) return 'YouTube';
        if (ruleLower.includes('netflix')) return 'NETFLIX';
        if (ruleLower.includes('disney')) return 'Disney+';
        if (ruleLower.includes('spotify')) return 'Spotify';
        if (ruleLower.includes('tiktok')) return 'TikTok';
        if (ruleLower.includes('bilibili')) return 'bilibili';
        if (ruleLower.includes('telegram')) return 'Telegram';

        // 科技公司
        if (ruleLower.includes('google')) return 'Google';
        if (ruleLower.includes('microsoft')) return 'Microsoft';
        if (ruleLower.includes('apple')) return 'Apple';
        if (ruleLower.includes('github')) return 'Proxy';
        if (ruleLower.includes('twitter')) return 'X';

        // 游戏
        if (ruleLower.includes('game') || ruleLower.includes('steam')) return 'Games';

        // 中国服务
        if (ruleLower === 'cn' || ruleLower.includes('china') || ruleLower.includes('baidu') || ruleLower.includes('tencent')) {
            return 'DIRECT';
        }

        // 广告拦截
        if (ruleLower.includes('ads') || ruleLower.includes('ad-')) {
            return 'REJECT';
        }

        // 默认使用代理 - 确保这个代理组存在
        return 'Proxy';
    }

    /**
     * 获取可用的代理组名称列表
     * @returns {Array} 代理组名称数组
     */
    getAvailableProxyGroups() {
        // 这里应该从代理组管理器获取实际的代理组列表
        // 为了演示，返回默认的代理组名称
        return [
            'Final', 'Proxy', 'AI', 'YouTube', 'NETFLIX', 'Disney+', 'Spotify', 'TikTok',
            'bilibili', 'Telegram', 'Google', 'Microsoft', 'Apple', 'Games',
            'HongKong', 'TaiWan', 'Japan', 'Singapore', 'America', 'AllServer',
            'DIRECT', 'REJECT'
        ];
    }

    /**
     * 验证目标代理组是否存在
     * @param {string} target - 目标代理组名称
     * @returns {boolean} 是否存在
     */
    validateTarget(target) {
        const availableGroups = this.getAvailableProxyGroups();
        return availableGroups.includes(target);
    }

    /**
     * 加载可用规则列表
     */
    loadAvailableRules() {
        // 从您提供的规则列表中提取常用规则
        this.availableRules = [
            // AI相关
            'category-ai-!cn', 'category-ai-cn', 'category-ai-chat-!cn', 'openai', 'anthropic', 'perplexity',

            // 流媒体
            'youtube', 'netflix', 'disney', 'spotify', 'tiktok', 'bilibili', 'biliintl', 'bahamut',
            'category-entertainment', 'category-media-cn', 'hbo', 'primevideo', 'hulu', 'twitch',

            // 社交媒体
            'twitter', 'facebook', 'instagram', 'telegram', 'discord', 'reddit', 'linkedin',
            'category-social-media-!cn', 'category-social-media-cn',

            // 科技公司
            'google', 'microsoft', 'apple', 'github', 'amazon', 'meta', 'adobe',

            // 游戏
            'category-games', 'category-games-!cn', 'category-games-cn', 'steam', 'epicgames', 'ubisoft',
            'ea', 'blizzard', 'nintendo', 'playstation', 'xbox',

            // 购物
            'category-ecommerce', 'amazon', 'ebay', 'shopify', 'alibaba', 'jd', 'pinduoduo',

            // 开发工具
            'category-dev', 'category-dev-cn', 'github', 'gitlab', 'docker', 'kubernetes', 'jetbrains',

            // 金融
            'category-finance', 'category-finance-cn', 'paypal', 'visa', 'mastercard',

            // 教育
            'category-education-cn', 'coursera', 'udemy', 'edx', 'khanacademy',

            // 新闻媒体
            'bbc', 'cnn', 'reuters', 'bloomberg', 'nytimes', 'theguardian',

            // 中国服务
            'cn', 'baidu', 'tencent', 'alibaba', 'bytedance', 'sina', 'sohu', 'netease',

            // 广告拦截
            'category-ads-all', 'category-ads', 'google-ads', 'facebook-ads', 'amazon-ads',

            // 其他常用
            'gfw', 'category-vpnservices', 'category-anticensorship', 'tor'
        ];
    }

    /**
     * 过滤规则
     */
    filterRules() {
        if (!this.searchTerm) {
            this.filteredRules = [...this.rules];
        } else {
            this.filteredRules = this.rules.filter(rule => 
                rule.toLowerCase().includes(this.searchTerm)
            );
        }
        this.renderRules();
    }

    /**
     * 渲染规则列表
     */
    renderRules() {
        const container = document.getElementById('rulesList');
        if (!container) return;

        if (this.filteredRules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-title">暂无规则</div>
                    <div class="empty-state-description">
                        ${this.searchTerm ? '没有找到匹配的规则' : '点击"添加规则"按钮创建新的规则'}
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredRules.map((rule, index) => 
            this.createRuleCard(rule, index)
        ).join('');
        
        this.bindRuleCardEvents();
    }

    /**
     * 创建规则卡片
     * @param {string} rule - 规则字符串
     * @param {number} index - 规则索引
     * @returns {string} 卡片HTML
     */
    createRuleCard(rule, index) {
        const parts = rule.split(',');
        const ruleType = parts[0];
        const ruleContent = parts[1] || '';
        const ruleTarget = parts[2] || '';

        const typeColors = {
            'RULE-SET': '#667eea',
            'DOMAIN': '#10b981',
            'DOMAIN-SUFFIX': '#10b981',
            'DOMAIN-KEYWORD': '#10b981',
            'IP-CIDR': '#f59e0b',
            'GEOIP': '#f59e0b',
            'MATCH': '#ef4444',
            'PROCESS-NAME': '#8b5cf6'
        };

        // 获取规则提供商信息
        let providerInfo = '';
        if (ruleType === 'RULE-SET' && this.ruleProviders[ruleContent]) {
            const provider = this.ruleProviders[ruleContent];
            providerInfo = `
                <div class="rule-provider-info">
                    <div class="provider-url">
                        <span class="provider-label">URL:</span>
                        <a href="${provider.url}" target="_blank" class="provider-link">${this.shortenUrl(provider.url)}</a>
                    </div>
                    <div class="provider-details">
                        <span class="tag">更新间隔: ${this.formatInterval(provider.interval)}</span>
                        <span class="tag">格式: ${provider.format}</span>
                        <span class="tag">行为: ${provider.behavior}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="rule-card ${this.batchMode ? 'batch-mode' : ''}" data-rule-index="${index}">
                ${this.batchMode ? `
                    <div class="rule-checkbox-container">
                        <input type="checkbox" class="rule-checkbox" data-rule-index="${index}">
                    </div>
                ` : ''}
                <div class="rule-info">
                    <div class="rule-main">
                        <span class="rule-type" style="background: ${typeColors[ruleType] || '#6b7280'}">
                            ${ruleType}
                        </span>
                        <span class="rule-content">${ruleContent}</span>
                        <span class="rule-arrow">→</span>
                        <span class="rule-target ${this.getTargetClass(ruleTarget)}" data-target="${ruleTarget}">
                            ${this.formatTargetDisplay(ruleTarget)}
                        </span>
                    </div>
                    ${providerInfo}
                </div>
                <div class="rule-actions">
                    <button class="btn btn-sm btn-primary assign-group-btn" data-rule-index="${index}" title="关联代理组">
                        🔗 代理组
                    </button>
                    ${ruleType === 'RULE-SET' && this.ruleProviders[ruleContent] ?
                        `<button class="btn btn-sm btn-outline view-provider-btn" data-rule-content="${ruleContent}">查看</button>` : ''}
                    <button class="btn btn-sm btn-outline edit-rule-btn" data-rule-index="${index}">编辑</button>
                    <button class="btn btn-sm btn-danger delete-rule-btn" data-rule-index="${index}">删除</button>
                    ${this.canMoveUp(index) ? `<button class="btn btn-sm btn-outline move-up-btn" data-rule-index="${index}">↑</button>` : ''}
                    ${this.canMoveDown(index) ? `<button class="btn btn-sm btn-outline move-down-btn" data-rule-index="${index}">↓</button>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 缩短URL显示
     * @param {string} url - 完整URL
     * @returns {string} 缩短的URL
     */
    shortenUrl(url) {
        if (url.length <= 50) return url;
        const parts = url.split('/');
        if (parts.length > 3) {
            return `${parts[0]}//${parts[2]}/.../${parts[parts.length - 1]}`;
        }
        return url.substring(0, 47) + '...';
    }

    /**
     * 格式化时间间隔
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
     * 绑定规则卡片事件
     */
    bindRuleCardEvents() {
        // 关联代理组按钮
        document.querySelectorAll('.assign-group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.ruleIndex);
                this.showAssignGroupModal(index);
            });
        });

        // 查看提供商按钮
        document.querySelectorAll('.view-provider-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ruleContent = e.target.dataset.ruleContent;
                this.viewRuleProvider(ruleContent);
            });
        });

        // 编辑按钮
        document.querySelectorAll('.edit-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.ruleIndex);
                this.editRule(index);
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.ruleIndex);
                this.deleteRule(index);
            });
        });

        // 上移按钮
        document.querySelectorAll('.move-up-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.ruleIndex);
                this.moveRule(index, -1);
            });
        });

        // 下移按钮
        document.querySelectorAll('.move-down-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.ruleIndex);
                this.moveRule(index, 1);
            });
        });

        // 复选框事件（批量模式）
        document.querySelectorAll('.rule-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.ruleIndex);
                if (e.target.checked) {
                    this.selectedRules.add(index);
                } else {
                    this.selectedRules.delete(index);
                }
                this.updateBatchUI();
            });
        });
    }

    /**
     * 查看规则提供商详情
     * @param {string} ruleContent - 规则内容（提供商名称）
     */
    viewRuleProvider(ruleContent) {
        const provider = this.ruleProviders[ruleContent];
        if (!provider) return;

        // 在新标签页中打开规则提供商URL
        window.open(provider.url, '_blank');
    }

    /**
     * 检查是否可以上移
     * @param {number} index - 规则索引
     * @returns {boolean} 是否可以上移
     */
    canMoveUp(index) {
        return index > 0;
    }

    /**
     * 检查是否可以下移
     * @param {number} index - 规则索引
     * @returns {boolean} 是否可以下移
     */
    canMoveDown(index) {
        return index < this.filteredRules.length - 1;
    }

    /**
     * 移动规则
     * @param {number} index - 当前索引
     * @param {number} direction - 移动方向 (-1上移, 1下移)
     */
    moveRule(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.rules.length) return;

        // 交换规则位置
        [this.rules[index], this.rules[newIndex]] = [this.rules[newIndex], this.rules[index]];
        
        this.filterRules();
        this.dispatchConfigUpdateEvent();
    }

    /**
     * 编辑规则
     * @param {number} index - 规则索引
     */
    editRule(index) {
        const rule = this.filteredRules[index];
        this.showRuleEditModal(rule, (newRule) => {
            if (newRule && newRule !== rule) {
                const originalIndex = this.rules.indexOf(rule);
                if (originalIndex > -1) {
                    this.rules[originalIndex] = newRule;
                    this.filterRules();
                    this.dispatchConfigUpdateEvent();
                    this.showSuccess('规则已更新');
                }
            }
        });
    }

    /**
     * 删除规则
     * @param {number} index - 规则索引
     */
    deleteRule(index) {
        const rule = this.filteredRules[index];

        this.showConfirm(
            `确定要删除规则 "${rule}" 吗？`,
            () => {
                const originalIndex = this.rules.indexOf(rule);
                if (originalIndex > -1) {
                    this.rules.splice(originalIndex, 1);
                    this.filterRules();
                    this.dispatchConfigUpdateEvent();
                    this.showSuccess('规则已删除');
                }
            }
        );
    }

    /**
     * 显示添加规则模态框
     */
    showAddRuleModal() {
        this.showRuleEditModal('', (ruleText) => {
            if (ruleText && ruleText.trim()) {
                this.addRule(ruleText.trim());
            }
        });
    }

    /**
     * 添加规则
     * @param {string} rule - 规则字符串
     */
    addRule(rule) {
        if (!this.validateRule(rule)) {
            this.showError('规则格式不正确');
            return;
        }

        this.rules.push(rule);
        this.filterRules();
        this.dispatchConfigUpdateEvent();
        this.showSuccess('规则已添加');
    }

    /**
     * 验证规则格式
     * @param {string} rule - 规则字符串
     * @returns {boolean} 验证结果
     */
    validateRule(rule) {
        if (!rule || typeof rule !== 'string') return false;
        
        const parts = rule.split(',');
        if (parts.length < 2) return false;
        
        const validTypes = [
            'RULE-SET', 'DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD',
            'IP-CIDR', 'GEOIP', 'MATCH', 'PROCESS-NAME'
        ];
        
        return validTypes.includes(parts[0]);
    }

    /**
     * 加载规则
     */
    async loadRules() {
        this.renderRules();
    }

    /**
     * 获取所有规则
     * @returns {Array} 规则数组
     */
    getAllRules() {
        return this.rules;
    }

    /**
     * 获取规则提供商
     * @returns {Object} 规则提供商对象
     */
    getRuleProviders() {
        return this.ruleProviders;
    }

    /**
     * 设置规则
     * @param {Array} rules - 规则数组
     */
    setRules(rules) {
        this.rules = rules || [];
        this.filterRules();
    }

    /**
     * 设置规则提供商
     * @param {Object} providers - 规则提供商对象
     */
    setRuleProviders(providers) {
        this.ruleProviders = providers || {};
    }

    /**
     * 显示规则编辑模态框
     * @param {string} initialValue - 初始值
     * @param {Function} onSave - 保存回调
     */
    showRuleEditModal(initialValue, onSave) {
        const isEditing = !!initialValue;
        const modalHtml = `
            <div id="ruleEditModal" class="modal active">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>${isEditing ? '编辑规则' : '添加规则'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${!isEditing ? this.createRuleBrowserHtml() : ''}
                        <div class="form-group">
                            <label for="ruleInput">规则内容</label>
                            <input type="text" id="ruleInput" class="form-control"
                                   value="${initialValue}"
                                   placeholder="格式: TYPE,CONTENT,TARGET (例如: RULE-SET,youtube,YouTube)">
                        </div>
                        <div class="form-help">
                            支持的规则类型: RULE-SET, DOMAIN, DOMAIN-SUFFIX, DOMAIN-KEYWORD, IP-CIDR, GEOIP, MATCH, PROCESS-NAME
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="saveRuleBtn" class="btn btn-primary">保存</button>
                        <button type="button" class="modal-close btn btn-secondary">取消</button>
                    </div>
                </div>
            </div>
        `;

        // 移除现有模态框
        const existingModal = document.getElementById('ruleEditModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定事件
        this.bindRuleModalEvents(onSave);

        // 聚焦输入框
        setTimeout(() => {
            document.getElementById('ruleInput').focus();
        }, 100);
    }

    /**
     * 创建规则浏览器HTML
     * @returns {string} 规则浏览器HTML
     */
    createRuleBrowserHtml() {
        if (!this.availableRules || this.availableRules.length === 0) {
            return '<div class="form-help">正在加载可用规则...</div>';
        }

        // 按类别分组规则
        const categories = {
            'AI服务': this.availableRules.filter(rule => rule.includes('ai') || rule.includes('openai') || rule.includes('anthropic')),
            '流媒体': this.availableRules.filter(rule =>
                ['youtube', 'netflix', 'disney', 'spotify', 'tiktok', 'bilibili', 'biliintl', 'bahamut', 'hbo', 'primevideo', 'hulu', 'twitch'].some(keyword => rule.includes(keyword))
            ),
            '社交媒体': this.availableRules.filter(rule =>
                ['twitter', 'facebook', 'instagram', 'telegram', 'discord', 'reddit', 'linkedin'].some(keyword => rule.includes(keyword))
            ),
            '科技公司': this.availableRules.filter(rule =>
                ['google', 'microsoft', 'apple', 'github', 'amazon', 'meta', 'adobe'].some(keyword => rule.includes(keyword))
            ),
            '游戏': this.availableRules.filter(rule => rule.includes('game') || rule.includes('steam') || rule.includes('epic')),
            '其他': this.availableRules.filter(rule =>
                !['ai', 'youtube', 'netflix', 'disney', 'spotify', 'tiktok', 'bilibili', 'twitter', 'facebook', 'instagram', 'telegram', 'google', 'microsoft', 'apple', 'github', 'game', 'steam'].some(keyword => rule.includes(keyword))
            )
        };

        let html = `
            <div class="rule-browser">
                <div class="form-group">
                    <label>快速选择规则</label>
                    <input type="text" id="ruleBrowserSearch" class="form-control" placeholder="搜索规则...">
                </div>
                <div class="rule-categories">
        `;

        Object.entries(categories).forEach(([category, rules]) => {
            if (rules.length > 0) {
                html += `
                    <div class="rule-category">
                        <div class="rule-category-title">${category} (${rules.length})</div>
                        <div class="rule-category-items">
                `;

                rules.slice(0, 10).forEach(rule => { // 限制每个类别显示10个
                    html += `
                        <button type="button" class="rule-item-btn" data-rule="${rule}">
                            ${rule}
                        </button>
                    `;
                });

                if (rules.length > 10) {
                    html += `<div class="rule-more">还有 ${rules.length - 10} 个...</div>`;
                }

                html += `
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;

        return html;
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
     * 绑定规则模态框事件
     * @param {Function} onSave - 保存回调
     */
    bindRuleModalEvents(onSave) {
        // 保存按钮
        document.getElementById('saveRuleBtn').addEventListener('click', () => {
            const value = document.getElementById('ruleInput').value.trim();
            document.getElementById('ruleEditModal').remove();
            onSave(value);
        });

        // 关闭按钮
        document.querySelectorAll('#ruleEditModal .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('ruleEditModal').remove();
            });
        });

        // 规则项点击事件
        document.querySelectorAll('.rule-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ruleName = e.target.dataset.rule;
                this.selectRuleFromBrowser(ruleName);
            });
        });

        // 搜索功能
        const searchInput = document.getElementById('ruleBrowserSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterRuleBrowser(e.target.value);
            });
        }
    }

    /**
     * 从浏览器选择规则
     * @param {string} ruleName - 规则名称
     */
    selectRuleFromBrowser(ruleName) {
        // 生成规则字符串，默认目标为代理组名称（首字母大写）
        const target = ruleName.charAt(0).toUpperCase() + ruleName.slice(1);
        const ruleString = `RULE-SET,${ruleName},${target}`;

        // 填入输入框
        document.getElementById('ruleInput').value = ruleString;

        // 自动添加到规则提供商（如果不存在）
        if (!this.ruleProviders[ruleName]) {
            this.ruleProviders[ruleName] = {
                behavior: 'classical',
                format: 'yaml',
                interval: 86400,
                url: `https://raw.githubusercontent.com/rdone4425/meta-rules-dat/meta/geo/geosite/${ruleName}.yaml`
            };
        }
    }

    /**
     * 过滤规则浏览器
     * @param {string} searchTerm - 搜索词
     */
    filterRuleBrowser(searchTerm) {
        const items = document.querySelectorAll('.rule-item-btn');
        const categories = document.querySelectorAll('.rule-category');

        items.forEach(item => {
            const ruleName = item.dataset.rule;
            const visible = ruleName.toLowerCase().includes(searchTerm.toLowerCase());
            item.style.display = visible ? 'inline-block' : 'none';
        });

        // 隐藏空的分类
        categories.forEach(category => {
            const visibleItems = category.querySelectorAll('.rule-item-btn[style*="inline-block"], .rule-item-btn:not([style*="none"])');
            category.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
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
            detail: {
                type: 'rules',
                data: {
                    rules: this.rules,
                    ruleProviders: this.ruleProviders
                }
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 绑定批量操作事件
     */
    bindBatchOperationEvents() {
        // 全选按钮
        const selectAllBtn = document.getElementById('selectAllRulesBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllRules();
            });
        }

        // 清除选择按钮
        const clearSelectionBtn = document.getElementById('clearSelectionBtn');
        if (clearSelectionBtn) {
            clearSelectionBtn.addEventListener('click', () => {
                this.clearSelection();
            });
        }

        // 批量关联代理组按钮
        const batchAssignBtn = document.getElementById('batchAssignGroupBtn');
        if (batchAssignBtn) {
            batchAssignBtn.addEventListener('click', () => {
                this.showBatchAssignGroupModal();
            });
        }

        // 批量删除按钮
        const batchDeleteBtn = document.getElementById('batchDeleteRulesBtn');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => {
                this.batchDeleteRules();
            });
        }
    }

    /**
     * 切换批量操作模式
     */
    toggleBatchMode() {
        this.batchMode = !this.batchMode;
        const panel = document.getElementById('batchOperationPanel');
        const btn = document.getElementById('toggleBatchModeBtn');

        if (this.batchMode) {
            panel.style.display = 'block';
            btn.textContent = '退出批量';
            btn.classList.add('active');
        } else {
            panel.style.display = 'none';
            btn.textContent = '批量操作';
            btn.classList.remove('active');
            this.clearSelection();
        }

        // 重新渲染规则列表以显示/隐藏复选框
        this.renderRules();
    }

    /**
     * 全选规则
     */
    selectAllRules() {
        this.selectedRules.clear();
        this.filteredRules.forEach((rule, index) => {
            this.selectedRules.add(index);
        });
        this.updateBatchUI();
        this.updateRuleSelection();
    }

    /**
     * 清除选择
     */
    clearSelection() {
        this.selectedRules.clear();
        this.updateBatchUI();
        this.updateRuleSelection();
    }

    /**
     * 更新批量操作UI
     */
    updateBatchUI() {
        const selectedCount = document.getElementById('selectedCount');
        const batchAssignBtn = document.getElementById('batchAssignGroupBtn');
        const batchDeleteBtn = document.getElementById('batchDeleteRulesBtn');

        if (selectedCount) {
            selectedCount.textContent = `已选择 ${this.selectedRules.size} 条规则`;
        }

        const hasSelection = this.selectedRules.size > 0;
        if (batchAssignBtn) batchAssignBtn.disabled = !hasSelection;
        if (batchDeleteBtn) batchDeleteBtn.disabled = !hasSelection;
    }

    /**
     * 更新规则选择状态
     */
    updateRuleSelection() {
        document.querySelectorAll('.rule-checkbox').forEach((checkbox, index) => {
            checkbox.checked = this.selectedRules.has(index);
        });
    }

    /**
     * 显示关联代理组模态框
     * @param {number} ruleIndex - 规则索引
     */
    showAssignGroupModal(ruleIndex) {
        const rule = this.filteredRules[ruleIndex];
        if (!rule) return;

        const parts = rule.split(',');
        const currentTarget = parts[2] || '';

        // 获取可用的代理组列表
        const availableGroups = this.getAvailableProxyGroups();

        const modalHtml = `
            <div id="assignGroupModal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>关联代理组</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="rule-info-display">
                            <h4>规则信息</h4>
                            <div class="rule-display">
                                <span class="rule-type-display">${parts[0]}</span>
                                <span class="rule-content-display">${parts[1]}</span>
                                <span class="rule-arrow">→</span>
                                <span class="current-target">${currentTarget}</span>
                            </div>
                        </div>

                        <div class="proxy-group-selection">
                            <h4>选择目标代理组</h4>
                            <div class="group-grid">
                                ${availableGroups.map(group => `
                                    <button class="group-option ${group === currentTarget ? 'selected' : ''}"
                                            data-group="${group}">
                                        ${this.formatTargetDisplay(group)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="create-new-group">
                            <h4>或创建新代理组</h4>
                            <div class="form-group">
                                <input type="text" id="newGroupName" class="form-control"
                                       placeholder="输入新代理组名称">
                                <button id="createGroupBtn" class="btn btn-outline">创建并关联</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="confirmAssignBtn" class="btn btn-primary" disabled>确认关联</button>
                        <button type="button" class="modal-close btn btn-secondary">取消</button>
                    </div>
                </div>
            </div>
        `;

        // 移除现有模态框
        const existingModal = document.getElementById('assignGroupModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定事件
        this.bindAssignGroupModalEvents(ruleIndex);
    }

    /**
     * 绑定关联代理组模态框事件
     * @param {number} ruleIndex - 规则索引
     */
    bindAssignGroupModalEvents(ruleIndex) {
        let selectedGroup = '';

        // 代理组选项点击事件
        document.querySelectorAll('.group-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 清除其他选中状态
                document.querySelectorAll('.group-option').forEach(b => b.classList.remove('selected'));

                // 设置当前选中
                e.target.classList.add('selected');
                selectedGroup = e.target.dataset.group;

                // 启用确认按钮
                document.getElementById('confirmAssignBtn').disabled = false;
            });
        });

        // 创建新代理组按钮
        document.getElementById('createGroupBtn').addEventListener('click', () => {
            const newGroupName = document.getElementById('newGroupName').value.trim();
            if (newGroupName) {
                selectedGroup = newGroupName;
                document.getElementById('confirmAssignBtn').disabled = false;
                this.showSuccess(`将创建新代理组: ${newGroupName}`);
            }
        });

        // 确认关联按钮
        document.getElementById('confirmAssignBtn').addEventListener('click', () => {
            if (selectedGroup) {
                this.assignRuleToGroup(ruleIndex, selectedGroup);
                document.getElementById('assignGroupModal').remove();
            }
        });

        // 关闭按钮
        document.querySelectorAll('#assignGroupModal .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('assignGroupModal').remove();
            });
        });
    }

    /**
     * 将规则关联到代理组
     * @param {number} ruleIndex - 规则索引
     * @param {string} groupName - 代理组名称
     */
    assignRuleToGroup(ruleIndex, groupName) {
        const rule = this.filteredRules[ruleIndex];
        if (!rule) return;

        const parts = rule.split(',');
        const newRule = `${parts[0]},${parts[1]},${groupName}`;

        // 更新规则
        const originalIndex = this.rules.indexOf(rule);
        if (originalIndex > -1) {
            this.rules[originalIndex] = newRule;
            this.filteredRules[ruleIndex] = newRule;

            // 重新渲染规则列表
            this.renderRules();

            // 触发配置更新事件
            this.dispatchConfigUpdateEvent();

            this.showSuccess(`规则已关联到代理组: ${groupName}`);
        }
    }

    /**
     * 显示批量关联代理组模态框
     */
    showBatchAssignGroupModal() {
        if (this.selectedRules.size === 0) return;

        const availableGroups = this.getAvailableProxyGroups();
        const selectedRulesList = Array.from(this.selectedRules).map(index => this.filteredRules[index]);

        const modalHtml = `
            <div id="batchAssignGroupModal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>批量关联代理组</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="selected-rules-info">
                            <h4>选中的规则 (${this.selectedRules.size} 条)</h4>
                            <div class="rules-preview">
                                ${selectedRulesList.slice(0, 5).map(rule => {
                                    const parts = rule.split(',');
                                    return `<div class="rule-preview">${parts[0]} → ${parts[1]} → ${parts[2]}</div>`;
                                }).join('')}
                                ${selectedRulesList.length > 5 ? `<div class="more-rules">还有 ${selectedRulesList.length - 5} 条规则...</div>` : ''}
                            </div>
                        </div>

                        <div class="proxy-group-selection">
                            <h4>选择目标代理组</h4>
                            <div class="group-grid">
                                ${availableGroups.map(group => `
                                    <button class="group-option" data-group="${group}">
                                        ${this.formatTargetDisplay(group)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="confirmBatchAssignBtn" class="btn btn-primary" disabled>批量关联</button>
                        <button type="button" class="modal-close btn btn-secondary">取消</button>
                    </div>
                </div>
            </div>
        `;

        // 移除现有模态框
        const existingModal = document.getElementById('batchAssignGroupModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定事件
        this.bindBatchAssignGroupModalEvents();
    }

    /**
     * 绑定批量关联代理组模态框事件
     */
    bindBatchAssignGroupModalEvents() {
        let selectedGroup = '';

        // 代理组选项点击事件
        document.querySelectorAll('#batchAssignGroupModal .group-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 清除其他选中状态
                document.querySelectorAll('#batchAssignGroupModal .group-option').forEach(b => b.classList.remove('selected'));

                // 设置当前选中
                e.target.classList.add('selected');
                selectedGroup = e.target.dataset.group;

                // 启用确认按钮
                document.getElementById('confirmBatchAssignBtn').disabled = false;
            });
        });

        // 确认批量关联按钮
        document.getElementById('confirmBatchAssignBtn').addEventListener('click', () => {
            if (selectedGroup) {
                this.batchAssignRulesToGroup(selectedGroup);
                document.getElementById('batchAssignGroupModal').remove();
            }
        });

        // 关闭按钮
        document.querySelectorAll('#batchAssignGroupModal .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('batchAssignGroupModal').remove();
            });
        });
    }

    /**
     * 批量将规则关联到代理组
     * @param {string} groupName - 代理组名称
     */
    batchAssignRulesToGroup(groupName) {
        let updatedCount = 0;

        Array.from(this.selectedRules).forEach(index => {
            const rule = this.filteredRules[index];
            if (rule) {
                const parts = rule.split(',');
                const newRule = `${parts[0]},${parts[1]},${groupName}`;

                const originalIndex = this.rules.indexOf(rule);
                if (originalIndex > -1) {
                    this.rules[originalIndex] = newRule;
                    this.filteredRules[index] = newRule;
                    updatedCount++;
                }
            }
        });

        // 清除选择并退出批量模式
        this.clearSelection();
        this.toggleBatchMode();

        // 重新渲染规则列表
        this.renderRules();

        // 触发配置更新事件
        this.dispatchConfigUpdateEvent();

        this.showSuccess(`已将 ${updatedCount} 条规则关联到代理组: ${groupName}`);
    }

    /**
     * 批量删除规则
     */
    batchDeleteRules() {
        if (this.selectedRules.size === 0) return;

        const selectedCount = this.selectedRules.size;

        // 确认删除
        const confirmMessage = `确定要删除选中的 ${selectedCount} 条规则吗？此操作不可撤销。`;

        if (confirm(confirmMessage)) {
            // 按索引倒序删除，避免索引变化问题
            const sortedIndexes = Array.from(this.selectedRules).sort((a, b) => b - a);

            sortedIndexes.forEach(index => {
                const rule = this.filteredRules[index];
                const originalIndex = this.rules.indexOf(rule);
                if (originalIndex > -1) {
                    this.rules.splice(originalIndex, 1);
                }
            });

            // 清除选择并退出批量模式
            this.clearSelection();
            this.toggleBatchMode();

            // 重新渲染规则列表
            this.renderRules();

            // 触发配置更新事件
            this.dispatchConfigUpdateEvent();

            this.showSuccess(`已删除 ${selectedCount} 条规则`);
        }
    }
}
