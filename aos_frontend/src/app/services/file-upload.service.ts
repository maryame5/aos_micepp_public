import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, map, filter } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export interface UploadResponse {
  success: boolean;
  documentPaths: string[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/upload`;
private uploadUrl = `${environment.apiUrl}/upload/documents`;
  constructor(private http: HttpClient) {}

  uploadFiles(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<string[]>(this.uploadUrl, formData);
  }

  uploadDocuments(files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('documents', file);
    });

    return this.http.post<UploadResponse>(`${this.apiUrl}/documents`, formData);
  }

  uploadDocumentsWithProgress(files: File[]): Observable<UploadProgress | UploadResponse> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('documents', file);
    });

    return this.http.post(`${this.apiUrl}/documents`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressEvent = event as HttpProgressEvent;
          return {
            progress: Math.round(100 * progressEvent.loaded / (progressEvent.total || 1)),
            loaded: progressEvent.loaded,
            total: progressEvent.total || 1
          } as UploadProgress;
        } else if (event.type === HttpEventType.Response) {
          return event.body as UploadResponse;
        }
        return null;
      }),
      filter((value): value is UploadProgress | UploadResponse => value !== null)
    );
  }

  // ✅ Méthode pour télécharger un document
  downloadDocument(documentPath: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/documents/download/${encodeURIComponent(documentPath)}`, {
      responseType: 'blob'
    });
  }

  // ✅ Méthode pour obtenir l'URL de visualisation d'un document
  getDocumentViewUrl(documentPath: string): string {
    return `${environment.apiUrl}/documents/view/${encodeURIComponent(documentPath)}`;
  }

  deleteDocument(documentPath: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents`, { body: { documentPath } });
  }

  getDocumentUrl(documentPath: string): string {
    return `${environment.apiUrl}/documents/${documentPath}`;
  }

  // ✅ Méthode pour vérifier si un document existe
  checkDocumentExists(documentPath: string): Observable<boolean> {
    return this.http.head(`${environment.apiUrl}/documents/check/${encodeURIComponent(documentPath)}`, {
      observe: 'response'
    }).pipe(
      map(response => response.status === 200)
    );
  }

  
}