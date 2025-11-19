import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Product, ProductService } from '../../../../core/services/api/product.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface ProductManagementState {
    products: Product[];
    selectedProduct: Product | null;
    editingProduct: Product | null;
    deletingProductId: string | null;
    isLoading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    searchTerm: string;
    categoryFilter: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductManagementFacade {
    private readonly productService = inject(ProductService);
    private readonly notificationService = inject(NotificationService);

    private readonly state = signal<ProductManagementState>({
        products: [],
        selectedProduct: null,
        editingProduct: null,
        deletingProductId: null,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        searchTerm: '',
        categoryFilter: ''
    });

    readonly products = computed(() => this.state().products);
    readonly selectedProduct = computed(() => this.state().selectedProduct);
    readonly editingProduct = computed(() => this.state().editingProduct);
    readonly deletingProductId = computed(() => this.state().deletingProductId);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isUpdating = computed(() => this.state().isUpdating);
    readonly isDeleting = computed(() => this.state().isDeleting);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);
    readonly categoryFilter = computed(() => this.state().categoryFilter);

    readonly filteredProducts = computed(() => {
        const products = this.products();
        const search = this.searchTerm().toLowerCase();
        const category = this.categoryFilter();

        return products.filter(product => {
            const matchesSearch = !search ||
                product.name.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search);

            const matchesCategory = !category || product.category_id === category;

            return matchesSearch && matchesCategory;
        });
    });

    loadProducts(): void {
        this.setStateProperty('isLoading', true);
        this.setStateProperty('error', null);

        this.productService.getAllProducts().pipe(
            tap((response: any) => {
                const products = response.data || response || [];
                this.setStateProperty('products', Array.isArray(products) ? products : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                const message = error?.error?.message || 'Error cargando productos';
                this.setStateProperty('error', message);
                this.setStateProperty('isLoading', false);
                this.notificationService.error('Error', message);
                return of([]);
            })
        ).subscribe();
    }

    selectProduct(product: Product): void {
        this.setStateProperty('selectedProduct', product);
    }

    closeProductDetail(): void {
        this.setStateProperty('selectedProduct', null);
    }

    openEditModal(product: Product): void {
        this.setStateProperty('editingProduct', product);
    }

    closeEditModal(): void {
        this.setStateProperty('editingProduct', null);
    }

    openDeleteConfirm(productId: string): void {
        this.setStateProperty('deletingProductId', productId);
    }

    closeDeleteConfirm(): void {
        this.setStateProperty('deletingProductId', null);
    }

    updateProduct(productId: string, updates: Partial<Product>): Observable<Product> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.productService.updateProduct(productId, updates).pipe(
                map((response: any) => response.data || response),
                tap((updatedProduct: Product) => {
                    this.setStateProperty('products',
                        this.state().products.map(p => p.id === productId ? updatedProduct : p)
                    );
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Producto actualizado', 'Los cambios se han guardado correctamente');
                    observer.next(updatedProduct);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error actualizando producto';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    deleteProduct(productId: string): Observable<void> {
        this.setStateProperty('isDeleting', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.productService.deleteProduct(productId).pipe(
                tap(() => {
                    this.setStateProperty('products',
                        this.state().products.filter(p => p.id !== productId)
                    );
                    this.setStateProperty('isDeleting', false);
                    this.closeDeleteConfirm();
                    this.notificationService.success('Producto eliminado', 'El producto ha sido eliminado correctamente');
                    observer.next();
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error eliminando producto';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isDeleting', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    setSearchTerm(term: string): void {
        this.setStateProperty('searchTerm', term);
    }

    setCategoryFilter(category: string): void {
        this.setStateProperty('categoryFilter', category);
    }

    private setStateProperty<K extends keyof ProductManagementState>(
        key: K,
        value: ProductManagementState[K]
    ): void {
        this.state.update(currentState => ({
            ...currentState,
            [key]: value
        }));
    }

    resetState(): void {
        this.state.set({
            products: [],
            selectedProduct: null,
            editingProduct: null,
            deletingProductId: null,
            isLoading: false,
            isUpdating: false,
            isDeleting: false,
            error: null,
            searchTerm: '',
            categoryFilter: ''
        });
    }
}
