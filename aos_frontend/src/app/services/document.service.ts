import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DocumentDTO {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  downloadUrl: string;
  previewUrl: string;
  uploadedAt: Date;
  description?: string;
  demandeId: number;
  demandeReference: string;
  statutDemande: string;
  source: string;
  sourceType: string; // "JUSTIFICATIF" ou "REPONSE"
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient) { }

  getUserDocuments(): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(this.apiUrl);
  }

  getDocumentsByUserId(userId: number): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  previewDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/preview`, {
      responseType: 'blob'
    });
  }

  getDocumentCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getDocumentTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }
}