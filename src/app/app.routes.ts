/*import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SurveyWizardComponent } from './pages/survey/survey-wizard.component';
import { EncuestasListComponent } from './pages/encuestas-list/encuestas-list.component';
import { EncuestaDetailComponent } from './pages/encuesta-detail/encuesta-detail.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'survey/new', component: SurveyWizardComponent },
      { path: 'survey/:id', component: EncuestaDetailComponent },
      { path: 'encuestas', component: EncuestasListComponent },
      { path: 'mapa', component: MapViewComponent },
      { path: 'reportes', component: ReportsComponent },
      {
        path: 'usuarios',
        component: UsersComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];*/

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { AuthGuard} from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Dashboard } from './pages/dashboard/dashboard/dashboard';
import { SurveyWizardComponent } from './pages/survey/survey-wizard/survey-wizard';



export const routes: Routes = [
  // Ruta pública de login
  { path: 'login', component: LoginComponent },

  // Rutas protegidas (requieren autenticación)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'survey/new', component: SurveyWizardComponent },
  
      // Redirección por defecto dentro del área protegida
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Ruta comodín: redirige a login si la URL no coincide con ninguna
  { path: '**', redirectTo: 'login' }
];
