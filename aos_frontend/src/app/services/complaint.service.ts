import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Define interfaces to match your backend
export interface ReclamationRequest {
  objet: string;
  contenu: string;
}

export interface ReclamationResponse {
  id?: number;
  objet: string;
  contenu: string;
  statut: string;
  dateSoumission: string;
  lastModifiedDate?: string;
  utilisateur?: any;
  assignedTo?: any;
  commentaire?: string;
}

export enum StatutReclamation {
  EN_ATTENTE = 'EN_ATTENTE',
  AFFECTEE = 'AFFECTEE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  CLOTUREE = 'CLOTUREE'
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private readonly apiUrl = `${environment.apiUrl}/Reclamation`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('aos_token') || sessionStorage.getItem('aos_token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  createComplaint(request: ReclamationRequest): Observable<any> {
    const headers = this.getAuthHeaders();
   return this.http.post(`${this.apiUrl}/ajouter`, request, { 
      headers,
      responseType: 'text' 
    }).pipe(
      tap(response => {
        console.log('Complaint creation response:', response);
      }),
      catchError(this.handleError)
    );
  }

  // Fixed: Now returns array instead of single object
  getComplaintsByUser(): Observable<ReclamationResponse[]> {
    const headers = this.getAuthHeaders();
    
    console.log('Fetching user complaints with headers:', headers);

    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}`, { headers }).pipe(
      tap(response => {
        console.log('User complaints retrieved:', response);
      }),
      catchError(this.handleError)
    );
  }

  // Kept for backward compatibility
  getComplaintByUser(): Observable<ReclamationResponse[]> {
    return this.getComplaintsByUser();
  }

  getAllComplaints(): Observable<ReclamationResponse[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/all`, { headers }).pipe(
      tap(response => {
        console.log('All complaints retrieved:', response);
      }),
      catchError(this.handleError)
    );
  }

  getComplaintById(id: number): Observable<ReclamationResponse> {
    const headers = this.getAuthHeaders();

    return this.http.get<ReclamationResponse>(`${this.apiUrl}/details/${id}`, { headers }).pipe(
      tap(response => {
        console.log('Complaint retrieved by ID:', response);
      }),
      catchError(this.handleError)
    );
  }

  updateComplaintStatus(id: number, status: StatutReclamation): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.patch(`${this.apiUrl}/${id}/status`, { status }, { 
      headers,
      responseType: 'text'
    }).pipe(
      tap(response => {
        console.log('Complaint status updated:', response);
      }),
      catchError(this.handleError)
    );
  }

  deleteComplaint(id: number): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers,
      responseType: 'text'
    }).pipe(
      tap(response => {
        console.log('Complaint deleted:', response);
      }),
      catchError(this.handleError)
    );
  }

  getComplaintStatistics(): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/statistics`, { headers }).pipe(
      tap(response => {
        console.log('Complaint statistics retrieved:', response);
      }),
      catchError(this.handleError)
    );
  }

  searchComplaints(criteria: {
    objet?: string;
    statut?: StatutReclamation;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<ReclamationResponse[]> {
    const headers = this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (criteria.objet) params.append('objet', criteria.objet);
    if (criteria.statut) params.append('statut', criteria.statut);
    if (criteria.dateFrom) params.append('dateFrom', criteria.dateFrom);
    if (criteria.dateTo) params.append('dateTo', criteria.dateTo);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/search${queryString}`, { headers }).pipe(
      tap(response => {
        console.log('Complaints search results:', response);
      }),
      catchError(this.handleError)
    );
  }

  validateComplaintData(request: ReclamationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!request.objet || request.objet.trim().length === 0) {
      errors.push('L\'objet est requis');
    } else if (request.objet.trim().length < 5) {
      errors.push('L\'objet doit contenir au moins 5 caractères');
    } else if (request.objet.length > 200) {
      errors.push('L\'objet ne peut pas dépasser 200 caractères');
    }

    if (!request.contenu || request.contenu.trim().length === 0) {
      errors.push('Le contenu est requis');
    } else if (request.contenu.trim().length < 20) {
      errors.push('Le contenu doit contenir au moins 20 caractères');
    } else if (request.contenu.length > 2000) {
      errors.push('Le contenu ne peut pas dépasser 2000 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatStatus(status: StatutReclamation): string {
    const statusMap = {
      [StatutReclamation.EN_ATTENTE]: 'En attente',
      [StatutReclamation.AFFECTEE]: 'Affectée',
      [StatutReclamation.EN_COURS]: 'En cours de traitement',
      [StatutReclamation.RESOLUE]: 'Résolue',
      [StatutReclamation.CLOTUREE]: 'Clôturée'
    };

    return statusMap[status] || status;
  }

  getStatusColor(status: StatutReclamation): string {
    const colorMap = {
      [StatutReclamation.EN_ATTENTE]: 'status-pending',
      [StatutReclamation.AFFECTEE]: 'status-assigned',
      [StatutReclamation.EN_COURS]: 'status-in-progress',
      [StatutReclamation.RESOLUE]: 'status-resolved',
      [StatutReclamation.CLOTUREE]: 'status-closed'
    };

    return colorMap[status] || 'status-default';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides';
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          break;
        case 401:
          errorMessage = 'Non autorisé - veuillez vous connecter';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          break;
        case 501:
          errorMessage = 'Fonctionnalité non implémentée';
          break;
        default:
          errorMessage = `Erreur serveur (${error.status}): ${error.message}`;
      }

      // If the server returned an error message, use it
      if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('ComplaintService Error:', error);
    console.error('Error message:', errorMessage);

    return throwError(() => ({
      ...error,
      userMessage: errorMessage
    }));
  }
}