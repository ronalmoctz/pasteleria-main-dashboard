import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LayoutComponent } from '../../../layout/layout';
import { UserManagementComponent } from '../components/user-management';
import { ProductManagementComponent } from '../components/product-management';
import { CategoryManagementComponent } from '../components/category-management';
import { IngredientManagementComponent } from '../components/ingredient-management';

/**
 * Admin Dashboard Component
 * 
 * Dashboard principal para usuarios con rol de administrador.
 * Proporciona acceso a funcionalidades administrativas como:
 * - Gestión de usuarios
 * - Gestión de productos
 * - Reportes y estadísticas
 * - Configuración del sistema
 * 
 * @requires authGuard - Requiere autenticación
 * @requires roleGuard(['admin']) - Requiere rol de administrador
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [
    LayoutComponent,
    CommonModule,
    UserManagementComponent,
    ProductManagementComponent,
    CategoryManagementComponent,
    IngredientManagementComponent
  ],
  template: `
    <app-layout>
      <div class="admin-dashboard">
        <header class="dashboard-header">
          <div class="welcome-section">
            <h1>Panel de Administración</h1>
            <p class="welcome-text">
              Bienvenido, <strong>{{ userName() }}</strong>
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
            [class.active]="activeTab() === 'overview'"
            (click)="setActiveTab('overview')"
          >
            📊 Resumen
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'users'"
            (click)="setActiveTab('users')"
          >
            👥 Usuarios
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'products'"
            (click)="setActiveTab('products')"
          >
            🧁 Productos
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'categories'"
            (click)="setActiveTab('categories')"
          >
            📂 Categorías
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'ingredients'"
            (click)="setActiveTab('ingredients')"
          >
            🥘 Ingredientes
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tabs-content">
          <!-- Overview Tab -->
          @if (activeTab() === 'overview') {
            <div class="dashboard-content">
              <div class="stats-grid">
                <div class="stat-card">
                  <h3>Usuarios</h3>
                  <p class="stat-value">0</p>
                  <span class="stat-label">Total registrados</span>
                </div>
                
                <div class="stat-card">
                  <h3>Productos</h3>
                  <p class="stat-value">0</p>
                  <span class="stat-label">En catálogo</span>
                </div>
                
                <div class="stat-card">
                  <h3>Categorías</h3>
                  <p class="stat-value">0</p>
                  <span class="stat-label">Disponibles</span>
                </div>
                
                <div class="stat-card">
                  <h3>Ingredientes</h3>
                  <p class="stat-value">0</p>
                  <span class="stat-label">En inventario</span>
                </div>
              </div>

              <div class="quick-actions">
                <h2>Acciones Rápidas</h2>
                <div class="actions-grid">
                  <button class="action-button" (click)="setActiveTab('users')">
                    👥 Gestionar Usuarios
                  </button>
                  <button class="action-button" (click)="setActiveTab('products')">
                    🧁 Gestionar Productos
                  </button>
                  <button class="action-button" (click)="setActiveTab('categories')">
                    📂 Gestionar Categorías
                  </button>
                  <button class="action-button" (click)="setActiveTab('ingredients')">
                    🥘 Gestionar Ingredientes
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Users Tab -->
          @if (activeTab() === 'users') {
            <app-user-management></app-user-management>
          }

          <!-- Products Tab -->
          @if (activeTab() === 'products') {
            <app-product-management></app-product-management>
          }

          <!-- Categories Tab -->
          @if (activeTab() === 'categories') {
            <app-category-management></app-category-management>
          }

          <!-- Ingredients Tab -->
          @if (activeTab() === 'ingredients') {
            <app-ingredient-management></app-ingredient-management>
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .admin-dashboard {
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
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e5e7eb;
      overflow-x: auto;
      padding: 0;
    }

    .tab-button {
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

    .quick-actions h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-button {
      padding: 1.25rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      text-align: left;
    }

    .action-button:hover {
      background: #2563eb;
      transform: translateY(-2px);
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
export class AdminDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signal para controlar la tab activa
  readonly activeTab = signal<'overview' | 'users' | 'products' | 'categories' | 'ingredients'>('overview');

  /**
   * Computed signal que retorna el nombre completo del usuario
   * Combina first_name y last_name del usuario autenticado
   */
  readonly userName = () => {
    const user = this.authService.user();
    if (!user) return 'Administrador';
    return `${user.first_name} ${user.last_name}`;
  };

  /**
   * Cambia la tab activa
   */
  setActiveTab(tab: 'overview' | 'users' | 'products' | 'categories' | 'ingredients'): void {
    this.activeTab.set(tab);
  }

  /**
   * Maneja el cierre de sesión del usuario
   * - Limpia el estado de autenticación
   * - Elimina tokens del localStorage
   * - Redirige al login
   */
  onLogout(): void {
    this.authService.logout();
  }
}
