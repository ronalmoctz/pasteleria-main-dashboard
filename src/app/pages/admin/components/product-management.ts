import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/api/product.service';

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: ` 
    <div class="product-management">
      <div class="management-header">
        <h2>Gestión de Productos</h2>
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar producto..."
            [(ngModel)]="searchTerm"
            (input)="filterProducts()"
          >
        </div>
        <button class="btn-add">+ Nuevo Producto</button>
      </div>

      @if (loading()) {
        <div class="loading">
          <p>Cargando productos...</p>
        </div>
      } @else if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
          <button (click)="loadProducts()">Reintentar</button>
        </div>
      } @else if (filteredProducts().length === 0) {
        <div class="empty-state">
          <p>No hay productos para mostrar</p>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of filteredProducts(); track product.id) {
            <div class="product-card">
              @if (product.image) {
                <div class="product-image">
                  <img [src]="product.image" [alt]="product.name">
                </div>
              }
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="description">{{ product.description }}</p>
                <div class="product-details">
                  <span class="price">$ {{ product.price.toFixed(2) }}</span>
                  <span class="category">{{ product.category_id }}</span>
                </div>
              </div>
              <div class="product-actions">
                <button class="btn-view" (click)="viewProduct(product)">Ver</button>
                <button class="btn-edit" (click)="editProduct(product)">Editar</button>
                <button class="btn-delete" (click)="deleteProduct(product)">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .product-management {
      padding: 2rem;
    }

    .management-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .management-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .search-box {
      flex: 1;
      max-width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .btn-add {
      padding: 0.75rem 1.5rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-add:hover {
      background: #059669;
    }

    .loading,
    .error,
    .empty-state {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .error {
      background: #fee;
      color: #c33;
    }

    .error button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .product-image {
      width: 100%;
      height: 200px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #1f2937;
      font-weight: 700;
    }

    .description {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      color: #6b7280;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .product-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .product-actions button {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view {
      background: #dbeafe;
      color: #1e40af;
    }

    .btn-view:hover {
      background: #bfdbfe;
    }

    .btn-edit {
      background: #fef3c7;
      color: #92400e;
    }

    .btn-edit:hover {
      background: #fde68a;
    }

    .btn-delete {
      background: #fee2e2;
      color: #991b1b;
    }

    .btn-delete:hover {
      background: #fecaca;
    }

    @media (max-width: 768px) {
      .management-header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: 100%;
      }

      .btn-add {
        width: 100%;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductManagementComponent implements OnInit {
    private readonly productService = inject(ProductService);

    readonly products = signal<Product[]>([]);
    readonly filteredProducts = signal<Product[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly searchTerm = signal('');

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading.set(true);
        this.error.set(null);

        this.productService.getAllProducts().subscribe({
            next: (response) => {
                if (response.success) {
                    this.products.set(response.data);
                    this.filteredProducts.set(response.data);
                } else {
                    this.error.set('Error al cargar productos');
                }
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading products:', err);
                this.error.set('Error al cargar productos. Intenta de nuevo.');
                this.loading.set(false);
            }
        });
    }

    filterProducts(): void {
        const term = this.searchTerm().toLowerCase();

        if (!term) {
            this.filteredProducts.set(this.products());
            return;
        }

        const filtered = this.products().filter(product =>
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term)
        );

        this.filteredProducts.set(filtered);
    }

    viewProduct(product: Product): void {
        console.log('View product:', product);
        // TODO: Abrir modal con detalles
    }

    editProduct(product: Product): void {
        console.log('Edit product:', product);
        // TODO: Abrir modal para editar
    }

    deleteProduct(product: Product): void {
        console.log('Delete product:', product);
        // TODO: Implementar eliminación
    }
}
