import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LayoutComponent } from '../../../layout/layout';
import { UserManagementComponent } from '../components/user-management';
import { ProductManagementComponent } from '../components/product-management';
import { CategoryManagementComponent } from '../components/category-management';
import { IngredientManagementComponent } from '../components/ingredient-management';
import { OrderManagementComponent } from '../components/order-management';
import { AdminDashboardFacade } from './services/admin-dashboard.facade';
import { IconComponent } from '../../../shared/icon/icon';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    LayoutComponent,
    CommonModule,
    IconComponent,
    UserManagementComponent,
    ProductManagementComponent,
    CategoryManagementComponent,
    IngredientManagementComponent,
    OrderManagementComponent
  ],
  template: `
    <app-layout>
      <div class="admin-dashboard">
        <header class="dashboard-header">
          <div class="welcome-section">
            <h1>Panel de Administración</h1>
            <p class="welcome-text">
              Bienvenido, <strong>{{ facade.userName() }}</strong>
            </p>
          </div>
          <button class="logout-button" (click)="onLogout()">
            Cerrar Sesión
          </button>
        </header>

        <!-- Tabs Navigation -->
        <div class="tabs-navigation">
          <button 
            class="tab-button"
            [class.active]="facade.activeTab() === 'overview'"
            (click)="onSetActiveTab('overview')"
          >
            <app-icon name="dashboard" [size]="20" class="tab-icon"></app-icon>
            Resumen
          </button>
          <button 
            class="tab-button"
            [class.active]="facade.activeTab() === 'orders'"
            (click)="onSetActiveTab('orders')"
          >
            <app-icon name="shopping-cart" [size]="20" class="tab-icon"></app-icon>
            Pedidos
          </button>
          <button 
            class="tab-button"
            [class.active]="facade.activeTab() === 'users'"
            (click)="onSetActiveTab('users')"
          >
            <app-icon name="user-cog" [size]="20" class="tab-icon"></app-icon>
            Usuarios
          </button>
          <button 
            class="tab-button"
            [class.active]="facade.activeTab() === 'products'"
            (click)="onSetActiveTab('products')"
          >
            <app-icon name="cake" [size]="20" class="tab-icon"></app-icon>
            Productos
          </button>
          <button 
            class="tab-button"
            [class.active]="facade.activeTab() === 'categories'"
            (click)="onSetActiveTab('categories')"
          >
            <app-icon name="shopping-cart" [size]="20" class="tab-icon"></app-icon>
            Categorías
          </button>
          <button 
            class="tab-button"
            [class.active]="facade.activeTab() === 'ingredients'"
            (click)="onSetActiveTab('ingredients')"
          >
            <app-icon name="receipt" [size]="20" class="tab-icon"></app-icon>
            Ingredientes
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tabs-content">
          <!-- Overview Tab -->
          @if (facade.activeTab() === 'overview') {
            <div class="dashboard-content">
              <div class="stats-grid">
                <div class="stat-card">
                  <h3>Usuarios</h3>
                  <p class="stat-value">{{ facade.stats().totalUsers }}</p>
                  <span class="stat-label">Total registrados</span>
                </div>
                
                <div class="stat-card">
                  <h3>Productos</h3>
                  <p class="stat-value">{{ facade.stats().totalProducts }}</p>
                  <span class="stat-label">En catálogo</span>
                </div>
                
                <div class="stat-card">
                  <h3>Categorías</h3>
                  <p class="stat-value">{{ facade.stats().totalCategories }}</p>
                  <span class="stat-label">Disponibles</span>
                </div>
                
                <div class="stat-card">
                  <h3>Ingredientes</h3>
                  <p class="stat-value">{{ facade.stats().totalIngredients }}</p>
                  <span class="stat-label">En inventario</span>
                </div>
              </div>
            </div>
          }

          <!-- Orders Tab -->
          @if (facade.activeTab() === 'orders') {
            <app-order-management></app-order-management>
          }

          <!-- Users Tab -->
          @if (facade.activeTab() === 'users') {
            <app-user-management></app-user-management>
          }

          <!-- Products Tab -->
          @if (facade.activeTab() === 'products') {
            <app-product-management></app-product-management>
          }

          <!-- Categories Tab -->
          @if (facade.activeTab() === 'categories') {
            <app-category-management></app-category-management>
          }

          <!-- Ingredients Tab -->
          @if (facade.activeTab() === 'ingredients') {
            <app-ingredient-management></app-ingredient-management>
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      width: 100%;
      margin: 0;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
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
      color: #3b82f6;
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

    .tabs-navigation {
      display: flex;
      gap: 0;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e5e7eb;
      overflow-x: auto;
      padding: 0;
    }

    .tab-button {
      flex: 1;
      padding: 1rem 1.5rem;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: #6b7280;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .tab-icon {
      color: inherit;
    }

    .tab-button:hover {
      color: #3b82f6;
    }

    .tab-button.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .tabs-content {
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-card h3 {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .stat-value {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .welcome-section h1 {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  readonly facade = inject(AdminDashboardFacade);
  private readonly route = inject(ActivatedRoute);

  /**
   * Inicializa el dashboard y carga las estadísticas
   */
  ngOnInit(): void {
    this.facade.initialize();

    // Check for tab query param
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.onSetActiveTab(params['tab']);
      }
    });
  }

  /**
   * Limpia el estado del dashboard al destruir el componente
   */
  ngOnDestroy(): void {
    this.facade.cleanup();
  }

  /**
   * Cambia la tab activa
   */
  onSetActiveTab(tab: 'overview' | 'users' | 'products' | 'categories' | 'ingredients' | 'orders'): void {
    this.facade.setActiveTab(tab);
  }

  /**
   * Maneja el cierre de sesión del usuario
   */
  onLogout(): void {
    this.facade.logout();
  }
}
