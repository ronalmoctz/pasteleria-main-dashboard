import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IngredientManagementFacade } from '../dashboard/services/ingredient-management.facade';
import { ModalDialogComponent, ModalConfig } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { Ingredient } from '../../../core/services/api/ingredient.service';
import { IconComponent } from '../../../shared/icon/icon';

@Component({
    selector: 'app-ingredient-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalDialogComponent, IconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ingredient-management">
            <!-- Header -->
            <div class="management-header">
                <h2>Gestión de Ingredientes</h2>
                <div class="search-box">
                    <input
                        type="text"
                        placeholder="Buscar ingredientes..."
                        [value]="facade.searchTerm()"
                        (input)="onSearchChange($event)"
                    />
                </div>
            </div>

            <!-- Loading state -->
            @if (facade.isLoading()) {
                <div class="loading">
                    <app-icon name="circle-check" [size]="40" class="loading-icon"></app-icon>
                    <p>Cargando ingredientes...</p>
                </div>
            } @else if (facade.error()) {
                <div class="error-state">
                    <app-icon name="x" [size]="40" class="error-icon"></app-icon>
                    <p>{{ facade.error() }}</p>
                    <button (click)="onRetry()" class="btn btn-primary">Reintentar</button>
                </div>
            } @else if (facade.filteredIngredients().length === 0) {
                <div class="empty-state">
                    <app-icon name="shopping-cart" [size]="40" class="empty-icon"></app-icon>
                    <p>No hay ingredientes para mostrar</p>
                </div>
            } @else {
                <div class="table-container">
                    <table class="management-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cantidad Stock</th>
                                <th>Unidad</th>
                                <th class="actions-header">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (ingredient of facade.filteredIngredients(); track ingredient.id) {
                                <tr>
                                    <td><strong>{{ ingredient.name }}</strong></td>
                                    <td>{{ ingredient.stock_quantity }}</td>
                                    <td>
                                        <span class="unit-badge" [class]="'unit-' + ingredient.unit">
                                            {{ getUnitLabel(ingredient.unit) }}
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="action-btn icon-btn" (click)="onViewIngredient(ingredient)" title="Ver detalles">
                                            <app-icon name="eye" [size]="18" class="icon-view"></app-icon>
                                        </button>
                                        <button class="action-btn icon-btn" (click)="onEditIngredient(ingredient)" title="Editar">
                                            <app-icon name="edit" [size]="18" class="icon-edit"></app-icon>
                                        </button>
                                        <button class="action-btn icon-btn" (click)="onDeleteIngredient(ingredient.id)" title="Eliminar">
                                            <app-icon name="trash" [size]="18" class="icon-delete"></app-icon>
                                        </button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div class="add-ingredient-container">
                    <button class="btn btn-add-ingredient" (click)="onOpenAddIngredientModal()" title="Agregar nuevo ingrediente">
                        <app-icon name="plus" [size]="20"></app-icon>
                        Agregar Ingrediente
                    </button>
                </div>
            }

            <!-- View Modal -->
            @if (facade.selectedIngredient()) {
                <app-modal-dialog
                    [config]="viewModalConfig"
                    (cancel)="facade.selectIngredient(null)"
                    (confirm)="facade.selectIngredient(null)"
                >
                    @let ingredient = facade.selectedIngredient();
                    <div class="modal-details-content">
                        <div class="detail-group">
                            <label>Nombre</label>
                            <p>{{ ingredient?.name }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Cantidad Stock</label>
                            <p>{{ ingredient?.stock_quantity }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Unidad</label>
                            <p>
                                <span class="unit-badge" [class]="'unit-' + ingredient?.unit">
                                    {{ getUnitLabel(ingredient?.unit) }}
                                </span>
                            </p>
                        </div>
                        <div class="detail-group">
                            <label>Creado</label>
                            <p>{{ ingredient?.created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                    </div>
                </app-modal-dialog>
            }

            <!-- Edit Modal -->
            @if (facade.editingIngredient()) {
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
                                placeholder="Nombre del ingrediente"
                            >
                            @if (editForm.get('name')?.invalid && editForm.get('name')?.touched) {
                                <span class="form-error">Nombre requerido (mín. 3 caracteres)</span>
                            }
                        </div>
                        <div class="form-group">
                            <label for="stock_quantity">Cantidad Stock</label>
                            <input
                                id="stock_quantity"
                                type="number"
                                formControlName="stock_quantity"
                                class="form-input"
                                placeholder="Cantidad en stock"
                                min="0"
                            >
                            @if (editForm.get('stock_quantity')?.invalid && editForm.get('stock_quantity')?.touched) {
                                <span class="form-error">Cantidad requerida</span>
                            }
                        </div>
                        <div class="form-group">
                            <label for="unit">Unidad</label>
                            <select
                                id="unit"
                                formControlName="unit"
                                class="form-input"
                            >
                                <option value="g">Gramos (g)</option>
                                <option value="kg">Kilos (kg)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="l">Litros (l)</option>
                                <option value="unit">Unidades</option>
                            </select>
                        </div>
                    </form>
                </app-modal-dialog>
            }

            <!-- Delete Modal -->
            @if (facade.deletingIngredientId()) {
                <app-modal-dialog
                    [config]="deleteModalConfig"
                    (cancel)="onCancelDelete()"
                    (confirm)="onConfirmDelete()"
                >
                    <div class="danger-message">
                        <app-icon name="trash" [size]="40" class="danger-icon"></app-icon>
                        <p>¿Estás completamente seguro?</p>
                        <p class="danger-description">
                            Esta acción no se puede deshacer. El ingrediente será eliminado permanentemente.
                        </p>
                    </div>
                </app-modal-dialog>
            }
        </div>
    `,
    styles: [`
        .ingredient-management {
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

        .unit-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8125rem;
            font-weight: 600;
        }

        .unit-icon {
            display: flex;
            align-items: center;
        }

        .unit-g {
            background: #f3e8ff;
            color: #7c3aed;
        }

        .unit-kg {
            background: #fef3c7;
            color: #b45309;
        }

        .unit-ml {
            background: #dbeafe;
            color: #1e40af;
        }

        .unit-l {
            background: #dcfce7;
            color: #166534;
        }

        .unit-unit {
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

        .add-ingredient-container {
            margin-top: 1.5rem;
            display: flex;
            justify-content: flex-end;
        }

        .btn-add-ingredient {
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

        .btn-add-ingredient:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-add-ingredient:active {
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
            .ingredient-management {
                padding: 1rem;
            }

            .search-box {
                min-width: 100%;
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
export class IngredientManagementComponent implements OnInit, OnDestroy {
    readonly facade = inject(IngredientManagementFacade);
    private readonly fb = inject(FormBuilder);

    readonly editForm: FormGroup;

    // Configuraciones de modales
    readonly viewModalConfig: ModalConfig = {
        type: 'view',
        title: 'Detalles del Ingrediente',
        subtitle: 'Información del ingrediente seleccionado',
        cancelLabel: 'Cerrar',
        actionLabel: 'Cerrar',
        maxWidth: '600px'
    };

    readonly deleteModalConfig: ModalConfig = {
        type: 'delete',
        title: 'Eliminar Ingrediente',
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
            stock_quantity: ['', [Validators.required, Validators.min(0)]],
            unit: ['kg', Validators.required]
        });
    }

    ngOnInit(): void {
        this.facade.loadIngredients();
    }

    ngOnDestroy(): void {
        this.facade.resetState();
    }

    getEditModalConfig(): ModalConfig {
        const editingIngredient = this.facade.editingIngredient();
        const isNewIngredient = !editingIngredient?.id;
        return {
            type: 'edit',
            title: isNewIngredient ? 'Crear Ingrediente' : 'Editar Ingrediente',
            subtitle: isNewIngredient ? 'Completa los datos del nuevo ingrediente' : 'Actualiza los datos del ingrediente',
            actionLabel: isNewIngredient ? 'Crear Ingrediente' : 'Guardar Cambios',
            cancelLabel: 'Cancelar',
            maxWidth: '700px',
            isLoading: this.facade.isUpdating()
        };
    }

    getUnitLabel(unit?: string): string {
        switch (unit) {
            case 'g':
                return 'Gramos (g)';
            case 'kg':
                return 'Kilos (kg)';
            case 'ml':
                return 'Mililitros (ml)';
            case 'l':
                return 'Litros (l)';
            case 'unit':
                return 'Unidades';
            default:
                return 'Unidad';
        }
    }

    onSearchChange(event: Event): void {
        const term = (event.target as HTMLInputElement).value;
        this.facade.setSearchTerm(term);
    }

    onRetry(): void {
        this.facade.loadIngredients();
    }

    onViewIngredient(ingredient: Ingredient): void {
        this.facade.selectIngredient(ingredient);
    }

    onEditIngredient(ingredient: Ingredient): void {
        this.facade.openEditModal(ingredient);
        this.editForm.patchValue({
            name: ingredient.name,
            stock_quantity: ingredient.stock_quantity,
            unit: ingredient.unit
        });
    }

    onOpenAddIngredientModal(): void {
        this.facade.openEditModal({
            id: 0,
            name: '',
            stock_quantity: 0,
            unit: 'kg',
            created_at: new Date().toISOString()
        } as Ingredient);
        this.editForm.reset({
            name: '',
            stock_quantity: '',
            unit: 'kg'
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

        const editingIngredient = this.facade.editingIngredient();
        if (!editingIngredient) return;

        const isNewIngredient = !editingIngredient.id || editingIngredient.id === 0;
        const formData = { ...this.editForm.value };

        if (isNewIngredient) {
            // Crear nuevo ingrediente
            this.facade.createIngredient(formData).subscribe({
                next: () => {
                    this.facade.closeEditModal();
                    this.editForm.reset();
                    this.facade.loadIngredients();
                },
                error: (err) => {
                    console.error('Error creating ingredient:', err);
                }
            });
        } else {
            // Actualizar ingrediente existente
            this.facade.updateIngredient(editingIngredient.id, formData).subscribe({
                next: () => {
                    this.facade.closeEditModal();
                    this.editForm.reset();
                },
                error: (err) => {
                    console.error('Error updating ingredient:', err);
                }
            });
        }
    }

    onDeleteIngredient(ingredientId: number): void {
        this.facade.openDeleteConfirm(ingredientId);
    }

    onCancelDelete(): void {
        this.facade.closeDeleteConfirm();
    }

    onConfirmDelete(): void {
        const ingredientId = this.facade.deletingIngredientId();
        if (ingredientId) {
            this.facade.deleteIngredient(ingredientId).subscribe({
                next: () => {
                    // Notificación ya es manejada por el facade
                },
                error: (err) => {
                    console.error('Error deleting ingredient:', err);
                }
            });
        }
    }
}
