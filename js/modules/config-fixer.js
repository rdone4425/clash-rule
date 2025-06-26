// 配置修复助手
export class ConfigFixer {
    constructor() {
        this.fixActions = [];
    }

    /**
     * 分析并生成修复建议
     * @param {Object} validationResult - 验证结果
     * @param {Object} config - 当前配置
     * @returns {Array} 修复建议数组
     */
    generateFixSuggestions(validationResult, config) {
        this.fixActions = [];
        
        // 修复代理组问题
        this.analyzeProxyGroupIssues(validationResult.proxyGroups, config);
        
        // 修复规则问题
        this.analyzeRuleIssues(validationResult.rules, config);
        
        // 修复规则提供商问题
        this.analyzeRuleProviderIssues(validationResult.ruleProviders, config);
        
        return this.fixActions;
    }

    /**
     * 分析代理组问题
     * @param {Array} issues - 代理组问题列表
     * @param {Object} config - 当前配置
     */
    analyzeProxyGroupIssues(issues, config) {
        issues.forEach(issue => {
            if (issue.type === 'error') {
                if (issue.message.includes('缺少名称')) {
                    this.fixActions.push({
                        type: 'proxy-group-name',
                        description: '为代理组添加名称',
                        action: 'addProxyGroupName',
                        data: issue.group,
                        severity: 'high'
                    });
                }
                
                if (issue.message.includes('缺少类型')) {
                    this.fixActions.push({
                        type: 'proxy-group-type',
                        description: '为代理组设置类型',
                        action: 'addProxyGroupType',
                        data: issue.group,
                        severity: 'high'
                    });
                }
                
                if (issue.message.includes('名称重复')) {
                    this.fixActions.push({
                        type: 'proxy-group-duplicate',
                        description: '修复重复的代理组名称',
                        action: 'fixDuplicateProxyGroupName',
                        data: issue.group,
                        severity: 'high'
                    });
                }
            }
            
            if (issue.type === 'warning') {
                if (issue.message.includes('应该包含代理列表')) {
                    this.fixActions.push({
                        type: 'proxy-group-proxies',
                        description: '为select类型代理组添加代理列表',
                        action: 'addProxyGroupProxies',
                        data: issue.group,
                        severity: 'medium'
                    });
                }
                
                if (issue.message.includes('建议设置测试间隔')) {
                    this.fixActions.push({
                        type: 'proxy-group-interval',
                        description: '为自动测试代理组设置测试间隔',
                        action: 'addProxyGroupInterval',
                        data: issue.group,
                        severity: 'low'
                    });
                }
            }
        });
    }

    /**
     * 分析规则问题
     * @param {Array} issues - 规则问题列表
     * @param {Object} config - 当前配置
     */
    analyzeRuleIssues(issues, config) {
        issues.forEach(issue => {
            if (issue.type === 'error') {
                if (issue.message.includes('目标代理组') && issue.message.includes('不存在')) {
                    this.fixActions.push({
                        type: 'rule-target-missing',
                        description: '修复规则中不存在的目标代理组',
                        action: 'fixRuleTarget',
                        data: { rule: issue.rule, config: config },
                        severity: 'high'
                    });
                }
                
                if (issue.message.includes('规则格式不正确')) {
                    this.fixActions.push({
                        type: 'rule-format',
                        description: '修复规则格式错误',
                        action: 'fixRuleFormat',
                        data: issue.rule,
                        severity: 'high'
                    });
                }
            }
            
            if (issue.type === 'warning') {
                if (issue.message.includes('MATCH规则')) {
                    this.fixActions.push({
                        type: 'rule-match-position',
                        description: '调整MATCH规则位置',
                        action: 'fixMatchRulePosition',
                        data: { rules: config.rules },
                        severity: 'medium'
                    });
                }
                
                if (issue.message.includes('缺少MATCH规则')) {
                    this.fixActions.push({
                        type: 'rule-match-missing',
                        description: '添加MATCH兜底规则',
                        action: 'addMatchRule',
                        data: { rules: config.rules },
                        severity: 'medium'
                    });
                }
            }
            
            if (issue.type === 'info' && issue.message.includes('未被任何规则使用')) {
                this.fixActions.push({
                    type: 'unused-proxy-group',
                    description: '处理未使用的代理组',
                    action: 'handleUnusedProxyGroup',
                    data: issue.group,
                    severity: 'low'
                });
            }
        });
    }

    /**
     * 分析规则提供商问题
     * @param {Array} issues - 规则提供商问题列表
     * @param {Object} config - 当前配置
     */
    analyzeRuleProviderIssues(issues, config) {
        issues.forEach(issue => {
            if (issue.type === 'error') {
                if (issue.message.includes('缺少URL')) {
                    this.fixActions.push({
                        type: 'rule-provider-url',
                        description: '为规则提供商添加URL',
                        action: 'addRuleProviderUrl',
                        data: issue.provider,
                        severity: 'high'
                    });
                }
                
                if (issue.message.includes('URL格式不正确')) {
                    this.fixActions.push({
                        type: 'rule-provider-url-format',
                        description: '修复规则提供商URL格式',
                        action: 'fixRuleProviderUrl',
                        data: issue.provider,
                        severity: 'high'
                    });
                }
            }
        });
    }

    /**
     * 执行自动修复
     * @param {Array} selectedFixes - 选中的修复项
     * @param {Object} config - 当前配置
     * @returns {Object} 修复后的配置
     */
    applyFixes(selectedFixes, config) {
        let fixedConfig = JSON.parse(JSON.stringify(config)); // 深拷贝
        const results = [];

        selectedFixes.forEach(fix => {
            try {
                switch (fix.action) {
                    case 'addProxyGroupName':
                        fixedConfig = this.addProxyGroupName(fixedConfig, fix.data);
                        results.push({ success: true, message: `已为代理组添加名称` });
                        break;
                        
                    case 'addProxyGroupType':
                        fixedConfig = this.addProxyGroupType(fixedConfig, fix.data);
                        results.push({ success: true, message: `已为代理组设置类型` });
                        break;
                        
                    case 'fixRuleTarget':
                        fixedConfig = this.fixRuleTarget(fixedConfig, fix.data);
                        results.push({ success: true, message: `已修复规则目标: ${fix.data.rule}` });
                        break;
                        
                    case 'addMatchRule':
                        fixedConfig = this.addMatchRule(fixedConfig);
                        results.push({ success: true, message: `已添加MATCH兜底规则` });
                        break;
                        
                    case 'addRuleProviderUrl':
                        fixedConfig = this.addRuleProviderUrl(fixedConfig, fix.data);
                        results.push({ success: true, message: `已为规则提供商添加URL` });
                        break;
                        
                    default:
                        results.push({ success: false, message: `未知的修复操作: ${fix.action}` });
                }
            } catch (error) {
                results.push({ success: false, message: `修复失败: ${error.message}` });
            }
        });

        return { config: fixedConfig, results };
    }

    /**
     * 为代理组添加名称
     */
    addProxyGroupName(config, group) {
        const groups = config['proxy-groups'] || [];
        const index = groups.findIndex(g => g === group);
        if (index > -1) {
            groups[index].name = `ProxyGroup${index + 1}`;
        }
        return config;
    }

    /**
     * 为代理组设置类型
     */
    addProxyGroupType(config, group) {
        const groups = config['proxy-groups'] || [];
        const index = groups.findIndex(g => g === group);
        if (index > -1) {
            groups[index].type = 'select'; // 默认类型
        }
        return config;
    }

    /**
     * 修复规则目标
     */
    fixRuleTarget(config, data) {
        const { rule, config: currentConfig } = data;
        const rules = config.rules || [];
        const groups = currentConfig['proxy-groups'] || [];
        const groupNames = groups.map(g => g.name);
        
        const ruleIndex = rules.indexOf(rule);
        if (ruleIndex > -1) {
            const parts = rule.split(',');
            if (parts.length >= 3) {
                const ruleType = parts[0];
                const ruleContent = parts[1];
                const oldTarget = parts[2];
                
                // 尝试找到最相似的代理组名称
                let newTarget = this.findSimilarProxyGroup(oldTarget, groupNames);
                if (!newTarget) {
                    newTarget = 'Proxy'; // 默认目标
                }
                
                rules[ruleIndex] = `${ruleType},${ruleContent},${newTarget}`;
            }
        }
        
        return config;
    }

    /**
     * 添加MATCH规则
     */
    addMatchRule(config) {
        const rules = config.rules || [];
        
        // 检查是否已有MATCH规则
        const hasMatch = rules.some(rule => rule.startsWith('MATCH,'));
        
        if (!hasMatch) {
            rules.push('MATCH,Final');
        }
        
        return config;
    }

    /**
     * 为规则提供商添加URL
     */
    addRuleProviderUrl(config, provider) {
        // 这里需要根据提供商名称生成合适的URL
        // 实际实现中应该有一个URL映射表
        return config;
    }

    /**
     * 查找相似的代理组名称
     */
    findSimilarProxyGroup(target, groupNames) {
        const targetLower = target.toLowerCase();
        
        // 精确匹配
        const exactMatch = groupNames.find(name => name.toLowerCase() === targetLower);
        if (exactMatch) return exactMatch;
        
        // 部分匹配
        const partialMatch = groupNames.find(name => 
            name.toLowerCase().includes(targetLower) || 
            targetLower.includes(name.toLowerCase())
        );
        if (partialMatch) return partialMatch;
        
        // 常见映射
        const mappings = {
            'youtube': 'YouTube',
            'netflix': 'NETFLIX',
            'ai': 'AI',
            'proxy': 'Proxy',
            'direct': 'DIRECT',
            'reject': 'REJECT'
        };
        
        return mappings[targetLower] || null;
    }
}
