import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredientService, Ingredient } from '../../../core/services/api/ingredient.service';

@Component({
    selector: 'app-ingredient-management',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="ingredient-management">
      <div class="management-header">
        <h2>Gestión de Ingredientes</h2>
        <button class="btn-add">+ Nuevo Ingrediente</button>
      </div>

      @if (loading()) {
        <div class="loading">
          <p>Cargando ingredientes...</p>
        </div>
      } @else if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
          <button (click)="loadIngredients()">Reintentar</button>
        </div>
      } @else if (ingredients().length === 0) {
        <div class="empty-state">
          <p>No hay ingredientes para mostrar</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="ingredients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad de Medida</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (ingredient of ingredients(); track ingredient.id) {
                <tr>
                  <td>{{ ingredient.name }}</td>
                  <td>{{ ingredient.description || '-' }}</td>
                  <td>{{ ingredient.measurement_unit || '-' }}</td>
                  <td>{{ ingredient.created_at | date: 'dd/MM/yyyy' }}</td>
                  <td class="actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
    styles: [`
    .ingredient-management {
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

    .table-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
    }

    .ingredients-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .ingredients-table thead {
      background: #f3f4f6;
      border-bottom: 2px solid #e5e7eb;
    }

    .ingredients-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .ingredients-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }

    .ingredients-table tbody tr:hover {
      background: #f9fafb;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .actions button {
      padding: 0.375rem 0.75rem;
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

      .ingredients-table {
        font-size: 0.75rem;
      }

      .ingredients-table th,
      .ingredients-table td {
        padding: 0.75rem 0.5rem;
      }

      .actions button {
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
      }
    }
  `]
})
export class IngredientManagementComponent implements OnInit {
    private readonly ingredientService = inject(IngredientService);

    readonly ingredients = signal<Ingredient[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadIngredients();
    }

    loadIngredients(): void {
        this.loading.set(true);
        this.error.set(null);

        this.ingredientService.getAllIngredients().subscribe({
            next: (response) => {
                if (response.success) {
                    this.ingredients.set(response.data);
                } else {
                    this.error.set('Error al cargar ingredientes');
                }
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading ingredients:', err);
                this.error.set('Error al cargar ingredientes. Intenta de nuevo.');
                this.loading.set(false);
            }
        });
    }
}
