import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { DashboardStateService } from './dashboard-state.service';
import { UserService } from '../../../../core/services/api/user.service';
import { ProductService } from '../../../../core/services/api/product.service';
import { CategoryService } from '../../../../core/services/api/category.service';
import { IngredientService } from '../../../../core/services/api/ingredient.service';

/**
 * Servicio de Estadísticas del Dashboard
 * 
 * Responsabilidad única: Cargar y manejar las estadísticas del dashboard
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo gestiona carga de estadísticas
 * - Open/Closed: Fácil de extender con nuevas estadísticas
 * - Dependency Inversion: Depende de abstracciones de servicios
 */
@Injectable({
    providedIn: 'root'
})
export class DashboardStatsService {
    private readonly dashboardStateService = inject(DashboardStateService);
    private readonly userService = inject(UserService);
    private readonly productService = inject(ProductService);
    private readonly categoryService = inject(CategoryService);
    private readonly ingredientService = inject(IngredientService);

    /**
     * Carga todas las estadísticas en paralelo
     * 
     * Usa forkJoin implícitamente mediante múltiples subscripciones
     * independientes para mantener la composabilidad
     */
    loadStats(): Observable<void> {
        this.dashboardStateService.setStatsLoading(true);

        // Cargar datos en paralelo
        this.userService.getAllUsers().pipe(
            tap((response: any) => {
                const users = response.data || response;
                this.dashboardStateService.updateStats({
                    totalUsers: Array.isArray(users) ? users.length : 0
                });
            }),
            catchError(error => {
                console.error('Error cargando usuarios:', error);
                this.dashboardStateService.setStatsError('Error cargando usuarios');
                return of([]);
            })
        ).subscribe();

        this.productService.getAllProducts().pipe(
            tap((response: any) => {
                const products = response.data || response;
                this.dashboardStateService.updateStats({
                    totalProducts: Array.isArray(products) ? products.length : 0
                });
            }),
            catchError(error => {
                console.error('Error cargando productos:', error);
                return of([]);
            })
        ).subscribe();

        this.categoryService.getAllCategories().pipe(
            tap((response: any) => {
                const categories = response.data || response;
                this.dashboardStateService.updateStats({
                    totalCategories: Array.isArray(categories) ? categories.length : 0
                });
            }),
            catchError(error => {
                console.error('Error cargando categorías:', error);
                return of([]);
            })
        ).subscribe();

        this.ingredientService.getAllIngredients().pipe(
            tap((response: any) => {
                const ingredients = response.data || response;
                this.dashboardStateService.updateStats({
                    totalIngredients: Array.isArray(ingredients) ? ingredients.length : 0
                });
            }),
            catchError(error => {
                console.error('Error cargando ingredientes:', error);
                return of([]);
            }),
            finalize(() => {
                this.dashboardStateService.setStatsLoading(false);
            })
        ).subscribe();

        return of(void 0);
    }

    /**
     * Recarga las estadísticas (útil para refrescar datos)
     */
    refreshStats(): void {
        this.loadStats().subscribe();
    }
}
