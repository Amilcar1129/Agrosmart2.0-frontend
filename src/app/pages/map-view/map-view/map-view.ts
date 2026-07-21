import { Component, AfterViewInit, inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommunityService } from '../../../services/community';
import { NotificationService } from '../../../services/notification';
import { LoadingService } from '../../../services/loading';

import * as L from 'leaflet';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './map-view.html',
  styleUrls: ['./map-view.scss']
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private communityService = inject(CommunityService);
  private notification = inject(NotificationService);
  private loading = inject(LoadingService);

  private map: L.Map | undefined;
  private markersLayer: L.FeatureGroup | undefined;
  private resizeObserver: ResizeObserver | undefined;
  isLoading = true;
  markersCount = 0;

  ngAfterViewInit(): void {
    this.initMap();
    this.cargarComunidades();
  }

  private initMap(): void {
    // Coordenadas aproximadas de Manabí
    const defaultLat = -0.45;
    const defaultLng = -80.2;
    const zoom = 9;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [defaultLat, defaultLng],
      zoom: zoom,
      zoomControl: true,
      fadeAnimation: true,
      attributionControl: true
    });

    // Capa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Capa para marcadores
    this.markersLayer = L.featureGroup().addTo(this.map);

    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);

    window.addEventListener('resize', this.onResize);

    // Forzar invalidación del tamaño después de que el mapa se haya inicializado
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 300);

    // Invalidar tamaño también al cargar la capa de tiles
    this.map.whenReady(() => {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    });
  }

  private cargarComunidades(): void {
    this.isLoading = true;
    this.loading.show();

    this.communityService.getAllCommunities().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.loading.hide();
        this.agregarMarcadores(data);
      },
      error: (err) => {
        this.isLoading = false;
        this.loading.hide();
        this.notification.showError('Error al cargar las comunidades');
        console.error(err);
      }
    });
  }

  private agregarMarcadores(comunidades: any[]): void {
    if (!this.map || !this.markersLayer) return;

    // Limpiar marcadores existentes
    this.markersLayer.clearLayers();
    this.markersCount = 0;

    if (!comunidades || comunidades.length === 0) {
      this.notification.showInfo('No hay comunidades georreferenciadas');
      return;
    }

    comunidades.forEach(comunidad => {
      // Verificar si tiene geojson o lat/lng
      let lat: number | null = null;
      let lng: number | null = null;

      if (comunidad.geojson && comunidad.geojson.coordinates) {
        lng = comunidad.geojson.coordinates[0];
        lat = comunidad.geojson.coordinates[1];
      } else if (comunidad.lat && comunidad.lng) {
        lat = comunidad.lat;
        lng = comunidad.lng;
      }

      if (lat === null || lng === null) return;

      // Crear marcador
      const marker = L.marker([lat, lng])
        .bindPopup(`
          <div style="font-size: 14px;">
            <strong>${comunidad.comunidad_nombre || comunidad.nombre || 'Sin nombre'}</strong><br>
            <span>Parroquia: ${comunidad.parroquia || 'N/A'}</span><br>
            <span>Cantón: ${comunidad.canton || 'N/A'}</span>
            ${comunidad.encuesta_id ? `<br><span>Encuesta: #${comunidad.encuesta_id}</span>` : ''}
          </div>
        `);

      this.markersLayer?.addLayer(marker);
      this.markersCount++;
    });

    // Ajustar el mapa para que muestre todos los marcadores
    if (this.markersCount > 0) {
      const bounds = this.markersLayer.getBounds();
      this.map?.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  private onResize = () => {
    this.map?.invalidateSize();
  };

  // Método para invalidar el mapa desde fuera
  invalidateSize(): void {
    if (this.map) {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 50);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onResize);

    if (this.map) {
      this.map.remove();
    }
  }
}