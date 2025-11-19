import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Product, ProductService } from '../../../../core/services/api/product.service';
import { Order, OrderService } from '../../../../core/services/api/order.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CustomerDashboardState {
    products: Product[];
    cart: CartItem[];
    isLoading: boolean;
    isCreatingOrder: boolean;
    error: string | null;
    searchTerm: string;
}

@Injectable({
    providedIn: 'root'
})
export class CustomerDashboardFacade {
    private readonly productService = inject(ProductService);
    private readonly orderService = inject(OrderService);
    private readonly authService = inject(AuthService);
    private readonly notificationService = inject(NotificationService);

    private readonly state = signal<CustomerDashboardState>({
        products: [],
        cart: [],
        isLoading: false,
        isCreatingOrder: false,
        error: null,
        searchTerm: ''
    });

    readonly products = computed(() => this.state().products);
    readonly cart = computed(() => this.state().cart);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isCreatingOrder = computed(() => this.state().isCreatingOrder);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);

    readonly filteredProducts = computed(() => {
        const products = this.products();
        const searchTerm = this.searchTerm().toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    });

    readonly cartTotal = computed(() => {
        return this.state().cart.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    });

    readonly cartItemCount = computed(() => {
        return this.state().cart.reduce((count, item) => count + item.quantity, 0);
    });

    loadProducts(): void {
        this.setStateProperty('isLoading', true);
        this.productService.getAllProducts().pipe(
            tap((response: any) => {
                const products = response.data || response;
                this.setStateProperty('products', Array.isArray(products) ? products : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                this.setStateProperty('error', 'Error cargando productos');
                this.setStateProperty('isLoading', false);
                return of(null);
            })
        ).subscribe();
    }

    addToCart(product: Product): void {
        const currentCart = this.state().cart;
        const existingItem = currentCart.find(item => item.product.id === product.id);

        if (existingItem) {
            const updatedCart = currentCart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            this.setStateProperty('cart', updatedCart);
        } else {
            this.setStateProperty('cart', [...currentCart, { product, quantity: 1 }]);
        }
        this.notificationService.success('Producto agregado', `${product.name} agregado al carrito`);
    }

    removeFromCart(productId: string): void {
        const currentCart = this.state().cart;
        this.setStateProperty('cart', currentCart.filter(item => item.product.id !== productId));
    }

    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const currentCart = this.state().cart;
        this.setStateProperty('cart', currentCart.map(item =>
            item.product.id === productId
                ? { ...item, quantity }
                : item
        ));
    }

    clearCart(): void {
        this.setStateProperty('cart', []);
    }

    createOrder(specialInstructions: string): void {
        const user = this.authService.user();
        if (!user) return;

        this.setStateProperty('isCreatingOrder', true);

        const orderData: Partial<Order> = {
            user_id: user.id,
            status_id: 1, // Pendiente
            total_amount: this.cartTotal(),
            special_instructions: specialInstructions,
            // Note: Assuming backend handles items creation or we send them in a specific format
            // For now, we'll put items details in special_instructions if backend doesn't support items array directly in createOrder
            // But ideally we should send items. Let's try to send them if the interface supports it.
            items: this.state().cart.map(item => ({
                product_id: parseInt(item.product.id),
                quantity: item.quantity,
                price_per_unit: item.product.price
            })) as any
        };

        this.orderService.createOrder(orderData).pipe(
            tap(() => {
                this.notificationService.success('Pedido creado', 'Tu pedido ha sido realizado con éxito');
                this.clearCart();
                this.setStateProperty('isCreatingOrder', false);
            }),
            catchError(error => {
                this.notificationService.error('Error', 'No se pudo crear el pedido');
                this.setStateProperty('isCreatingOrder', false);
                return of(null);
            })
        ).subscribe();
    }

    setSearchTerm(term: string): void {
        this.setStateProperty('searchTerm', term);
    }

    private setStateProperty<K extends keyof CustomerDashboardState>(
        key: K,
        value: CustomerDashboardState[K]
    ): void {
        this.state.update(current => ({
            ...current,
            [key]: value
        }));
    }
}
