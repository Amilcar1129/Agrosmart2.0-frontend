import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

//  Configuración de iconos con rutas locales (recomendado para zonas rurales sin internet)
const defaultIcon = L.icon({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Asignar como icono por defecto para todos los marcadores
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="map-container" style="height: 300px; width: 100%; border-radius: 8px; border: 1px solid #ccc;"></div>`,
  styles: []
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Input() lat: number | null = null;
  @Input() lng: number | null = null;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const defaultLat = this.lat ?? -0.45;
    const defaultLng = this.lng ?? -80.2;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: true,
      fadeAnimation: true,
      attributionControl: true
    });

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Si hay coordenadas iniciales, colocar marcador
    if (this.lat !== null && this.lng !== null) {
      this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
    }

    // Evento de clic para seleccionar ubicación
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (this.marker) {
        this.map?.removeLayer(this.marker);
      }
      this.marker = L.marker([lat, lng]).addTo(this.map!);
      this.locationSelected.emit({ lat, lng });
    });

    // Forzar invalidación del tamaño después de que el DOM esté listo
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 300);

    // Invalidar de nuevo cuando la capa de tiles esté lista
    this.map.whenReady(() => {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    });
  }

  // Método para que el padre invalide el mapa desde fuera
  invalidateSize(): void {
    if (this.map) {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 50);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}