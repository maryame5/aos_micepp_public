import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceInfo {
  id: number;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ServiceInfoService {
  private apiUrl = `${environment.apiUrl}/api/services`;

  constructor(private http: HttpClient) { }

  getAllServices(): Observable<ServiceInfo[]> {
    return this.http.get<ServiceInfo[]>(this.apiUrl);
  }

  getServiceById(id: number): Observable<ServiceInfo> {
    return this.http.get<ServiceInfo>(`${this.apiUrl}/${id}`);
  }
}
