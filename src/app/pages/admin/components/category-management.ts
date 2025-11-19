import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryManagementFacade } from '../dashboard/services/category-management.facade';
import { ModalDialogComponent, ModalConfig } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { Category } from '../../../core/services/api/category.service';
import { IconComponent } from '../../../shared/icon/icon';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalDialogComponent, IconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="category-management">
            <!-- Header -->
            <div class="management-header">
                <h2>Gestión de Categorías</h2>
                <div class="search-and-filters">
                    <div class="search-box">
                        <input
                            type="text"
                            placeholder="Buscar categorías..."
                            [value]="facade.searchTerm()"
                            (input)="onSearchChange($event)"
                        />
                    </div>
                    <select [value]="sortBy" (change)="onSortChange($event)" class="sort-select">
                        <option value="name-asc">Nombre (A-Z)</option>
                        <option value="name-desc">Nombre (Z-A)</option>
                        <option value="date-new">Más Reciente</option>
                        <option value="date-old">Más Antiguo</option>
                    </select>
                </div>
            </div>

            <!-- Loading state -->
            @if (facade.isLoading()) {
                <div class="loading">
                    <app-icon name="circle-check" [size]="40" class="loading-icon"></app-icon>
                    <p>Cargando categorías...</p>
                </div>
            } @else if (facade.error()) {
                <div class="error-state">
                    <app-icon name="x" [size]="40" class="error-icon"></app-icon>
                    <p>{{ facade.error() }}</p>
                    <button (click)="onRetry()" class="btn btn-primary">Reintentar</button>
                </div>
            } @else if (facade.filteredCategories().length === 0) {
                <div class="empty-state">
                    <app-icon name="shopping-cart" [size]="40" class="empty-icon"></app-icon>
                    <p>No hay categorías para mostrar</p>
                </div>
            } @else {
                <div class="table-container">
                    <table class="management-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Fecha de Creación</th>
                                <th class="actions-header">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (category of getSortedCategories(); track category.id) {
                                <tr>
                                    <td><strong>{{ category.name }}</strong></td>
                                    <td>{{ category.description || '—' }}</td>
                                    <td>{{ category.created_at | date: 'dd/MM/yyyy' }}</td>
                                    <td class="actions-cell">
                                        <button class="action-btn icon-btn" (click)="onViewCategory(category)" title="Ver detalles">
                                            <app-icon name="eye" [size]="18" class="icon-view"></app-icon>
                                        </button>
                                        <button class="action-btn icon-btn" (click)="onEditCategory(category)" title="Editar">
                                            <app-icon name="edit" [size]="18" class="icon-edit"></app-icon>
                                        </button>
                                        <button class="action-btn icon-btn" (click)="onDeleteCategory(category.id)" title="Eliminar">
                                            <app-icon name="trash" [size]="18" class="icon-delete"></app-icon>
                                        </button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div class="add-category-container">
                    <button class="btn btn-add-category" (click)="onOpenAddCategoryModal()" title="Agregar nueva categoría">
                        <app-icon name="plus" [size]="20"></app-icon>
                        Agregar Categoría
                    </button>
                </div>
            }

            <!-- View Modal -->
            @if (facade.selectedCategory()) {
                <app-modal-dialog
                    [config]="viewModalConfig"
                    (cancel)="facade.selectCategory(null)"
                    (confirm)="facade.selectCategory(null)"
                >
                    @let category = facade.selectedCategory();
                    <div class="modal-details-content">
                        <div class="detail-group">
                            <label>Nombre</label>
                            <p>{{ category?.name }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Descripción</label>
                            <p>{{ category?.description || '—' }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Creado</label>
                            <p>{{ category?.created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                    </div>
                </app-modal-dialog>
            }

            <!-- Edit Modal -->
            @if (facade.editingCategory()) {
                <app-modal-dialog
                    [config]="getEditModalConfig()"
                    (cancel)="onCancelEdit()"
                    (confirm)="onSaveChanges()"
                >
                    <form [formGroup]="editForm" class="modal-form">
                        <div class="form-group">
                            <label for="name">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                formControlName="name"
                                class="form-input"
                                placeholder="Nombre de la categoría"
                            >
                            @if (editForm.get('name')?.invalid && editForm.get('name')?.touched) {
                                <span class="form-error">Nombre requerido (mín. 3 caracteres)</span>
                            }
                        </div>
                        <div class="form-group">
                            <label for="description">Descripción</label>
                            <textarea
                                id="description"
                                formControlName="description"
                                class="form-input"
                                placeholder="Descripción de la categoría"
                                rows="4"
                            ></textarea>
                        </div>
                    </form>
                </app-modal-dialog>
            }

            <!-- Delete Modal -->
            @if (facade.deletingCategoryId()) {
                <app-modal-dialog
                    [config]="deleteModalConfig"
                    (cancel)="onCancelDelete()"
                    (confirm)="onConfirmDelete()"
                >
                    <div class="danger-message">
                        <app-icon name="trash" [size]="40" class="danger-icon"></app-icon>
                        <p>¿Estás completamente seguro?</p>
                        <p class="danger-description">
                            Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
                        </p>
                    </div>
                </app-modal-dialog>
            }
        </div>
    `,
    styles: [`
        .category-management {
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

        .sort-select {
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 0.95rem;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
        }

        .sort-select:focus {
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

        .management-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9375rem;
        }

        .management-table thead {
            background: #f3f4f6;
            border-bottom: 2px solid #e5e7eb;
            position: sticky;
            top: 0;
        }

        .management-table th {
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

        .management-table td {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
        }

        .management-table tbody tr:hover {
            background: #f9fafb;
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

        .add-category-container {
            margin-top: 1.5rem;
            display: flex;
            justify-content: flex-end;
        }

        .btn-add-category {
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

        .btn-add-category:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-add-category:active {
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
            .category-management {
                padding: 1rem;
            }

            .search-and-filters {
                flex-direction: column;
            }

            .search-box {
                min-width: 100%;
            }

            .sort-select {
                width: 100%;
            }

            .management-table {
                font-size: 0.8rem;
            }

            .management-table th,
            .management-table td {
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
    `]
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
    readonly facade = inject(CategoryManagementFacade);
    private readonly fb = inject(FormBuilder);

    readonly editForm: FormGroup;
    sortBy = 'name-asc';

    // Configuraciones de modales
    readonly viewModalConfig: ModalConfig = {
        type: 'view',
        title: 'Detalles de la Categoría',
        subtitle: 'Información de la categoría seleccionada',
        cancelLabel: 'Cerrar',
        actionLabel: 'Cerrar',
        maxWidth: '600px'
    };

    readonly deleteModalConfig: ModalConfig = {
        type: 'delete',
        title: 'Eliminar Categoría',
        subtitle: 'Esta acción no se puede deshacer',
        actionLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        isDangerous: true,
        maxWidth: '500px',
        isLoading: this.facade.isDeleting()
    };

    constructor() {
        this.editForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        });
    }

    ngOnInit(): void {
        this.facade.loadCategories();
    }

    ngOnDestroy(): void {
        this.facade.resetState();
    }

    getEditModalConfig(): ModalConfig {
        const editingCategory = this.facade.editingCategory();
        const isNewCategory = !editingCategory?.id;
        return {
            type: 'edit',
            title: isNewCategory ? 'Crear Categoría' : 'Editar Categoría',
            subtitle: isNewCategory ? 'Completa los datos de la nueva categoría' : 'Actualiza los datos de la categoría',
            actionLabel: isNewCategory ? 'Crear Categoría' : 'Guardar Cambios',
            cancelLabel: 'Cancelar',
            maxWidth: '700px',
            isLoading: this.facade.isUpdating()
        };
    }

    onSearchChange(event: Event): void {
        const term = (event.target as HTMLInputElement).value;
        this.facade.setSearchTerm(term);
    }

    onSortChange(event: Event): void {
        this.sortBy = (event.target as HTMLSelectElement).value;
    }

    getSortedCategories(): Category[] {
        let categories = [...this.facade.filteredCategories()];

        switch (this.sortBy) {
            case 'name-asc':
                categories.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                categories.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date-new':
                categories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'date-old':
                categories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
        }

        return categories;
    }

    onRetry(): void {
        this.facade.loadCategories();
    }

    onViewCategory(category: Category): void {
        this.facade.selectCategory(category);
    }

    onEditCategory(category: Category): void {
        this.facade.openEditModal(category);
        this.editForm.patchValue({
            name: category.name,
            description: category.description || ''
        });
    }

    onOpenAddCategoryModal(): void {
        this.facade.openEditModal({
            id: 0,
            name: '',
            description: '',
            created_at: new Date().toISOString()
        } as Category);
        this.editForm.reset({
            name: '',
            description: ''
        });
    }

    onCancelEdit(): void {
        this.facade.closeEditModal();
        this.editForm.reset();
    }

    onSaveChanges(): void {
        if (!this.editForm.valid) {
            return;
        }

        const editingCategory = this.facade.editingCategory();
        if (!editingCategory) return;

        const isNewCategory = !editingCategory.id || editingCategory.id === 0;
        const formData = { ...this.editForm.value };

        if (isNewCategory) {
            // Crear nueva categoría
            this.facade.createCategory(formData).subscribe({
                next: () => {
                    this.facade.closeEditModal();
                    this.editForm.reset();
                    this.facade.loadCategories();
                },
                error: (err) => {
                    console.error('Error creating category:', err);
                }
            });
        } else {
            // Actualizar categoría existente
            this.facade.updateCategory(editingCategory.id, formData).subscribe({
                next: () => {
                    this.facade.closeEditModal();
                    this.editForm.reset();
                },
                error: (err) => {
                    console.error('Error updating category:', err);
                }
            });
        }
    }

    onDeleteCategory(categoryId: number): void {
        this.facade.openDeleteConfirm(categoryId);
    }

    onCancelDelete(): void {
        this.facade.closeDeleteConfirm();
    }

    onConfirmDelete(): void {
        const categoryId = this.facade.deletingCategoryId();
        if (categoryId) {
            this.facade.deleteCategory(categoryId).subscribe({
                next: () => {
                    // Notificación ya es manejada por el facade
                },
                error: (err) => {
                    console.error('Error deleting category:', err);
                }
            });
        }
    }
}
