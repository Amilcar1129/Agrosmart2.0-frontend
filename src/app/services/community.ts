import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

 getAllCommunities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/communities`);
  }

  getNearbyCommunities(lat: number, lng: number, radius: number = 5000): Observable<any> {
    return this.http.get(`${this.apiUrl}/communities/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }
}