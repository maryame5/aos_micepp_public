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

  constructor(private http: HttpClient) {}

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
      // Filter out null values to satisfy TypeScript
      filter((value): value is UploadProgress | UploadResponse => value !== null)
    );
  }

  deleteDocument(documentPath: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents`, { body: { documentPath } });
  }

  getDocumentUrl(documentPath: string): string {
    return `${environment.apiUrl}/documents/${documentPath}`;
  }
}
