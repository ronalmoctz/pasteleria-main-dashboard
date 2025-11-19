import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LayoutComponent } from '../../../layout/layout';
import { IconComponent } from '../../../shared/icon/icon';
import { CustomerDashboardFacade } from './services/customer-dashboard.facade';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { Product } from '../../../core/services/api/product.service';

@Component({
  selector: 'app-customer-dashboard',
  imports: [LayoutComponent, CommonModule, IconComponent, FormsModule, ModalDialogComponent],
  template: `
    <app-layout>
      <div class="customer-dashboard">
        <header class="dashboard-header">
          <div class="welcome-section">
            <h1>Mi Cuenta</h1>
            <p class="welcome-text">
              ¡Hola, <strong>{{ userName() }}</strong>! 🧁
            </p>
          </div>
          <div class="search-bar">
            <app-icon name="search" [size]="20" class="search-icon"></app-icon>
            <input 
              type="text" 
              placeholder="Buscar pasteles, postres..." 
              [value]="facade.searchTerm()"
              (input)="onSearch($event)"
            >
          </div>
          <div class="header-actions">
            <button class="cart-button" (click)="openCart()" [class.has-items]="facade.cartItemCount() > 0">
              <app-icon name="shopping-cart" [size]="24"></app-icon>
              <span class="cart-badge" *ngIf="facade.cartItemCount() > 0">{{ facade.cartItemCount() }}</span>
            </button>
            <button class="logout-button" (click)="onLogout()">
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div class="dashboard-content">
          <!-- Stats Section -->
          <div class="info-cards">
            <div class="info-card">
              <app-icon name="receipt" [size]="40" class="info-icon"></app-icon>
              <div class="info-content">
                <h3>Mis Pedidos</h3>
                <p class="info-value">0</p>
                <span class="info-label">Pedidos realizados</span>
              </div>
            </div>
            
            <div class="info-card">
              <app-icon name="shopping-cart" [size]="40" class="info-icon"></app-icon>
              <div class="info-content">
                <h3>Carrito</h3>
                <p class="info-value">\${{ facade.cartTotal().toFixed(2) }}</p>
                <span class="info-label">{{ facade.cartItemCount() }} productos</span>
              </div>
            </div>
          </div>

          <!-- Product Catalog Section -->
          <div class="catalog-section">
            <div class="section-header">
              <h2>Nuestros Productos</h2>
            </div>

            @if (facade.isLoading()) {
              <div class="loading-state">
                <app-icon name="loader" [size]="40" class="spin"></app-icon>
                <p>Cargando delicias...</p>
              </div>
            }

            @if (!facade.isLoading() && facade.filteredProducts().length === 0) {
              <div class="empty-state">
                <p>No encontramos productos que coincidan con tu búsqueda 😔</p>
              </div>
            }

            <div class="products-grid">
              @for (product of facade.filteredProducts(); track product.id) {
                <div class="product-card">
                  <div class="product-image">
                    <img [src]="product.image || 'assets/placeholder-cake.jpg'" [alt]="product.name">
                    <div class="price-tag">\${{ product.price.toFixed(2) }}</div>
                  </div>
                  <div class="product-info">
                    <h3>{{ product.name }}</h3>
                    <p>{{ product.description }}</p>
                    <button class="add-btn" (click)="facade.addToCart(product)">
                      <app-icon name="plus" [size]="18"></app-icon>
                      Agregar
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Modal -->
      <app-modal-dialog
        *ngIf="isCartOpen()"
        [config]="{
          type: 'info',
          title: 'Tu Carrito',
          subtitle: 'Revisa tus productos antes de ordenar',
          actionLabel: 'Confirmar Pedido',
          cancelLabel: 'Seguir Comprando',
          isDangerous: false,
          isLoading: facade.isCreatingOrder(),
          maxWidth: '600px'
        }"
        (cancel)="closeCart()"
        (confirm)="onCheckout()"
      >
        <div class="cart-content">
          @if (facade.cart().length === 0) {
            <div class="empty-cart">
              <app-icon name="shopping-cart" [size]="48"></app-icon>
              <p>Tu carrito está vacío</p>
              <button class="btn-link" (click)="closeCart()">Ir a comprar</button>
            </div>
          } @else {
            <div class="cart-items">
              @for (item of facade.cart(); track item.product.id) {
                <div class="cart-item">
                  <div class="item-info">
                    <h4>{{ item.product.name }}</h4>
                    <p class="item-price">\${{ item.product.price.toFixed(2) }} x {{ item.quantity }}</p>
                  </div>
                  <div class="item-actions">
                    <button class="qty-btn" (click)="facade.updateQuantity(item.product.id, item.quantity - 1)">-</button>
                    <span>{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="facade.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                    <button class="remove-btn" (click)="facade.removeFromCart(item.product.id)">
                      <app-icon name="trash" [size]="18"></app-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
            
            <div class="cart-summary">
              <div class="summary-row total">
                <span>Total</span>
                <span>\${{ facade.cartTotal().toFixed(2) }}</span>
              </div>
            </div>

            <div class="order-notes">
              <label>Instrucciones especiales (opcional):</label>
              <textarea 
                [(ngModel)]="specialInstructions" 
                placeholder="Ej: Escribir 'Feliz Cumpleaños' en el pastel..."
                rows="3"
              ></textarea>
            </div>
          }
        </div>
      </app-modal-dialog>
    </app-layout>
  `,
  styles: [`
    .customer-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
      gap: 2rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-section h1 {
      margin: 0;
      font-size: 2rem;
      color: #1f2937;
      font-weight: 700;
    }

    .welcome-text {
      margin: 0.5rem 0 0 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .welcome-text strong {
      color: #8b5cf6;
    }

    .logout-button {
      padding: 0.75rem 1.5rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .logout-button:hover {
      background: #dc2626;
    }

    .cart-button {
      position: relative;
      padding: 0.75rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .cart-button:hover {
      border-color: #8b5cf6;
      color: #8b5cf6;
    }

    .cart-button.has-items {
      color: #8b5cf6;
      border-color: #8b5cf6;
      background: #f5f3ff;
    }

    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* Info Cards */
    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-icon {
      color: #3b82f6;
      flex-shrink: 0;
    }

    .info-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
    }

    .info-value {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .info-label {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    /* Catalog Section */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .search-bar {
      position: relative;
      flex: 1;
      max-width: 500px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .search-bar input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      border: 1px solid #e5e7eb;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      position: relative;
      height: 200px;
      background: #f3f4f6;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .price-tag {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: white;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: 700;
      color: #8b5cf6;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }

    .product-info p {
      margin: 0 0 1.5rem 0;
      color: #6b7280;
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .add-btn {
      width: 100%;
      padding: 0.75rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }

    .add-btn:hover {
      background: #7c3aed;
    }

    /* Cart Modal Styles */
    .cart-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .empty-cart {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .empty-cart p {
      margin: 1rem 0;
      font-size: 1.125rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: #8b5cf6;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    .cart-items {
      max-height: 300px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .item-info h4 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .item-price {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .qty-btn {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
    }

    .qty-btn:hover {
      border-color: #8b5cf6;
      color: #8b5cf6;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 0.25rem;
      margin-left: 0.5rem;
    }

    .cart-summary {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 1.125rem;
      color: #1f2937;
    }

    .order-notes {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .order-notes label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .order-notes textarea {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-family: inherit;
      resize: vertical;
    }

    .order-notes textarea:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .customer-dashboard {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        justify-content: space-between;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDashboardComponent implements OnInit {
  readonly facade = inject(CustomerDashboardFacade);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isCartOpen = signal(false);
  specialInstructions = '';

  ngOnInit(): void {
    this.facade.loadProducts();
  }

  readonly userName = () => {
    const user = this.authService.user();
    if (!user) return 'Cliente';
    return `${user.first_name} ${user.last_name}`;
  };

  onLogout(): void {
    this.authService.logout();
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.facade.setSearchTerm(term);
  }

  openCart(): void {
    this.isCartOpen.set(true);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  onCheckout(): void {
    if (this.facade.cart().length === 0) return;

    this.facade.createOrder(this.specialInstructions);
    this.closeCart();
    this.specialInstructions = '';
  }
}
