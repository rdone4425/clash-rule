# 🚀 部署指南

这个Clash配置管理工具是一个纯前端应用，可以部署在多个平台上。

## 📋 部署前准备

1. **确保所有文件完整**
   ```
   clash-config-manager/
   ├── index.html
   ├── js/
   ├── styles/
   ├── README.md
   ├── package.json
   ├── vercel.json
   ├── netlify.toml
   └── .github/workflows/deploy.yml
   ```

2. **本地测试**
   ```bash
   # 方法1: 使用Python
   python -m http.server 8080
   
   # 方法2: 使用Node.js serve
   npx serve .
   
   # 访问 http://localhost:8080
   ```

## 🌐 部署选项

### 1. GitHub Pages（推荐 - 免费）

**步骤：**
1. 创建GitHub仓库
2. 推送代码到仓库
3. 启用GitHub Pages

```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit: Clash Config Manager"

# 添加远程仓库
git remote add origin https://github.com/yourusername/clash-config-manager.git
git push -u origin main

# GitHub会自动运行部署工作流
```

**配置GitHub Pages：**

**第一步：创建Personal Access Token**
1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 设置Token名称：`GitHub Pages Deploy`
4. 选择权限：勾选 `repo` (完整仓库权限)
5. 点击 "Generate token" 并复制生成的token

**第二步：添加Repository Secret**
1. 进入仓库设置页面 → Secrets and variables → Actions
2. 点击 "New repository secret"
3. Name: `ACCESS_TOKEN`
4. Secret: 粘贴刚才复制的Personal Access Token
5. 点击 "Add secret"

**第三步：配置GitHub Pages**
1. 进入仓库设置页面
2. 找到 "Pages" 选项
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "gh-pages"
5. 推送代码后，GitHub Actions会自动部署

**访问地址：** `https://yourusername.github.io/clash-config-manager`

### 2. Vercel（推荐 - 免费）

**方法1: CLI部署**
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

**方法2: 网页部署**
1. 访问 [vercel.com](https://vercel.com)
2. 连接GitHub账户
3. 导入仓库
4. 自动部署

**访问地址：** `https://your-project.vercel.app`

### 3. Netlify（免费）

**方法1: 拖拽部署**
1. 访问 [netlify.com](https://netlify.com)
2. 将项目文件夹拖拽到部署区域
3. 等待部署完成

**方法2: Git集成**
1. 连接GitHub账户
2. 选择仓库
3. 配置构建设置（使用默认即可）
4. 部署

**访问地址：** `https://random-name.netlify.app`

### 4. Cloudflare Pages（免费）

1. 访问 [pages.cloudflare.com](https://pages.cloudflare.com)
2. 连接GitHub账户
3. 选择仓库
4. 构建设置：
   - Build command: `echo "No build required"`
   - Build output directory: `/`
5. 部署

### 5. 自托管服务器

**使用Nginx：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/clash-config-manager;
    index index.html;
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

**使用Apache：**
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/clash-config-manager
    
    <Directory /var/www/clash-config-manager>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA路由支持
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## 🔧 自定义域名

### GitHub Pages
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名：`your-domain.com`
3. 在域名DNS设置中添加CNAME记录指向 `yourusername.github.io`

### Vercel/Netlify
1. 在平台控制台添加自定义域名
2. 按照提示配置DNS记录
3. 等待SSL证书自动配置

## 🛡️ 安全考虑

1. **HTTPS强制**
   - 所有推荐的平台都自动提供HTTPS
   - 自托管时使用Let's Encrypt

2. **内容安全策略**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

3. **跨域资源共享**
   - 规则提供商URL需要支持CORS
   - 或使用代理服务器

## 📊 性能优化

1. **启用压缩**
   - Gzip/Brotli压缩
   - 所有推荐平台自动启用

2. **缓存策略**
   - 静态资源长期缓存
   - HTML文件短期缓存

3. **CDN加速**
   - Vercel/Netlify/Cloudflare自带全球CDN
   - 自托管可使用Cloudflare

## 🔍 监控和分析

1. **Google Analytics**
   ```html
   <!-- 在index.html中添加 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
   ```

2. **错误监控**
   - 使用Sentry等服务监控JavaScript错误

3. **性能监控**
   - 使用Web Vitals监控页面性能

## 🚨 故障排除

**常见问题：**

1. **页面空白**
   - 检查浏览器控制台错误
   - 确认所有文件路径正确

2. **规则加载失败**
   - 检查网络连接
   - 确认规则提供商URL可访问

3. **配置导出失败**
   - 检查浏览器是否阻止下载
   - 尝试不同浏览器

**调试技巧：**
```javascript
// 在浏览器控制台中检查
console.log('App loaded:', window.ClashConfigApp);
console.log('Current config:', app.currentConfig);
```

## 📞 技术支持

如果遇到部署问题，可以：
1. 检查浏览器控制台错误信息
2. 查看平台部署日志
3. 参考各平台官方文档
4. 在GitHub仓库提交Issue

---

选择最适合您需求的部署方案，开始使用这个强大的Clash配置管理工具吧！ 🎉
