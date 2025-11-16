import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutComponent } from '../../layout/layout';

@Component({
  selector: 'app-dashboard',
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <h1>Dashboard</h1>
      <p>Bienvenido al panel de control</p>
    </app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
