import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DemandeRequest {
  serviceId: number;
  description: string;
  serviceData: { [key: string]: any };
}

export interface DocumentJustificatif {
  id: number;
  fileName: string;
  contentType: string;
  uploadedAt?: Date;
}

export interface Demande {
  id: number;
  dateSoumission: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'ACCEPTEE' | 'REFUSEE';
  description: string;
  documentsJustificatifs: DocumentJustificatif[];
  documentReponse?: DocumentJustificatif;
  utilisateur?: {
    id: number;
    email: string;
    fullname?: string;
  
  };
  serviceId: number;
  serviceNom: string;
 

}

export interface DemandeServiceData {
  // Transport Service
  trajet?: string;
  pointDepart?: string;
  pointArrivee?: string;
  frequence?: string;
  
  // Santé Sociale Service
  typeSoin?: string;
  montant?: number;
  
  // Logement Service
  typeLogement?: string;
  localisationSouhaitee?: string;
  montantParticipation?: number;
  
  // Colonie Vacance Service
  nombreEnfants?: number;
  lieuSouhaite?: string;
  periode?: string;
  
  // Appui Scolaire Service
  niveau?: string;
  typeAide?: string;
  montantDemande?: number;
  
  // Activité Culturelle Sportive Service
  typeActivite?: string;
  nomActivite?: string;
  dateActivite?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('aos_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
    }

  /**
   * Create a new demande with files using multipart/form-data
   */
  createDemande(request: DemandeRequest, files: File[]): Observable<Demande> {
    const formData = new FormData();
    
    // Add the JSON request as a blob part
    const requestBlob = new Blob([JSON.stringify(request)], {
      type: 'application/json'
    });
    formData.append('request', requestBlob);
    
    // Add each file
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    

    return this.http.post<Demande>(`${this.apiUrl}/nouveau_demande`, formData, {
      headers: new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('aos_token')}`
    })
    });
  }

  getUserDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl, {
      headers: new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('aos_token')}`
    })
    });
  }



  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getDemandeServiceData(id: number): Observable<DemandeServiceData> {
    return this.http.get<DemandeServiceData>(`${this.apiUrl}/${id}/service-data`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadDocument(demandeId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${demandeId}/documents/${documentId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  updateDemandeStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, status, {
      headers: this.getAuthHeaders()
    });
  }
}