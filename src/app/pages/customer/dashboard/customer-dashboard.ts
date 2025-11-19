import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LayoutComponent } from '../../../layout/layout';
import { IconComponent } from '../../../shared/icon/icon';

/**
 * Customer Dashboard Component
 * 
 * Dashboard principal para usuarios con rol de cliente.
 * Proporciona acceso a funcionalidades del cliente como:
 * - Catálogo de productos
 * - Historial de pedidos
 * - Carrito de compras
 * - Perfil de usuario
 * 
 * @requires authGuard - Requiere autenticación
 * @requires roleGuard(['customer']) - Requiere rol de cliente
 */
@Component({
  selector: 'app-customer-dashboard',
  imports: [LayoutComponent, CommonModule, IconComponent],
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
          <button class="logout-button" (click)="onLogout()">
            Cerrar Sesión
          </button>
        </header>

        <div class="dashboard-content">
          <!-- Sección de información rápida -->
          <div class="info-cards">
            <div class="info-card">
              <div class="info-icon">📦</div>
              <div class="info-content">
                <h3>Mis Pedidos</h3>
                <p class="info-value">0</p>
                <span class="info-label">Pedidos realizados</span>
              </div>
            </div>
            
            <div class="info-card">
              <app-icon name="user" [size]="40" class="info-icon"></app-icon>
              <div class="info-content">
                <h3>Mi Perfil</h3>
                <p class="info-value">Actualizado</p>
                <span class="info-label">Información personal</span>
              </div>
            </div>
            
            <div class="info-card">
              <app-icon name="shopping-cart" [size]="40" class="info-icon"></app-icon>
              <div class="info-content">
                <h3>Carrito</h3>
                <p class="info-value">0</p>
                <span class="info-label">Productos en carrito</span>
              </div>
            </div>
          </div>

          <!-- Sección de menú de navegación -->
          <div class="navigation-section">
            <h2>¿Qué deseas hacer hoy?</h2>
            <div class="navigation-grid">
              <button class="nav-card">
                <app-icon name="cake" [size]="40" class="nav-icon"></app-icon>
                <div class="nav-content">
                  <h3>Explorar Productos</h3>
                  <p>Descubre nuestras deliciosas opciones</p>
                </div>
              </button>

              <button class="nav-card">
                <app-icon name="receipt" [size]="40" class="nav-icon"></app-icon>
                <div class="nav-content">
                  <h3>Mis Pedidos</h3>
                  <p>Revisa el estado de tus pedidos</p>
                </div>
              </button>

              <button class="nav-card">
                <app-icon name="user" [size]="40" class="nav-icon"></app-icon>
                <div class="nav-content">
                  <h3>Mi Perfil</h3>
                  <p>Actualiza tu información personal</p>
                </div>
              </button>

              <button class="nav-card">
                <app-icon name="shield-off" [size]="40" class="nav-icon"></app-icon>
                <div class="nav-content">
                  <h3>Métodos de Pago</h3>
                  <p>Gestiona tus formas de pago</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Sección de pedidos recientes -->
          <div class="recent-orders">
            <h2>Pedidos Recientes</h2>
            <div class="empty-state">
              <p class="empty-icon">📦</p>
              <p class="empty-text">No tienes pedidos aún</p>
              <p class="empty-subtext">¡Explora nuestro catálogo y realiza tu primera orden!</p>
              <button class="primary-button">Ver Productos</button>
            </div>
          </div>
        </div>
      </div>
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

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Info Cards Section */
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
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      letter-spacing: 0.05em;
    }

    .info-value {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .info-label {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    /* Navigation Section */
    .navigation-section h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .navigation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .nav-card {
      background: white;
      padding: 1.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .nav-card:hover {
      border-color: #8b5cf6;
      background: #faf5ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    }

    .nav-icon {
      color: #8b5cf6;
      flex-shrink: 0;
    }

    .nav-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      color: #1f2937;
      font-weight: 600;
    }

    .nav-content p {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Recent Orders Section */
    .recent-orders h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .empty-state {
      background: white;
      padding: 3rem 2rem;
      border-radius: 0.75rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin: 0 0 1rem 0;
      opacity: 0.5;
    }

    .empty-text {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .empty-subtext {
      margin: 0 0 1.5rem 0;
      color: #6b7280;
    }

    .primary-button {
      padding: 0.875rem 2rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }

    .primary-button:hover {
      background: #7c3aed;
      transform: translateY(-2px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .customer-dashboard {
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

      .info-cards {
        grid-template-columns: 1fr;
      }

      .navigation-grid {
        grid-template-columns: 1fr;
      }

      .nav-card {
        padding: 1.25rem;
      }

      .empty-state {
        padding: 2rem 1.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Computed signal que retorna el nombre completo del usuario
   * Combina first_name y last_name del usuario autenticado
   */
  readonly userName = () => {
    const user = this.authService.user();
    if (!user) return 'Cliente';
    return `${user.first_name} ${user.last_name}`;
  };

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
