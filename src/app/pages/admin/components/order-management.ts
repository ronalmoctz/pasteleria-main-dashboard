import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderManagementFacade } from '../dashboard/services/order-management.facade';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { Order } from '../../../core/services/api/order.service';

@Component({
    selector: 'app-order-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="order-management">
            <!-- Header -->
            <div class="management-header">
                <h2>📦 Gestión de Pedidos</h2>
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
                        <option value="1">Pendiente</option>
                        <option value="2">En proceso</option>
                        <option value="3">Completado</option>
                        <option value="4">Cancelado</option>
                    </select>
                </div>
            </div>

            <!-- Loading state -->
            @if (facade.isLoading()) {
                <div class="loading">Cargando pedidos...</div>
            }

            <!-- Error state -->
            @if (facade.error()) {
                <div class="error-message">{{ facade.error() }}</div>
            }

            <!-- Empty state -->
            @if (!facade.isLoading() && facade.orders().length === 0) {
                <div class="empty-state">
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
                                        <button class="btn-view" (click)="onViewOrder(order)" title="Ver">👁️</button>
                                        <button class="btn-edit" (click)="onEditOrder(order)" title="Editar">✏️</button>
                                        <button class="btn-delete" (click)="onDeleteOrder(order.id)" title="Eliminar">🗑️</button>
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
                [config]="{
                    type: 'edit',
                    title: 'Editar Pedido',
                    subtitle: 'Modifica los datos del pedido',
                    actionLabel: 'Guardar',
                    isDangerous: false,
                    isLoading: facade.isUpdating(),
                    maxWidth: '600px'
                }"
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
                            <option value="1">Pendiente</option>
                            <option value="2">En proceso</option>
                            <option value="3">Completado</option>
                            <option value="4">Cancelado</option>
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
        }

        .management-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #1f2937;
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
            padding: 2rem;
            background: #f9fafb;
            border-radius: 0.75rem;
            color: #6b7280;
        }

        .error-message {
            color: #dc2626;
            background: #fef2f2;
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
        .status-3 { background: #bbf7d0; color: #065f46; } /* Completado */
        .status-4 { background: #fecaca; color: #991b1b; } /* Cancelado */

        .actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-view, .btn-edit, .btn-delete {
            padding: 0.5rem 0.75rem;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
            background: transparent;
        }

        .btn-view:hover {
            background: #dbeafe;
        }

        .btn-edit:hover {
            background: #fef3c7;
        }

        .btn-delete:hover {
            background: #fee2e2;
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

    onSaveChanges(order: Order): void {
        this.facade.updateOrder(order.id, order).subscribe();
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
        const statusMap: { [key: number]: string } = {
            1: 'Pendiente',
            2: 'En proceso',
            3: 'Completado',
            4: 'Cancelado'
        };
        return statusMap[statusId] || 'Desconocido';
    }
}
