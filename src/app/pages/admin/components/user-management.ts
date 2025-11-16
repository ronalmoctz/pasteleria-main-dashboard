import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User, UpdateUserDTO } from '../../../core/services/api/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="user-management">
      <div class="management-header">
        <h2>Gestión de Usuarios</h2>
        <div class="search-and-filters">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Buscar por email o nombre..."
              [(ngModel)]="searchTerm"
              (input)="filterUsers()"
            >
          </div>
          <div class="filters">
            <select [(ngModel)]="roleFilter" (change)="filterUsers()">
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="customer">Cliente</option>
            </select>
            <select [(ngModel)]="statusFilter" (change)="filterUsers()">
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">
          <p>Cargando usuarios...</p>
        </div>
      } @else if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
          <button (click)="loadUsers()">Reintentar</button>
        </div>
      } @else if (filteredUsers().length === 0) {
        <div class="empty-state">
          <p>No hay usuarios para mostrar</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Conexión</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.id) {
                <tr [class.inactive]="!user.is_active">
                  <td>{{ user.email }}</td>
                  <td>{{ user.first_name }}</td>
                  <td>{{ user.last_name }}</td>
                  <td>{{ user.phone || '-' }}</td>
                  <td>
                    <span class="badge" [class]="'badge-' + user.role">
                      {{ user.role === 'admin' ? 'Administrador' : 'Cliente' }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="user.is_active ? 'status-active' : 'status-inactive'">
                      {{ user.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    @let status = userStatuses()[user.id];
                    @if (status) {
                      <div class="connection-status">
                        <span class="status-badge-connection" [class]="status.is_online ? 'online' : 'offline'">
                          {{ status.is_online ? 'Online' : 'Offline' }}
                        </span>
                        @if (status.duration?.formatted) {
                          <span class="time-display">{{ status.duration.formatted }}</span>
                        }
                      </div>
                    } @else {
                      <div class="connection-status loading-status">
                        <span class="status-badge-connection offline">Cargando...</span>
                      </div>
                    }
                  </td>
                  <td>{{ user.created_at | date: 'dd/MM/yyyy' }}</td>
                  <td class="actions">
                    <button class="btn-view" (click)="viewUser(user)">Ver</button>
                    <button class="btn-edit" (click)="openEditModal(user)">Editar</button>
                    <button class="btn-delete" (click)="confirmDelete(user)">Eliminar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (selectedUser()) {
        <div class="modal-overlay" (click)="closeUserDetail()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Detalles del Usuario</h3>
              <button class="close-btn" (click)="closeUserDetail()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Email:</label>
                <p>{{ selectedUser()?.email }}</p>
              </div>
              <div class="form-group">
                <label>Nombre:</label>
                <p>{{ selectedUser()?.first_name }}</p>
              </div>
              <div class="form-group">
                <label>Apellido:</label>
                <p>{{ selectedUser()?.last_name }}</p>
              </div>
              <div class="form-group">
                <label>Teléfono:</label>
                <p>{{ selectedUser()?.phone || '-' }}</p>
              </div>
              <div class="form-group">
                <label>Rol:</label>
                <p>{{ selectedUser()?.role === 'admin' ? 'Administrador' : 'Cliente' }}</p>
              </div>
              <div class="form-group">
                <label>Estado:</label>
                <p>{{ selectedUser()?.is_active ? 'Activo' : 'Inactivo' }}</p>
              </div>
              <div class="form-group">
                <label>Registrado:</label>
                <p>{{ selectedUser()?.created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-primary" (click)="closeUserDetail()">Cerrar</button>
            </div>
          </div>
        </div>
      }

      @if (editingUser()) {
        <div class="modal-overlay" (click)="cancelEdit()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Editar Usuario</h3>
              <button class="close-btn" (click)="cancelEdit()">✕</button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="saveChanges()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="first_name">Nombre:</label>
                  <input 
                    id="first_name"
                    type="text" 
                    formControlName="first_name"
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label for="last_name">Apellido:</label>
                  <input 
                    id="last_name"
                    type="text" 
                    formControlName="last_name"
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label for="phone">Teléfono:</label>
                  <input 
                    id="phone"
                    type="tel" 
                    formControlName="phone"
                    class="form-input"
                  >
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
                <button type="submit" class="btn-primary" [disabled]="!editForm.valid || updatingUser()">
                  {{ updatingUser() ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-management {
      padding: 2rem;
    }

    .management-header {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .management-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .search-and-filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filters select {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .filters select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .loading,
    .error,
    .empty-state {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .error {
      background: #fee;
      color: #c33;
    }

    .error button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .table-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .users-table thead {
      background: #f3f4f6;
      border-bottom: 2px solid #e5e7eb;
    }

    .users-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .users-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }

    .users-table tbody tr:hover {
      background: #f9fafb;
    }

    .users-table tbody tr.inactive {
      opacity: 0.6;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-admin {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-customer {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-badge-connection {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-badge-connection.online {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge-connection.offline {
      background: #f3f4f6;
      color: #6b7280;
    }

    .time-display {
      font-size: 0.8125rem;
      color: #6b7280;
      font-weight: 500;
    }

    .loading-status .status-badge-connection {
      background: #f3f4f6;
      color: #9ca3af;
      font-style: italic;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .actions button {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view {
      background: #dbeafe;
      color: #1e40af;
    }

    .btn-view:hover {
      background: #bfdbfe;
    }

    .btn-edit {
      background: #fef3c7;
      color: #92400e;
    }

    .btn-edit:hover {
      background: #fde68a;
    }

    .btn-delete {
      background: #fee2e2;
      color: #991b1b;
    }

    .btn-delete:hover {
      background: #fecaca;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-lg {
      max-width: 600px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #1f2937;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group p {
      margin: 0;
      color: #1f2937;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      justify-content: flex-end;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #e5e7eb;
      color: #374151;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    @media (max-width: 768px) {
      .management-header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: 100%;
      }

      .users-table {
        font-size: 0.75rem;
      }

      .users-table th,
      .users-table td {
        padding: 0.75rem 0.5rem;
      }

      .actions button {
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedUser = signal<User | null>(null);
  readonly editingUser = signal<User | null>(null);
  readonly updatingUser = signal(false);
  readonly searchTerm = signal('');
  readonly roleFilter = signal('');
  readonly statusFilter = signal('');
  readonly userStatuses = signal<Record<string, any>>({});

  readonly editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.data);
          this.applyFilters();
        } else {
          this.error.set('Error al cargar usuarios');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error.set('Error al cargar usuarios. Intenta de nuevo.');
        this.loading.set(false);
      }
    });

    // Cargar estado de conexión para cada usuario
    this.loadUserStatuses();
  }

  loadUserStatuses(): void {
    const users = this.users();
    const statuses: Record<string, any> = {};

    users.forEach(user => {
      this.userService.getUserStatus(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            statuses[user.id] = response.data;
            this.userStatuses.set({ ...statuses });
          }
        },
        error: (err) => {
          console.error(`Error loading status for user ${user.id}:`, err);
          // Set offline as default if status fetch fails
          statuses[user.id] = { is_online: false, last_seen: null };
          this.userStatuses.set({ ...statuses });
        }
      });
    });
  }

  applyFilters(): void {
    let filtered = [...this.users()];

    const searchTerm = this.searchTerm().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm) ||
        user.first_name.toLowerCase().includes(searchTerm) ||
        user.last_name.toLowerCase().includes(searchTerm)
      );
    }

    const role = this.roleFilter();
    if (role) {
      filtered = filtered.filter(user => user.role === role);
    }

    const status = this.statusFilter();
    if (status === 'active') {
      filtered = filtered.filter(user => user.is_active !== false);
    } else if (status === 'inactive') {
      filtered = filtered.filter(user => user.is_active === false);
    }

    this.filteredUsers.set(filtered);
  }

  filterUsers(): void {
    this.applyFilters();
  }

  viewUser(user: User): void {
    this.selectedUser.set(user);
  }

  closeUserDetail(): void {
    this.selectedUser.set(null);
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.editForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || ''
    });
  }

  cancelEdit(): void {
    this.editingUser.set(null);
    this.editForm.reset();
  }

  saveChanges(): void {
    if (!this.editForm.valid || !this.editingUser()) return;

    this.updatingUser.set(true);
    const userId = this.editingUser()!.id;
    const updateData: UpdateUserDTO = this.editForm.value;

    this.userService.updateUser(userId, updateData).subscribe({
      next: () => {
        this.updatingUser.set(false);
        this.editingUser.set(null);
        this.editForm.reset();
        this.loadUsers();
        alert('Usuario actualizado exitosamente');
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.updatingUser.set(false);
        alert('Error al actualizar usuario');
      }
    });
  }

  confirmDelete(user: User): void {
    const confirmed = confirm(
      `¿Estás seguro de que deseas desactivar a ${user.email}?`
    );

    if (!confirmed) return;

    this.loading.set(true);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadUsers();
        alert('Usuario desactivado exitosamente');
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.loading.set(false);
        alert('Error al desactivar usuario');
      }
    });
  }
}
