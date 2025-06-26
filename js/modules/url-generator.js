// 简化的URL生成服务
export class URLGenerator {
    constructor() {
        // 只保留最常用的客户端
        this.clientUrls = {
            'Clash': 'clash://install-config?url=',
            'ClashX': 'clashx://install-config?url=',
            'Clash for Android': 'clash://install-config?url='
        };
    }

    /**
     * 生成配置URL（简化版）
     * @param {Object} config - 配置对象
     * @returns {Object} 生成结果
     */
    generateConfigURL(config) {
        const yamlConfig = this.convertToYAML(config);
        const filename = `clash-config-${Date.now()}.yaml`;
        
        // 创建Blob URL
        const blob = new Blob([yamlConfig], { type: 'text/yaml' });
        const blobUrl = URL.createObjectURL(blob);
        
        // 生成客户端链接
        const clientLinks = {};
        Object.entries(this.clientUrls).forEach(([name, prefix]) => {
            clientLinks[name] = prefix + encodeURIComponent(blobUrl);
        });

        return {
            success: true,
            subscriptionUrl: blobUrl,
            clientLinks: clientLinks,
            downloadLink: {
                url: blobUrl,
                filename: filename
            },
            yamlContent: yamlConfig
        };
    }

    /**
     * 转换配置为YAML格式
     * @param {Object} config - 配置对象
     * @returns {string} YAML字符串
     */
    convertToYAML(config) {
        let yaml = '';
        
        // 基础配置
        yaml += `# Clash配置文件\n`;
        yaml += `# 生成时间: ${new Date().toISOString()}\n\n`;
        
        if (config.port) yaml += `port: ${config.port}\n`;
        if (config['socks-port']) yaml += `socks-port: ${config['socks-port']}\n`;
        if (config.mode) yaml += `mode: ${config.mode}\n`;
        if (config['log-level']) yaml += `log-level: ${config['log-level']}\n`;
        
        yaml += '\n';
        
        // 代理组
        if (config['proxy-groups'] && config['proxy-groups'].length > 0) {
            yaml += 'proxy-groups:\n';
            config['proxy-groups'].forEach(group => {
                yaml += `  - name: ${group.name}\n`;
                yaml += `    type: ${group.type}\n`;
                if (group.proxies) {
                    yaml += `    proxies:\n`;
                    group.proxies.forEach(proxy => {
                        yaml += `      - ${proxy}\n`;
                    });
                }
                yaml += '\n';
            });
        }
        
        // 规则
        if (config.rules && config.rules.length > 0) {
            yaml += 'rules:\n';
            config.rules.forEach(rule => {
                yaml += `  - ${rule}\n`;
            });
            yaml += '\n';
        }
        
        // 规则提供商
        if (config['rule-providers'] && Object.keys(config['rule-providers']).length > 0) {
            yaml += 'rule-providers:\n';
            Object.entries(config['rule-providers']).forEach(([name, provider]) => {
                yaml += `  ${name}:\n`;
                yaml += `    behavior: ${provider.behavior}\n`;
                yaml += `    format: ${provider.format}\n`;
                yaml += `    interval: ${provider.interval}\n`;
                yaml += `    url: ${provider.url}\n`;
                yaml += '\n';
            });
        }
        
        return yaml;
    }
}
