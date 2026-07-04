import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-livestock-step',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './livestock-step.html',
  styleUrls: ['./livestock-step.scss'],
})
export class LivestockStepComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;
  @Output() formReady = new EventEmitter<FormGroup>();

  form!: FormGroup;
  private fb = inject(FormBuilder);

  get animales(): FormArray {
    return this.form.get('animales') as FormArray;
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
      if (!this.form.contains('animales')) {
        this.form.addControl('animales', this.fb.array([]));
      }
      if (this.animales.length === 0) {
        this.addAnimal();
      }
    } else {
      this.form = this.fb.group({
        animales: this.fb.array([])
      });
      this.addAnimal();
    }
    this.formReady.emit(this.form);
  }

  addAnimal(): void {
    const animalGroup = this.fb.group({
      tipo: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      sistema_produccion: [''],
      vacunado: [false]
    });
    this.animales.push(animalGroup);
  }

  removeAnimal(index: number): void {
    if (this.animales.length > 1) {
      this.animales.removeAt(index);
    } else {
      // Opcional: notificar que debe haber al menos un animal
      alert('Debe haber al menos un animal registrado.');
    }
  }
}
