import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DemandeRequest {
  serviceId: number;
  commentaire: string;
  documentsJustificatifs: string[];
  serviceData: { [key: string]: any };
}

export interface Demande {
  id: number;
  dateSoumission: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'ACCEPTEE' | 'REFUSEE';
  commentaire: string;
  documentsJustificatifs: string[];
  documentReponse?: string;
  utilisateur?: {
    id: number;
    email: string;
    nom?: string;
    prenom?: string;
  };
  service: {
    id: number;
    nom: string;
  };
  lastModifiedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient) {}

  createDemande(request: DemandeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/nouveau_demande`, request);
  }

  getUserDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl);
  }

  getAllDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/all`);
  }

  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/${id}`);
  }

  updateDemandeStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, status);
  }

  addDocumentReponse(id: number, documentPath: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/document-reponse`, documentPath);
  }
}
