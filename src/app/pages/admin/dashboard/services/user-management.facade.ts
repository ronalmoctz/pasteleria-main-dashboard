import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { User, UserService } from '../../../../core/services/api/user.service';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Modelo de estado para User Management
 */
export interface UserManagementState {
    users: User[];
    selectedUser: User | null;
    editingUser: User | null;
    deletingUserId: string | null;
    isLoading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    searchTerm: string;
    roleFilter: string;
    statusFilter: string;
}

/**
 * Facade para User Management
 * 
 * Responsabilidad: Coordinar UserService, NotificationService y estado local
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo coordina operaciones de usuarios
 * - Open/Closed: Fácil extender con nuevas operaciones
 * - Dependency Inversion: Depende de servicios, no de componentes
 */
@Injectable({
    providedIn: 'root'
})
export class UserManagementFacade {
    private readonly userService = inject(UserService);
    private readonly notificationService = inject(NotificationService);

    // Estado
    private readonly state = signal<UserManagementState>({
        users: [],
        selectedUser: null,
        editingUser: null,
        deletingUserId: null,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        searchTerm: '',
        roleFilter: '',
        statusFilter: ''
    });

    // Computed signals
    readonly users = computed(() => this.state().users);
    readonly selectedUser = computed(() => this.state().selectedUser);
    readonly editingUser = computed(() => this.state().editingUser);
    readonly deletingUserId = computed(() => this.state().deletingUserId);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isUpdating = computed(() => this.state().isUpdating);
    readonly isDeleting = computed(() => this.state().isDeleting);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);
    readonly roleFilter = computed(() => this.state().roleFilter);
    readonly statusFilter = computed(() => this.state().statusFilter);

    // Usuarios filtrados
    readonly filteredUsers = computed(() => {
        const users = this.users();
        const search = this.searchTerm().toLowerCase();
        const role = this.roleFilter();
        const status = this.statusFilter();

        return users.filter(user => {
            const matchesSearch = !search ||
                user.email.toLowerCase().includes(search) ||
                user.first_name.toLowerCase().includes(search) ||
                user.last_name.toLowerCase().includes(search);

            const matchesRole = !role || user.role === role;

            const matchesStatus = !status ||
                (status === 'active' ? user.is_active : !user.is_active);

            return matchesSearch && matchesRole && matchesStatus;
        });
    });

    /**
     * Carga todos los usuarios
     */
    loadUsers(): void {
        this.setStateProperty('isLoading', true);
        this.setStateProperty('error', null);

        this.userService.getAllUsers().pipe(
            tap((response: any) => {
                const users = response.data || response || [];
                this.setStateProperty('users', Array.isArray(users) ? users : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                const message = error?.error?.message || 'Error cargando usuarios';
                this.setStateProperty('error', message);
                this.setStateProperty('isLoading', false);
                this.notificationService.error('Error', message);
                return of([]);
            })
        ).subscribe();
    }

    /**
     * Abre el modal de detalles
     */
    selectUser(user: User): void {
        this.setStateProperty('selectedUser', user);
    }

    /**
     * Cierra el modal de detalles
     */
    closeUserDetail(): void {
        this.setStateProperty('selectedUser', null);
    }

    /**
     * Abre el modal de edición
     */
    openEditModal(user: User): void {
        this.setStateProperty('editingUser', user);
    }

    /**
     * Cierra el modal de edición
     */
    closeEditModal(): void {
        this.setStateProperty('editingUser', null);
    }

    /**
     * Abre el modal de confirmación de eliminar
     */
    openDeleteConfirm(userId: string): void {
        this.setStateProperty('deletingUserId', userId);
    }

    /**
     * Cierra el modal de eliminar
     */
    closeDeleteConfirm(): void {
        this.setStateProperty('deletingUserId', null);
    }

    /**
     * Actualiza un usuario
     */
    /**
     * Crea un nuevo usuario
     */
    createUser(userData: Partial<User>): Observable<User> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.userService.createUser(userData as any).pipe(
                tap((response: any) => {
                    const newUser = response.data || response;
                    this.setStateProperty('users', [...this.state().users, newUser]);
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Usuario creado', 'El nuevo usuario ha sido registrado correctamente');
                    observer.next(newUser);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error creando usuario';
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
     * Actualiza un usuario existente
     */
    updateUser(userId: string, updates: Partial<User>): Observable<User> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.userService.updateUser(userId, updates as any).pipe(
                tap((response: any) => {
                    const updatedUser = response.data || response;
                    this.setStateProperty('users',
                        this.state().users.map(u => u.id === userId ? updatedUser : u)
                    );
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Usuario actualizado', 'Los cambios se han guardado correctamente');
                    observer.next(updatedUser);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error actualizando usuario';
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
     * Elimina un usuario
     */
    deleteUser(userId: string): Observable<void> {
        this.setStateProperty('isDeleting', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.userService.deleteUser(userId).pipe(
                tap(() => {
                    this.setStateProperty('users',
                        this.state().users.filter(u => u.id !== userId)
                    );
                    this.setStateProperty('isDeleting', false);
                    this.closeDeleteConfirm();
                    this.notificationService.success('Usuario eliminado', 'El usuario ha sido eliminado correctamente');
                    observer.next();
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error eliminando usuario';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isDeleting', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }    /**
     * Actualiza el término de búsqueda
     */
    setSearchTerm(term: string): void {
        this.setStateProperty('searchTerm', term);
    }

    /**
     * Actualiza el filtro de rol
     */
    setRoleFilter(role: string): void {
        this.setStateProperty('roleFilter', role);
    }

    /**
     * Actualiza el filtro de estado
     */
    setStatusFilter(status: string): void {
        this.setStateProperty('statusFilter', status);
    }

    /**
     * Actualiza una propiedad del estado
     */
    private setStateProperty<K extends keyof UserManagementState>(
        key: K,
        value: UserManagementState[K]
    ): void {
        this.state.update(currentState => ({
            ...currentState,
            [key]: value
        }));
    }

    /**
     * Reinicia el estado
     */
    resetState(): void {
        this.state.set({
            users: [],
            selectedUser: null,
            editingUser: null,
            deletingUserId: null,
            isLoading: false,
            isUpdating: false,
            isDeleting: false,
            error: null,
            searchTerm: '',
            roleFilter: '',
            statusFilter: ''
        });
    }
}
