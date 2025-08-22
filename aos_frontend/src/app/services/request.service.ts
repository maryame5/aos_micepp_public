// request.service.ts - Version corrigée pour utiliser les nouveaux DTOs
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServiceRequest, RequestStatus, RequestPriority, Service } from '../models/request.model';
import { environment } from '../../environments/environment';
import { DemandeService, Demande } from './demande.service';
import { BackendServiceService, BackendService } from './backend-service.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private demandeService: DemandeService,
    private backendServiceService: BackendServiceService
  ) {}

  // Méthodes pour les demandes (utilisent DemandeService)
  getRequests(): Observable<ServiceRequest[]> {
    return this.demandeService.getAllDemandes().pipe(
      map(demandes => this.convertDemandesToServiceRequests(demandes)),
      catchError(error => {
        console.error('Error fetching requests:', error);
        return of([]);
      })
    );
  }

  getRequestById(id: string): Observable<ServiceRequest | undefined> {
    return this.demandeService.getDemandeById(parseInt(id)).pipe(
      map(demande => demande ? this.convertDemandeToServiceRequest(demande) : undefined),
      catchError(error => {
        console.error('Error fetching request by id:', error);
        return of(undefined);
      })
    );
  }

  getUserRequests(userId: string): Observable<ServiceRequest[]> {
    return this.demandeService.getUserDemandes().pipe(
      map(demandes => this.convertDemandesToServiceRequests(demandes)),
      catchError(error => {
        console.error('Error fetching user requests:', error);
        return of([]);
      })
    );
  }

  createRequest(request: Partial<ServiceRequest>): Observable<ServiceRequest> {
    // Convertir ServiceRequest en DemandeRequest
    const demandeRequest = {
      serviceId: parseInt(request.serviceId!),
      commentaire: request.description!,
      documentsJustificatifs: request.documents?.map(doc => doc.name) || [],
      serviceData: this.extractServiceData(request)
    };

    return this.demandeService.createDemande(demandeRequest).pipe(
      map(() => {
        // Créer un ServiceRequest temporaire pour la compatibilité
        const newRequest: ServiceRequest = {
          id: Date.now().toString(),
          userId: request.userId!,
          serviceId: request.serviceId!,
          title: request.title!,
          description: request.description!,
          status: RequestStatus.PENDING,
          priority: request.priority || RequestPriority.MEDIUM,
          documents: request.documents || [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return newRequest;
      }),
      catchError(error => {
        console.error('Error creating request:', error);
        throw error;
      })
    );
  }

  updateRequestStatus(id: string, status: RequestStatus): Observable<ServiceRequest> {
    const statutDemande = this.convertStatusToBackend(status);
    return this.demandeService.updateDemandeStatus(parseInt(id), statutDemande).pipe(
      map(() => {
        // Retourner un ServiceRequest temporaire
        const request: ServiceRequest = {
          id: id,
          userId: '',
          serviceId: '',
          title: '',
          description: '',
          status: status,
          priority: RequestPriority.MEDIUM,
          documents: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return request;
      }),
      catchError(error => {
        console.error('Error updating request status:', error);
        throw error;
      })
    );
  }

  assignRequest(id: string, assignedTo: string): Observable<ServiceRequest> {
    // Cette fonctionnalité n'est pas encore implémentée dans le backend
    console.warn('Assign request functionality not implemented in backend yet');
    return of({
      id: id,
      userId: '',
      serviceId: '',
      title: '',
      description: '',
      status: RequestStatus.PENDING,
      priority: RequestPriority.MEDIUM,
      documents: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: assignedTo
    });
  }

  // Méthodes pour les services (utilisent BackendServiceService)
  getServices(): Observable<Service[]> {
    return this.backendServiceService.getAllServices().pipe(
      map(backendServices => this.convertBackendServicesToServices(backendServices)),
      catchError(error => {
        console.error('Error fetching services:', error);
        return of([]);
      })
    );
  }

  getServiceById(id: string): Observable<Service | undefined> {
    return this.backendServiceService.getServiceById(parseInt(id)).pipe(
      map(backendService => backendService ? this.convertBackendServiceToService(backendService) : undefined),
      catchError(error => {
        console.error('Error fetching service by id:', error);
        return of(undefined);
      })
    );
  }

  // Méthodes de conversion
  private convertDemandesToServiceRequests(demandes: Demande[]): ServiceRequest[] {
    return demandes.map(demande => this.convertDemandeToServiceRequest(demande));
  }

  private convertDemandeToServiceRequest(demande: Demande): ServiceRequest {
    return {
      id: demande.id.toString(),
      userId: demande.utilisateur?.id?.toString() || '',
      serviceId: demande.service.id.toString(),
      title: `Demande ${demande.service.nom}`,
      description: demande.commentaire,
      status: this.convertBackendStatusToFrontend(demande.statut),
      priority: RequestPriority.MEDIUM, // Par défaut
      documents: demande.documentsJustificatifs.map(doc => ({
        id: Date.now().toString(),
        name: doc,
        type: 'application/pdf',
        size: 0,
        url: '',
        uploadedAt: new Date()
      })),
      comments: [],
      createdAt: new Date(demande.dateSoumission),
      updatedAt: demande.lastModifiedDate ? new Date(demande.lastModifiedDate) : new Date(demande.dateSoumission)
    };
  }

  private convertBackendServicesToServices(backendServices: BackendService[]): Service[] {
    return backendServices.map(backendService => this.convertBackendServiceToService(backendService));
  }

  private convertBackendServiceToService(backendService: BackendService): Service {
    return {
      id: backendService.id.toString(),
      name: backendService.title || backendService.nom,
      description: backendService.description,
      category: backendService.type,
      isActive: backendService.isActive,
      formFields: backendService.formFields || [],
      requiredDocuments: backendService.requiredDocuments || []
    };
  }

  private convertBackendStatusToFrontend(statut: string): RequestStatus {
    switch (statut) {
      case 'EN_ATTENTE': return RequestStatus.PENDING;
      case 'EN_COURS': return RequestStatus.IN_PROGRESS;
      case 'ACCEPTEE': return RequestStatus.APPROVED;
      case 'REFUSEE': return RequestStatus.REJECTED;
      default: return RequestStatus.PENDING;
    }
  }

  private convertStatusToBackend(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.PENDING: return 'EN_ATTENTE';
      case RequestStatus.IN_PROGRESS: return 'EN_COURS';
      case RequestStatus.APPROVED: return 'ACCEPTEE';
      case RequestStatus.REJECTED: return 'REFUSEE';
      default: return 'EN_ATTENTE';
    }
  }

  private extractServiceData(request: Partial<ServiceRequest>): { [key: string]: any } {
    // Extraire les données spécifiques au service depuis les champs dynamiques
    const serviceData: { [key: string]: any } = {};
    
    // Cette méthode sera utilisée pour extraire les données depuis les champs du formulaire
    // Les données seront disponibles dans request après soumission du formulaire
    
    return serviceData;
  }}