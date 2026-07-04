import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { NotificationService } from './../../../services/notification';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authservice = inject(AuthService);
  private router = inject (Router);
  private notification = inject (NotificationService);


  loginForm: FormGroup = this.fb.group({
    email:[' ',[  Validators.required, Validators.email]],
    password:[' ', Validators.required]
  });
  loading = false;

  onSubmit(): void {
    if(this.loginForm.invalid){
      this.notification.showWarning('Complete los campos correctamente');
      return;
    }
    this.loading = true;
    const {email, password}=this.loginForm.value;

    this.authservice.login(email, password).subscribe({
    next: () =>{
      this.loading = false;
      this.notification.showSuccess('Inicio de sesion exitoso');
      this.router.navigate(['/dashboard']);

    },
    error: (err)=>{
      this.loading = false;
      const message = err.error?.message || 'credenciales invalidas';
      
    } 
    
  });
  }
}
