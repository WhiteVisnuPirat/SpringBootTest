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
            this.users = await response.json();
            this.renderUsersTable();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadRoles() {
        try {
            const response = await fetch('/api/roles');
            this.roles = await response.json();
        } catch (error) {
            console.error('Error loading roles:', error);
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
        // Add new user button
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.openAddModal();
        });

        // Save user form
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Close modal
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
        document.getElementById('password').required = false;

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

        const userData = {
            username: formData.get('username'),
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            age: parseInt(formData.get('age')),
            password: formData.get('password') || '',
            roles: this.getSelectedRoles()
        };

        try {
            let response;
            if (userId) {
                // Update existing user
                response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // Create new user
                response = await fetch('/api/admin/users', {
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
                throw new Error('Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showAlert('Error saving user!', 'danger');
        }
    }

    getSelectedRoles() {
        const selectedRoles = [];
        document.querySelectorAll('#userRoles input:checked').forEach(checkbox => {
            selectedRoles.push({
                id: parseInt(checkbox.value),
                name: this.roles.find(r => r.id == checkbox.value).name
            });
        });
        return selectedRoles;
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
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showAlert('Error deleting user!', 'danger');
        }
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
        modal.hide();
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
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new UserManager();
});