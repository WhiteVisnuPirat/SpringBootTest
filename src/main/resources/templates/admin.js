class UserManager {
    constructor() {
        this.users = [];
        this.roles = [];
        this.init();
    }

    async init() {
        await this.loadRoles();
        await this.loadUsers();
        this.setupEventListeners();
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) throw new Error('Failed to load users');
            this.users = await response.json();
            this.renderUsersTable();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showAlert('Error loading users!', 'danger');
        }
    }

    async loadRoles() {
        try {
            const response = await fetch('/api/admin/roles');
            if (!response.ok) throw new Error('Failed to load roles');
            this.roles = await response.json();
        } catch (error) {
            console.error('Error loading roles:', error);
            this.showAlert('Error loading roles!', 'danger');
        }
    }

    renderUsersTable() {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.firstname}</td>
                <td>${user.lastname}</td>
                <td>${user.email}</td>
                <td>${user.age}</td>
                <td>${user.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${user.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.addTableEventListeners();
    }

    addTableEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.id;
                this.openEditModal(userId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.id;
                this.deleteUser(userId);
            });
        });
    }

    setupEventListeners() {
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.openAddModal();
        });

        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });
    }

    openAddModal() {
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        document.getElementById('modalTitle').textContent = 'Add New User';
        document.getElementById('userId').value = '';
        document.getElementById('username').value = '';
        document.getElementById('firstname').value = '';
        document.getElementById('lastname').value = '';
        document.getElementById('email').value = '';
        document.getElementById('age').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password').required = true;

        this.renderRoleCheckboxes(null);
        modal.show();
    }

    openEditModal(userId) {
        const user = this.users.find(u => u.id == userId);
        if (!user) return;

        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('firstname').value = user.firstname;
        document.getElementById('lastname').value = user.lastname;
        document.getElementById('email').value = user.email;
        document.getElementById('age').value = user.age;
        document.getElementById('password').value = '';
        document.getElementById('password').required = false;
        document.getElementById('password').placeholder = 'Leave empty to keep current password';

        this.renderRoleCheckboxes(user);
        modal.show();
    }

    renderRoleCheckboxes(user) {
        const rolesContainer = document.getElementById('userRoles');
        rolesContainer.innerHTML = '';

        this.roles.forEach(role => {
            const isChecked = user && user.roles.some(r => r.id === role.id);
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" 
                       value="${role.id}" id="role-${role.id}" 
                       ${isChecked ? 'checked' : ''}>
                <label class="form-check-label" for="role-${role.id}">
                    ${role.name.replace('ROLE_', '')}
                </label>
            `;
            rolesContainer.appendChild(div);
        });
    }

    async saveUser() {
        const formData = new FormData(document.getElementById('userForm'));
        const userId = document.getElementById('userId').value;

        // Валидация
        const username = formData.get('username');
        const firstname = formData.get('firstname');
        const lastname = formData.get('lastname');
        const email = formData.get('email');
        const age = formData.get('age');

        if (!username || !firstname || !lastname || !email || !age) {
            this.showAlert('Please fill all required fields!', 'warning');
            return;
        }

        const userData = {
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            age: parseInt(age),
            password: formData.get('password') || ''
        };

        const roleIds = this.getSelectedRoleIds();
        const roleParams = this.buildRoleParams(roleIds);

        try {
            let response;
            let url;

            if (userId) {
                url = `/api/admin/users/${userId}${roleParams ? '?' + roleParams : ''}`;
                response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                url = `/api/admin/users${roleParams ? '?' + roleParams : ''}`;
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            if (response.ok) {
                this.closeModal();
                await this.loadUsers();
                this.showAlert('User saved successfully!', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showAlert(error.message || 'Error saving user!', 'danger');
        }
    }

    getSelectedRoleIds() {
        const selectedRoleIds = [];
        document.querySelectorAll('#userRoles input:checked').forEach(checkbox => {
            selectedRoleIds.push(parseInt(checkbox.value));
        });
        return selectedRoleIds;
    }

    buildRoleParams(roleIds) {
        if (roleIds.length === 0) return '';
        return roleIds.map(id => `roleIds=${id}`).join('&');
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadUsers();
                this.showAlert('User deleted successfully!', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showAlert(error.message || 'Error deleting user!', 'danger');
        }
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
        if (modal) {
            modal.hide();
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new UserManager();
});