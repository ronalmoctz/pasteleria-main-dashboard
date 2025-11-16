import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, type TablerIconName } from '../shared/icon/icon';

interface MenuItem {
  label: string;
  route: string;
  icon: TablerIconName;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <header class="sidebar-header">
        <div class="sidebar-profile">
          <img
            [src]="adminProfileImage()"
            [alt]="adminName()"
            class="sidebar-avatar"
          />
          <div class="sidebar-profile-info" [class.hidden]="isCollapsed()">
            <h2 class="sidebar-title">{{ adminName() }}</h2>
          </div>
        </div>
        <button
          type="button"
          class="sidebar-toggle"
          (click)="toggleSidebar()"
          [attr.aria-label]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          [attr.aria-expanded]="!isCollapsed()"
        >
          <app-icon [name]="isCollapsed() ? 'menu-2' : 'x'" [size]="20" />
        </button>
      </header>
      <nav class="sidebar-nav">
        <ul class="sidebar-menu">
          @for (item of menuItems(); track item.route) {
            <li class="sidebar-item">
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }"
                class="sidebar-link"
                [title]="isCollapsed() ? item.label : ''"
              >
                <app-icon [name]="item.icon" [size]="20" class="sidebar-icon" />
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
      overflow-y: auto;
      overflow-x: hidden;
      transition: transform 0.3s ease, width 0.3s ease;
      transform: translateX(0);
    }

    .sidebar.collapsed {
      transform: translateX(-220px);
      width: 260px;
    }

    .sidebar-header {
      padding: 1.5rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: relative;
    }

    .sidebar-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }

    .sidebar-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background-color: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .sidebar-profile-info {
      flex: 1;
      min-width: 0;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .sidebar-profile-info.hidden {
      opacity: 0;
      visibility: hidden;
      width: 0;
      overflow: hidden;
    }

    .sidebar-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-toggle {
      background: transparent;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      flex-shrink: 0;
    }

    .sidebar-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
    }

    .sidebar-menu {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sidebar-item {
      margin: 0;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #fff;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      position: relative;
    }

    .sidebar-link:hover:not(.active) {
      background-color: rgba(0, 0, 0, 0.25);
    }

    .sidebar-link.active {
      background-color: #fff;
      color: #181a1e;
    }

    .sidebar-link.active .sidebar-icon {
      stroke: #181a1e;
    }

    .sidebar-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .sidebar-label {
      font-size: 0.9375rem;
      font-weight: 500;
      white-space: nowrap;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .sidebar-label.hidden {
      opacity: 0;
      visibility: hidden;
      width: 0;
      overflow: hidden;
    }

    .hidden {
      opacity: 0;
      visibility: hidden;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        max-height: none;
      }

      .sidebar-menu {
        flex-direction: row;
        overflow-x: auto;
        padding: 0.5rem;
      }

      .sidebar-item {
        flex-shrink: 0;
      }

      .sidebar-link {
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        min-width: 80px;
      }

      .sidebar-label {
        font-size: 0.75rem;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .sidebar-header {
        padding: 1rem;
      }

      .sidebar-title {
        font-size: 1rem;
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
  isCollapsed = signal<boolean>(false);
  adminName = input<string>('Admin User');
  adminProfileImage = input<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=admin');

  collapsedChange = output<boolean>();

  menuItems = signal<MenuItem[]>([
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Admin Panel', route: '/admin', icon: 'user-cog' },
    { label: 'Orders', route: '/orders', icon: 'shopping-cart' },
    { label: 'Messages', route: '/messages', icon: 'message' },
    { label: 'Help & Support', route: '/help', icon: 'help-circle' },
    { label: 'Settings', route: '/settings', icon: 'settings' }
  ]);

  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
    this.collapsedChange.emit(this.isCollapsed());
  }
}
