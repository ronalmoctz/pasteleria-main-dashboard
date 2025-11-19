/**
 * Modelo genérico para CRUD
 * Define interfaces estándar para operaciones Create, Read, Update, Delete
 */

/**
 * Respuesta de CRUD genérica
 */
export interface CrudResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Respuesta de lista paginada
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

/**
 * Interfaz base para entidades
 */
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

/**
 * Estados posibles de una operación CRUD
 */
export enum CrudState {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}

/**
 * Opciones de configuración del servicio CRUD
 */
export interface CrudServiceConfig {
    baseEndpoint: string;
    cacheDuration?: number; // milisegundos
    autoRefetch?: boolean;
}
