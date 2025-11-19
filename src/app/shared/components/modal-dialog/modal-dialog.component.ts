import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

/**
 * Tipo de modal
 */
export type ModalType = 'create' | 'edit' | 'view' | 'delete' | 'confirm';

/**
 * Configuración del modal
 */
export interface ModalConfig {
    type: ModalType;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    isDangerous?: boolean; // Para modales de eliminar
    maxWidth?: string; // CSS max-width value
}

/**
 * Modal Reutilizable (Componente Presentacional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza el modal
 * - Open/Closed: Extensible con inputs/outputs
 * - Interface Segregation: Props mínimos requeridos
 * 
 * Características:
 * - Flexible y reutilizable
 * - Diseño elegante y responsive
 * - Soporta contenido personalizado vía ng-content
 * - Estados de carga
 */
@Component({
    selector: 'app-modal-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="modal-overlay" (click)="onOverlayClick()">
      <div 
        class="modal" 
        (click)="$event.stopPropagation()"
        [style.max-width]="config().maxWidth || '500px'"
        [class.modal-lg]="(config().maxWidth || '500px') !== '500px'"
        [class.modal-danger]="config().isDangerous"
      >
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-section">
            <h2 class="modal-title">{{ config().title }}</h2>
            @if (config().subtitle) {
              <p class="modal-subtitle">{{ config().subtitle }}</p>
            }
          </div>
          <button 
            class="modal-close" 
            (click)="onCancel()"
            [attr.aria-label]="'Cerrar ' + config().title"
            type="button"
          >
            ✕
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="config().isLoading"
            type="button"
          >
            {{ config().cancelLabel || 'Cancelar' }}
          </button>
          <button
            class="btn"
            [class.btn-primary]="!config().isDangerous"
            [class.btn-danger]="config().isDangerous"
            (click)="onConfirm()"
            [disabled]="config().isLoading"
            type="button"
          >
            @if (config().isLoading) {
              <span class="btn-loading">
                <span class="spinner"></span>
                {{ config().actionLabel || 'Procesando...' }}
              </span>
            } @else {
              {{ config().actionLabel || 'Confirmar' }}
            }
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
      padding: 1rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-lg {
      width: 100%;
    }

    .modal-danger {
      border-top: 4px solid #ef4444;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      gap: 1rem;
    }

    .modal-title-section {
      flex: 1;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }

    .modal-subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .modal-close:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .modal-content {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9375rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #1f2937;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #d1d5db;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);
    }

    .btn-loading {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 640px) {
      .modal {
        width: 100%;
        max-height: 100vh;
        border-radius: 0.5rem 0.5rem 0 0;
      }

      .modal-header {
        padding: 1rem;
      }

      .modal-content {
        padding: 1rem;
      }

      .modal-footer {
        padding: 1rem;
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDialogComponent {
    readonly config = input.required<ModalConfig>();
    readonly cancel = output<void>();
    readonly confirm = output<void>();

    onOverlayClick(): void {
        // Solo cerrar en overlay click si no es peligroso
        if (!this.config().isDangerous) {
            this.onCancel();
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onConfirm(): void {
        this.confirm.emit();
    }
}
