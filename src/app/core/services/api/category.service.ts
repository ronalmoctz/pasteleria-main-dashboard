import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface Category {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at?: string;
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
    message: string;
}

export interface CategoryResponse {
    success: boolean;
    data: Category;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly httpClient = inject(HttpClient);
    private readonly apiBaseUrl = API_CONFIG.apiV1;

    /**
     * Obtiene todas las categorías (público)
     */
    getAllCategories(): Observable<CategoriesResponse> {
        return this.httpClient.get<CategoriesResponse>(
            `${this.apiBaseUrl}/categories`
        );
    }

    /**
     * Crea una nueva categoría
     */
    create(categoryData: Partial<Category>): Observable<CategoryResponse> {
        return this.httpClient.post<CategoryResponse>(
            `${this.apiBaseUrl}/categories`,
            categoryData
        );
    }

    /**
     * Actualiza una categoría existente
     */
    update(categoryId: number, updates: Partial<Category>): Observable<CategoryResponse> {
        return this.httpClient.put<CategoryResponse>(
            `${this.apiBaseUrl}/categories/${categoryId}`,
            updates
        );
    }

    /**
     * Elimina una categoría
     */
    delete(categoryId: number): Observable<CategoryResponse> {
        return this.httpClient.delete<CategoryResponse>(
            `${this.apiBaseUrl}/categories/${categoryId}`
        );
    }
}
