class AdminApp {
    constructor() {
        this.apiBase = '/api/admin';
        this.init();
    }

    init() {
        this.loadUsers();
        this.loadRoles();
        this.setupEventListeners();
    }

    async loadUsers() {
        try {
            const response = await fetch(`${this.apiBase}/users`);
            const users = await response.json();
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showAlert('Error loading users', 'danger');
        }
    }

    async loadRoles() {
        try {
            const response = await fetch(`${this.apiBase}/roles`);
            this.roles = await response.json();
            this.renderRoleCheckboxes();
        } catch (error) {
            console.error('Error loading roles:', error);
            this.showAlert('Error loading roles', 'danger');
        }
    }

    renderRoleCheckboxes() {
        const addContainer = document.getElementById('rolesCheckboxes');
        const editContainer = document.getElementById('editRolesCheckboxes');

        if (addContainer && this.roles) {
            addContainer.innerHTML = this.roles.map(role => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="roleIds" value="${role.id}" id="role-${role.id}">
                    <label class="form-check-label" for="role-${role.id}">${role.name}</label>
                </div>
            `).join('');
        }

        if (editContainer && this.roles) {
            editContainer.innerHTML = this.roles.map(role => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="roleIds" value="${role.id}" id="edit-role-${role.id}">
                    <label class="form-check-label" for="edit-role-${role.id}">${role.name}</label>
                </div>
            `).join('');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.firstname}</td>
                <td>${user.lastname}</td>
                <td>${user.email}</td>
                <td>${user.age || ''}</td>
                <td>${user.roles.map(role => role.name).join(', ')}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="adminApp.showEditModal(${user.id})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminApp.deleteUser(${user.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showEditModal(userId) {
        try {
            const response = await fetch(`${this.apiBase}/users/${userId}`);
            const user = await response.json();

            this.populateEditForm(user);
            new bootstrap.Modal(document.getElementById('editUserModal')).show();
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showAlert('Error loading user data', 'danger');
        }
    }

    populateEditForm(user) {
        const form = document.getElementById('editUserForm');
        form.reset();

        form.querySelector('[name="id"]').value = user.id;
        form.querySelector('[name="username"]').value = user.username;
        form.querySelector('[name="firstname"]').value = user.firstname;
        form.querySelector('[name="lastname"]').value = user.lastname;
        form.querySelector('[name="email"]').value = user.email;
        form.querySelector('[name="age"]').value = user.age || '';

        // Clear role checkboxes
        form.querySelectorAll('[name="roleIds"]').forEach(cb => cb.checked = false);

        // Check user's roles
        user.roles.forEach(userRole => {
            const checkbox = form.querySelector(`[name="roleIds"][value="${userRole.id}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    async createUser(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const user = {
            username: formData.get('username'),
            password: formData.get('password'),
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            age: parseInt(formData.get('age')) || 0
        };

        const roleIds = Array.from(form.querySelectorAll('[name="roleIds"]:checked'))
            .map(cb => parseInt(cb.value));

        try {
            const response = await fetch(`${this.apiBase}/users?roleIds=${roleIds.join(',')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                const newUser = await response.json();
                this.showAlert(`User ${newUser.username} created successfully`, 'success');
                this.loadUsers();
                bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
                form.reset();
            } else {
                throw new Error('Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            this.showAlert('Error creating user', 'danger');
        }
    }

    async updateUser(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const user = {
            id: parseInt(formData.get('id')),
            username: formData.get('username'),
            password: formData.get('password') || '',
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            age: parseInt(formData.get('age')) || 0
        };

        const roleIds = Array.from(form.querySelectorAll('[name="roleIds"]:checked'))
            .map(cb => parseInt(cb.value));

        try {
            const response = await fetch(`${this.apiBase}/users/${user.id}?roleIds=${roleIds.join(',')}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                this.showAlert(`User ${updatedUser.username} updated successfully`, 'success');
                this.loadUsers();
                bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            } else {
                throw new Error('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            this.showAlert('Error updating user', 'danger');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('User deleted successfully', 'success');
                this.loadUsers();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showAlert('Error deleting user', 'danger');
        }
    }

    showAlert(message, type) {
        const alertsContainer = document.getElementById('alertsContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertsContainer.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    setupEventListeners() {
        document.getElementById('addUserForm').addEventListener('submit', (e) => this.createUser(e));
        document.getElementById('editUserForm').addEventListener('submit', (e) => this.updateUser(e));

        // Clear form when modal is closed
        document.getElementById('addUserModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('addUserForm').reset();
        });
    }
}

// Initialize the application
const adminApp = new AdminApp();