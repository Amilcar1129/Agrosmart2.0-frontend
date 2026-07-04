import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  userRole: any = this.authService.getRole();

  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['tecnico', 'coordinador', 'admin'] },
    { path: '/survey/new', icon: 'add_circle', label: 'Nueva Encuesta', roles: ['tecnico', 'coordinador', 'admin'] },
    { path: '/encuestas', icon: 'list', label: 'Historial', roles: ['tecnico', 'coordinador', 'admin'] },
    { path: '/mapa', icon: 'map', label: 'Mapa', roles: ['tecnico', 'coordinador', 'admin'] },
    { path: '/reportes', icon: 'bar_chart', label: 'Reportes', roles: ['tecnico', 'coordinador', 'admin'] },
    { path: '/usuarios', icon: 'people', label: 'Usuarios', roles: ['admin'] }
  ];

  get visibleItems() {
    return this.menuItems.filter(item => item.roles.includes(this.userRole || ''));
  }
}

