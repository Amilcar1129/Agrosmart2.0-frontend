import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommunityStepComponent } from '../steps/community-step/community-step';
import { FamilyStepComponent } from '../steps/family-step/family-step';
import { AgroStepComponent } from '../steps/agro-step/agro-step';
import { LivestockStepComponent } from '../steps/livestock-step/livestock-step';
import { SocioeconomicStepComponent } from '../steps/socioeconomic-step/socioeconomic-step';
import { SurveyService } from '../../../services/survey';
import { NotificationService } from '../../../services/notification';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-survey-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatStepperModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    CommunityStepComponent,
    FamilyStepComponent,
    AgroStepComponent,
    LivestockStepComponent,
    SocioeconomicStepComponent
  ],
  templateUrl: './survey-wizard.html',
  styleUrls: ['./survey-wizard.scss'],
})
export class SurveyWizardComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(CommunityStepComponent) communityStepComponent!: CommunityStepComponent;

  private fb = inject(FormBuilder);
  private SurveyService = inject(SurveyService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  surveyForm: FormGroup = this.fb.group({});
  communityForm!: FormGroup;
  familyForm!: FormGroup;
  agroForm!: FormGroup;
  livestockForm!: FormGroup;
  socioeconomicForm!: FormGroup;

  currentStep = 0;
  totalSteps = 5;
  progressValue = 0;
  isSaving = false;
  surveyId: number | null = null;

  ngOnInit(): void {
    this.communityForm = this.fb.group({});
    this.familyForm = this.fb.group({});
    this.agroForm = this.fb.group({});
    this.livestockForm = this.fb.group({});
    this.socioeconomicForm = this.fb.group({});
    this.loadDraft();
  }

  ngAfterViewInit(): void {
    // Invalidar el mapa después de que la vista esté lista
    setTimeout(() => {
      this.invalidateMapIfNeeded();
    }, 300);
  }

  registerCommunityForm(form: FormGroup): void {
    this.communityForm = form;
    this.surveyForm.setControl('community', form);
    // Cuando el formulario se registra, invalidar el mapa
    setTimeout(() => {
      this.invalidateMapIfNeeded();
    }, 100);
  }

  registerFamilyForm(form: FormGroup): void {
    this.familyForm = form;
    this.surveyForm.setControl('family', form);
  }

  registerAgroForm(form: FormGroup): void {
    this.agroForm = form;
    this.surveyForm.setControl('cultivos', form);
  }

  registerLivestockForm(form: FormGroup): void {
    this.livestockForm = form;
    this.surveyForm.setControl('animales', form);
  }

  registerSocioeconomicForm(form: FormGroup): void {
    this.socioeconomicForm = form;
    this.surveyForm.setControl('socioeconomico', form);
  }

  onStepChange(event: any): void {
    this.currentStep = event.selectedIndex;
    this.updateProgress();
    this.saveDraftLocal();
    // Si el paso seleccionado es el 0 (Comunidad), invalidar el mapa
    if (this.currentStep === 0) {
      setTimeout(() => {
        this.invalidateMapIfNeeded();
      }, 300);
    }
  }

  updateProgress(): void {
    this.progressValue = ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  saveDraftLocal(): void {
    if (this.surveyForm.valid) {
      const draft = {
        data: this.surveyForm.value,
        step: this.currentStep,
        surveyId: this.surveyId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('survey_draft', JSON.stringify(draft));
    }
  }

  loadDraft(): void {
    const draftJson = localStorage.getItem('survey_draft');
    if (draftJson) {
      const draft = JSON.parse(draftJson);
      const confirmLoad = confirm('¿Desea continuar con el borrador guardado?');
      if (confirmLoad) {
        setTimeout(() => {
          if (this.communityForm) this.communityForm.patchValue(draft.data.community || {});
          if (this.familyForm) this.familyForm.patchValue(draft.data.family || {});
          if (this.agroForm) this.agroForm.patchValue(draft.data.cultivos || {});
          if (this.livestockForm) this.livestockForm.patchValue(draft.data.animales || {});
          if (this.socioeconomicForm) this.socioeconomicForm.patchValue(draft.data.socioeconomico || {});

          this.currentStep = draft.step;
          this.surveyId = draft.surveyId;
          this.updateProgress();
          this.stepper.selectedIndex = this.currentStep;

          // Después de cargar el borrador, invalidar el mapa si estamos en el paso 1
          if (this.currentStep === 0) {
            setTimeout(() => {
              this.invalidateMapIfNeeded();
            }, 400);
          }
        }, 100);
      } else {
        localStorage.removeItem('survey_draft');
      }
    }
  }

  // Método para invalidar el mapa si el paso 1 está activo
  private invalidateMapIfNeeded(): void {
    if (this.currentStep === 0 && this.communityStepComponent) {
      this.communityStepComponent.invalidateMap();
    }
  }

  saveDraftBackend(): void {
    if (this.surveyForm.invalid) {
      this.notification.showWarning('Complete los campos obligatorios antes de guardar borrador');
      return;
    }
    this.isSaving = true;
    const surveyData = this.buildSurveyData();
    this.SurveyService.saveSurvey(surveyData, null).subscribe({
      next: (res) => {
        this.surveyId = res.id;
        this.isSaving = false;
        this.notification.showSuccess('Borrador guardado correctamente');
        this.saveDraftLocal();
      },
      error: () => {
        this.isSaving = false;
        this.notification.showError('Error al guardar borrador');
      }
    });
  }

  submitSurvey(): void {
    if (this.surveyForm.invalid) {
      this.notification.showWarning('Complete todos los campos obligatorios');
      return;
    }

    const foto = this.communityForm.get('fotoFile')?.value;
    if (!foto) {
      this.notification.showError('Debe tomar una foto de evidencia');
      return;
    }
    this.isSaving = true;
    const surveyData = this.buildSurveyData();
    this.SurveyService.saveSurvey(surveyData, foto).subscribe({
      next: () => {
        this.isSaving = false;
        this.notification.showSuccess('Encuesta completada exitosamente');
        localStorage.removeItem('survey_draft');
        this.router.navigate(['/encuestas']);
      },
      error: () => {
        this.isSaving = false;
        this.notification.showError('Error al enviar la encuesta');
      }
    });
  }

  private buildSurveyData(): any {
    const communityVal = this.communityForm.value;
    return {
      id: this.surveyId,
      estado: 'completa',
      paso_actual: this.currentStep,
      comunidad: {
        nombre: communityVal.nombre,
        parroquia: communityVal.parroquia,
        canton: communityVal.canton,
        lat: communityVal.lat,
        lng: communityVal.lng,
        referencia_ubicacion: communityVal.referencia_ubicacion
      },
      familia: this.familyForm.value,
      socioeconomico: this.socioeconomicForm.value,
      cultivos: this.agroForm.value.cultivos || [],
      animales: this.livestockForm.value.animales || []
    };
  }
}