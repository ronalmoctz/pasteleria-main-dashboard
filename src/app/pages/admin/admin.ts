import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutComponent } from '../../layout/layout';

@Component({
  selector: 'app-admin',
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <h1>Admin Panel</h1>
      <p>Panel de administración</p>
    </app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {}
