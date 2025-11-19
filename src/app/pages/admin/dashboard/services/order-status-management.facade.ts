import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrderStatus, OrderService } from '../../../../core/services/api/order.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface OrderStatusManagementState {
    statuses: OrderStatus[];
    selectedStatus: OrderStatus | null;
    editingStatus: OrderStatus | null;
    deletingStatusId: number | null;
    isLoading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    searchTerm: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderStatusManagementFacade {
    private readonly orderService = inject(OrderService);
    private readonly notificationService = inject(NotificationService);

    private readonly state = signal<OrderStatusManagementState>({
        statuses: [],
        selectedStatus: null,
        editingStatus: null,
        deletingStatusId: null,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        searchTerm: ''
    });

    readonly statuses = computed(() => this.state().statuses);
    readonly selectedStatus = computed(() => this.state().selectedStatus);
    readonly editingStatus = computed(() => this.state().editingStatus);
    readonly deletingStatusId = computed(() => this.state().deletingStatusId);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isUpdating = computed(() => this.state().isUpdating);
    readonly isDeleting = computed(() => this.state().isDeleting);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);

    readonly filteredStatuses = computed(() => {
        const statuses = this.statuses();
        const searchTerm = this.searchTerm().toLowerCase();

        if (!searchTerm) return statuses;

        return statuses.filter(status =>
            status.status_name.toLowerCase().includes(searchTerm)
        );
    });

    /**
     * Carga la lista de estados de pedido
     */
    loadOrderStatuses(): void {
        this.setStateProperty('isLoading', true);
        this.setStateProperty('error', null);

        this.orderService.getAllOrderStatuses().pipe(
            tap((response: any) => {
                const statuses = response.data || response;
                this.setStateProperty('statuses', Array.isArray(statuses) ? statuses : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                const message = error?.error?.message || 'Error cargando estados de pedido';
                this.setStateProperty('error', message);
                this.setStateProperty('isLoading', false);
                this.notificationService.error('Error', message);
                return of(null);
            })
        ).subscribe();
    }

    /**
     * Selecciona un estado
     */
    selectOrderStatus(status: OrderStatus): void {
        this.setStateProperty('selectedStatus', status);
    }

    /**
     * Abre el modal de edición
     */
    openEditModal(status: OrderStatus): void {
        this.setStateProperty('editingStatus', { ...status });
    }

    /**
     * Cierra el modal de edición
     */
    closeEditModal(): void {
        this.setStateProperty('editingStatus', null);
    }

    /**
     * Abre el modal de eliminación
     */
    openDeleteModal(statusId: number): void {
        this.setStateProperty('deletingStatusId', statusId);
    }

    /**
     * Cierra el modal de eliminación
     */
    closeDeleteModal(): void {
        this.setStateProperty('deletingStatusId', null);
    }

    /**
     * Actualiza un estado de pedido
     */
    updateOrderStatus(statusId: number, updates: Partial<OrderStatus>): Observable<OrderStatus> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.orderService.updateOrderStatus(statusId, updates).pipe(
                map((response: any) => response.data || response),
                tap((updatedStatus: OrderStatus) => {
                    this.setStateProperty('statuses',
                        this.state().statuses.map(s => s.id === statusId ? updatedStatus : s)
                    );
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Estado actualizado', 'Los cambios se han guardado correctamente');
                    observer.next(updatedStatus);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error actualizando estado';
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
     * Elimina un estado de pedido
     */
    deleteOrderStatus(statusId: number): Observable<void> {
        this.setStateProperty('isDeleting', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.orderService.deleteOrderStatus(statusId).pipe(
                tap(() => {
                    this.setStateProperty('statuses',
                        this.state().statuses.filter(s => s.id !== statusId)
                    );
                    this.setStateProperty('isDeleting', false);
                    this.closeDeleteModal();
                    this.notificationService.success('Estado eliminado', 'El estado ha sido eliminado correctamente');
                    observer.next();
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error eliminando estado';
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
     * Limpia el estado
     */
    resetState(): void {
        this.state.set({
            statuses: [],
            selectedStatus: null,
            editingStatus: null,
            deletingStatusId: null,
            isLoading: false,
            isUpdating: false,
            isDeleting: false,
            error: null,
            searchTerm: ''
        });
    }

    /**
     * Actualiza una propiedad del estado
     */
    private setStateProperty<K extends keyof OrderStatusManagementState>(
        key: K,
        value: OrderStatusManagementState[K]
    ): void {
        this.state.update(current => ({
            ...current,
            [key]: value
        }));
    }
}
