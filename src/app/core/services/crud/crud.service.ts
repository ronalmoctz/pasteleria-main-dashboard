import { Injectable, Signal, signal, computed } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CrudState, CrudResponse, CrudServiceConfig } from '../../models/crud.model';

/**
 * Servicio CRUD Genérico
 * 
 * Proporciona operaciones CRUD reutilizables para cualquier entidad
 * Implementa principios SOLID:
 * - Single Responsibility: Solo maneja CRUD
 * - Open/Closed: Extensible para nuevas entidades
 * - Liskov Substitution: Puede ser subclaseado
 * - Interface Segregation: Interfaz mínima
 * - Dependency Inversion: Inyecta HttpClient
 * 
 * Características:
 * - State management con Signals
 * - Caché opcional
 * - Error handling centralizado
 */
@Injectable()
export abstract class CrudService<T extends { id: string }> {
    protected http = new (this.constructor as any).prototype.http as HttpClient;
    protected config!: CrudServiceConfig;

    // Estado interno
    private readonly items = signal<T[]>([]);
    private readonly state = signal<CrudState>(CrudState.IDLE);
    private readonly error = signal<string | null>(null);
    private readonly lastUpdate = signal<number>(0);

    // Eventos para notificaciones
    protected itemCreated$ = new Subject<T>();
    protected itemUpdated$ = new Subject<T>();
    protected itemDeleted$ = new Subject<string>();

    // Computed signals
    readonly isLoading = computed(() => this.state() === CrudState.LOADING);
    readonly hasError = computed(() => this.error() !== null);
    readonly itemsSnapshot = this.items.asReadonly();
    readonly errorMessage = this.error.asReadonly();

    /**
     * Obtiene todos los items
     */
    getAll(): Observable<T[]> {
        this.setLoading();
        return new Observable(observer => {
            this.http.get<CrudResponse<T[]>>(`${this.config.baseEndpoint}`)
                .subscribe({
                    next: (response) => {
                        const data = response.data || [];
                        this.items.set(data);
                        this.lastUpdate.set(Date.now());
                        this.clearError();
                        observer.next(data);
                        observer.complete();
                    },
                    error: (err) => {
                        this.handleError(err);
                        observer.error(err);
                    }
                });
        });
    }

    /**
     * Obtiene un item por ID
     */
    getById(id: string): Observable<T> {
        this.setLoading();
        return new Observable(observer => {
            this.http.get<CrudResponse<T>>(`${this.config.baseEndpoint}/${id}`)
                .subscribe({
                    next: (response) => {
                        const data = response.data!;
                        this.updateItemInCache(data);
                        this.clearError();
                        observer.next(data);
                        observer.complete();
                    },
                    error: (err) => {
                        this.handleError(err);
                        observer.error(err);
                    }
                });
        });
    }

    /**
     * Crea un nuevo item
     */
    create(payload: Omit<T, 'id' | 'created_at' | 'updated_at'>): Observable<T> {
        this.setLoading();
        return new Observable(observer => {
            this.http.post<CrudResponse<T>>(`${this.config.baseEndpoint}`, payload)
                .subscribe({
                    next: (response) => {
                        const data = response.data!;
                        this.items.update(items => [...items, data]);
                        this.lastUpdate.set(Date.now());
                        this.clearError();
                        this.itemCreated$.next(data);
                        observer.next(data);
                        observer.complete();
                    },
                    error: (err) => {
                        this.handleError(err);
                        observer.error(err);
                    }
                });
        });
    }

    /**
     * Actualiza un item existente
     */
    update(id: string, payload: Partial<T>): Observable<T> {
        this.setLoading();
        return new Observable(observer => {
            this.http.put<CrudResponse<T>>(`${this.config.baseEndpoint}/${id}`, payload)
                .subscribe({
                    next: (response) => {
                        const data = response.data!;
                        this.updateItemInCache(data);
                        this.lastUpdate.set(Date.now());
                        this.clearError();
                        this.itemUpdated$.next(data);
                        observer.next(data);
                        observer.complete();
                    },
                    error: (err) => {
                        this.handleError(err);
                        observer.error(err);
                    }
                });
        });
    }

    /**
     * Elimina un item
     */
    delete(id: string): Observable<void> {
        this.setLoading();
        return new Observable(observer => {
            this.http.delete<CrudResponse<void>>(`${this.config.baseEndpoint}/${id}`)
                .subscribe({
                    next: () => {
                        this.items.update(items => items.filter(item => item.id !== id));
                        this.lastUpdate.set(Date.now());
                        this.clearError();
                        this.itemDeleted$.next(id);
                        observer.next();
                        observer.complete();
                    },
                    error: (err) => {
                        this.handleError(err);
                        observer.error(err);
                    }
                });
        });
    }

    /**
     * Actualiza el item en caché
     */
    private updateItemInCache(item: T): void {
        const index = this.items().findIndex(i => i.id === item.id);
        if (index !== -1) {
            this.items.update(items => {
                const updated = [...items];
                updated[index] = item;
                return updated;
            });
        } else {
            this.items.update(items => [...items, item]);
        }
    }

    /**
     * Marca como cargando
     */
    protected setLoading(): void {
        this.state.set(CrudState.LOADING);
    }

    /**
     * Maneja errores
     */
    protected handleError(error: any): void {
        const message = error?.error?.message ||
            error?.message ||
            'Error desconocido';
        this.error.set(message);
        this.state.set(CrudState.ERROR);
    }

    /**
     * Limpia el error
     */
    protected clearError(): void {
        this.error.set(null);
        this.state.set(CrudState.SUCCESS);
    }

    /**
     * Reinicia el estado
     */
    resetState(): void {
        this.state.set(CrudState.IDLE);
        this.error.set(null);
    }
}
