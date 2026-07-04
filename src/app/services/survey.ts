import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  saveSurvey(surveyData: any, photoFile: File | null): Observable<any>{
    const formData = new FormData();
    formData.append('datos', JSON.stringify(surveyData));
    if (photoFile) {
      formData.append('foto', photoFile);
    }
    return this.http.post(`${this.apiUrl}/survey`, formData);
  }

  getSurveyById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/survey/${id}`);
  }

  getAllSurveys(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/survey`, { params });
  }

  deleteSurvey(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/survey/${id}`);
  }
}



