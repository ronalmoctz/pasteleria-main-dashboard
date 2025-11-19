import { Injectable, signal, computed } from '@angular/core';
import { DashboardState, DashboardTab, DEFAULT_DASHBOARD_STATE } from '../models/dashboard.model';

/**
 * Servicio de Gestión del Estado del Dashboard
 * 
 * Responsabilidad única: Mantener y gestionar el estado del dashboard
 * (tabs activos, estadísticas, etc.)
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo gestiona estado
 * - Dependency Inversion: Usa signals (abstraído de la implementación)
 */
@Injectable({
    providedIn: 'root'
})
export class DashboardStateService {
    private readonly dashboardState = signal<DashboardState>(DEFAULT_DASHBOARD_STATE);

    // Computed signals para acceso a propiedades específicas
    readonly activeTab = computed(() => this.dashboardState().activeTab);
    readonly stats = computed(() => this.dashboardState().stats);
    readonly isLoadingStats = computed(() => this.dashboardState().stats.isLoading);
    readonly statsError = computed(() => this.dashboardState().stats.error);

    /**
     * Cambia la tab activa
     */
    setActiveTab(tab: DashboardTab): void {
        this.dashboardState.update(state => ({
            ...state,
            activeTab: tab
        }));
    }

    /**
     * Actualiza las estadísticas
     */
    updateStats(stats: Partial<typeof DEFAULT_DASHBOARD_STATE.stats>): void {
        this.dashboardState.update(state => ({
            ...state,
            stats: {
                ...state.stats,
                ...stats
            }
        }));
    }

    /**
     * Marca que se están cargando las estadísticas
     */
    setStatsLoading(isLoading: boolean): void {
        this.dashboardState.update(state => ({
            ...state,
            stats: {
                ...state.stats,
                isLoading,
                error: isLoading ? null : state.stats.error
            }
        }));
    }

    /**
     * Establece un error en las estadísticas
     */
    setStatsError(error: string | null): void {
        this.dashboardState.update(state => ({
            ...state,
            stats: {
                ...state.stats,
                error,
                isLoading: false
            }
        }));
    }

    /**
     * Reinicia el estado del dashboard
     */
    resetState(): void {
        this.dashboardState.set(DEFAULT_DASHBOARD_STATE);
    }
}
