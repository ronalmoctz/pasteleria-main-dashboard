import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    created_at: string;
    updated_at?: string;
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
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
}
