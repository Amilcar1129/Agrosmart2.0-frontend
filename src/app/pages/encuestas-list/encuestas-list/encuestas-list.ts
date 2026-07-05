import { Component, OnInit, ViewChild,inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey';
import { NotificationService } from '../../../services/notification';
import { AuthService } from '../../../services/auth';
import { LoadingService } from '../../../services/loading';


@Component({
  selector: 'app-encuestas-list',
  imports: [     CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './encuestas-list.html',
  styleUrl: './encuestas-list.scss',
})
export class EncuestasListComponents  implements OnInit {
   @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inyección de servicios
  private surveyService = inject(SurveyService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private loading = inject(LoadingService); // ← Asegúrate de que LoadingService exista
  private router = inject(Router);

  // Columnas de la tabla
  displayedColumns: string[] = ['id', 'fecha', 'comunidad', 'canton', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  //  Paginación
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;

  //  Filtros
  filtroEstado: string = 'Todos';
  filtroCanton: string = 'Todos';
  cantones: string[] = ['Bolívar', 'Chone', 'Junín', 'San Vicente', 'Sucre', 'Tosagua'];

  //  Rol del usuario
  userRole = this.authService.getRole();

  ngOnInit(): void {
    this.cargarEncuestas();
  }

  //  Método para cargar encuestas con paginación y filtros
  cargarEncuestas(): void {
    this.loading.show();

    const params: any = {
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    if (this.filtroEstado && this.filtroEstado !== 'Todos') {
      params.estado = this.filtroEstado;
    }

    if (this.filtroCanton && this.filtroCanton !== 'Todos') {
      params.canton = this.filtroCanton;
    }

    this.surveyService.getAllSurveys(params).subscribe({
      next: (response: any) => {
        // Si el backend devuelve { data: [], total: number }
        // Si devuelve directamente el array, ajusta:
        const data = response.data || response;
        this.dataSource.data = Array.isArray(data) ? data : [];
        this.totalItems = response.total || this.dataSource.data.length;
        this.loading.hide();
      },
      error: (err) => {
        this.loading.hide();
        this.notification.showError('Error al cargar las encuestas');
        console.error(err);
      }
    });
  }

  //  Cambio de página
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize; // ← cuidado con mayúsculas
    this.cargarEncuestas();
  }

  //  Aplicar filtros
  aplicarFiltros(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.cargarEncuestas();
  }

  //  Limpiar filtros
  limpiarFiltros(): void {
    this.filtroEstado = 'Todos';
    this.filtroCanton = 'Todos';
    this.aplicarFiltros();
  }

  //  Navegar a nueva encuesta
  nuevaEncuesta(): void {
    this.router.navigate(['/survey/new']);
  }

  //  Ver detalle
  verDetalle(id: number): void {
    this.router.navigate(['/survey', id]);
  }

  //  Editar (solo borrador)
  editarEncuesta(id: number, estado: string): void {
    if (estado === 'borrador') {
      this.router.navigate(['/survey/edit', id]);
    } else {
      this.notification.showWarning('No se puede editar una encuesta completada');
    }
  }

  //  Eliminar
  eliminarEncuesta(id: number): void {
    const confirmar = confirm('¿Está seguro de eliminar esta encuesta?');
    if (confirmar) {
      this.loading.show();
      this.surveyService.deleteSurvey(id).subscribe({
        next: () => {
          this.loading.hide();
          this.notification.showSuccess('Encuesta eliminada');
          this.cargarEncuestas();
        },
        error: (err) => {
          this.loading.hide();
          this.notification.showError('Error al eliminar');
          console.error(err);
        }
      });
    }
  }

  //  Color del chip según estado
  getEstadoColor(estado: string): string {
    return estado === 'borrador' ? 'warn' : 'primary';
  }

  //  Formato de fecha
  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}