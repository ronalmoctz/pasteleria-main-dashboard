import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TablerIconName =
  | 'dashboard'
  | 'user-cog'
  | 'shopping-cart'
  | 'message'
  | 'help-circle'
  | 'settings'
  | 'menu-2'
  | 'x'
  | 'eye'
  | 'eye-off'
  | 'cake'
  | 'receipt'
  | 'user'
  | 'shield-off'
  | 'edit'
  | 'trash'
  | 'circle-check'
  | 'plus';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="class()"
    >
      @switch (name()) {
        @case ('dashboard') {
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        }
        @case ('user-cog') {
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h2.5" /><path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M19.001 15.5v1.5" /><path d="M19.001 21v1.5" /><path d="M22.032 17.25l-1.299 .75" /><path d="M17.27 20l-1.3 .75" /><path d="M15.97 17.25l1.3 .75" /><path d="M20.733 20l1.3 .75" />
        }
        @case ('shopping-cart') {
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        }
        @case ('message') {
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="14" y2="14" />
        }
        @case ('help-circle') {
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        }
        @case ('settings') {
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ('menu-2') {
          <line x1="18" y1="6" x2="6" y2="6" />
          <line x1="18" y1="12" x2="6" y2="12" />
          <line x1="18" y1="18" x2="6" y2="18" />
        }
        @case ('x') {
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        }
        @case ('eye') {
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ('eye-off') {
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        }
        @case ('cake') {
          <path d="M3 9c0-1 .895-1.789 2-1.789h14c1.105 0 2 .789 2 1.789v8c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2v-8z" />
          <path d="M7 5V3h1v2M12 5V3h1v2M17 5V3h1v2" />
          <path d="M12 14v3" />
        }
        @case ('receipt') {
          <path d="M5 21V5c0-1 .895-2 2-2h10c1.105 0 2 .895 2 2v16l-3-2-3 2-3-2-2 2z" />
          <path d="M9 9h6M9 13h6M9 17h2" />
        }
        @case ('user') {
          <path d="M12 2c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 12c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" />
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20a7 7 0 1 1 14 0" />
        }
        @case ('shield-off') {
          <path d="M12 3.05a9 9 0 0 1 8.846 6.546m-1.348 4.894A9 9 0 0 1 5.154 9.596" />
          <path d="M12 3.05L5 7.5v2.5c0 3.89 1.694 7.373 4.284 9.753M12 3.05l7 4.45v2.5c0 3.89-1.694 7.373-4.284 9.753" />
          <line x1="1" y1="1" x2="23" y2="23" />
        }
        @case ('edit') {
          <path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1" />
          <path d="m13.3 6.3 4.4-4.4a2 2 0 0 1 2.8 0l2.8 2.8a2 2 0 0 1 0 2.8l-4.4 4.4" />
          <path d="M12 15H4" />
        }
        @case ('trash') {
          <path d="M4 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
          <line x1="9" y1="11" x2="9" y2="17" />
          <line x1="13" y1="11" x2="13" y2="17" />
          <line x1="4" y1="7" x2="20" y2="7" />
        }
        @case ('circle-check') {
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        }
        @case ('plus') {
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        }
      }
    </svg>
  `,
  styles: [
    `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon'
  }
})
export class IconComponent {
  name = input.required<TablerIconName>();
  size = input<number>(20);
  class = input<string>('');
}
