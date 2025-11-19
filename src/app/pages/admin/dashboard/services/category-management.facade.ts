import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Category, CategoryService } from '../../../../core/services/api/category.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface CategoryManagementState {
    categories: Category[];
    selectedCategory: Category | null;
    editingCategory: Category | null;
    deletingCategoryId: number | null;
    isLoading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    searchTerm: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryManagementFacade {
    private readonly categoryService = inject(CategoryService);
    private readonly notificationService = inject(NotificationService);

    private readonly state = signal<CategoryManagementState>({
        categories: [],
        selectedCategory: null,
        editingCategory: null,
        deletingCategoryId: null,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        searchTerm: ''
    });

    readonly categories = computed(() => this.state().categories);
    readonly selectedCategory = computed(() => this.state().selectedCategory);
    readonly editingCategory = computed(() => this.state().editingCategory);
    readonly deletingCategoryId = computed(() => this.state().deletingCategoryId);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly isUpdating = computed(() => this.state().isUpdating);
    readonly isDeleting = computed(() => this.state().isDeleting);
    readonly error = computed(() => this.state().error);
    readonly searchTerm = computed(() => this.state().searchTerm);

    readonly filteredCategories = computed(() => {
        const categories = this.categories();
        const search = this.searchTerm().toLowerCase();

        return categories.filter(category =>
            !search || category.name.toLowerCase().includes(search)
        );
    });

    loadCategories(): void {
        this.setStateProperty('isLoading', true);
        this.setStateProperty('error', null);

        this.categoryService.getAllCategories().pipe(
            tap((response: any) => {
                const categories = response.data || response || [];
                this.setStateProperty('categories', Array.isArray(categories) ? categories : []);
                this.setStateProperty('isLoading', false);
            }),
            catchError(error => {
                const message = error?.error?.message || 'Error cargando categorías';
                this.setStateProperty('error', message);
                this.setStateProperty('isLoading', false);
                this.notificationService.error('Error', message);
                return of([]);
            })
        ).subscribe();
    }

    selectCategory(category: Category | null): void {
        this.setStateProperty('selectedCategory', category);
    }

    closeCategoryDetail(): void {
        this.setStateProperty('selectedCategory', null);
    }

    openEditModal(category: Category): void {
        this.setStateProperty('editingCategory', category);
    }

    closeEditModal(): void {
        this.setStateProperty('editingCategory', null);
    }

    openDeleteConfirm(categoryId: number): void {
        this.setStateProperty('deletingCategoryId', categoryId);
    }

    closeDeleteConfirm(): void {
        this.setStateProperty('deletingCategoryId', null);
    }

    updateCategory(categoryId: number, updates: Partial<Category>): Observable<Category> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.categoryService.update(categoryId, updates).pipe(
                map((response: any) => response.data || response),
                tap((updatedCategory: Category) => {
                    this.setStateProperty('categories',
                        this.state().categories.map(c => c.id === categoryId ? updatedCategory : c)
                    );
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Categoría actualizada', 'Los cambios se han guardado correctamente');
                    observer.next(updatedCategory);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error actualizando categoría';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    createCategory(categoryData: Partial<Category>): Observable<Category> {
        this.setStateProperty('isUpdating', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.categoryService.create(categoryData).pipe(
                map((response: any) => response.data || response),
                tap((newCategory: Category) => {
                    this.setStateProperty('categories', [...this.state().categories, newCategory]);
                    this.setStateProperty('isUpdating', false);
                    this.closeEditModal();
                    this.notificationService.success('Categoría creada', 'La nueva categoría se ha agregado correctamente');
                    observer.next(newCategory);
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error creando categoría';
                    this.setStateProperty('error', message);
                    this.setStateProperty('isUpdating', false);
                    this.notificationService.error('Error', message);
                    observer.error(error);
                    return of(null);
                })
            ).subscribe();
        });
    }

    deleteCategory(categoryId: number): Observable<void> {
        this.setStateProperty('isDeleting', true);
        this.setStateProperty('error', null);

        return new Observable(observer => {
            this.categoryService.delete(categoryId).pipe(
                tap(() => {
                    this.setStateProperty('categories',
                        this.state().categories.filter(c => c.id !== categoryId)
                    );
                    this.setStateProperty('isDeleting', false);
                    this.closeDeleteConfirm();
                    this.notificationService.success('Categoría eliminada', 'La categoría ha sido eliminada correctamente');
                    observer.next();
                    observer.complete();
                }),
                catchError(error => {
                    const message = error?.error?.message || 'Error eliminando categoría';
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

    private setStateProperty<K extends keyof CategoryManagementState>(
        key: K,
        value: CategoryManagementState[K]
    ): void {
        this.state.update(currentState => ({
            ...currentState,
            [key]: value
        }));
    }

    resetState(): void {
        this.state.set({
            categories: [],
            selectedCategory: null,
            editingCategory: null,
            deletingCategoryId: null,
            isLoading: false,
            isUpdating: false,
            isDeleting: false,
            error: null,
            searchTerm: ''
        });
    }
}
