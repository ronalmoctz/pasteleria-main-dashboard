import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Ingredient, IngredientService } from '../../../../core/services/api/ingredient.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface IngredientManagementState {
    ingredients: Ingredient[];
    selectedIngredient: Ingredient | null;
    editingIngredient: Ingredient | null;
    deletingIngredientId: number | null;
    isLoading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    searchTerm: string;
}

@Injectable({
    providedIn: 'root'
})
export class IngredientManagementFacade {
    private readonly ingredientService = inject(IngredientService);
    private readonly notificationService = inject(NotificationService);

    private readonly state = signal<IngredientManagementState>({
        ingredients: [],
        selectedIngredient: null,
        editingIngredient: null,
        deletingIngredientId: null,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        searchTerm: ''
    });

    readonly ingredients = computed(() => this.state().ingredients);
    readonly selectedIngredient = computed(() => this.state().selectedIngredient);
    readonly editingIngredient = computed(() => this.state().editingIngredient);
    readonly deletingIngredientId = computed(() => this.state().deletingIngredientId);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isUpdating = computed(() => this.state().isUpdating);
    readonly isDeleting = computed(() => this.state().isDeleting);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);

    readonly filteredIngredients = computed(() => {
        const ingredients = this.ingredients();
        const search = this.searchTerm().toLowerCase();

        return ingredients.filter(ingredient =>
            !search || ingredient.name.toLowerCase().includes(search)
        );
    });

    loadIngredients(): void {
        this.setStateProperty('isLoading', true);
        this.setStateProperty('error', null);

        this.ingredientService.getAllIngredients().pipe(
            tap((response: any) => {
                const ingredients = response.data || response || [];
                this.setStateProperty('ingredients', Array.isArray(ingredients) ? ingredients : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                const message = error?.error?.message || 'Error cargando ingredientes';
                this.setStateProperty('error', message);
                this.setStateProperty('isLoading', false);
                this.notificationService.error('Error', message);
                return of([]);
            })
        ).subscribe();
    }

    selectIngredient(ingredient: Ingredient | null): void {
        this.setStateProperty('selectedIngredient', ingredient);
    }

    closeIngredientDetail(): void {
        this.setStateProperty('selectedIngredient', null);
    }

    openEditModal(ingredient: Ingredient): void {
        this.setStateProperty('editingIngredient', ingredient);
    }

    closeEditModal(): void {
        this.setStateProperty('editingIngredient', null);
    }

    openDeleteConfirm(ingredientId: number): void {
        this.setStateProperty('deletingIngredientId', ingredientId);
    }

    closeDeleteConfirm(): void {
        this.setStateProperty('deletingIngredientId', null);
    }

    updateIngredient(ingredientId: number, updates: Partial<Ingredient>): Observable<Ingredient> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.ingredientService.update(ingredientId, updates).pipe(
                map((response: any) => response.data || response),
                tap((updatedIngredient: Ingredient) => {
                    this.setStateProperty('ingredients',
                        this.state().ingredients.map(i => i.id === ingredientId ? updatedIngredient : i)
                    );
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Ingrediente actualizado', 'Los cambios se han guardado correctamente');
                    observer.next(updatedIngredient);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error actualizando ingrediente';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    createIngredient(ingredientData: Partial<Ingredient>): Observable<Ingredient> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.ingredientService.create(ingredientData).pipe(
                map((response: any) => response.data || response),
                tap((newIngredient: Ingredient) => {
                    this.setStateProperty('ingredients', [...this.state().ingredients, newIngredient]);
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Ingrediente creado', 'El nuevo ingrediente se ha agregado correctamente');
                    observer.next(newIngredient);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error creando ingrediente';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    deleteIngredient(ingredientId: number): Observable<void> {
        this.setStateProperty('isDeleting', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.ingredientService.delete(ingredientId).pipe(
                tap(() => {
                    this.setStateProperty('ingredients',
                        this.state().ingredients.filter(i => i.id !== ingredientId)
                    );
                    this.setStateProperty('isDeleting', false);
                    this.closeDeleteConfirm();
                    this.notificationService.success('Ingrediente eliminado', 'El ingrediente ha sido eliminado correctamente');
                    observer.next();
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error eliminando ingrediente';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isDeleting', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    setSearchTerm(term: string): void {
        this.setStateProperty('searchTerm', term);
    }

    private setStateProperty<K extends keyof IngredientManagementState>(
        key: K,
        value: IngredientManagementState[K]
    ): void {
        this.state.update(currentState => ({
            ...currentState,
            [key]: value
        }));
    }

    resetState(): void {
        this.state.set({
            ingredients: [],
            selectedIngredient: null,
            editingIngredient: null,
            deletingIngredientId: null,
            isLoading: false,
            isUpdating: false,
            isDeleting: false,
            error: null,
            searchTerm: ''
        });
    }
}
