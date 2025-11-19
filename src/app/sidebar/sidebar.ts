import { ChangeDetectionStrategy, Component, inject, input, output, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, type TablerIconName } from '../shared/icon/icon';
import { AuthService } from '../core/services/auth/auth.service';

interface MenuItem {
  label: string;
  route: string;
  icon: TablerIconName;
  queryParams?: Record<string, any>;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Toggle Button (Arrow) -->
      <button
        type="button"
        class="sidebar-toggle-arrow"
        (click)="toggleSidebar()"
        [attr.aria-label]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <app-icon [name]="isCollapsed() ? 'menu-2' : 'menu-2'" [size]="16" />
      </button>

      <header class="sidebar-header">
        <div class="sidebar-profile">
          <img
            [src]="profileImage()"
            [alt]="userName()"
            class="sidebar-avatar"
          />
          <div class="sidebar-profile-info" [class.hidden]="isCollapsed()">
            <h2 class="sidebar-title">{{ userName() }}</h2>
            <p class="sidebar-role">{{ userRole() }}</p>
          </div>
        </div>
      </header>

      <nav class="sidebar-nav">
        <ul class="sidebar-menu">
          @for (item of menuItems(); track item.route) {
            <li class="sidebar-item">
              <a
                [routerLink]="item.route"
                [queryParams]="item.queryParams"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }"
                class="sidebar-link"
                [title]="isCollapsed() ? item.label : ''"
              >
                <app-icon [name]="item.icon" [size]="22" class="sidebar-icon" />
                <span class="sidebar-label" [class.hidden]="isCollapsed()">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `,
  styles: [
    `
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 260px;
      height: 100dvh;
      background-color: #181a1e;
      color: #fff;
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar.collapsed {
      width: 80px;
    }

    /* Toggle Arrow */
    .sidebar-toggle-arrow {
      position: absolute;
      top: 24px;
      right: -12px;
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border: 2px solid #181a1e;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 101;
      transition: transform 0.3s ease, background-color 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .sidebar-toggle-arrow:hover {
      background: #2563eb;
      transform: scale(1.1);
    }

    .sidebar.collapsed .sidebar-toggle-arrow {
      transform: rotate(180deg);
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .sidebar-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: max-content; /* Prevent wrapping */
    }

    .sidebar-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background-color: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .sidebar-profile-info {
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform-origin: left;
    }

    .sidebar-profile-info.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-10px);
      display: none; /* Completely hide to prevent layout issues */
    }

    .sidebar-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
    }

    .sidebar-role {
      margin: 0;
      font-size: 0.75rem;
      color: #9ca3af;
      text-transform: capitalize;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0.75rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-menu {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      color: #9ca3af;
      text-decoration: none;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
      white-space: nowrap;
      min-height: 48px;
    }

    .sidebar-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .sidebar-link.active {
      background-color: #3b82f6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .sidebar-icon {
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .sidebar-link:hover .sidebar-icon {
      transform: scale(1.1);
    }

    .sidebar-label {
      font-size: 0.95rem;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .sidebar-label.hidden {
      opacity: 0;
      display: none;
    }

    /* Centering icons when collapsed */
    .sidebar.collapsed .sidebar-link {
      justify-content: center;
      padding: 0.75rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 260px;
      }
      
      .sidebar.collapsed {
        transform: translateX(0);
        width: 260px; /* On mobile, collapsed means 'shown' usually, but here we might want a different behavior. 
                       Let's keep it simple: Mobile sidebar is usually a drawer. 
                       For now, adhering to the requested 'arrow' design which implies desktop-first. */
      }
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-sidebar'
  }
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  isCollapsed = signal<boolean>(false);
  collapsedChange = output<boolean>();

  readonly userName = computed(() => {
    const user = this.authService.user();
    return user ? `${user.first_name} ${user.last_name}` : 'Guest';
  });

  readonly userRole = computed(() => {
    const user = this.authService.user();
    return user?.role || 'guest';
  });

  readonly profileImage = computed(() =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.userName()}`
  );

  private readonly adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard', queryParams: { tab: 'overview' } },
    { label: 'Admin Panel', route: '/admin/dashboard', icon: 'user-cog', queryParams: { tab: 'users' } },
    { label: 'Orders', route: '/admin/dashboard', icon: 'shopping-cart', queryParams: { tab: 'orders' } },
    { label: 'Messages', route: '/messages', icon: 'message' },
    { label: 'Help & Support', route: '/help', icon: 'help-circle' },
    { label: 'Settings', route: '/settings', icon: 'settings' }
  ];

  private readonly customerMenuItems: MenuItem[] = [
    { label: 'Explorar', route: '/customer/dashboard', icon: 'cake' },
    { label: 'Mis Pedidos', route: '/customer/orders', icon: 'receipt' },
    { label: 'Mi Perfil', route: '/customer/profile', icon: 'user' },
    { label: 'Mensajes', route: '/customer/messages', icon: 'message' },
    { label: 'Ayuda', route: '/customer/help', icon: 'help-circle' },
    { label: 'Configuración', route: '/customer/settings', icon: 'settings' }
  ];

  readonly menuItems = computed(() => {
    const role = this.userRole();
    return role === 'admin' ? this.adminMenuItems : this.customerMenuItems;
  });

  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
    this.collapsedChange.emit(this.isCollapsed());
  }
}
