import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthResponse,User } from '../interfaces/user.interface';

@Injectable({providedIn: 'root',})

export class AuthService  {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  login(email: string, password:string): Observable<AuthResponse>{

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`,{email, password})
    .pipe(tap(response => {
      if(response.token){
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.usuario));
      }
    })
  );
  }

   logout(): void{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
   }

   getToken(): string| null{
    return localStorage.getItem('token');

   }

   getUser(): User | null {
     const userStr = localStorage.getItem('user');
     if (!userStr) return null;

     try{
      return JSON.parse(userStr);
     } catch {
      return null;
     }
   }
    isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.getUser()?.rol || null;
  }

}
