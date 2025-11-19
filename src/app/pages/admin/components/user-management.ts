import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../core/services/api/user.service';
import { UserManagementFacade } from '../dashboard/services/user-management.facade';
import { ModalDialogComponent, ModalConfig } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { IconComponent } from '../../../shared/icon/icon';

/**
 * Componente de Gestión de Usuarios - Refactorizado con Arquitectura Limpia
 * 
 * Responsabilidad única: Renderizar la interfaz de usuarios
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo presentación
 * - Dependency Inversion: Depende del Facade
 * - Interface Segregation: Usa solo lo necesario
 */
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalDialogComponent, IconComponent],
  template: `
    <div class="user-management">
      <!-- Header con búsqueda y filtros -->
      <div class="management-header">
        <h2>Gestión de Usuarios</h2>
        <div class="search-and-filters">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Buscar por email o nombre..."
              [value]="facade.searchTerm()"
              (input)="onSearchChange($event)"
            >
          </div>
          <div class="filters">
            <select [value]="facade.roleFilter()" (change)="onRoleFilterChange($event)">
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="customer">Cliente</option>
            </select>
            <select [value]="facade.statusFilter()" (change)="onStatusFilterChange($event)">
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estados de carga, error y vacío -->
      @if (facade.isLoading()) {
        <div class="loading">
          <app-icon name="circle-check" [size]="40" class="loading-icon"></app-icon>
          <p>Cargando usuarios...</p>
        </div>
      } @else if (facade.error()) {
        <div class="error-state">
          <app-icon name="x" [size]="40" class="error-icon"></app-icon>
          <p>{{ facade.error() }}</p>
          <button (click)="onRetry()" class="btn btn-primary">Reintentar</button>
        </div>
      } @else if (facade.filteredUsers().length === 0) {
        <div class="empty-state">
          <app-icon name="shopping-cart" [size]="40" class="empty-icon"></app-icon>
          <p>No hay usuarios para mostrar</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th class="actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of facade.filteredUsers(); track user.id) {
                <tr [class.inactive]="!user.is_active">
                  <td class="email-cell">{{ user.email }}</td>
                  <td>{{ user.first_name }} {{ user.last_name }}</td>
                  <td>{{ user.phone_number || '-' }}</td>
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
                  <td>{{ user.created_at | date: 'dd/MM/yyyy' }}</td>
                  <td class="actions-cell">
                    <button class="action-btn icon-btn" (click)="onViewUser(user)" title="Ver detalles">
                      <app-icon name="eye" [size]="18" class="icon-view"></app-icon>
                    </button>
                    <button class="action-btn icon-btn" (click)="onEditUser(user)" title="Editar">
                      <app-icon name="edit" [size]="18" class="icon-edit"></app-icon>
                    </button>
                    <button class="action-btn icon-btn" (click)="onConfirmDelete(user)" title="Eliminar">
                      <app-icon name="trash" [size]="18" class="icon-delete"></app-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="add-user-container">
          <button class="btn btn-add-user" (click)="onOpenAddUserModal()" title="Agregar nuevo usuario">
            <app-icon name="plus" [size]="20"></app-icon>
            Agregar Usuario
          </button>
        </div>
      }

      <!-- Modal: Ver detalles -->
      @if (facade.selectedUser()) {
        <app-modal-dialog
          [config]="viewModalConfig"
          (cancel)="onCloseViewModal()"
          (confirm)="onCloseViewModal()"
        >
          <div class="modal-details-content">
            @let user = facade.selectedUser();
            <div class="detail-group">
              <label>Email</label>
              <p>{{ user?.email }}</p>
            </div>
            <div class="detail-group">
              <label>Nombre Completo</label>
              <p>{{ user?.first_name }} {{ user?.last_name }}</p>
            </div>
            <div class="detail-group">
              <label>Teléfono</label>
              <p>{{ user?.phone_number || '—' }}</p>
            </div>
            <div class="detail-group">
              <label>Rol</label>
              <p>
                <span class="badge" [class]="'badge-' + user?.role">
                  {{ user?.role === 'admin' ? 'Administrador' : 'Cliente' }}
                </span>
              </p>
            </div>
            <div class="detail-group">
              <label>Estado</label>
              <p>
                <span class="status-badge" [class]="user?.is_active ? 'status-active' : 'status-inactive'">
                  {{ user?.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
            </div>
            <div class="detail-group">
              <label>Registrado</label>
              <p>{{ user?.created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </app-modal-dialog>
      }

      <!-- Modal: Editar usuario -->
      @if (facade.editingUser()) {
        <app-modal-dialog
          [config]="getEditModalConfig()"
          (cancel)="onCancelEdit()"
          (confirm)="onSaveChanges()"
        >
          <form [formGroup]="editForm" class="modal-form">
            <div class="form-group">
              <label for="first_name">Nombre</label>
              <input
                id="first_name"
                type="text"
                formControlName="first_name"
                class="form-input"
                placeholder="Nombre del usuario"
              >
              @if (editForm.get('first_name')?.invalid && editForm.get('first_name')?.touched) {
                <span class="form-error">Nombre requerido (mín. 2 caracteres)</span>
              }
            </div>

            <div class="form-group">
              <label for="last_name">Apellido</label>
              <input
                id="last_name"
                type="text"
                formControlName="last_name"
                class="form-input"
                placeholder="Apellido del usuario"
              >
              @if (editForm.get('last_name')?.invalid && editForm.get('last_name')?.touched) {
                <span class="form-error">Apellido requerido (mín. 2 caracteres)</span>
              }
            </div>

            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                class="form-input"
                placeholder="Teléfono (opcional)"
              >
            </div>
          </form>
        </app-modal-dialog>
      }

      <!-- Modal: Confirmar eliminación -->
      @if (facade.deletingUserId()) {
        <app-modal-dialog
          [config]="deleteModalConfig"
          (cancel)="onCancelDelete()"
          (confirm)="onConfirmDeleteAction()"
        >
          <div class="danger-message">
            <app-icon name="trash" [size]="40" class="danger-icon"></app-icon>
            <p>¿Estás completamente seguro?</p>
            <p class="danger-description">
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
            </p>
          </div>
        </app-modal-dialog>
      }
    </div>
  `,
  styles: [`
    .user-management {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .management-header {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .management-header h2 {
      margin: 0;
      font-size: 1.875rem;
      color: #1f2937;
      font-weight: 700;
    }

    .search-and-filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      flex: 1;
      min-width: 280px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .search-box input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filters {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filters select {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filters select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .loading,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-icon {
      color: #3b82f6;
      opacity: 0.7;
    }

    .loading p {
      margin: 0;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .error-state {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
    }

    .error-icon {
      color: #ef4444;
    }

    .error-state p {
      margin: 0;
      color: #991b1b;
      font-size: 1.1rem;
    }

    .error-state .btn {
      margin-top: 0.5rem;
    }

    .empty-state p {
      margin: 0;
      color: #9ca3af;
      font-size: 1.1rem;
    }

    .empty-icon {
      color: #d1d5db;
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
      font-size: 0.9375rem;
    }

    .users-table thead {
      background: #f3f4f6;
      border-bottom: 2px solid #e5e7eb;
      position: sticky;
      top: 0;
    }

    .users-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      font-size: 0.8125rem;
      letter-spacing: 0.05em;
    }

    .actions-header {
      text-align: center;
    }

    .users-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }

    .email-cell {
      font-weight: 500;
      color: #3b82f6;
    }

    .users-table tbody tr:hover {
      background: #f9fafb;
    }

    .users-table tbody tr.inactive {
      opacity: 0.6;
      background: #f3f4f6;
    }

    .badge {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .actions-cell {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: 0.375rem;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      height: 2.5rem;
    }

    .icon-btn {
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .icon-btn:hover {
      opacity: 1;
    }

    .icon-view {
      color: #3b82f6;
    }

    .icon-edit {
      color: #f59e0b;
    }

    .icon-delete {
      color: #ef4444;
    }

    .add-user-container {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn-add-user {
      background: #10b981;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-add-user:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-add-user:active {
      transform: translateY(0);
    }

    /* Modal Content Styles */
    .modal-details-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .detail-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-group label {
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #6b7280;
      letter-spacing: 0.05em;
    }

    .detail-group p {
      margin: 0;
      color: #1f2937;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      word-break: break-word;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #374151;
    }

    .form-input {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s;
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

    .form-error {
      font-size: 0.8125rem;
      color: #dc2626;
      font-weight: 500;
    }

    .danger-message {
      text-align: center;
      padding: 1rem;
    }

    .danger-icon {
      color: #ef4444;
      margin: 0 0 0.5rem 0;
    }

    .danger-message p {
      margin: 0 0 0.75rem 0;
    }

    .danger-message p:first-of-type {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .danger-description {
      font-size: 0.9375rem;
      color: #6b7280;
      margin: 1rem 0 0 0 !important;
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9375rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
    }

    @media (max-width: 768px) {
      .user-management {
        padding: 1rem;
      }

      .search-and-filters {
        flex-direction: column;
      }

      .search-box {
        min-width: 100%;
      }

      .filters {
        width: 100%;
      }

      .filters select {
        flex: 1;
        min-width: 150px;
      }

      .users-table {
        font-size: 0.8rem;
      }

      .users-table th,
      .users-table td {
        padding: 0.75rem 0.5rem;
      }

      .actions-cell {
        gap: 0.25rem;
      }

      .action-btn {
        min-width: 2rem;
        height: 2rem;
        padding: 0.375rem;
      }

      .modal-details-content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit, OnDestroy {
  readonly facade = inject(UserManagementFacade);
  private readonly fb = inject(FormBuilder);

  readonly editForm: FormGroup;

  // Configuraciones de modales
  readonly viewModalConfig: ModalConfig = {
    type: 'view',
    title: 'Detalles del Usuario',
    actionLabel: 'Cerrar',
    cancelLabel: 'Cerrar',
    maxWidth: '600px'
  };

  readonly editModalConfig: ModalConfig = {
    type: 'edit',
    title: 'Editar Usuario',
    subtitle: 'Actualiza los datos del usuario',
    actionLabel: 'Guardar Cambios',
    cancelLabel: 'Cancelar',
    maxWidth: '700px',
    isLoading: this.facade.isUpdating()
  };

  readonly deleteModalConfig: ModalConfig = {
    type: 'delete',
    title: 'Eliminar Usuario',
    subtitle: 'Esta acción no se puede deshacer',
    actionLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
    isDangerous: true,
    maxWidth: '500px',
    isLoading: this.facade.isDeleting()
  };

  constructor() {
    this.editForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.facade.loadUsers();
  }

  ngOnDestroy(): void {
    this.facade.resetState();
  }

  /**
   * Retorna la configuración del modal de edición/creación
   * Cambia el título y acciones según si es un nuevo usuario o una edición
   */
  getEditModalConfig(): ModalConfig {
    const editingUser = this.facade.editingUser();
    const isNewUser = !editingUser?.id;
    return {
      type: 'edit',
      title: isNewUser ? 'Crear Usuario' : 'Editar Usuario',
      subtitle: isNewUser ? 'Completa los datos del nuevo usuario' : 'Actualiza los datos del usuario',
      actionLabel: isNewUser ? 'Crear Usuario' : 'Guardar Cambios',
      cancelLabel: 'Cancelar',
      maxWidth: '700px',
      isLoading: this.facade.isUpdating()
    };
  }

  // Manejadores de búsqueda y filtros
  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.facade.setSearchTerm(term);
  }

  onRoleFilterChange(event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    this.facade.setRoleFilter(role);
  }

  onStatusFilterChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.facade.setStatusFilter(status);
  }

  onRetry(): void {
    this.facade.loadUsers();
  }

  // Manejadores de modales de vista
  onViewUser(user: User): void {
    this.facade.selectUser(user);
  }

  onCloseViewModal(): void {
    this.facade.closeUserDetail();
  }

  // Manejadores de modales de edición
  onEditUser(user: User): void {
    this.facade.openEditModal(user);
    this.editForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone_number || ''
    });
  }

  onCancelEdit(): void {
    this.facade.closeEditModal();
    this.editForm.reset();
  }

  onOpenAddUserModal(): void {
    this.facade.openEditModal({
      id: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      role: 'customer',
      is_active: true,
      created_at: new Date().toISOString()
    } as User);
    this.editForm.reset({
      first_name: '',
      last_name: '',
      phone: ''
    });
  }

  onSaveChanges(): void {
    if (!this.editForm.valid) {
      return;
    }

    const editingUser = this.facade.editingUser();
    if (!editingUser) return;

    const isNewUser = !editingUser.id;

    // Convertir phone a phone_number para la API
    const formData = { ...this.editForm.value };
    if (formData.phone !== undefined) {
      formData.phone_number = formData.phone;
      delete formData.phone;
    }

    if (isNewUser) {
      // Crear nuevo usuario
      this.facade.createUser(formData).subscribe({
        next: () => {
          this.facade.closeEditModal();
          this.editForm.reset();
          this.facade.loadUsers();
        },
        error: (err) => {
          console.error('Error creating user:', err);
        }
      });
    } else {
      // Actualizar usuario existente
      this.facade.updateUser(String(editingUser.id), formData).subscribe({
        next: () => {
          this.facade.closeEditModal();
          this.editForm.reset();
        },
        error: (err) => {
          console.error('Error updating user:', err);
        }
      });
    }
  }

  // Manejadores de modales de eliminación
  onConfirmDelete(user: User): void {
    this.facade.openDeleteConfirm(String(user.id));
  }

  onCancelDelete(): void {
    this.facade.closeDeleteConfirm();
  }

  onConfirmDeleteAction(): void {
    const deletingUserId = this.facade.deletingUserId();
    if (!deletingUserId) return;

    this.facade.deleteUser(deletingUserId).subscribe({
      next: () => {
        // Notificación ya es manejada por el facade
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      }
    });
  }
}
