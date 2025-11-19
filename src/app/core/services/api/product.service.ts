import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category_id: string;
    created_at: string;
    updated_at?: string;
}

export interface ProductResponse {
    success: boolean;
    data: Product;
    message: string;
}

export interface ProductsListResponse {
    success: boolean;
    data: Product[];
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly httpClient = inject(HttpClient);
    private readonly apiBaseUrl = API_CONFIG.apiV1;

    /**
     * Obtiene todos los productos (público)
     */
    getAllProducts(): Observable<ProductsListResponse> {
        return this.httpClient.get<ProductsListResponse>(
            `${this.apiBaseUrl}/products`
        );
    }

    /**
     * Obtiene un producto específico por ID (requiere rol admin)
     */
    getProductById(productId: string): Observable<ProductResponse> {
        return this.httpClient.get<ProductResponse>(
            `${this.apiBaseUrl}/products/${productId}`
        );
    }

    /**
     * Busca productos usando GraphQL (búsqueda binaria optimizada)
     */
    searchProducts(query: string): Observable<any> {
        const graphqlQuery = {
            query: `
        query SearchProducts($search: String!) {
          searchProducts(search: $search) {
            id
            name
            description
            price
            category_id
            created_at
          }
        }
      `,
            variables: { search: query }
        };

        return this.httpClient.post<any>(
            API_CONFIG.graphql,
            graphqlQuery
        );
    }

    /**
     * Actualiza un producto existente
     */
    updateProduct(productId: string, updates: Partial<Product>): Observable<ProductResponse> {
        return this.httpClient.put<ProductResponse>(
            `${this.apiBaseUrl}/products/${productId}`,
            updates
        );
    }

    /**
     * Elimina un producto
     */
    deleteProduct(productId: string): Observable<ProductResponse> {
        return this.httpClient.delete<ProductResponse>(
            `${this.apiBaseUrl}/products/${productId}`
        );
    }
}
