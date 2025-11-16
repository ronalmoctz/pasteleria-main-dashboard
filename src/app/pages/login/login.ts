import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { LoginRequest } from '../../core/models/auth.model';
import { IconComponent } from '../../shared/icon/icon';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <header class="login-header">
          <h1 class="login-title">🧁 Pastelería</h1>
          <p class="login-subtitle">Inicia sesión en tu cuenta</p>
        </header>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          @if (errorMessage()) {
            <div class="error-message" role="alert">
              <app-icon name="x" [size]="16" />
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              [class.error]="isFieldInvalid('email')"
              placeholder="tu@email.com"
              autocomplete="email"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-text">Email es requerido</span>
            }
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                class="form-input"
                [class.error]="isFieldInvalid('password')"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18" />
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <span class="error-text">Contraseña es requerida</span>
            }
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="forgot-password"
              (click)="showRecoveryModal.set(true)"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            class="submit-button"
            [disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <span class="loading">Cargando...</span>
            } @else {
              Iniciar sesión
            }
          </button>
        </form>
      </div>

      @if (showRecoveryModal()) {
        <div class="modal-overlay" (click)="closeRecoveryModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2>Recuperar contraseña</h2>
              <button type="button" class="modal-close" (click)="closeRecoveryModal()">
                <app-icon name="x" [size]="20" />
              </button>
            </header>
            <form [formGroup]="recoveryForm" (ngSubmit)="onRecoverySubmit()" class="recovery-form">
              <div class="form-group">
                <label for="recovery-email" class="form-label">Email</label>
                <input
                  id="recovery-email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  placeholder="tu@email.com"
                  autocomplete="email"
                />
              </div>
              <div class="modal-actions">
                <button type="button" class="button-secondary" (click)="closeRecoveryModal()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="submit-button"
                  [disabled]="recoveryForm.invalid || isRecoveryLoading()"
                >
                  @if (isRecoveryLoading()) {
                    Enviando...
                  } @else {
                    Enviar
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .login-container {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f2ede5 0%, #e8ddd0 100%);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .login-subtitle {
      color: #6b7280;
      margin: 0;
      font-size: 0.9375rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      color: #dc2626;
      font-size: 0.875rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error {
      border-color: #dc2626;
    }

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .password-toggle:hover {
      color: #374151;
    }

    .error-text {
      font-size: 0.75rem;
      color: #dc2626;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .forgot-password {
      background: transparent;
      border: none;
      color: #3b82f6;
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      transition: color 0.2s;
    }

    .forgot-password:hover {
      color: #2563eb;
    }

    .submit-button {
      width: 100%;
      padding: 0.875rem 1.5rem;
      background: #181a1e;
      color: #ffffff;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
    }

    .submit-button:hover:not(:disabled) {
      background: #2d2f35;
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading {
      display: inline-block;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: #ffffff;
      border-radius: 1rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #374151;
    }

    .recovery-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .button-secondary {
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .button-secondary:hover {
      background: #e5e7eb;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 2rem 1.5rem;
      }

      .login-title {
        font-size: 1.75rem;
      }
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm: FormGroup;
  readonly recoveryForm: FormGroup;

  readonly isLoading = signal<boolean>(false);
  readonly isRecoveryLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly showRecoveryModal = signal<boolean>(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Type narrowing: check which variant of LoginResponse we have
        let user: any;
        if ('success' in response && response.success) {
          user = response.data.user;
        } else if ('user' in response) {
          user = response.user;
        }

        // Redirigir según el rol del usuario
        if (user) {
          if (user.role === 'admin') {
            // Administrador -> Dashboard de administración
            this.router.navigate(['/admin/dashboard']);
          } else if (user.role === 'customer') {
            // Cliente -> Dashboard de cliente
            this.router.navigate(['/customer/dashboard']);
          } else {
            // Rol no reconocido - logout y mostrar error
            this.authService.logout();
            this.errorMessage.set('Rol de usuario no válido');
          }
        }
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
        );
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onRecoverySubmit(): void {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.isRecoveryLoading.set(true);
    const email = this.recoveryForm.get('email')?.value;

    this.authService.recoveryPassword({ email }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Se ha enviado un enlace de recuperación a tu email.');
          this.closeRecoveryModal();
        }
      },
      error: (error) => {
        alert(error?.error?.message || 'Error al enviar el email de recuperación.');
      },
      complete: () => {
        this.isRecoveryLoading.set(false);
      }
    });
  }

  closeRecoveryModal(): void {
    this.showRecoveryModal.set(false);
    this.recoveryForm.reset();
  }
}
