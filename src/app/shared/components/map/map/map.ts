import { Component, Input, Output, EventEmitter, AfterViewInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="map-container" style="height: 300px; width: 100%; border-radius: 8px; border: 1px solid #ccc;"></div>`,
  styles: []
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Input() lat: number | null = null;
  @Input() lng: number | null = null;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  ngAfterViewInit(): void {
    const defaultLat = this.lat ?? -0.45;
    const defaultLng = this.lng ?? -80.2;

    this.map = L.map(this.mapContainer.nativeElement).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    if (this.lat !== null && this.lng !== null) {
      this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (this.marker) {
        this.map?.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map!);
      this.locationSelected.emit({ lat, lng });
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }
}