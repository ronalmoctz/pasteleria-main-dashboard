import { Injectable, signal, computed } from '@angular/core';

/**
 * Tipos de notificación
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interfaz de notificación
 */
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number; // en milisegundos, 0 = permanente
    action?: {
        label: string;
        callback: () => void;
    };
}

/**
 * Servicio de Notificaciones (Singleton)
 * 
 * Responsabilidad única: Gestionar notificaciones de la aplicación
 * 
 * Características:
 * - Queue de notificaciones
 * - Auto-dismiss configurable
 * - Acceso desde cualquier parte de la app
 * - Inyectado como singleton con providedIn: 'root'
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly notifications = signal<Notification[]>([]);
    private notificationCounter = 0;

    readonly activeNotifications = this.notifications.asReadonly();

    /**
     * Muestra una notificación de éxito
     */
    success(title: string, message?: string): void {
        this.show({
            type: 'success',
            title,
            message: message || '',
            duration: 3000
        });
    }

    /**
     * Muestra una notificación de error
     */
    error(title: string, message?: string, action?: { label: string; callback: () => void }): void {
        this.show({
            type: 'error',
            title,
            message: message || '',
            duration: 0,
            action
        });
    }

    /**
     * Muestra una notificación de advertencia
     */
    warning(title: string, message?: string): void {
        this.show({
            type: 'warning',
            title,
            message: message || '',
            duration: 4000
        });
    }

    /**
     * Muestra una notificación de información
     */
    info(title: string, message?: string): void {
        this.show({
            type: 'info',
            title,
            message: message || '',
            duration: 3000
        });
    }

    /**
     * Mostración de notificación genérica
     */
    private show(notification: Omit<Notification, 'id'>): void {
        const id = `notification-${++this.notificationCounter}`;
        const fullNotification: Notification = {
            id,
            ...notification
        };

        this.notifications.update(notifs => [...notifs, fullNotification]);

        // Auto-dismiss si tiene duración
        if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
                this.dismiss(id);
            }, notification.duration);
        }
    }

    /**
     * Cierra una notificación
     */
    dismiss(id: string): void {
        this.notifications.update(notifs => notifs.filter(n => n.id !== id));
    }

    /**
     * Cierra todas las notificaciones
     */
    dismissAll(): void {
        this.notifications.set([]);
    }

    /**
     * Cierra notificaciones de un tipo específico
     */
    dismissByType(type: NotificationType): void {
        this.notifications.update(notifs => notifs.filter(n => n.type !== type));
    }
}
