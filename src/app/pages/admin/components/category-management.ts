import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Category } from '../../../core/services/api/category.service';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="category-management">
      <div class="management-header">
        <h2>Gestión de Categorías</h2>
        <button class="btn-add">+ Nueva Categoría</button>
      </div>

      @if (loading()) {
        <div class="loading">
          <p>Cargando categorías...</p>
        </div>
      } @else if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
          <button (click)="loadCategories()">Reintentar</button>
        </div>
      } @else if (categories().length === 0) {
        <div class="empty-state">
          <p>No hay categorías para mostrar</p>
        </div>
      } @else {
        <div class="categories-grid">
          @for (category of categories(); track category.id) {
            <div class="category-card">
              @if (category.image) {
                <div class="category-image">
                  <img [src]="category.image" [alt]="category.name">
                </div>
              }
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                @if (category.description) {
                  <p>{{ category.description }}</p>
                }
                <span class="date">{{ category.created_at | date: 'dd/MM/yyyy' }}</span>
              </div>
              <div class="category-actions">
                <button class="btn-edit">Editar</button>
                <button class="btn-delete">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .category-management {
      padding: 2rem;
    }

    .management-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .management-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1f2937;
      font-weight: 700;
    }

    .btn-add {
      padding: 0.75rem 1.5rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-add:hover {
      background: #059669;
    }

    .loading,
    .error,
    .empty-state {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .error {
      background: #fee;
      color: #c33;
    }

    .error button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .category-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .category-image {
      width: 100%;
      height: 150px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .category-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-info {
      padding: 1rem;
      flex: 1;
    }

    .category-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      color: #1f2937;
      font-weight: 700;
    }

    .category-info p {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .date {
      display: block;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .category-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .category-actions button {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-edit {
      background: #fef3c7;
      color: #92400e;
    }

    .btn-edit:hover {
      background: #fde68a;
    }

    .btn-delete {
      background: #fee2e2;
      color: #991b1b;
    }

    .btn-delete:hover {
      background: #fecaca;
    }

    @media (max-width: 768px) {
      .management-header {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-add {
        width: 100%;
      }

      .categories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryManagementComponent implements OnInit {
    private readonly categoryService = inject(CategoryService);

    readonly categories = signal<Category[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.loading.set(true);
        this.error.set(null);

        this.categoryService.getAllCategories().subscribe({
            next: (response) => {
                if (response.success) {
                    this.categories.set(response.data);
                } else {
                    this.error.set('Error al cargar categorías');
                }
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.error.set('Error al cargar categorías. Intenta de nuevo.');
                this.loading.set(false);
            }
        });
    }
}
