import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface Ingredient {
    id: number;
    name: string;
    stock_quantity: number;
    unit: 'g' | 'kg' | 'ml' | 'l' | 'unit';
    created_at: string;
    updated_at?: string;
}

export interface IngredientsResponse {
    success: boolean;
    data: Ingredient[];
    message: string;
}

export interface IngredientResponse {
    success: boolean;
    data: Ingredient;
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

    /**
     * Crea un nuevo ingrediente
     */
    create(ingredientData: Partial<Ingredient>): Observable<IngredientResponse> {
        return this.httpClient.post<IngredientResponse>(
            `${this.apiBaseUrl}/ingredients`,
            ingredientData
        );
    }

    /**
     * Actualiza un ingrediente existente
     */
    update(ingredientId: number, updates: Partial<Ingredient>): Observable<IngredientResponse> {
        return this.httpClient.put<IngredientResponse>(
            `${this.apiBaseUrl}/ingredients/${ingredientId}`,
            updates
        );
    }

    /**
     * Elimina un ingrediente
     */
    delete(ingredientId: number): Observable<IngredientResponse> {
        return this.httpClient.delete<IngredientResponse>(
            `${this.apiBaseUrl}/ingredients/${ingredientId}`
        );
    }
}
