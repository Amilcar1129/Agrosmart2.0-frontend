import { Component, OnInit, inject, ViewChild, AfterViewInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MapComponent } from '../../../shared/components/map/map/map';
import { SurveyService } from '../../../services/survey';
import { NotificationService } from '../../../services/notification';
import { LoadingService } from '../../../services/loading';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-encuesta-detail',
  imports: [   
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatListModule,
    MapComponent
  ],
  templateUrl: './encuesta-detail.html',
  styleUrl: './encuesta-detail.scss',
})
export class EncuestaDetailComponent implements OnInit, AfterViewInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private surveyService = inject(SurveyService);
  private notification = inject(NotificationService);
  private loading = inject(LoadingService);

  encuestaId!: number;
  encuesta: any = null;
  isLoading = false;
   fotoUrl: string | null = null; // ← Propiedad para la URL de la foto

  // Columnas para tablas
  cultivosColumns: string[] = ['nombre', 'area', 'rendimiento'];
  animalesColumns: string[] = ['tipo', 'cantidad', 'sistema', 'vacunado'];

  ngOnInit(): void {
    this.encuestaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.encuestaId) {
      this.cargarDetalle();
    } else {
      this.notification.showError('ID de encuesta no válido');
      this.router.navigate(['/encuestas']);
    }
  }

  ngAfterViewInit(): void {
    // El mapa se actualizará cuando los datos estén cargados
  }

  cargarDetalle(): void {
    this.isLoading = true;
    this.loading.show();
    this.surveyService.getSurveyById(this.encuestaId).subscribe({
      next: (data) => {
        this.encuesta = data;
        this.isLoading = false;
        this.loading.hide();

        // Construir URL de la foto
        this.fotoUrl = this.buildFotoUrl(data.foto_ruta);

        // Log para depuración
        console.log('📸 Ruta en BD:', data.foto_ruta);
        console.log('🔗 URL generada:', this.fotoUrl);

        // Invalidar mapa si hay coordenadas
        setTimeout(() => {
          if (this.mapComponent && this.encuesta.comunidad?.lat && this.encuesta.comunidad?.lng) {
            this.mapComponent.invalidateSize();
          }
        }, 300);
      },
      error: (err) => {
        this.isLoading = false;
        this.loading.hide();
        this.notification.showError('Error al cargar los detalles de la encuesta');
        console.error(err);
        this.router.navigate(['/encuestas']);
      }
    });
  }

  // 🔧 Método para construir la URL de la foto
  private buildFotoUrl(ruta: string): string | null {
    if (!ruta) return null;

    const trimmedRuta = ruta.trim();
    if (trimmedRuta.startsWith('http')) {
      return trimmedRuta;
    }

    const uploadBase = environment.uploadUrl.replace(/\/+$|\s+$/g, '');
    let relativePath = trimmedRuta.replace(/^\/+/, '');

    if (relativePath.startsWith('uploads/')) {
      relativePath = relativePath.substring('uploads/'.length);
    }

    return `${uploadBase}/${relativePath}`;
  }

  volver(): void {
    this.router.navigate(['/encuestas']);
  }

  editar(): void {
    if (this.encuesta.estado === 'borrador') {
      this.router.navigate(['/survey/edit', this.encuestaId]);
    } else {
      this.notification.showWarning('No se puede editar una encuesta completada');
    }
  }

  getEstadoColor(estado: string): string {
    return estado === 'borrador' ? 'warn' : 'primary';
  }

  getAccesoTexto(valor: boolean): string {
    return valor ? 'Sí' : 'No';
  }

  getFotoUrl(): string | null {
    return this.fotoUrl;
  }

  formatNumber(valor: any): string {
    if (valor === null || valor === undefined) return 'N/A';
    return Number(valor).toLocaleString('es-EC');
  }
}