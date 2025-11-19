import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Order, OrderService, OrderStatus } from '../../../../core/services/api/order.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface OrderManagementState {
    orders: Order[];
    statuses: OrderStatus[];
    selectedOrder: Order | null;
    editingOrder: Order | null;
    deletingOrderId: number | null;
    isLoading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    searchTerm: string;
    statusFilter: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class OrderManagementFacade {
    private readonly orderService = inject(OrderService);
    private readonly notificationService = inject(NotificationService);

    private readonly state = signal<OrderManagementState>({
        orders: [],
        statuses: [],
        selectedOrder: null,
        editingOrder: null,
        deletingOrderId: null,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        searchTerm: '',
        statusFilter: null
    });

    readonly orders = computed(() => this.state().orders);
    readonly statuses = computed(() => this.state().statuses);
    readonly selectedOrder = computed(() => this.state().selectedOrder);
    readonly editingOrder = computed(() => this.state().editingOrder);
    readonly deletingOrderId = computed(() => this.state().deletingOrderId);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isUpdating = computed(() => this.state().isUpdating);
    readonly isDeleting = computed(() => this.state().isDeleting);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);
    readonly statusFilter = computed(() => this.state().statusFilter);

    readonly filteredOrders = computed(() => {
        const orders = this.orders();
        const searchTerm = this.searchTerm().toLowerCase();
        const statusFilter = this.statusFilter();

        return orders.filter(order => {
            const matchesSearch = !searchTerm ||
                order.id.toString().includes(searchTerm) ||
                (order.special_instructions?.toLowerCase() || '').includes(searchTerm);

            const matchesStatus = !statusFilter || order.status_id === statusFilter;

            return matchesSearch && matchesStatus;
        });
    });

    /**
     * Carga la lista de pedidos y estados
     */
    loadOrders(): void {
        this.setStateProperty('isLoading', true);
        this.setStateProperty('error', null);

        // Load statuses first if empty
        if (this.state().statuses.length === 0) {
            this.loadStatuses();
        }

        this.orderService.getAllOrders().pipe(
            tap((response: any) => {
                const orders = response.data || response;
                this.setStateProperty('orders', Array.isArray(orders) ? orders : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                const message = error?.error?.message || 'Error cargando pedidos';
                this.setStateProperty('error', message);
                this.setStateProperty('isLoading', false);
                this.notificationService.error('Error', message);
                return of(null);
            })
        ).subscribe();
    }

    /**
     * Carga los estados de los pedidos
     */
    loadStatuses(): void {
        this.orderService.getAllOrderStatuses().pipe(
            tap((response: any) => {
                const statuses = response.data || response;
                this.setStateProperty('statuses', Array.isArray(statuses) ? statuses : []);
            }),
            catchError(error => {
                console.error('Error loading statuses', error);
                return of(null);
            })
        ).subscribe();
    }

    /**
     * Selecciona un pedido
     */
    selectOrder(order: Order | null): void {
        this.setStateProperty('selectedOrder', order);
    }

    /**
     * Abre el modal de edición
     */
    openEditModal(order: Order): void {
        this.setStateProperty('editingOrder', { ...order });
    }

    /**
     * Cierra el modal de edición
     */
    closeEditModal(): void {
        this.setStateProperty('editingOrder', null);
    }

    /**
     * Abre el modal de eliminación
     */
    openDeleteModal(orderId: number): void {
        this.setStateProperty('deletingOrderId', orderId);
    }

    /**
     * Cierra el modal de eliminación
     */
    closeDeleteModal(): void {
        this.setStateProperty('deletingOrderId', null);
    }

    /**
     * Crea un nuevo pedido
     */
    createOrder(order: Partial<Order>): Observable<Order> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.orderService.createOrder(order).pipe(
                map((response: any) => response.data || response),
                tap((newOrder: Order) => {
                    this.setStateProperty('orders', [newOrder, ...this.state().orders]);
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Pedido creado', 'El pedido ha sido creado correctamente');
                    observer.next(newOrder);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error creando pedido';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    /**
     * Actualiza un pedido
     */
    updateOrder(orderId: number, updates: Partial<Order>): Observable<Order> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.orderService.updateOrder(orderId, updates).pipe(
                map((response: any) => response.data || response),
                tap((updatedOrder: Order) => {
                    this.setStateProperty('orders',
                        this.state().orders.map(o => o.id === orderId ? updatedOrder : o)
                    );
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Pedido actualizado', 'Los cambios se han guardado correctamente');
                    observer.next(updatedOrder);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error actualizando pedido';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    /**
     * Elimina un pedido
     */
    deleteOrder(orderId: number): Observable<void> {
        this.setStateProperty('isDeleting', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.orderService.deleteOrder(orderId).pipe(
                tap(() => {
                    this.setStateProperty('orders',
                        this.state().orders.filter(o => o.id !== orderId)
                    );
                    this.setStateProperty('isDeleting', false);
                    this.closeDeleteModal();
                    this.notificationService.success('Pedido eliminado', 'El pedido ha sido eliminado correctamente');
                    observer.next();
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error eliminando pedido';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isDeleting', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    /**
     * Establece el término de búsqueda
     */
    setSearchTerm(term: string): void {
        this.setStateProperty('searchTerm', term);
    }

    /**
     * Establece el filtro de estado
     */
    setStatusFilter(statusId: number | null): void {
        this.setStateProperty('statusFilter', statusId);
    }

    /**
     * Limpia el estado
     */
    resetState(): void {
        this.state.set({
            orders: [],
            statuses: [],
            selectedOrder: null,
            editingOrder: null,
            deletingOrderId: null,
            isLoading: false,
            isUpdating: false,
            isDeleting: false,
            error: null,
            searchTerm: '',
            statusFilter: null
        });
    }

    /**
     * Actualiza una propiedad del estado
     */
    private setStateProperty<K extends keyof OrderManagementState>(
        key: K,
        value: OrderManagementState[K]
    ): void {
        this.state.update(current => ({
            ...current,
            [key]: value
        }));
    }
}
