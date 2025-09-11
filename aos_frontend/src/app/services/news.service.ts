import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DocumentPublicDTO {
  id: number;
  titre: string;
  description: string;
  contentType: string;
  fileName: string;
  type: string;
  publishedByName: string;
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les documents publics
   */
  getAllDocuments(): Observable<DocumentPublicDTO[]> {
    return this.http.get<DocumentPublicDTO[]>(`${this.apiUrl}/public`);
  }

  /**
   * Récupère un document par son ID
   */
  getDocumentById(id: number): Observable<DocumentPublicDTO> {
    return this.http.get<DocumentPublicDTO>(`${this.apiUrl}/public/${id}`);
  }

  /**
   * Télécharge un document
   */
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/public/${id}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Récupère l'image d'un document (si c'est une image)
   */
  getDocumentImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/public/${id}/image`, {
      responseType: 'blob'
    });
  }




 
  getDocumentsByType(type: string): Observable<DocumentPublicDTO[]> {
    return this.http.get<DocumentPublicDTO[]>(`${this.apiUrl}/public/type/${type}`);
  }

  /**
   * Recherche dans les documents
   */
  searchDocuments(query: string): Observable<DocumentPublicDTO[]> {
    return this.http.get<DocumentPublicDTO[]>(`${this.apiUrl}/public/search`, {
      params: { q: query }
    });
  }
}