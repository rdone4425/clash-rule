# 🚀 快速部署指南

## 方法一：Vercel（推荐，最简单）

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **一键部署**
   ```bash
   vercel
   ```

3. **完成！** 
   - 访问提供的URL即可使用
   - 支持自定义域名

---

## 方法二：GitHub Pages（免费托管）

### 🔑 第一步：创建Access Token

1. 访问 [GitHub Settings](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置名称：`GitHub Pages Deploy`
4. 勾选权限：`repo` (完整仓库权限)
5. 生成并复制token

### 📁 第二步：设置仓库

1. **创建GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/clash-config-manager.git
   git push -u origin main
   ```

2. **添加Secret**
   - 进入仓库 Settings → Secrets and variables → Actions
   - 新建secret：
     - Name: `ACCESS_TOKEN`
     - Value: 粘贴刚才的token

3. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "gh-pages"

### ✅ 第三步：自动部署

推送代码后，GitHub Actions会自动：
1. 检测到代码变更
2. 运行部署工作流
3. 发布到 `https://yourusername.github.io/clash-config-manager`

---

## 方法三：Netlify（拖拽部署）

1. 访问 [netlify.com](https://netlify.com)
2. 将整个项目文件夹拖拽到部署区域
3. 等待部署完成
4. 获得访问链接

---

## 🔧 故障排除

**GitHub Pages部署失败？**
- 检查ACCESS_TOKEN是否正确设置
- 确认token有repo权限
- 查看Actions页面的错误日志

**页面显示空白？**
- 检查浏览器控制台错误
- 确认所有文件都已上传
- 尝试硬刷新（Ctrl+F5）

**规则加载失败？**
- 检查网络连接
- 确认防火墙没有阻止GitHub访问

---

## 📱 部署后测试

访问部署的网站，测试以下功能：
- ✅ 页面正常加载
- ✅ 添加代理组
- ✅ 添加规则
- ✅ 规则库浏览
- ✅ 配置验证
- ✅ 导出配置

---

## 🎯 推荐配置

**生产环境建议：**
- 使用Vercel或GitHub Pages
- 启用自定义域名
- 配置HTTPS（自动提供）
- 定期备份配置

**开发环境：**
```bash
# 本地运行
python -m http.server 8080
# 或
npx serve .
```

选择最适合的方法，几分钟内完成部署！🎉
