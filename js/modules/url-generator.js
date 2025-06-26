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

        // 创建Blob URL（仅用于下载）
        const blob = new Blob([yamlConfig], { type: 'text/yaml' });
        const blobUrl = URL.createObjectURL(blob);

        // 创建Data URL（可以被客户端访问）
        const dataUrl = `data:text/yaml;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(yamlConfig)))}`;

        // 生成客户端链接（使用Data URL）
        const clientLinks = {};
        Object.entries(this.clientUrls).forEach(([name, prefix]) => {
            clientLinks[name] = prefix + encodeURIComponent(dataUrl);
        });

        return {
            success: true,
            subscriptionUrl: dataUrl,
            blobUrl: blobUrl, // 仅用于下载
            clientLinks: clientLinks,
            downloadLink: {
                url: blobUrl,
                filename: filename
            },
            yamlContent: yamlConfig,
            note: 'Data URL可以被Clash客户端直接访问'
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

        // 添加示例代理节点说明
        yaml += '# 代理节点配置\n';
        yaml += '# 请在此处添加您的实际代理节点\n';
        yaml += 'proxies:\n';
        yaml += '  # 示例节点 - 请替换为您的实际节点信息\n';
        yaml += '  # - name: "示例节点1"\n';
        yaml += '  #   type: ss\n';
        yaml += '  #   server: example.com\n';
        yaml += '  #   port: 443\n';
        yaml += '  #   cipher: aes-256-gcm\n';
        yaml += '  #   password: "your-password"\n';
        yaml += '\n';

        // 代理组
        if (config['proxy-groups'] && config['proxy-groups'].length > 0) {
            yaml += 'proxy-groups:\n';
            config['proxy-groups'].forEach(group => {
                yaml += `  - name: ${group.name}\n`;
                yaml += `    type: ${group.type}\n`;

                // 添加URL测试配置
                if (group.type === 'url-test') {
                    yaml += `    url: http://www.gstatic.com/generate_204\n`;
                    yaml += `    interval: 300\n`;
                }

                if (group.proxies && group.proxies.length > 0) {
                    yaml += `    proxies:\n`;
                    group.proxies.forEach(proxy => {
                        yaml += `      - ${proxy}\n`;
                    });
                } else {
                    // 为空的代理组添加注释说明
                    yaml += `    proxies:\n`;
                    yaml += `      # 请在此处添加代理节点名称\n`;
                    yaml += `      # - "节点名称1"\n`;
                    yaml += `      # - "节点名称2"\n`;
                }
                yaml += '\n';
            });
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

        // 规则
        if (config.rules && config.rules.length > 0) {
            yaml += 'rules:\n';
            config.rules.forEach(rule => {
                yaml += `  - ${rule}\n`;
            });
            yaml += '\n';
        }

        return yaml;
    }
}
