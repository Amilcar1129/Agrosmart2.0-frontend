import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-family-step',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './family-step.html',
  styleUrls: ['./family-step.scss'],
})
export class FamilyStepComponent implements OnInit, OnChanges {
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
      jefe_nombre: ['', Validators.required],
      num_miembros: [1, [Validators.required, Validators.min(1)]],
      acceso_agua: [false, []],
      acceso_luz: [false, []],
      acceso_internet: [false, []]
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
}
