// 验证管理器
export class ValidationManager {
    constructor() {
        this.validationRules = this.initValidationRules();
    }

    /**
     * 初始化验证规则
     * @returns {Object} 验证规则对象
     */
    initValidationRules() {
        return {
            // 通用设置验证
            general: {
                mode: {
                    required: true,
                    type: 'string',
                    enum: ['rule', 'global', 'direct'],
                    message: '运行模式必须是 rule、global 或 direct'
                },
                'log-level': {
                    required: true,
                    type: 'string',
                    enum: ['info', 'warning', 'error', 'debug', 'silent'],
                    message: '日志级别必须是有效值'
                },
                port: {
                    required: false,
                    type: 'number',
                    min: 1,
                    max: 65535,
                    message: 'HTTP端口必须在1-65535之间'
                },
                'socks-port': {
                    required: false,
                    type: 'number',
                    min: 1,
                    max: 65535,
                    message: 'SOCKS端口必须在1-65535之间'
                }
            },

            // DNS配置验证
            dns: {
                'default-nameserver': {
                    required: false,
                    type: 'array',
                    itemType: 'string',
                    message: '默认DNS服务器必须是字符串数组'
                },
                nameserver: {
                    required: false,
                    type: 'array',
                    itemType: 'string',
                    message: 'DNS服务器必须是字符串数组'
                },
                'fake-ip-filter': {
                    required: false,
                    type: 'array',
                    itemType: 'string',
                    message: 'Fake-IP过滤器必须是字符串数组'
                }
            },

            // 代理提供商验证
            'proxy-providers': {
                url: {
                    required: true,
                    type: 'string',
                    format: 'url',
                    message: '订阅链接必须是有效的URL'
                },
                interval: {
                    required: false,
                    type: 'number',
                    min: 60,
                    message: '更新间隔必须大于等于60秒'
                },
                'benchmark-url': {
                    required: false,
                    type: 'string',
                    format: 'url',
                    message: '测试URL必须是有效的URL'
                },
                'benchmark-timeout': {
                    required: false,
                    type: 'number',
                    min: 1,
                    max: 30,
                    message: '测试超时必须在1-30秒之间'
                }
            },

            // 代理组验证
            'proxy-groups': {
                name: {
                    required: true,
                    type: 'string',
                    minLength: 1,
                    message: '代理组名称不能为空'
                },
                type: {
                    required: true,
                    type: 'string',
                    enum: ['select', 'url-test', 'fallback', 'load-balance'],
                    message: '代理组类型必须是有效值'
                },
                proxies: {
                    required: false,
                    type: 'array',
                    itemType: 'string',
                    message: '代理列表必须是字符串数组'
                },
                use: {
                    required: false,
                    type: 'array',
                    itemType: 'string',
                    message: '使用的提供商必须是字符串数组'
                },
                filter: {
                    required: false,
                    type: 'string',
                    format: 'regex',
                    message: '过滤器必须是有效的正则表达式'
                },
                interval: {
                    required: false,
                    type: 'number',
                    min: 60,
                    message: '测试间隔必须大于等于60秒'
                },
                strategy: {
                    required: false,
                    type: 'string',
                    enum: ['consistent-hashing', 'round-robin'],
                    message: '负载均衡策略必须是有效值'
                }
            }
        };
    }

    /**
     * 验证完整配置
     * @param {Object} config - 配置对象
     * @returns {Promise<boolean>} 验证结果
     */
    async validateConfig(config) {
        try {
            const errors = [];

            // 验证通用设置
            if (config) {
                const generalErrors = this.validateSection(config, this.validationRules.general);
                errors.push(...generalErrors);
            }

            // 验证DNS配置
            if (config.dns) {
                const dnsErrors = this.validateSection(config.dns, this.validationRules.dns);
                errors.push(...dnsErrors);
            }

            // 验证代理提供商
            if (config['proxy-providers']) {
                const providerErrors = this.validateProviders(config['proxy-providers']);
                errors.push(...providerErrors);
            }

            // 验证代理组
            if (config['proxy-groups']) {
                const groupErrors = this.validateProxyGroups(config['proxy-groups']);
                errors.push(...groupErrors);
            }

            // 验证规则
            if (config.rules) {
                const ruleErrors = this.validateRules(config.rules);
                errors.push(...ruleErrors);
            }

            // 验证端口冲突
            const portErrors = this.validatePortConflicts(config);
            errors.push(...portErrors);

            if (errors.length > 0) {
                console.warn('配置验证发现问题:', errors);
                this.showValidationErrors(errors);
                return false;
            }

            return true;
        } catch (error) {
            console.error('配置验证失败:', error);
            throw new Error('配置验证失败: ' + error.message);
        }
    }

    /**
     * 验证配置节
     * @param {Object} section - 配置节
     * @param {Object} rules - 验证规则
     * @returns {Array} 错误列表
     */
    validateSection(section, rules) {
        const errors = [];

        Object.entries(rules).forEach(([key, rule]) => {
            const value = section[key];
            const error = this.validateField(key, value, rule);
            if (error) {
                errors.push(error);
            }
        });

        return errors;
    }

    /**
     * 验证字段
     * @param {string} fieldName - 字段名
     * @param {any} value - 字段值
     * @param {Object} rule - 验证规则
     * @returns {string|null} 错误信息或null
     */
    validateField(fieldName, value, rule) {
        // 必填验证
        if (rule.required && (value === undefined || value === null || value === '')) {
            return `${fieldName}: 字段是必填的`;
        }

        // 如果值为空且非必填，跳过其他验证
        if (value === undefined || value === null || value === '') {
            return null;
        }

        // 类型验证
        if (rule.type && !this.validateType(value, rule.type)) {
            return `${fieldName}: ${rule.message || '类型不正确'}`;
        }

        // 枚举验证
        if (rule.enum && !rule.enum.includes(value)) {
            return `${fieldName}: 值必须是 ${rule.enum.join(', ')} 中的一个`;
        }

        // 数值范围验证
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                return `${fieldName}: 值不能小于 ${rule.min}`;
            }
            if (rule.max !== undefined && value > rule.max) {
                return `${fieldName}: 值不能大于 ${rule.max}`;
            }
        }

        // 字符串长度验证
        if (rule.type === 'string') {
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                return `${fieldName}: 长度不能小于 ${rule.minLength}`;
            }
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                return `${fieldName}: 长度不能大于 ${rule.maxLength}`;
            }
        }

        // 格式验证
        if (rule.format) {
            const formatError = this.validateFormat(value, rule.format);
            if (formatError) {
                return `${fieldName}: ${formatError}`;
            }
        }

        // 数组项类型验证
        if (rule.type === 'array' && rule.itemType) {
            for (let i = 0; i < value.length; i++) {
                if (!this.validateType(value[i], rule.itemType)) {
                    return `${fieldName}[${i}]: 数组项类型不正确`;
                }
            }
        }

        return null;
    }

    /**
     * 验证类型
     * @param {any} value - 值
     * @param {string} type - 期望类型
     * @returns {boolean} 验证结果
     */
    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return true;
        }
    }

    /**
     * 验证格式
     * @param {string} value - 值
     * @param {string} format - 格式类型
     * @returns {string|null} 错误信息或null
     */
    validateFormat(value, format) {
        switch (format) {
            case 'url':
                try {
                    new URL(value);
                    return null;
                } catch {
                    return 'URL格式不正确';
                }
            case 'regex':
                try {
                    new RegExp(value);
                    return null;
                } catch {
                    return '正则表达式格式不正确';
                }
            case 'ip':
                const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
                if (!ipRegex.test(value)) {
                    return 'IP地址格式不正确';
                }
                const parts = value.split('.');
                for (const part of parts) {
                    const num = parseInt(part);
                    if (num < 0 || num > 255) {
                        return 'IP地址格式不正确';
                    }
                }
                return null;
            default:
                return null;
        }
    }

    /**
     * 验证代理提供商
     * @param {Object} providers - 代理提供商对象
     * @returns {Array} 错误列表
     */
    validateProviders(providers) {
        const errors = [];
        const rules = this.validationRules['proxy-providers'];

        Object.entries(providers).forEach(([name, provider]) => {
            Object.entries(rules).forEach(([key, rule]) => {
                const error = this.validateField(`proxy-providers.${name}.${key}`, provider[key], rule);
                if (error) {
                    errors.push(error);
                }
            });
        });

        return errors;
    }

    /**
     * 验证代理组
     * @param {Array} groups - 代理组数组
     * @returns {Array} 错误列表
     */
    validateProxyGroups(groups) {
        const errors = [];
        const rules = this.validationRules['proxy-groups'];
        const groupNames = new Set();

        groups.forEach((group, index) => {
            // 检查名称重复
            if (groupNames.has(group.name)) {
                errors.push(`proxy-groups[${index}]: 代理组名称 "${group.name}" 重复`);
            } else {
                groupNames.add(group.name);
            }

            // 验证字段
            Object.entries(rules).forEach(([key, rule]) => {
                const error = this.validateField(`proxy-groups[${index}].${key}`, group[key], rule);
                if (error) {
                    errors.push(error);
                }
            });

            // 验证代理组特定逻辑
            if (group.type === 'url-test' || group.type === 'fallback') {
                if (!group.interval) {
                    errors.push(`proxy-groups[${index}]: ${group.type} 类型的代理组必须设置测试间隔`);
                }
            }

            if (group.type === 'load-balance' && !group.strategy) {
                errors.push(`proxy-groups[${index}]: load-balance 类型的代理组必须设置负载均衡策略`);
            }
        });

        return errors;
    }

    /**
     * 验证规则
     * @param {Array} rules - 规则数组
     * @returns {Array} 错误列表
     */
    validateRules(rules) {
        const errors = [];

        rules.forEach((rule, index) => {
            if (typeof rule !== 'string') {
                errors.push(`rules[${index}]: 规则必须是字符串`);
                return;
            }

            const parts = rule.split(',');
            if (parts.length < 2) {
                errors.push(`rules[${index}]: 规则格式不正确，至少需要两个部分`);
                return;
            }

            const ruleType = parts[0];
            const validTypes = [
                'RULE-SET', 'DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD',
                'IP-CIDR', 'GEOIP', 'MATCH', 'PROCESS-NAME'
            ];

            if (!validTypes.includes(ruleType)) {
                errors.push(`rules[${index}]: 不支持的规则类型 "${ruleType}"`);
            }
        });

        return errors;
    }

    /**
     * 验证端口冲突
     * @param {Object} config - 配置对象
     * @returns {Array} 错误列表
     */
    validatePortConflicts(config) {
        const errors = [];
        const ports = [];

        if (config.port) {
            ports.push({ port: config.port, type: 'HTTP' });
        }

        if (config['socks-port']) {
            ports.push({ port: config['socks-port'], type: 'SOCKS' });
        }

        // 检查端口重复
        const portNumbers = ports.map(p => p.port);
        const duplicates = portNumbers.filter((port, index) => portNumbers.indexOf(port) !== index);

        if (duplicates.length > 0) {
            errors.push(`端口冲突: ${duplicates.join(', ')} 被多次使用`);
        }

        return errors;
    }

    /**
     * 显示验证错误
     * @param {Array} errors - 错误列表
     */
    showValidationErrors(errors) {
        const errorMessage = '配置验证发现以下问题:\n\n' + errors.join('\n');
        
        // 这里可以使用更好的UI来显示错误
        console.warn(errorMessage);
        
        // 可以触发事件让UI管理器显示错误
        const event = new CustomEvent('validationError', {
            detail: { errors: errors }
        });
        document.dispatchEvent(event);
    }

    /**
     * 验证单个字段
     * @param {string} fieldName - 字段名
     * @param {any} value - 字段值
     * @param {Object} rule - 验证规则
     * @returns {boolean} 验证结果
     */
    validateSingleField(fieldName, value, rule) {
        const error = this.validateField(fieldName, value, rule);
        return error === null;
    }

    /**
     * 获取字段验证规则
     * @param {string} section - 配置节
     * @param {string} field - 字段名
     * @returns {Object|null} 验证规则或null
     */
    getFieldRule(section, field) {
        return this.validationRules[section]?.[field] || null;
    }

    /**
     * 验证URL格式
     * @param {string} url - URL字符串
     * @returns {boolean} 验证结果
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 验证正则表达式
     * @param {string} regex - 正则表达式字符串
     * @returns {boolean} 验证结果
     */
    isValidRegex(regex) {
        try {
            new RegExp(regex);
            return true;
        } catch {
            return false;
        }
    }
}
