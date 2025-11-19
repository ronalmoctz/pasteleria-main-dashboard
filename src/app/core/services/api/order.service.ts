import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price_per_unit: number;
}

export interface Order {
    id: number;
    user_id: number;
    status_id: number;
    order_date: string;
    total_amount: number;
    special_instructions?: string;
    completed_at?: string;
    items?: OrderItem[];
}

export interface OrderResponse {
    success: boolean;
    data: Order;
    message: string;
}

export interface OrdersResponse {
    success: boolean;
    data: Order[];
    message: string;
}

export interface OrderStatus {
    id: number;
    status_name: string;
}

export interface OrderStatusResponse {
    success: boolean;
    data: OrderStatus;
    message: string;
}

export interface OrderStatusesResponse {
    success: boolean;
    data: OrderStatus[];
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly httpClient = inject(HttpClient);
    private readonly apiBaseUrl = API_CONFIG.apiV1;

    /**
     * Obtiene todos los pedidos
     */
    getAllOrders(): Observable<OrdersResponse> {
        return this.httpClient.get<OrdersResponse>(
            `${this.apiBaseUrl}/orders`
        );
    }

    /**
     * Obtiene un pedido específico
     */
    getOrderById(orderId: number): Observable<OrderResponse> {
        return this.httpClient.get<OrderResponse>(
            `${this.apiBaseUrl}/orders/${orderId}`
        );
    }

    /**
     * Crea un nuevo pedido
     */
    createOrder(order: Partial<Order>): Observable<OrderResponse> {
        return this.httpClient.post<OrderResponse>(
            `${this.apiBaseUrl}/orders`,
            order
        );
    }

    /**
     * Actualiza un pedido existente
     */
    updateOrder(orderId: number, updates: Partial<Order>): Observable<OrderResponse> {
        return this.httpClient.put<OrderResponse>(
            `${this.apiBaseUrl}/orders/${orderId}`,
            updates
        );
    }

    /**
     * Elimina un pedido
     */
    deleteOrder(orderId: number): Observable<OrderResponse> {
        return this.httpClient.delete<OrderResponse>(
            `${this.apiBaseUrl}/orders/${orderId}`
        );
    }

    /**
     * Obtiene todos los estados de pedido
     */
    getAllOrderStatuses(): Observable<OrderStatusesResponse> {
        return this.httpClient.get<OrderStatusesResponse>(
            `${this.apiBaseUrl}/order-statuses`
        );
    }

    /**
     * Obtiene un estado de pedido específico
     */
    getOrderStatusById(statusId: number): Observable<OrderStatusResponse> {
        return this.httpClient.get<OrderStatusResponse>(
            `${this.apiBaseUrl}/order-statuses/${statusId}`
        );
    }

    /**
     * Crea un nuevo estado de pedido
     */
    createOrderStatus(status: Partial<OrderStatus>): Observable<OrderStatusResponse> {
        return this.httpClient.post<OrderStatusResponse>(
            `${this.apiBaseUrl}/order-statuses`,
            status
        );
    }

    /**
     * Actualiza un estado de pedido
     */
    updateOrderStatus(statusId: number, updates: Partial<OrderStatus>): Observable<OrderStatusResponse> {
        return this.httpClient.put<OrderStatusResponse>(
            `${this.apiBaseUrl}/order-statuses/${statusId}`,
            updates
        );
    }

    /**
     * Elimina un estado de pedido
     */
    deleteOrderStatus(statusId: number): Observable<OrderStatusResponse> {
        return this.httpClient.delete<OrderStatusResponse>(
            `${this.apiBaseUrl}/order-statuses/${statusId}`
        );
    }
}
