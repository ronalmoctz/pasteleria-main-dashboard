import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.getUrl(endpoint), body);
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.getUrl(endpoint));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.getUrl(endpoint), body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.getUrl(endpoint));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.getUrl(endpoint), body);
  }
}
