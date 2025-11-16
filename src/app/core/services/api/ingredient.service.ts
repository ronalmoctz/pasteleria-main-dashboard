import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface Ingredient {
    id: string;
    name: string;
    description?: string;
    measurement_unit?: string;
    created_at: string;
    updated_at?: string;
}

export interface IngredientsResponse {
    success: boolean;
    data: Ingredient[];
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class IngredientService {
    private readonly httpClient = inject(HttpClient);
    private readonly apiBaseUrl = API_CONFIG.apiV1;

    /**
     * Obtiene todos los ingredientes (público)
     */
    getAllIngredients(): Observable<IngredientsResponse> {
        return this.httpClient.get<IngredientsResponse>(
            `${this.apiBaseUrl}/ingredients`
        );
    }
}
