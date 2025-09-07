import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contacts`; // Ajustez selon votre configuration

  constructor(private http: HttpClient) {}

  sendMessage(contactData: ContactRequest): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(this.apiUrl, contactData, {
      headers,
      responseType: 'text' as 'json'
    });
  }
}