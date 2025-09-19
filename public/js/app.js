// 密码管理应用
class PasswordManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.totalCount = 0;
        this.currentSearch = '';
        this.passwords = [];
        this.deleteId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPasswords();
        this.loadStats();
    }

    bindEvents() {
        // 搜索功能
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.search();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.search();
                }
            });
        }

        // 添加密码
        document.getElementById('addPasswordBtn').addEventListener('click', () => {
            this.showAddModal();
        });

        // 导入密码
        document.getElementById('importBtn').addEventListener('click', () => {
            this.showImportModal();
        });

        // 确认导入
        document.getElementById('confirmImportBtn').addEventListener('click', () => {
            this.importPasswords();
        });

        // 刷新
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadPasswords();
            this.loadStats();
        });

        // 保存密码
        document.getElementById('savePasswordBtn').addEventListener('click', () => {
            this.savePassword();
        });

        // 确认删除
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.deletePassword();
        });

        // 密码显示/隐藏切换
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('password-toggle') || e.target.closest('.password-toggle')) {
                const button = e.target.classList.contains('password-toggle') ? e.target : e.target.closest('.password-toggle');
                this.showKeyModal(button);
            }
        });

        // 确认解密按钮
        document.getElementById('confirmDecryptBtn').addEventListener('click', () => {
            this.decryptPassword();
        });

        // 编辑和删除按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                this.editPassword(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-btn')) {
                this.showDeleteModal(e.target.dataset.id);
            } else if (e.target.classList.contains('copy-password') || e.target.closest('.copy-password')) {
                const button = e.target.classList.contains('copy-password') ? e.target : e.target.closest('.copy-password');
                this.copyPassword(button);
            } else if (e.target.classList.contains('password-hide') || e.target.closest('.password-hide')) {
                const button = e.target.classList.contains('password-hide') ? e.target : e.target.closest('.password-hide');
                this.hidePassword(button);
            }
        });
    }

    async loadPasswords(page = 1) {
        try {
            this.currentPage = page;
            const url = `/api/passwords?page=${page}&limit=${this.pageSize}&search=${encodeURIComponent(this.currentSearch)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.passwords = data.data;
                this.totalCount = data.total;
                this.totalPages = Math.ceil(this.totalCount / this.pageSize);
                this.renderPasswords();
                this.renderPagination();
                this.updateListCount();
            } else {
                this.showError('加载密码失败: ' + data.message);
            }
        } catch (error) {
            this.showError('网络错误: ' + error.message);
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            if (data.success) {
                this.updateStats(data.data);
            }
        } catch (error) {
        }
    }

    updateStats(stats) {
        document.getElementById('totalPasswords').textContent = stats.total || 0;
        document.getElementById('sourceFiles').textContent = stats.bySource ? stats.bySource.length : 0;
        document.getElementById('totalCount').textContent = `共 ${stats.total || 0} 条记录`;
        
        // 计算今日新增（简化处理）
        const today = new Date().toISOString().split('T')[0];
        const todayAdded = this.passwords.filter(p => p.created_at && p.created_at.startsWith(today)).length;
        document.getElementById('todayAdded').textContent = todayAdded;
        
        // 计算弱密码（长度小于8位）
        const weakPasswords = this.passwords.filter(p => p.password && p.password.length < 8).length;
        document.getElementById('weakPasswords').textContent = weakPasswords;
    }

    renderPasswords() {
        const tbody = document.getElementById('passwordTableBody');
        
        if (this.passwords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <div>暂无数据</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.passwords.map(password => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-globe me-2 text-primary"></i>
                        <a href="${this.escapeHtml(password.url)}" target="_blank" class="text-decoration-none fw-bold text-dark site-name-link" title="${this.escapeHtml(password.url)}">
                            ${this.getDisplayName(password.name)}
                            <i class="bi bi-box-arrow-up-right ms-1"></i>
                        </a>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person me-2 text-muted"></i>
                        <span class="fw-medium">${this.escapeHtml(password.username)}</span>
                    </div>
                </td>
                <td>
                    <div class="input-group input-group-sm">
                        <input type="password" class="form-control password-field" value="••••••••" readonly data-encrypted="${this.escapeHtml(password.password)}">
                        <button class="btn btn-outline-secondary password-toggle" type="button" title="解密/显示密码">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm password-hide" type="button" title="隐藏密码" style="display: none;">
                            <i class="bi bi-eye-slash"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm copy-password" type="button" title="复制密码">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <span class="badge badge-custom ${this.getSourceBadgeClass(password.from)}">${this.escapeHtml(password.from)}</span>
                </td>
                <td>
                    ${password.note ? `<span class="text-muted">${this.escapeHtml(password.note)}</span>` : '<span class="text-muted">-</span>'}
                </td>
                <td>
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn edit-btn btn-action" data-id="${password.id}" title="编辑密码">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn delete-btn btn-action" data-id="${password.id}" title="删除密码">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        // 上一页
        if (this.currentPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${this.currentPage - 1}">上一页</a></li>`;
        }

        // 页码
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            html += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a></li>`;
        }

        // 下一页
        if (this.currentPage < this.totalPages) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${this.currentPage + 1}">下一页</a></li>`;
        }

        pagination.innerHTML = html;

        // 绑定分页点击事件
        pagination.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('page-link') && !e.target.parentElement.classList.contains('disabled')) {
                const page = parseInt(e.target.dataset.page);
                this.loadPasswords(page);
            }
        });
    }

    updateListCount() {
        document.getElementById('listCount').textContent = this.passwords.length;
    }

    search() {
        this.currentSearch = document.getElementById('searchInput').value.trim();
        this.loadPasswords(1);
    }

    showAddModal() {
        document.getElementById('modalTitle').textContent = '添加密码';
        document.getElementById('passwordForm').reset();
        document.getElementById('passwordId').value = '';
        new bootstrap.Modal(document.getElementById('passwordModal')).show();
    }

    showImportModal() {
        document.getElementById('importFile').value = '';
        document.getElementById('importSource').value = 'Chrome';
        new bootstrap.Modal(document.getElementById('importModal')).show();
    }

    async importPasswords() {
        const fileInput = document.getElementById('importFile');
        const sourceSelect = document.getElementById('importSource');
        
        if (!fileInput.files[0]) {
            this.showError('请选择要导入的CSV文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('source', sourceSelect.value);

        // 显示加载状态
        const importBtn = document.getElementById('confirmImportBtn');
        const originalText = importBtn.innerHTML;
        importBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>导入中...';
        importBtn.disabled = true;

        try {
            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess(data.message);
                bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
                this.loadPasswords(this.currentPage);
                this.loadStats();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            this.showError('导入失败: ' + error.message);
        } finally {
            // 恢复按钮状态
            importBtn.innerHTML = originalText;
            importBtn.disabled = false;
        }
    }

    async editPassword(id) {
        try {
            const response = await fetch(`/api/passwords/${id}`);
            const data = await response.json();

            if (data.success) {
                const password = data.data;
                document.getElementById('modalTitle').textContent = '编辑密码';
                document.getElementById('passwordId').value = password.id;
                document.getElementById('name').value = password.name;
                document.getElementById('url').value = password.url;
                document.getElementById('username').value = password.username;
                document.getElementById('password').value = password.password;
                document.getElementById('note').value = password.note || '';
                document.getElementById('from').value = password.from;
                new bootstrap.Modal(document.getElementById('passwordModal')).show();
            } else {
                this.showError('获取密码信息失败: ' + data.message);
            }
        } catch (error) {
            this.showError('网络错误: ' + error.message);
        }
    }

    async savePassword() {
        const form = document.getElementById('passwordForm');
        const formData = new FormData(form);
        
        const passwordData = {
            name: document.getElementById('name').value.trim(),
            url: document.getElementById('url').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            note: document.getElementById('note').value.trim(),
            from: document.getElementById('from').value
        };

        // 验证必填字段
        if (!passwordData.name || !passwordData.url || !passwordData.username || !passwordData.password) {
            this.showError('请填写所有必填字段');
            return;
        }

        try {
            const id = document.getElementById('passwordId').value;
            const url = id ? `/api/passwords/${id}` : '/api/passwords';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess(data.message);
                bootstrap.Modal.getInstance(document.getElementById('passwordModal')).hide();
                this.loadPasswords(this.currentPage);
                this.loadStats();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            this.showError('网络错误: ' + error.message);
        }
    }

    showDeleteModal(id) {
        const password = this.passwords.find(p => p.id == id);
        if (password) {
            document.getElementById('deleteSiteName').textContent = password.name;
            document.getElementById('deleteUsername').textContent = password.username;
            this.deleteId = id;
            new bootstrap.Modal(document.getElementById('deleteModal')).show();
        }
    }

    async deletePassword() {
        if (!this.deleteId) return;

        try {
            const response = await fetch(`/api/passwords/${this.deleteId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('密码删除成功');
                bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
                this.loadPasswords(this.currentPage);
                this.loadStats();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            this.showError('网络错误: ' + error.message);
        } finally {
            this.deleteId = null;
        }
    }

    showKeyModal(button) {
        this.currentDecryptButton = button;
        this.currentDecryptInput = button.parentElement.querySelector('input');
        this.currentDecryptIcon = button.querySelector('i');
        
        // 清空密钥输入框
        document.getElementById('decryptKey').value = '';
        
        // 显示模态框
        const keyModal = new bootstrap.Modal(document.getElementById('keyModal'));
        keyModal.show();
    }

    async decryptPassword() {
        const key = document.getElementById('decryptKey').value.trim();
        
        if (!key) {
            this.showError('请输入解密密钥');
            return;
        }

        const encryptedPassword = this.currentDecryptInput.dataset.encrypted;
        
        try {
            const response = await fetch('/api/decrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    encryptedPassword: encryptedPassword,
                    key: key
                })
            });

            const result = await response.json();

            if (result.success) {
                // 解密成功，显示明文
                this.currentDecryptInput.value = result.data.password;
                this.currentDecryptInput.type = 'text';
                this.currentDecryptIcon.className = 'bi bi-eye-slash';
                this.currentDecryptInput.dataset.decrypted = 'true';
                
                // 显示隐藏按钮，隐藏解密按钮
                const hideButton = this.currentDecryptButton.parentElement.querySelector('.password-hide');
                if (hideButton) {
                    hideButton.style.display = 'inline-block';
                    this.currentDecryptButton.style.display = 'none';
                }
                
                // 关闭模态框
                const keyModal = bootstrap.Modal.getInstance(document.getElementById('keyModal'));
                keyModal.hide();
                
                this.showSuccess('密码解密成功');
            } else {
                this.showError(result.message || '解密失败');
            }
        } catch (error) {
            this.showError('解密失败，请检查网络连接');
        }
    }

    togglePassword(button) {
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        
        // 如果已经解密过，直接切换显示/隐藏
        if (input.dataset.decrypted === 'true') {
            if (input.type === 'password') {
                // 显示明文
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                // 隐藏明文
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        } else {
            // 如果未解密，显示密钥输入模态框
            this.showKeyModal(button);
        }
    }

    hidePassword(button) {
        const input = button.parentElement.querySelector('input');
        const toggleButton = button.parentElement.querySelector('.password-toggle');
        
        // 隐藏明文，显示密文
        input.value = '••••••••';
        input.type = 'password';
        input.dataset.decrypted = 'false';
        
        // 切换按钮显示
        button.style.display = 'none';
        toggleButton.style.display = 'inline-block';
        toggleButton.querySelector('i').className = 'bi bi-eye';
    }

    copyPassword(button) {
        const input = button.parentElement.querySelector('input');
        
        let textToCopy;
        let successMessage;
        
        if (input.dataset.decrypted === 'true') {
            // 如果已解密，复制明文
            textToCopy = input.value;
            successMessage = '密码已复制到剪贴板';
        } else {
            // 如果未解密，复制密文
            textToCopy = input.dataset.encrypted;
            successMessage = '密文已复制到剪贴板';
        }
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showSuccess(successMessage);
            }).catch((error) => {
                this.showError('复制失败');
            });
        } else {
            // 备用方案
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess(successMessage);
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getDisplayName(name) {
        if (!name.includes('.')) {
            return this.escapeHtml(name);
        }
        
        const parts = name.split('.');
        if (parts.length >= 2) {
            // 取倒数第二个部分
            return this.escapeHtml(parts[parts.length - 2]);
        }
        
        return this.escapeHtml(name);
    }

    getSourceBadgeClass(source) {
        const sourceMap = {
            'Chrome': 'bg-primary',
            'Firefox': 'bg-warning',
            'Edge': 'bg-info',
            'Safari': 'bg-success',
            'web': 'bg-secondary',
            'Test': 'bg-dark',
            'Other': 'bg-light text-dark'
        };
        
        return sourceMap[source] || 'bg-primary';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PasswordManager();
});
