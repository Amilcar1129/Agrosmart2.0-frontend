import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-photo-capture',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="photo-container">
      <!-- Input oculto para seleccionar archivo -->
      <input type="file" accept="image/*" (change)="onFileSelected($event)" #fileInput hidden>
      
      <!-- Botón para abrir cámara/galería -->
      <button mat-raised-button type="button" (click)="fileInput.click()" color="primary">
        <mat-icon>camera_alt</mat-icon> Tomar foto / Subir
      </button>

      <!-- Vista previa de la foto -->
      <div *ngIf="previewUrl" class="preview">
        <img [src]="previewUrl" alt="Vista previa">
        <button mat-icon-button (click)="clearPhoto()" color="warn">
          <mat-icon>delete</mat-icon>
        </button>
      </div>

      <!-- Nota informativa -->
      <div class="info">La foto se comprimirá automáticamente a ~90KB para facilitar el envío</div>
    </div>
  `,
  styles: [`
    .photo-container { margin-top: 0.5rem; }
    .preview { 
      margin-top: 1rem; 
      position: relative; 
      display: inline-block; 
    }
    .preview img { 
      max-width: 200px; 
      max-height: 200px; 
      border-radius: 8px; 
      border: 1px solid #ddd;
    }
    .preview button {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      border-radius: 50%;
    }
    .info { 
      font-size: 0.75rem; 
      color: #666; 
      margin-top: 0.5rem; 
    }
  `]
})
export class PhotoCaptureComponent {
  @Output() photoSelected = new EventEmitter<File>();
  previewUrl: string | null = null;

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Opciones de compresión: máxima calidad 90KB, máximo ancho/alto 1024px
    const options = {
      maxSizeMB: 0.09,          // 90 KB
      maxWidthOrHeight: 1024,   // Resolución máxima
      useWebWorker: true,       // Usar worker para no bloquear UI
    };

    try {
      // Comprimir la imagen
      const compressedFile = await imageCompression(file, options);
      
      // Emitir el archivo comprimido al padre
      this.photoSelected.emit(compressedFile);
      
      // Crear URL para vista previa
      this.previewUrl = URL.createObjectURL(compressedFile);
    } catch (err) {
      console.error('Error al comprimir la imagen:', err);
      // Si falla la compresión, enviamos el archivo original
      this.photoSelected.emit(file);
      this.previewUrl = URL.createObjectURL(file);
    }

    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
    input.value = '';
  }

  clearPhoto(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.photoSelected.emit(null as any);
  }
}