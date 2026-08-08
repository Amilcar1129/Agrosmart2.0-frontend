import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png'
});

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

    // Forzar invalidación del tamaño después de que el mapa se haya inicializado
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 300);

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Si hay coordenadas iniciales, colocar marcador
    if (this.lat !== null && this.lng !== null) {
      this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
    }

    // Evento de clic
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (this.marker) {
        this.map?.removeLayer(this.marker);
      }
      this.marker = L.marker([lat, lng]).addTo(this.map!);
      this.locationSelected.emit({ lat, lng });
    });

    // Forzar invalidación del tamaño también después de que la capa de tiles se haya cargado
    this.map.whenReady(() => {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    });
  }

  // Método para que el padre pueda invalidar el tamaño del mapa desde fuera
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