// 代理组管理器
export class ProxyGroupManager {
    constructor() {
        this.groups = [];
        this.currentGroupType = 'application';
        this.editingGroup = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDefaultGroups();
    }

    bindEvents() {
        // 代理组类型切换
        document.querySelectorAll('.group-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchGroupType(e.target.dataset.groupType);
            });
        });

        // 保存代理组
        const saveBtn = document.getElementById('saveGroupBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveGroup();
            });
        }

        // 监听代理组类型变化
        document.addEventListener('change', (e) => {
            if (e.target.id === 'groupType') {
                this.onGroupTypeChange(e.target.value);
            }
        });
    }

    /**
     * 切换代理组类型
     * @param {string} type - 代理组类型
     */
    switchGroupType(type) {
        this.currentGroupType = type;
        
        // 更新导航按钮状态
        document.querySelectorAll('.group-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-group-type="${type}"]`).classList.add('active');
        
        // 重新渲染代理组列表
        this.renderGroups();
    }

    /**
     * 获取默认的地区代理组列表
     * @returns {Array} 地区代理组名称数组
     */
    getDefaultRegionGroups() {
        return ['HongKong', 'TaiWan', 'Japan', 'Singapore', 'America', 'AllServer'];
    }

    /**
     * 获取应用代理组的默认代理列表
     * @returns {Array} 包含所有地区代理组和DIRECT的数组
     */
    getDefaultApplicationProxies() {
        return [...this.getDefaultRegionGroups(), 'DIRECT'];
    }

    /**
     * 加载默认代理组
     */
    loadDefaultGroups() {
        const defaultProxies = this.getDefaultApplicationProxies();

        this.groups = [
            // 应用代理组
            {
                name: 'Final',
                type: 'select',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png',
                proxies: ['Proxy', 'DIRECT'],
                description: '最终策略'
            },
            {
                name: 'Proxy',
                type: 'select',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png',
                proxies: defaultProxies,
                description: '代理策略'
            },
            {
                name: 'AI',
                type: 'select',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png',
                proxies: defaultProxies,
                description: 'AI服务'
            },
            {
                name: 'YouTube',
                type: 'select',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png',
                proxies: defaultProxies,
                description: 'YouTube视频'
            },
            {
                name: 'NETFLIX',
                type: 'select',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png',
                proxies: defaultProxies,
                description: 'Netflix流媒体'
            },
            {
                name: 'Spotify',
                type: 'select',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png',
                proxies: defaultProxies,
                description: 'Spotify音乐'
            },
            {
                name: 'AllServer',
                type: 'url-test',
                category: 'application',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png',
                'include-all': true,
                filter: '^(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|(\\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\\b|(\\d{4}-\\d{2}-\\d{2}|\\d+G)))).*$',
                interval: 300,
                lazy: true,
                use: ['Subscribe'],
                description: '所有可用节点 (自动选择最优)'
            },
            // 地区代理组（合并策略功能）
            {
                name: 'HongKong',
                type: 'url-test',  // 直接使用自动选择策略
                category: 'region',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png',
                'include-all': true,
                filter: '港|🇭🇰|HK|(?i)Hong',
                interval: 300,
                lazy: true,
                use: ['Subscribe'],
                description: '🇭🇰 香港节点 (自动选择最优)'
            },
            {
                name: 'TaiWan',
                type: 'url-test',
                category: 'region',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png',
                'include-all': true,
                filter: '台|🇨🇳|🇹🇼|湾|TW|(?i)Taiwan',
                interval: 300,
                lazy: true,
                use: ['Subscribe'],
                description: '🇹🇼 台湾节点 (自动选择最优)'
            },
            {
                name: 'Japan',
                type: 'url-test',
                category: 'region',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png',
                'include-all': true,
                filter: '日|🇯🇵|东京|JP|(?i)Japan',
                interval: 300,
                lazy: true,
                use: ['Subscribe'],
                description: '🇯🇵 日本节点 (自动选择最优)'
            },
            {
                name: 'Singapore',
                type: 'url-test',
                category: 'region',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png',
                'include-all': true,
                filter: '新加坡|坡|狮城|🇸🇬|SG|(?i)Singapore',
                interval: 300,
                lazy: true,
                use: ['Subscribe'],
                description: '🇸🇬 新加坡节点 (自动选择最优)'
            },
            {
                name: 'America',
                type: 'url-test',
                category: 'region',
                icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png',
                'include-all': true,
                filter: '美|🇺🇲|US|(?i)States|American',
                interval: 300,
                lazy: true,
                use: ['Subscribe'],
                description: '🇺🇸 美国节点 (自动选择最优)'
            }
        ];
    }

    /**
     * 渲染代理组列表
     */
    renderGroups() {
        const container = document.getElementById('groupsList');
        if (!container) return;

        const filteredGroups = this.groups.filter(group => 
            group.category === this.currentGroupType
        );

        if (filteredGroups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-title">暂无${this.getCategoryName()}代理组</div>
                    <div class="empty-state-description">点击"添加代理组"按钮创建新的代理组</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredGroups.map(group => this.createGroupCard(group)).join('');
        
        // 绑定卡片事件
        this.bindGroupCardEvents();
    }

    /**
     * 创建代理组卡片
     * @param {Object} group - 代理组对象
     * @returns {string} 卡片HTML
     */
    createGroupCard(group) {
        const typeLabels = {
            'select': '手动选择',
            'url-test': '自动选择',
            'fallback': '故障转移',
            'load-balance': '负载均衡'
        };

        const typeColors = {
            'select': '#667eea',
            'url-test': '#10b981',
            'fallback': '#f59e0b',
            'load-balance': '#8b5cf6'
        };

        return `
            <div class="group-card" data-group-name="${group.name}">
                <div class="group-header">
                    <div class="group-name">
                        ${group.icon ? `<img src="${group.icon}" class="group-icon" alt="${group.name}">` : ''}
                        ${group.name}
                    </div>
                    <div class="group-actions">
                        <button class="btn btn-sm btn-outline edit-group-btn" data-group-name="${group.name}">编辑</button>
                        <button class="btn btn-sm btn-danger delete-group-btn" data-group-name="${group.name}">删除</button>
                    </div>
                </div>
                <div class="group-info">
                    <div><span class="group-type" style="background: ${typeColors[group.type] || '#6b7280'}">${typeLabels[group.type] || group.type}</span></div>
                    ${group.proxies ? `<div>包含代理: ${group.proxies.join(', ')}</div>` : ''}
                    ${group.filter ? `<div>节点过滤: <code>${group.filter}</code></div>` : ''}
                    ${group.use ? `<div>使用提供商: ${group.use.join(', ')}</div>` : ''}
                    ${group.interval ? `<div>测试间隔: ${group.interval}秒</div>` : ''}
                    ${group.lazy ? `<div><span class="tag">延迟测试</span></div>` : ''}
                    ${group['include-all'] ? `<div><span class="tag tag-success">包含所有节点</span></div>` : ''}
                    ${group.description ? `<div class="text-secondary">${group.description}</div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 绑定代理组卡片事件
     */
    bindGroupCardEvents() {
        // 编辑按钮
        document.querySelectorAll('.edit-group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupName = e.target.dataset.groupName;
                this.editGroup(groupName);
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupName = e.target.dataset.groupName;
                this.deleteGroup(groupName);
            });
        });
    }

    /**
     * 获取分类名称
     * @returns {string} 分类名称
     */
    getCategoryName() {
        const names = {
            'application': '应用',
            'region': '地区'
        };
        return names[this.currentGroupType] || '';
    }

    /**
     * 显示添加代理组模态框
     */
    showAddGroupModal() {
        this.editingGroup = null;
        document.getElementById('groupModalTitle').textContent = '添加代理组';
        this.clearGroupForm();
        this.showGroupModal();

        // 如果是应用代理组，默认选中所有地区代理组
        if (this.currentGroupType === 'application') {
            setTimeout(() => {
                this.selectDefaultProxies();
            }, 200);
        }
    }

    /**
     * 编辑代理组
     * @param {string} groupName - 代理组名称
     */
    editGroup(groupName) {
        const group = this.groups.find(g => g.name === groupName);
        if (!group) return;

        this.editingGroup = group;
        document.getElementById('groupModalTitle').textContent = '编辑代理组';
        this.fillGroupForm(group);
        this.showGroupModal();
    }

    /**
     * 显示代理组模态框
     */
    showGroupModal() {
        const modal = document.getElementById('groupModal');
        if (modal) {
            // 生成代理组复选框
            this.generateProxyGroupCheckboxes();
            modal.classList.add('active');

            // 根据当前类型设置字段可见性
            setTimeout(() => {
                const currentType = document.getElementById('groupType').value;
                this.onGroupTypeChange(currentType);
            }, 100);
        }
    }

    /**
     * 生成代理组复选框
     */
    generateProxyGroupCheckboxes() {
        const container = document.getElementById('groupProxiesCheckboxes');
        if (!container) return;

        // 获取所有可用的代理组（排除当前编辑的组）
        const availableGroups = this.getAvailableProxyGroups();

        // 添加常用选项
        const commonOptions = ['DIRECT'];

        let html = '';

        // 常用选项
        commonOptions.forEach(option => {
            html += `
                <div class="checkbox-item">
                    <input type="checkbox" id="proxy_${option}" value="${option}">
                    <label for="proxy_${option}">${option}</label>
                </div>
            `;
        });

        // 地区代理组
        if (availableGroups.region.length > 0) {
            html += '<div class="checkbox-section-title">地区代理组</div>';
            availableGroups.region.forEach(group => {
                html += `
                    <div class="checkbox-item">
                        <input type="checkbox" id="proxy_${group.name}" value="${group.name}" checked>
                        <label for="proxy_${group.name}">
                            ${group.icon ? `<img src="${group.icon}" class="checkbox-icon" alt="">` : ''}
                            ${group.name}
                        </label>
                    </div>
                `;
            });
        }

        // 应用代理组
        if (availableGroups.application.length > 0) {
            html += '<div class="checkbox-section-title">应用代理组</div>';
            availableGroups.application.forEach(group => {
                html += `
                    <div class="checkbox-item">
                        <input type="checkbox" id="proxy_${group.name}" value="${group.name}">
                        <label for="proxy_${group.name}">
                            ${group.icon ? `<img src="${group.icon}" class="checkbox-icon" alt="">` : ''}
                            ${group.name}
                        </label>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }

    /**
     * 为新的应用代理组选择默认代理
     */
    selectDefaultProxies() {
        if (this.currentGroupType !== 'application') return;

        const defaultProxies = this.getDefaultApplicationProxies();
        defaultProxies.forEach(proxyName => {
            const checkbox = document.getElementById(`proxy_${proxyName}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    /**
     * 获取可用的代理组
     * @returns {Object} 分类的代理组
     */
    getAvailableProxyGroups() {
        const currentGroupName = this.editingGroup ? this.editingGroup.name : null;

        return {
            region: this.groups.filter(g => g.category === 'region'),
            application: this.groups.filter(g =>
                g.category === 'application' && g.name !== currentGroupName
            )
        };
    }

    /**
     * 处理代理组类型变化
     * @param {string} type - 新的代理组类型
     */
    onGroupTypeChange(type) {
        const proxiesContainer = document.querySelector('.form-group:has(#groupProxiesCheckboxes)');
        const filterContainer = document.querySelector('.form-group:has(#groupFilter)');
        const intervalContainer = document.querySelector('.form-group:has(#groupInterval)');
        const lazyContainer = document.querySelector('.form-group:has(#groupLazy)');

        // 根据当前代理组类别决定是否显示复选框
        const isApplicationGroup = this.currentGroupType === 'application';

        if (proxiesContainer) {
            proxiesContainer.style.display = isApplicationGroup ? 'flex' : 'none';
        }

        if (type === 'select') {
            // 手动选择类型：只显示代理组选择（仅应用代理组）
            if (filterContainer) filterContainer.style.display = 'none';
            if (intervalContainer) intervalContainer.style.display = 'none';
            if (lazyContainer) lazyContainer.style.display = 'none';
        } else {
            // 自动选择类型：显示自动化选项
            if (filterContainer) filterContainer.style.display = 'flex';
            if (intervalContainer) intervalContainer.style.display = 'flex';
            if (lazyContainer) lazyContainer.style.display = 'flex';
        }
    }

    /**
     * 清空代理组表单
     */
    clearGroupForm() {
        document.getElementById('groupName').value = '';
        document.getElementById('groupType').value = 'select';
        document.getElementById('groupIcon').value = '';
        document.getElementById('groupFilter').value = '';
        document.getElementById('groupInterval').value = '300';
        document.getElementById('groupHidden').checked = false;
        document.getElementById('groupLazy').checked = false;

        // 清空复选框
        const checkboxes = document.querySelectorAll('#groupProxiesCheckboxes input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    /**
     * 填充代理组表单
     * @param {Object} group - 代理组对象
     */
    fillGroupForm(group) {
        document.getElementById('groupName').value = group.name || '';
        document.getElementById('groupType').value = group.type || 'select';
        document.getElementById('groupIcon').value = group.icon || '';
        document.getElementById('groupFilter').value = group.filter || '';
        document.getElementById('groupInterval').value = group.interval || 300;
        document.getElementById('groupHidden').checked = group.hidden || false;
        document.getElementById('groupLazy').checked = group.lazy || false;

        // 设置复选框状态
        setTimeout(() => {
            if (group.proxies) {
                group.proxies.forEach(proxyName => {
                    const checkbox = document.getElementById(`proxy_${proxyName}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        }, 100); // 等待复选框生成完成
    }

    /**
     * 保存代理组
     */
    saveGroup() {
        const formData = this.getGroupFormData();
        
        if (!this.validateGroupForm(formData)) {
            return;
        }

        if (this.editingGroup) {
            // 更新现有代理组
            Object.assign(this.editingGroup, formData);
        } else {
            // 添加新代理组
            formData.category = this.currentGroupType;
            this.groups.push(formData);
        }

        this.renderGroups();
        this.closeGroupModal();
        
        // 触发配置更新事件
        this.dispatchConfigUpdateEvent();
    }

    /**
     * 获取代理组表单数据
     * @returns {Object} 表单数据
     */
    getGroupFormData() {
        const formData = {
            name: document.getElementById('groupName').value.trim(),
            type: document.getElementById('groupType').value,
            icon: document.getElementById('groupIcon').value.trim(),
            filter: document.getElementById('groupFilter').value.trim(),
            interval: parseInt(document.getElementById('groupInterval').value) || 300,
            hidden: document.getElementById('groupHidden').checked,
            lazy: document.getElementById('groupLazy').checked
        };

        // 只有应用代理组才使用复选框选择的代理组
        if (this.currentGroupType === 'application') {
            const checkedBoxes = document.querySelectorAll('#groupProxiesCheckboxes input[type="checkbox"]:checked');
            const proxies = Array.from(checkedBoxes).map(cb => cb.value);

            if (proxies.length > 0) {
                formData.proxies = proxies;
            }
        }

        // 地区代理组和自动选择类型需要额外的配置
        if (this.currentGroupType === 'region' || formData.type !== 'select') {
            formData['include-all'] = true;
            formData.use = ['Subscribe'];
        }

        return formData;
    }

    /**
     * 验证代理组表单
     * @param {Object} formData - 表单数据
     * @returns {boolean} 验证结果
     */
    validateGroupForm(formData) {
        if (!formData.name) {
            this.showError('请输入代理组名称');
            return false;
        }

        // 检查名称是否重复（编辑时排除自身）
        const existingGroup = this.groups.find(g =>
            g.name === formData.name && g !== this.editingGroup
        );

        if (existingGroup) {
            this.showError('代理组名称已存在');
            return false;
        }

        return true;
    }

    /**
     * 关闭代理组模态框
     */
    closeGroupModal() {
        const modal = document.getElementById('groupModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 删除代理组
     * @param {string} groupName - 代理组名称
     */
    deleteGroup(groupName) {
        this.showConfirm(
            `确定要删除代理组 "${groupName}" 吗？`,
            () => {
                const index = this.groups.findIndex(g => g.name === groupName);
                if (index > -1) {
                    this.groups.splice(index, 1);
                    this.renderGroups();
                    this.dispatchConfigUpdateEvent();
                    this.showSuccess(`代理组 "${groupName}" 已删除`);
                }
            }
        );
    }

    /**
     * 加载代理组
     */
    async loadGroups() {
        this.renderGroups();
    }

    /**
     * 获取所有代理组
     * @returns {Array} 代理组数组
     */
    getAllGroups() {
        return this.groups;
    }

    /**
     * 设置代理组
     * @param {Array} groups - 代理组数组
     */
    setGroups(groups) {
        this.groups = groups || [];
        this.renderGroups();
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
     * @param {Function} onCancel - 取消回调
     */
    showConfirm(message, onConfirm, onCancel) {
        const event = new CustomEvent('showConfirm', {
            detail: { message, onConfirm, onCancel }
        });
        document.dispatchEvent(event);
    }

    /**
     * 触发配置更新事件
     */
    dispatchConfigUpdateEvent() {
        const event = new CustomEvent('configUpdate', {
            detail: { type: 'proxy-groups', data: this.groups }
        });
        document.dispatchEvent(event);
    }
}
