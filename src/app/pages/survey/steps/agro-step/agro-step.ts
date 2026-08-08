import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule} from '@angular/material/dialog';
import { PolygonDrawerComponent } from '../../../../shared/components/polygon-drawer/polygon-drawer';
@Component({
  selector: 'app-agro-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './agro-step.html',
  styleUrls: ['./agro-step.scss'],
})
export class AgroStepComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;
  @Output() formReady = new EventEmitter<FormGroup>();

  form!: FormGroup;
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  get cultivos(): FormArray {
    return this.form.get('cultivos') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formGroup'] && !changes['formGroup'].isFirstChange()) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.formGroup) {
      this.form = this.formGroup;
      if (!this.form.contains('cultivos')) {
        this.form.addControl('cultivos', this.fb.array([]));
      }
      if (this.cultivos.length === 0) {
        this.addCultivo();
      }
    } else {
      this.form = this.fb.group({
        cultivos: this.fb.array([])
      });
      this.addCultivo();
    }
    this.formReady.emit(this.form);
  }

  addCultivo(): void {
    const cultivoGroup = this.fb.group({
      nombre_cultivo: ['', Validators.required],
      area_ha: [0, [Validators.required, Validators.min(0.01)]],
      rendimiento_estimado: [null],// opcional
      geom: [null] 
    });
    this.cultivos.push(cultivoGroup);
  }

  removeCultivo(index: number): void {
    if (this.cultivos.length > 1) {
      this.cultivos.removeAt(index);
    }
  }
   openPolygonDrawer(index: number): void {
    const dialogRef = this.dialog.open<PolygonDrawerComponent>(PolygonDrawerComponent, {
      width: '90%',
      maxWidth: '800px',
      height: '90%',
      maxHeight: '600px'
    });

    dialogRef.componentInstance.polygonSaved.subscribe((geojson: any) => {
      if (geojson) {
        const cultivoForm = this.cultivos.at(index);
        cultivoForm.patchValue({ geom: geojson });
        console.log('✅ Polígono guardado para cultivo', index, geojson);
      } else {
        console.log('ℹ️ No se dibujó polígono');
      }
      dialogRef.close();
    });

    dialogRef.componentInstance.cancelled.subscribe(() => {
      dialogRef.close();
    });
  }
}
