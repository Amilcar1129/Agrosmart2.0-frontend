import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PhotoCaptureComponent } from '../../../../shared/components/photo-capture/photo-capture/photo-capture';
import { MapComponent } from '../../../../shared/components/map/map/map';
@Component({
  selector: 'app-community-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    PhotoCaptureComponent,
    MapComponent
  ],
  templateUrl: './community-step.html',
  styleUrls: ['./community-step.scss'],
})
export class CommunityStepComponent implements OnInit, OnChanges {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

invalidateMap(): void {
  if (this.mapComponent) {
    this.mapComponent.invalidateSize();
  }
}
  @Input() formGroup!: FormGroup;
  @Output() formReady = new EventEmitter<FormGroup>();
  form!: FormGroup;
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formGroup'] && !changes['formGroup'].isFirstChange()) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    type ControlConfig = [any, any?];
    const defaultControls: Record<string, ControlConfig> = {
      nombre: ['', Validators.required],
      parroquia: [''],
      canton: ['', Validators.required],
      lat: [null],
      lng: [null],
      referencia_ubicacion: [''],
      fotoFile: [null, Validators.required]
    };

    if (this.formGroup) {
      this.form = this.formGroup;
      for (const name in defaultControls) {
        const [value, validator] = defaultControls[name];
        if (!this.form.contains(name)) {
          this.form.addControl(name, this.fb.control(value, validator));
        }
      }
    } else {
      this.form = this.fb.group(defaultControls);
    }

    this.formReady.emit(this.form);
  }

  onLocationSelected(latLng: { lat: number; lng: number }): void {
    this.form.patchValue({ lat: latLng.lat, lng: latLng.lng });
  }

  onPhotoSelected(file: File): void {
    this.form.patchValue({ fotoFile: file });
  }
}
