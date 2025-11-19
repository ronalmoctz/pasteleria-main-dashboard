import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Componente de Notificaciones Toast
 * 
 * Muestra las notificaciones del NotificationService en la esquina superior derecha
 * con animaciones suaves y auto-dismissal configurable.
 */
@Component({
    selector: 'app-notification-toast',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="notification-container">
            @for (notification of notificationService.activeNotifications(); track notification.id) {
                <div
                    class="notification"
                    [class]="'notification-' + notification.type"
                    (click)="notificationService.dismiss(notification.id)"
                >
                    <div class="notification-content">
                        <div class="notification-header">
                            <span class="notification-icon">
                                @switch (notification.type) {
                                    @case ('success') { ✓ }
                                    @case ('error') { ✕ }
                                    @case ('warning') { ⚠ }
                                    @case ('info') { ⓘ }
                                }
                            </span>
                            <span class="notification-title">{{ notification.title }}</span>
                            <button
                                class="notification-close"
                                (click)="notificationService.dismiss(notification.id); $event.stopPropagation()"
                                title="Cerrar"
                            >
                                ✕
                            </button>
                        </div>
                        @if (notification.message) {
                            <p class="notification-message">{{ notification.message }}</p>
                        }
                    </div>
                    <div class="notification-progress">
                        <div
                            class="notification-progress-bar"
                            [style.animation]="'progress ' + (notification.duration || 3000) + 'ms linear forwards'"
                        ></div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
            max-width: 400px;
        }

        .notification {
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            overflow: hidden;
            pointer-events: auto;
            cursor: pointer;
            transition: all 0.3s ease;
            border-left: 4px solid;
            animation: slideIn 300ms ease-out forwards;
        }

        .notification:hover {
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
            transform: translateY(-2px);
        }

        .notification-success {
            border-left-color: #10b981;
            background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }

        .notification-error {
            border-left-color: #ef4444;
            background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
        }

        .notification-warning {
            border-left-color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
        }

        .notification-info {
            border-left-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
        }

        .notification-content {
            padding: 16px;
        }

        .notification-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }

        .notification-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }

        .notification-success .notification-icon {
            color: #10b981;
        }

        .notification-error .notification-icon {
            color: #ef4444;
        }

        .notification-warning .notification-icon {
            color: #f59e0b;
        }

        .notification-info .notification-icon {
            color: #3b82f6;
        }

        .notification-title {
            font-weight: 600;
            color: #1f2937;
            font-size: 14px;
            flex: 1;
        }

        .notification-close {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: color 0.2s;
        }

        .notification-close:hover {
            color: #6b7280;
        }

        .notification-message {
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .notification-progress {
            height: 2px;
            background: rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        .notification-progress-bar {
            height: 100%;
            background: currentColor;
            opacity: 0.6;
        }

        .notification-success .notification-progress-bar {
            background: #10b981;
        }

        .notification-error .notification-progress-bar {
            background: #ef4444;
        }

        .notification-warning .notification-progress-bar {
            background: #f59e0b;
        }

        .notification-info .notification-progress-bar {
            background: #3b82f6;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes progress {
            from {
                width: 100%;
            }
            to {
                width: 0%;
            }
        }

        @media (max-width: 480px) {
            .notification-container {
                left: 12px;
                right: 12px;
                max-width: none;
            }

            .notification {
                width: 100%;
            }
        }
    `]
})
export class NotificationToastComponent {
    readonly notificationService = inject(NotificationService);
}
