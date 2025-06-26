// 配置验证管理器
export class ConfigValidator {
    constructor() {
        this.validationResults = {
            rules: [],
            proxyGroups: [],
            ruleProviders: [],
            overall: true
        };
    }

    /**
     * 验证完整配置
     * @param {Object} config - 配置对象
     * @returns {Object} 验证结果
     */
    validateConfig(config) {
        this.validationResults = {
            rules: [],
            proxyGroups: [],
            ruleProviders: [],
            overall: true
        };

        // 1. 验证代理组配置
        this.validateProxyGroups(config['proxy-groups'] || []);

        // 2. 验证规则配置
        this.validateRules(config.rules || [], config['proxy-groups'] || []);

        // 3. 验证规则提供商
        this.validateRuleProviders(config['rule-providers'] || {});

        // 4. 验证规则与代理组的匹配
        this.validateRuleGroupMatching(config.rules || [], config['proxy-groups'] || []);

        // 5. 验证规则优先级
        this.validateRulePriority(config.rules || []);

        return this.validationResults;
    }

    /**
     * 验证代理组配置
     * @param {Array} proxyGroups - 代理组数组
     */
    validateProxyGroups(proxyGroups) {
        const groupNames = new Set();
        const issues = [];

        proxyGroups.forEach((group, index) => {
            // 检查必需字段
            if (!group.name) {
                issues.push({
                    type: 'error',
                    message: `代理组 #${index + 1}: 缺少名称`,
                    group: group,
                    suggestion: '请为代理组设置名称'
                });
            }

            if (!group.type) {
                issues.push({
                    type: 'error',
                    message: `代理组 "${group.name}": 缺少类型`,
                    group: group,
                    suggestion: '请设置代理组类型 (select, url-test, fallback, load-balance)'
                });
            }

            // 检查名称重复
            if (groupNames.has(group.name)) {
                issues.push({
                    type: 'error',
                    message: `代理组名称重复: "${group.name}"`,
                    group: group,
                    suggestion: '请使用唯一的代理组名称'
                });
            } else {
                groupNames.add(group.name);
            }

            // 检查代理组类型特定配置
            if (group.type === 'select' && (!group.proxies || group.proxies.length === 0)) {
                issues.push({
                    type: 'warning',
                    message: `代理组 "${group.name}": select类型应该包含代理列表`,
                    group: group,
                    suggestion: '请添加代理组或节点到proxies列表'
                });
            }

            if (['url-test', 'fallback'].includes(group.type) && !group.interval) {
                issues.push({
                    type: 'warning',
                    message: `代理组 "${group.name}": ${group.type}类型建议设置测试间隔`,
                    group: group,
                    suggestion: '建议设置interval字段 (如: 300秒)'
                });
            }

            if (group.type === 'load-balance' && !group.strategy) {
                issues.push({
                    type: 'warning',
                    message: `代理组 "${group.name}": load-balance类型建议设置负载均衡策略`,
                    group: group,
                    suggestion: '建议设置strategy字段 (consistent-hashing 或 round-robin)'
                });
            }

            // 检查地区代理组的过滤器
            if (group.category === 'region' && !group.filter) {
                issues.push({
                    type: 'warning',
                    message: `地区代理组 "${group.name}": 缺少节点过滤器`,
                    group: group,
                    suggestion: '建议设置filter字段来筛选对应地区的节点'
                });
            }
        });

        this.validationResults.proxyGroups = issues;
        if (issues.some(issue => issue.type === 'error')) {
            this.validationResults.overall = false;
        }
    }

    /**
     * 验证规则配置
     * @param {Array} rules - 规则数组
     * @param {Array} proxyGroups - 代理组数组
     */
    validateRules(rules, proxyGroups) {
        const issues = [];
        const validRuleTypes = ['RULE-SET', 'DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'IP-CIDR', 'GEOIP', 'MATCH', 'PROCESS-NAME'];

        rules.forEach((rule, index) => {
            if (typeof rule !== 'string') {
                issues.push({
                    type: 'error',
                    message: `规则 #${index + 1}: 规则必须是字符串`,
                    rule: rule,
                    suggestion: '请检查规则格式'
                });
                return;
            }

            const parts = rule.split(',');
            if (parts.length < 2) {
                issues.push({
                    type: 'error',
                    message: `规则 #${index + 1}: 规则格式不正确 "${rule}"`,
                    rule: rule,
                    suggestion: '规则格式应为: TYPE,CONTENT,TARGET'
                });
                return;
            }

            const ruleType = parts[0].trim();
            const ruleContent = parts[1]?.trim();
            const ruleTarget = parts[2]?.trim();

            // 检查规则类型
            if (!validRuleTypes.includes(ruleType)) {
                issues.push({
                    type: 'error',
                    message: `规则 #${index + 1}: 不支持的规则类型 "${ruleType}"`,
                    rule: rule,
                    suggestion: `支持的类型: ${validRuleTypes.join(', ')}`
                });
            }

            // 检查规则内容
            if (!ruleContent) {
                issues.push({
                    type: 'error',
                    message: `规则 #${index + 1}: 规则内容不能为空`,
                    rule: rule,
                    suggestion: '请提供有效的规则内容'
                });
            }

            // 检查规则目标
            if (!ruleTarget) {
                issues.push({
                    type: 'error',
                    message: `规则 #${index + 1}: 规则目标不能为空`,
                    rule: rule,
                    suggestion: '请指定目标代理组'
                });
            }
        });

        this.validationResults.rules = issues;
        if (issues.some(issue => issue.type === 'error')) {
            this.validationResults.overall = false;
        }
    }

    /**
     * 验证规则提供商
     * @param {Object} ruleProviders - 规则提供商对象
     */
    validateRuleProviders(ruleProviders) {
        const issues = [];

        Object.entries(ruleProviders).forEach(([name, provider]) => {
            // 检查必需字段
            if (!provider.url) {
                issues.push({
                    type: 'error',
                    message: `规则提供商 "${name}": 缺少URL`,
                    provider: provider,
                    suggestion: '请设置有效的规则文件URL'
                });
            }

            // 检查URL格式
            if (provider.url) {
                try {
                    new URL(provider.url);
                } catch {
                    issues.push({
                        type: 'error',
                        message: `规则提供商 "${name}": URL格式不正确`,
                        provider: provider,
                        suggestion: '请提供有效的HTTP/HTTPS URL'
                    });
                }
            }

            // 检查行为类型
            if (provider.behavior && !['classical', 'domain', 'ipcidr'].includes(provider.behavior)) {
                issues.push({
                    type: 'warning',
                    message: `规则提供商 "${name}": 不常见的behavior值 "${provider.behavior}"`,
                    provider: provider,
                    suggestion: '常用值: classical, domain, ipcidr'
                });
            }

            // 检查格式
            if (provider.format && !['text', 'yaml'].includes(provider.format)) {
                issues.push({
                    type: 'warning',
                    message: `规则提供商 "${name}": 不常见的format值 "${provider.format}"`,
                    provider: provider,
                    suggestion: '常用值: text, yaml'
                });
            }

            // 检查更新间隔
            if (provider.interval && (provider.interval < 60 || provider.interval > 86400 * 7)) {
                issues.push({
                    type: 'warning',
                    message: `规则提供商 "${name}": 更新间隔不合理 (${provider.interval}秒)`,
                    provider: provider,
                    suggestion: '建议设置在60秒到7天之间'
                });
            }
        });

        this.validationResults.ruleProviders = issues;
        if (issues.some(issue => issue.type === 'error')) {
            this.validationResults.overall = false;
        }
    }

    /**
     * 验证规则与代理组的匹配
     * @param {Array} rules - 规则数组
     * @param {Array} proxyGroups - 代理组数组
     */
    validateRuleGroupMatching(rules, proxyGroups) {
        const issues = [];
        const groupNames = new Set(proxyGroups.map(g => g.name));
        const builtinTargets = new Set(['DIRECT', 'REJECT', 'PASS']);

        rules.forEach((rule, index) => {
            const parts = rule.split(',');
            if (parts.length >= 3) {
                const ruleTarget = parts[2].trim();
                
                if (!builtinTargets.has(ruleTarget) && !groupNames.has(ruleTarget)) {
                    issues.push({
                        type: 'error',
                        message: `规则 #${index + 1}: 目标代理组 "${ruleTarget}" 不存在`,
                        rule: rule,
                        suggestion: `请创建代理组 "${ruleTarget}" 或修改规则目标`
                    });
                }
            }
        });

        // 检查未使用的代理组
        const usedGroups = new Set();
        rules.forEach(rule => {
            const parts = rule.split(',');
            if (parts.length >= 3) {
                usedGroups.add(parts[2].trim());
            }
        });

        proxyGroups.forEach(group => {
            if (!usedGroups.has(group.name) && group.category === 'application') {
                issues.push({
                    type: 'info',
                    message: `代理组 "${group.name}" 未被任何规则使用`,
                    group: group,
                    suggestion: '考虑添加相应的分流规则或删除此代理组'
                });
            }
        });

        this.validationResults.rules.push(...issues);
        if (issues.some(issue => issue.type === 'error')) {
            this.validationResults.overall = false;
        }
    }

    /**
     * 验证规则优先级
     * @param {Array} rules - 规则数组
     */
    validateRulePriority(rules) {
        const issues = [];
        let hasMatch = false;
        let matchIndex = -1;

        rules.forEach((rule, index) => {
            const ruleType = rule.split(',')[0];
            
            // 检查MATCH规则位置
            if (ruleType === 'MATCH') {
                if (hasMatch) {
                    issues.push({
                        type: 'warning',
                        message: `规则 #${index + 1}: 发现多个MATCH规则`,
                        rule: rule,
                        suggestion: 'MATCH规则应该只有一个，且位于规则列表末尾'
                    });
                } else {
                    hasMatch = true;
                    matchIndex = index;
                }
            }

            // 检查MATCH规则后是否还有其他规则
            if (hasMatch && matchIndex !== -1 && index > matchIndex) {
                issues.push({
                    type: 'warning',
                    message: `规则 #${index + 1}: MATCH规则后不应该有其他规则`,
                    rule: rule,
                    suggestion: 'MATCH规则应该位于规则列表的最后'
                });
            }
        });

        // 检查是否缺少MATCH规则
        if (!hasMatch) {
            issues.push({
                type: 'warning',
                message: '缺少MATCH规则',
                suggestion: '建议在规则列表末尾添加 "MATCH,Final" 作为兜底规则'
            });
        }

        this.validationResults.rules.push(...issues);
    }

    /**
     * 生成验证报告
     * @returns {string} 验证报告
     */
    generateReport() {
        let report = '# 配置验证报告\n\n';
        
        if (this.validationResults.overall) {
            report += '✅ **配置验证通过**\n\n';
        } else {
            report += '❌ **配置验证失败，发现严重问题**\n\n';
        }

        // 代理组问题
        if (this.validationResults.proxyGroups.length > 0) {
            report += '## 代理组问题\n';
            this.validationResults.proxyGroups.forEach(issue => {
                const icon = issue.type === 'error' ? '❌' : '⚠️';
                report += `${icon} ${issue.message}\n`;
                if (issue.suggestion) {
                    report += `   💡 ${issue.suggestion}\n`;
                }
                report += '\n';
            });
        }

        // 规则问题
        if (this.validationResults.rules.length > 0) {
            report += '## 规则问题\n';
            this.validationResults.rules.forEach(issue => {
                const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
                report += `${icon} ${issue.message}\n`;
                if (issue.suggestion) {
                    report += `   💡 ${issue.suggestion}\n`;
                }
                report += '\n';
            });
        }

        // 规则提供商问题
        if (this.validationResults.ruleProviders.length > 0) {
            report += '## 规则提供商问题\n';
            this.validationResults.ruleProviders.forEach(issue => {
                const icon = issue.type === 'error' ? '❌' : '⚠️';
                report += `${icon} ${issue.message}\n`;
                if (issue.suggestion) {
                    report += `   💡 ${issue.suggestion}\n`;
                }
                report += '\n';
            });
        }

        if (this.validationResults.overall && 
            this.validationResults.proxyGroups.length === 0 && 
            this.validationResults.rules.length === 0 && 
            this.validationResults.ruleProviders.length === 0) {
            report += '🎉 **恭喜！配置完全正确，没有发现任何问题。**\n';
        }

        return report;
    }
}
