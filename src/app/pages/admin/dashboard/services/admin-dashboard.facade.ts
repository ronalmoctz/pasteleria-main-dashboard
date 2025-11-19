import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { DashboardStateService } from './dashboard-state.service';
import { DashboardStatsService } from './dashboard-stats.service';
import { DashboardTab } from '../models/dashboard.model';

/**
 * Fachada del Dashboard Administrativo
 * 
 * Patrón de diseño: Facade
 * Simplifica la interfaz del dashboard al componente, ocultando la complejidad
 * de múltiples servicios
 * 
 * Responsabilidades:
 * - Coordinar servicios (estado, estadísticas, autenticación)
 * - Proporcionar una interfaz única y simple al componente
 * - Manejar lógica de inicialización y ciclo de vida
 * 
 * Principios SOLID aplicados:
 * - Dependency Inversion: Inyecta abstracciones (servicios)
 * - Interface Segregation: Expone solo métodos necesarios
 * - Single Responsibility: Coordina sin duplicar responsabilidades
 */
@Injectable({
    providedIn: 'root'
})
export class AdminDashboardFacade {
    private readonly authService = inject(AuthService);
    private readonly dashboardStateService = inject(DashboardStateService);
    private readonly dashboardStatsService = inject(DashboardStatsService);
    private readonly router = inject(Router);

    private initialized = signal(false);

    // Expone el estado del dashboard
    readonly activeTab = this.dashboardStateService.activeTab;
    readonly stats = this.dashboardStateService.stats;
    readonly isLoadingStats = this.dashboardStateService.isLoadingStats;
    readonly statsError = this.dashboardStateService.statsError;

    // Datos del usuario autenticado
    readonly user = this.authService.user;
    readonly userName = computed(() => {
        const user = this.authService.user();
        if (!user) return 'Administrador';
        return `${user.first_name} ${user.last_name}`;
    });

    readonly isInitialized = this.initialized.asReadonly();

    /**
     * Inicializa el dashboard
     * Debe llamarse en onInit del componente
     */
    initialize(): void {
        if (this.initialized()) return;

        this.dashboardStatsService.loadStats().subscribe(() => {
            this.initialized.set(true);
        });
    }

    /**
     * Cambia la tab activa
     */
    setActiveTab(tab: DashboardTab): void {
        this.dashboardStateService.setActiveTab(tab);
    }

    /**
     * Recarga las estadísticas del dashboard
     */
    refreshStats(): void {
        this.dashboardStatsService.refreshStats();
    }

    /**
     * Maneja el cierre de sesión
     */
    logout(): void {
        this.authService.logout();
        this.dashboardStateService.resetState();
        this.router.navigate(['/login']);
    }

    /**
     * Limpia el estado del dashboard
     */
    cleanup(): void {
        this.dashboardStateService.resetState();
        this.initialized.set(false);
    }
}
