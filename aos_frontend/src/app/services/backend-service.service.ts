// backend-service.service.ts - Interface mise à jour pour le backend
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BackendService {
  id: number;
  nom: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  isActive: boolean;
  formFields: FormField[];
  requiredDocuments: string[];
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BackendServiceService {
  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) { }

  getAllServices(): Observable<BackendService[]> {
    return this.http.get<BackendService[]>(this.apiUrl);
  }

  getServiceById(id: number): Observable<BackendService> {
    return this.http.get<BackendService>(`${this.apiUrl}/${id}`);
  }
}