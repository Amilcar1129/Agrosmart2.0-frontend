import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './../../services/auth';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar/sidebar';
@Component({
  selector: 'app-main-layout',
  imports: [ CommonModule, RouterOutlet, MatSidenavModule, 
    MatToolbarModule, MatIconModule, SidebarComponent],

  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent  {

  private authService = inject (AuthService);
  user = this.authService.getUser();

  logout() {
    this.authService.logout();
  }
}
