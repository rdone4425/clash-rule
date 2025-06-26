// UI管理器
export class UIManager {
    constructor() {
        this.notifications = [];
        this.modals = new Map();
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.bindGlobalEvents();
    }

    /**
     * 创建通知容器
     */
    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // 点击模态框背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
                this.closeModal(e.target);
            }
        });

        // 复制配置按钮
        const copyBtn = document.getElementById('copyConfigBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyPreviewContent();
            });
        }

        // 下载配置按钮
        const downloadBtn = document.getElementById('downloadConfigBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadPreviewContent();
            });
        }
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 ('success', 'error', 'warning', 'info')
     * @param {number} duration - 显示时长（毫秒）
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // 添加图标
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `${icon} ${message}`;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);

        // 点击关闭
        notification.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        this.notifications.push(notification);
    }

    /**
     * 隐藏通知
     * @param {HTMLElement} notification - 通知元素
     */
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * 获取通知颜色
     * @param {string} type - 通知类型
     * @returns {string} 颜色值
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * 获取通知图标
     * @param {string} type - 通知类型
     * @returns {string} 图标HTML
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * 显示模态框
     * @param {string} modalId - 模态框ID
     * @param {Object} options - 选项
     */
    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`模态框 ${modalId} 不存在`);
            return;
        }

        // 设置模态框内容
        if (options.title) {
            const titleElement = modal.querySelector('.modal-header h3');
            if (titleElement) {
                titleElement.textContent = options.title;
            }
        }

        if (options.content) {
            const bodyElement = modal.querySelector('.modal-body');
            if (bodyElement) {
                bodyElement.innerHTML = options.content;
            }
        }

        // 显示模态框
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 记录模态框
        this.modals.set(modalId, {
            element: modal,
            options: options
        });

        // 聚焦到第一个输入框
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    /**
     * 关闭模态框
     * @param {HTMLElement|string} modal - 模态框元素或ID
     */
    closeModal(modal) {
        let modalElement;
        let modalId;

        if (typeof modal === 'string') {
            modalId = modal;
            modalElement = document.getElementById(modal);
        } else {
            modalElement = modal;
            modalId = modal.id;
        }

        if (!modalElement) return;

        modalElement.classList.remove('active');
        
        // 如果没有其他模态框打开，恢复body滚动
        const activeModals = document.querySelectorAll('.modal.active');
        if (activeModals.length === 0) {
            document.body.style.overflow = '';
        }

        // 清理记录
        this.modals.delete(modalId);

        // 清理表单
        const form = modalElement.querySelector('form');
        if (form) {
            form.reset();
        }
    }

    /**
     * 关闭最顶层的模态框
     */
    closeTopModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            this.closeModal(activeModal);
        }
    }

    /**
     * 显示配置预览
     * @param {string} content - 配置内容
     */
    showPreview(content) {
        const previewContent = document.getElementById('previewContent');
        if (previewContent) {
            previewContent.textContent = content;
        }
        this.showModal('previewModal', {
            title: '配置预览'
        });
    }

    /**
     * 复制预览内容
     */
    async copyPreviewContent() {
        try {
            const content = document.getElementById('previewContent').textContent;
            await navigator.clipboard.writeText(content);
            this.showNotification('配置已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showNotification('复制失败', 'error');
        }
    }

    /**
     * 下载预览内容
     */
    downloadPreviewContent() {
        try {
            const content = document.getElementById('previewContent').textContent;
            const blob = new Blob([content], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clash-config.yaml';
            a.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('配置文件已下载', 'success');
        } catch (error) {
            console.error('下载失败:', error);
            this.showNotification('下载失败', 'error');
        }
    }

    /**
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     */
    showConfirm(message, onConfirm, onCancel) {
        const confirmModal = this.createConfirmModal(message, onConfirm, onCancel);
        document.body.appendChild(confirmModal);
        this.showModal(confirmModal.id);
    }

    /**
     * 创建确认对话框
     * @param {string} message - 确认消息
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     * @returns {HTMLElement} 确认对话框元素
     */
    createConfirmModal(message, onConfirm, onCancel) {
        const modalId = 'confirm-modal-' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>确认操作</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary confirm-btn">确认</button>
                    <button type="button" class="btn btn-secondary cancel-btn">取消</button>
                </div>
            </div>
        `;

        // 绑定事件
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            this.closeModal(modal);
            if (onConfirm) onConfirm();
            document.body.removeChild(modal);
        });

        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeModal(modal);
            if (onCancel) onCancel();
            document.body.removeChild(modal);
        });

        return modal;
    }

    /**
     * 显示加载状态
     * @param {HTMLElement} element - 目标元素
     * @param {boolean} loading - 是否加载中
     */
    setLoading(element, loading) {
        if (loading) {
            element.disabled = true;
            element.classList.add('loading');
            const originalText = element.textContent;
            element.dataset.originalText = originalText;
            element.innerHTML = '<span class="loading"></span> 加载中...';
        } else {
            element.disabled = false;
            element.classList.remove('loading');
            element.textContent = element.dataset.originalText || element.textContent;
        }
    }

    /**
     * 创建空状态显示
     * @param {string} title - 标题
     * @param {string} description - 描述
     * @param {string} icon - 图标
     * @returns {HTMLElement} 空状态元素
     */
    createEmptyState(title, description, icon = '📝') {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-description">${description}</div>
        `;
        return emptyState;
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化时间
     * @param {Date|string|number} date - 日期
     * @returns {string} 格式化后的时间
     */
    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
