import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar';
import { NotificationToastComponent } from '../shared/components/notification-toast/notification-toast.component';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [SidebarComponent, NotificationToastComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar
        (collapsedChange)="onSidebarCollapsed($event)"
      />
      <main class="layout" [class.sidebar-collapsed]="isSidebarCollapsed()">
        <div class="container">
          <ng-content></ng-content>
        </div>
      </main>
      <app-notification-toast></app-notification-toast>
    </div>
  `,
  styles: [
    `
    .layout-wrapper {
      display: flex;
      min-height: 100dvh;
    }

    .layout {
      flex: 1;
      display: block;
      padding-block-start: 2.5rem; /* space below future header */
      padding-block-end: 2rem;
      padding-inline: clamp(1rem, 6vw, 5rem); /* ~80px max on large screens */
      margin-left: 260px; /* sidebar width */
      transition: margin-left 0.3s ease;
    }

    .layout.sidebar-collapsed {
      margin-left: 40px; /* collapsed sidebar width */
    }

    .container {
      width: 100%;
      max-width: 1200px;
      margin-inline: auto;
    }

    @media (max-width: 768px) {
      .layout-wrapper {
        flex-direction: column;
      }

      .layout {
        margin-left: 0;
        padding-inline: 1rem;
      }

      .layout.sidebar-collapsed {
        margin-left: 0;
      }
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-layout'
  }
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  isSidebarCollapsed = signal<boolean>(false);
  adminName = computed(() => {
    const u = this.authService.user();
    if (!u) return 'Usuario';
    const full = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
    return full || u.email;
  });
  adminProfileImage = computed(
    () => this.authService.user()?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  );

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
  }
}


