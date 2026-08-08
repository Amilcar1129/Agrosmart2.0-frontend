import { AfterViewInit, ElementRef, Component, Output, ViewChild, OnDestroy, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import * as L from 'leaflet';
import 'leaflet-draw';

@Component({
  selector: 'app-polygon-drawer',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './polygon-drawer.html',
  styleUrls: ['./polygon-drawer.scss']
})
export class PolygonDrawerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Output() polygonSaved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private map: L.Map | undefined;
  private drawnItems: L.FeatureGroup = L.featureGroup();
  private polygonLayer: L.Polygon | null = null;
  private drawControl: L.Control.Draw | undefined;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Coordenadas por defecto (Manabí)
    const defaultLat = -0.45;
    const defaultLng = -80.2;

    // Inicializar el mapa
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [defaultLat, defaultLng],
      zoom: 12,
      zoomControl: true
    });

    // Capa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Capa de dibujo (FeatureGroup)
    this.drawnItems.addTo(this.map);

    // Configuración del control de dibujo
    const drawConstructor = (L.Control as any)?.Draw;
    if (typeof drawConstructor !== 'function') {
      return; // Si Leaflet Draw no está disponible, no se inicializa
    }

    const drawOptions = {
      position: 'topright' as const,
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: false,
          shapeOptions: {
            color: '#2e7d32',
            weight: 3,
            opacity: 0.8,
            fillColor: '#4caf50',
            fillOpacity: 0.3
          },
          repeatMode: false,
          maxPoints: 0,
          drawError: { color: '#b00b00', timeout: 2000 }
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: false,
        edit: { selectedPathOptions: { color: '#2e7d32', weight: 4 } }
      }
    };

    this.drawControl = new drawConstructor(drawOptions);
    if (this.drawControl) {
      this.map.addControl(this.drawControl);
    }

    // Evento: cuando se dibuja un polígono
    this.map.on('draw:created', (event: any) => {
      const layer = event.layer;
      if (this.polygonLayer) {
        this.drawnItems.removeLayer(this.polygonLayer);
      }
      this.polygonLayer = layer;
      this.drawnItems.addLayer(layer);
    });

    // Evento: cuando se edita un polígono
    this.map.on('draw:edited', (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          this.polygonLayer = layer;
        }
      });
    });

    // Evento: cuando se elimina un polígono
    this.map.on('draw:deleted', (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        if (layer === this.polygonLayer) {
          this.polygonLayer = null;
        }
      });
    });

    // Ajustar tamaño del mapa después de renderizar
    setTimeout(() => this.map?.invalidateSize(), 500);
    setTimeout(() => this.map?.invalidateSize(), 1000);
  }

  savePolygon(): void {
  if (this.polygonLayer) {
    // Obtener el Feature completo
    const feature = this.polygonLayer.toGeoJSON();
    // Extraer solo la geometría
    const geometry = feature.geometry;
    this.polygonSaved.emit(geometry);
  } else {
    this.polygonSaved.emit(null);
  }
}
  cancel(): void {
    // Emitir evento de cancelación
    this.cancelled.emit();
  }

  ngOnDestroy(): void {
    // Destruir el mapa al cerrar el componente
    if (this.map) {
      this.map.remove();
    }
  }
}
