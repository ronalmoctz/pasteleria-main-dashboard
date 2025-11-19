/**
 * Modelo de estado del Dashboard Administrativo
 * Define los tipos y estructuras de datos del dashboard
 */

export type DashboardTab = 'overview' | 'users' | 'products' | 'categories' | 'ingredients' | 'orders';

/**
 * Estadísticas del dashboard
 * Cada propiedad representa un contador de recursos
 */
export interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalCategories: number;
    totalIngredients: number;
    isLoading: boolean;
    error: string | null;
}

/**
 * Estado del dashboard
 */
export interface DashboardState {
    activeTab: DashboardTab;
    stats: DashboardStats;
}

/**
 * Valores por defecto para las estadísticas
 */
export const DEFAULT_STATS: DashboardStats = {
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalIngredients: 0,
    isLoading: false,
    error: null
};

/**
 * Valores por defecto del estado del dashboard
 */
export const DEFAULT_DASHBOARD_STATE: DashboardState = {
    activeTab: 'overview',
    stats: DEFAULT_STATS
};
