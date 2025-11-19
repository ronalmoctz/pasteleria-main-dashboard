import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderManagementFacade } from '../dashboard/services/order-management.facade';
import { ModalDialogComponent, ModalConfig } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { Order } from '../../../core/services/api/order.service';
import { IconComponent } from '../../../shared/icon/icon';

@Component({
    selector: 'app-order-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalDialogComponent, IconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="order-management">
            <!-- Header -->
            <!-- Header -->
            <div class="management-header">
                <div class="header-content">
                    <h2>Gestión de Pedidos</h2>
                    <button class="btn-add" (click)="onCreateOrder()">
                        <app-icon name="plus" [size]="20"></app-icon>
                        Nuevo Pedido
                    </button>
                </div>
                <div class="filter-bar">
                    <input
                        type="text"
                        placeholder="Buscar por ID o instrucciones..."
                        [value]="facade.searchTerm()"
                        (input)="onSearchChange($event)"
                    />
                    <select
                        [value]="facade.statusFilter() || ''"
                        (change)="onStatusFilterChange($event)"
                    >
                        <option value="">Todos los estados</option>
                        @for (status of facade.statuses(); track status.id) {
                            <option [value]="status.id">{{ status.status_name }}</option>
                        }
                    </select>
                </div>
            </div>

            <!-- Loading state -->
            <!-- Loading state -->
            @if (facade.isLoading()) {
                <div class="loading">
                    <app-icon name="circle-check" [size]="40" class="loading-icon"></app-icon>
                    <p>Cargando pedidos...</p>
                </div>
            }

            <!-- Error state -->
            <!-- Error state -->
            @if (facade.error()) {
                <div class="error-message">
                    <app-icon name="x" [size]="40" class="error-icon"></app-icon>
                    <p>{{ facade.error() }}</p>
                </div>
            }

            <!-- Empty state -->
            <!-- Empty state -->
            @if (!facade.isLoading() && facade.orders().length === 0) {
                <div class="empty-state">
                    <app-icon name="shopping-cart" [size]="40" class="empty-icon"></app-icon>
                    <p>No hay pedidos disponibles</p>
                </div>
            }

            <!-- Table -->
            @if (!facade.isLoading() && facade.filteredOrders().length > 0) {
                <div class="table-container">
                    <table class="management-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Usuario ID</th>
                                <th>Monto Total</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (order of facade.filteredOrders(); track order.id) {
                                <tr>
                                    <td>#{{ order.id }}</td>
                                    <td>{{ order.user_id }}</td>
                                    <td>\${{ order.total_amount.toFixed(2) }}</td>
                                    <td>
                                        <span class="status-badge" [class]="'status-' + order.status_id">
                                            {{ getStatusName(order.status_id) }}
                                        </span>
                                    </td>
                                    <td>{{ order.order_date | date: 'dd/MM/yyyy HH:mm' }}</td>
                                    <td class="actions">
                                        <button class="btn-icon btn-view" (click)="onViewOrder(order)" title="Ver">
                                            <app-icon name="eye" [size]="18"></app-icon>
                                        </button>
                                        <button class="btn-icon btn-edit" (click)="onEditOrder(order)" title="Editar">
                                            <app-icon name="edit" [size]="18"></app-icon>
                                        </button>
                                        <button class="btn-icon btn-delete" (click)="onDeleteOrder(order.id)" title="Eliminar">
                                            <app-icon name="trash" [size]="18"></app-icon>
                                        </button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }

            <!-- View Modal -->
            <app-modal-dialog
                *ngIf="facade.selectedOrder() as order"
                [config]="{
                    type: 'view',
                    title: 'Detalles del Pedido',
                    subtitle: 'Información del pedido seleccionado',
                    cancelLabel: 'Cerrar',
                    isDangerous: false,
                    isLoading: false,
                    maxWidth: '600px'
                }"
                (cancel)="facade.selectOrder(null)"
                (confirm)="facade.selectOrder(null)"
            >
                <div class="modal-content">
                    <div class="detail-row">
                        <label>ID:</label>
                        <span>{{ order.id }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Usuario:</label>
                        <span>{{ order.user_id }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Monto:</label>
                        <span>\${{ order.total_amount.toFixed(2) }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Estado:</label>
                        <span>{{ getStatusName(order.status_id) }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Fecha de Pedido:</label>
                        <span>{{ order.order_date | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    @if (order.completed_at) {
                        <div class="detail-row">
                            <label>Completado:</label>
                            <span>{{ order.completed_at | date: 'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                    }
                    @if (order.special_instructions) {
                        <div class="detail-row">
                            <label>Instrucciones:</label>
                            <span>{{ order.special_instructions }}</span>
                        </div>
                    }
                </div>
            </app-modal-dialog>

            <!-- Edit Modal -->
            <app-modal-dialog
                *ngIf="facade.editingOrder() as order"
                [config]="getEditModalConfig()"
                (cancel)="facade.closeEditModal()"
                (confirm)="onSaveChanges(order)"
            >
                <form class="edit-form">
                    <div class="form-group">
                        <label>Monto Total:</label>
                        <input
                            type="number"
                            [(ngModel)]="order.total_amount"
                            name="total_amount"
                            step="0.01"
                            min="0"
                            placeholder="Monto total"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label>Estado:</label>
                        <select [(ngModel)]="order.status_id" name="status_id" required>
                            @for (status of facade.statuses(); track status.id) {
                                <option [value]="status.id">{{ status.status_name }}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Instrucciones Especiales:</label>
                        <textarea
                            [(ngModel)]="order.special_instructions"
                            name="special_instructions"
                            placeholder="Instrucciones especiales para el pedido"
                            rows="4"
                        ></textarea>
                    </div>
                </form>
            </app-modal-dialog>

            <!-- Delete Modal -->
            <app-modal-dialog
                *ngIf="facade.deletingOrderId()"
                [config]="{
                    type: 'delete',
                    title: '¿Eliminar Pedido?',
                    subtitle: '¿Estás seguro de que deseas eliminar este pedido?',
                    actionLabel: 'Eliminar',
                    isDangerous: true,
                    isLoading: facade.isDeleting(),
                    maxWidth: '500px'
                }"
                (cancel)="facade.closeDeleteModal()"
                (confirm)="onConfirmDelete()"
            >
            >
                <div class="danger-message">
                    <app-icon name="trash" [size]="40" class="danger-icon"></app-icon>
                    <p>¿Estás seguro?</p>
                    <p class="danger-description">
                        Esta acción no se puede deshacer. El pedido será eliminado permanentemente.
                    </p>
                </div>
            </app-modal-dialog>
        </div>
    `,
    styles: [`
        .order-management {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .management-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            gap: 2rem;
            flex-wrap: wrap;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .management-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #1f2937;
            font-weight: 700;
        }

        .btn-add {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9375rem;
        }

        .btn-add:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .filter-bar {
            display: flex;
            gap: 1rem;
            flex: 1;
            max-width: 600px;
        }

        .filter-bar input,
        .filter-bar select {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-family: inherit;
            transition: border-color 0.2s;
        }

        .filter-bar input:focus,
        .filter-bar select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .loading, .error-message, .empty-state {
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

        .loading-icon { color: #3b82f6; opacity: 0.7; }
        .empty-icon { color: #d1d5db; }
        .error-icon { color: #ef4444; }

        .error-message {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
        }

        .error-message p {
            color: #991b1b;
            margin: 0;
        }

        .table-container {
            overflow-x: auto;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .management-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
        }

        .management-table thead {
            background: #f3f4f6;
            border-bottom: 2px solid #e5e7eb;
        }

        .management-table th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .management-table td {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
        }

        .management-table tbody tr:hover {
            background: #f9fafb;
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .status-1 { background: #fef3c7; color: #92400e; } /* Pendiente */
        .status-2 { background: #bfdbfe; color: #1e40af; } /* En proceso */
        .status-3 { background: #e9d5ff; color: #6b21a8; } /* Lista para recoger (Purple) */
        .status-4 { background: #bbf7d0; color: #065f46; } /* Completado */
        .status-5 { background: #fecaca; color: #991b1b; } /* Cancelado */

        .actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-icon {
            padding: 0.5rem;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: all 0.2s;
            background: transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
        }

        .btn-view:hover { background: #dbeafe; color: #3b82f6; }
        .btn-edit:hover { background: #fef3c7; color: #d97706; }
        .btn-delete:hover { background: #fee2e2; color: #ef4444; }

        .danger-message {
            text-align: center;
            padding: 1rem;
        }

        .danger-icon {
            color: #ef4444;
            margin-bottom: 1rem;
        }

        .danger-description {
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }

        .modal-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 0;
        }

        .detail-row {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 1rem;
            align-items: start;
        }

        .detail-row label {
            font-weight: 600;
            color: #374151;
        }

        .detail-row span {
            color: #6b7280;
            word-break: break-word;
        }

        .edit-form {
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
            color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-family: inherit;
            transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 768px) {
            .order-management {
                padding: 1rem;
            }

            .management-header {
                flex-direction: column;
                align-items: stretch;
            }

            .filter-bar {
                flex-direction: column;
                max-width: 100%;
            }

            .detail-row {
                grid-template-columns: 1fr;
            }

            .management-table {
                font-size: 0.75rem;
            }

            .management-table th,
            .management-table td {
                padding: 0.75rem 0.5rem;
            }
        }
    `]
})
export class OrderManagementComponent implements OnInit, OnDestroy {
    readonly facade = inject(OrderManagementFacade);

    // Configuración dinámica del modal
    getEditModalConfig(): ModalConfig {
        const isNew = !this.facade.editingOrder()?.id;
        return {
            type: 'edit',
            title: isNew ? 'Crear Pedido' : 'Editar Pedido',
            subtitle: isNew ? 'Ingresa los datos del nuevo pedido' : 'Modifica los datos del pedido',
            actionLabel: isNew ? 'Crear' : 'Guardar',
            isDangerous: false,
            isLoading: this.facade.isUpdating(),
            maxWidth: '600px'
        };
    }

    ngOnInit(): void {
        this.facade.loadOrders();
    }

    ngOnDestroy(): void {
        this.facade.resetState();
    }

    onSearchChange(event: Event): void {
        const term = (event.target as HTMLInputElement).value;
        this.facade.setSearchTerm(term);
    }

    onStatusFilterChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        const statusId = value ? parseInt(value) : null;
        this.facade.setStatusFilter(statusId);
    }

    onViewOrder(order: Order): void {
        this.facade.selectOrder(order);
    }

    onEditOrder(order: Order): void {
        this.facade.openEditModal(order);
    }

    onCreateOrder(): void {
        const newOrder: Partial<Order> = {
            id: 0, // ID temporal para indicar creación
            total_amount: 0,
            status_id: 1,
            special_instructions: '',
            order_date: new Date().toISOString()
        };
        this.facade.openEditModal(newOrder as Order);
    }

    onSaveChanges(order: Order): void {
        if (order.id === 0) {
            // Es un nuevo pedido
            const { id, ...createData } = order;
            this.facade.createOrder(createData).subscribe();
        } else {
            this.facade.updateOrder(order.id, order).subscribe();
        }
    }

    onDeleteOrder(orderId: number): void {
        this.facade.openDeleteModal(orderId);
    }

    onConfirmDelete(): void {
        const orderId = this.facade.deletingOrderId();
        if (orderId) {
            this.facade.deleteOrder(orderId).subscribe();
        }
    }

    getStatusName(statusId: number): string {
        const status = this.facade.statuses().find(s => s.id === statusId);
        return status ? status.status_name : 'Desconocido';
    }
}
