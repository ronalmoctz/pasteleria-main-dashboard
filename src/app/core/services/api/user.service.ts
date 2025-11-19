import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface User {
    id: string | number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: 'admin' | 'customer';
    is_active?: boolean;
    created_at: string;
    updated_at?: string;
    last_seen?: string | null;
}

export interface UserStatus {
    id: string;
    is_online: boolean;
    last_seen?: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
    message: string;
}

export interface UsersListResponse {
    success: boolean;
    data: User[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message: string;
}

export interface UserStatusResponse {
    success: boolean;
    data: UserStatus;
    message: string;
}

export interface UpdateUserDTO {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly httpClient = inject(HttpClient);
    private readonly apiBaseUrl = `${API_CONFIG.baseUrl}/api`;

    /**
     * Obtiene todos los usuarios con paginación y filtros (requiere rol admin)
     */
    getAllUsers(page: number = 1, limit: number = 10, filters?: { role?: string; is_active?: boolean }): Observable<UsersListResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (filters?.role) {
            params = params.set('role', filters.role);
        }

        if (filters?.is_active !== undefined) {
            params = params.set('is_active', filters.is_active.toString());
        }

        return this.httpClient.get<UsersListResponse>(
            `${this.apiBaseUrl}/users`,
            { params }
        );
    }

    /**
     * Obtiene un usuario específico por ID
     */
    getUserById(userId: string): Observable<UserResponse> {
        return this.httpClient.get<UserResponse>(
            `${this.apiBaseUrl}/users/${userId}`
        );
    }

    /**
     * Obtiene un usuario específico por email (requiere rol admin)
     */
    getUserByEmail(email: string): Observable<UserResponse> {
        return this.httpClient.get<UserResponse>(
            `${this.apiBaseUrl}/users/email/${email}`
        );
    }

    /**
     * Obtiene el estado online/offline del usuario
     */
    getUserStatus(userId: string): Observable<UserStatusResponse> {
        return this.httpClient.get<UserStatusResponse>(
            `${this.apiBaseUrl}/users/${userId}/status`
        );
    }

    /**
     * Actualiza datos del usuario (PATCH)
     */
    updateUser(userId: string, updateData: UpdateUserDTO): Observable<UserResponse> {
        return this.httpClient.patch<UserResponse>(
            `${this.apiBaseUrl}/users/${userId}`,
            updateData
        );
    }

    /**
     * Crea un nuevo usuario (POST) - requiere rol admin
     */
    createUser(userData: Partial<User>): Observable<UserResponse> {
        return this.httpClient.post<UserResponse>(
            `${this.apiBaseUrl}/users`,
            userData
        );
    }

    /**
     * Desactiva un usuario (soft delete) - requiere rol admin
     */
    deleteUser(userId: string): Observable<UserResponse> {
        return this.httpClient.delete<UserResponse>(
            `${this.apiBaseUrl}/users/${userId}`
        );
    }
}
