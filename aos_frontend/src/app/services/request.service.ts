// request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServiceRequest, RequestStatus,  Service, Document } from '../models/request.model';
import { environment } from '../../environments/environment';
import { DemandeService, Demande, DemandeRequest, DocumentJustificatif } from './demande.service';
import { BackendServiceService, BackendService } from './backend-service.service';
import { FileUploadService } from './file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  

  constructor(
    private http: HttpClient,
    private demandeService: DemandeService,
    private backendServiceService: BackendServiceService,
    private fileUploadService: FileUploadService
  ) {}

 

  getRequestById(id: string): Observable<ServiceRequest | undefined> {
    return this.demandeService.getDemandeById(parseInt(id)).pipe(
      switchMap(demande => {
        if (!demande) return of(undefined);
        if (!demande.serviceId) return of(this.convertDemandeToServiceRequest(demande));
        return this.backendServiceService.getServiceById(demande.serviceId).pipe(
          map(service => this.convertDemandeToServiceRequestWithFullService(demande, service)),
          catchError(() => of(this.convertDemandeToServiceRequest(demande)))
        );
      }),
      catchError(error => {
        console.error('Error fetching request by id:', error);
        return of(undefined);
      })
    );
  }

  getUserRequests(userId: string): Observable<ServiceRequest[]> {
    return this.demandeService.getUserDemandes().pipe(
      switchMap(demandes => {
        if (!demandes || demandes.length === 0) return of([]);
        const serviceRequests = demandes.map(demande =>
          this.backendServiceService.getServiceById(demande.serviceId).pipe(
            map(service => this.convertDemandeToServiceRequestWithFullService(demande, service)),
            catchError(() => of(this.convertDemandeToServiceRequest(demande)))
          )
        );
        return forkJoin(serviceRequests);
      }),
      catchError(error => {
        console.error('Error fetching user requests:', error);
        return of([]);
      })
    );
  }

    createRequest(request: Partial<ServiceRequest>, files: File[]): Observable<ServiceRequest> {
    const demandeRequest: DemandeRequest = {
      serviceId: parseInt(request.serviceId!),
      description: request.description!,
      serviceData: this.extractServiceData(request)
    };

    // Use the fixed createDemande method from DemandeService
    return this.demandeService.createDemande(demandeRequest, files).pipe(
      map(demande => {
        console.log('Create demande response:', demande); // Debug log
        return this.convertDemandeToServiceRequest(demande);
      }),
      catchError(error => {
        console.error('Error creating request - Full error:', error);

        throw error;
      })
    );
  }

  // This method should work fine as it uses BackendServiceService
  getServices(): Observable<Service[]> {
    return this.backendServiceService.getAllServices().pipe(
      map(backendServices => {
        console.log('Fetched backend services:', backendServices); // Debug log
        return this.convertBackendServicesToServices(backendServices);
      }),
      catchError(error => {
        console.error('Error fetching services - Full error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
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

  getServiceSpecificData(serviceId: string, demandeId: number): Observable<any> {
    return this.demandeService.getDemandeServiceData(demandeId).pipe(
      catchError(error => {
        console.error('Error fetching service specific data:', error);
        return of({});
      })
    );
  }

  private convertDemandeToServiceRequestWithFullService(demande: Demande, service: BackendService): ServiceRequest {
    return {
      id: demande.id,
      userId: demande.utilisateur?.id?.toString() || '',
      serviceId: demande.serviceId?.toString() || '',
      title: `Demande ${service.title || service.nom}`,
      description: demande.description || '',
      status: this.convertBackendStatusToFrontend(demande.statut),

      documents: this.convertDocumentJustificatifs(demande.documentsJustificatifs, demande.id),
      documentReponse: demande.documentReponse ? this.convertDocumentJustificatifToDocument(demande.documentReponse, demande.id) : undefined,
      commentaire: demande.commentaire || '',
      createdAt: new Date(demande.dateSoumission),
      // Additional fields for comprehensive display
      utilisateurNom: demande.utilisateur?.fullname || '',
      utilisateurEmail: demande.utilisateur?.email || '',
      serviceNom: service.nom || service.title || '',
      assignedToUsername: demande.assignedTo?.fullname || '',
      lastModifiedDate: demande.lastModifiedDate ? new Date(demande.lastModifiedDate) : new Date(demande.dateSoumission),
       serviceData: {
        serviceType: service.type,
        serviceName: service.nom,
        serviceTitle: service.title,
        serviceDescription: service.description,
        serviceFeatures: service.features,
        formFields: service.formFields
      }
    };
  }

  private convertDemandeToServiceRequest(demande: Demande): ServiceRequest {
    return {
      id: demande.id,
      userId: demande.utilisateur?.id ? demande.utilisateur.id.toString() : '',
      serviceId: demande.serviceId ? demande.serviceId.toString() : '',
      title: `Demande ${demande.serviceNom || 'Service'}`,
      description: demande.description || '',
      status: this.convertBackendStatusToFrontend(demande.statut),

      documents: this.convertDocumentJustificatifs(demande.documentsJustificatifs, demande.id),
      commentaire: demande.commentaire || '',
      createdAt: new Date(demande.dateSoumission),

    };
  }

  private convertDocumentJustificatifs(documentsJustificatifs: DocumentJustificatif[] | undefined, demandeId: number): Document[] {
    if (!documentsJustificatifs || documentsJustificatifs.length === 0) {
      return [];
    }

    return documentsJustificatifs.map((doc) => ({
      id: doc.id?.toString() || '',
      name: doc.fileName || '',
      type: doc.contentType || '',
      size: 0, // Size not available from DocumentJustificatif
      url: `${environment.apiUrl}/demandes/${demandeId}/documents/${doc.id}`,
      uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date()
    }));
  }

  private convertDocumentJustificatifToDocument(documentJustificatif: DocumentJustificatif, demandeId: number): Document {
    return {
      id: documentJustificatif.id?.toString() || '',
      name: documentJustificatif.fileName || '',
      type: documentJustificatif.contentType || '',
      size: 0, // Size not available from DocumentJustificatif
      url: `${environment.apiUrl}/demandes/${demandeId}/documents/${documentJustificatif.id}`,
      uploadedAt: documentJustificatif.uploadedAt ? new Date(documentJustificatif.uploadedAt) : new Date()
    };
  }

  private convertBackendServicesToServices(backendServices: BackendService[]): Service[] {
    if (!backendServices || !Array.isArray(backendServices)) {
      console.warn('Invalid backend services data:', backendServices);
      return [];
    }
    return backendServices.map(backendService => this.convertBackendServiceToService(backendService));
  }

  private convertBackendServiceToService(backendService: BackendService): Service {
    return {
      id: backendService.id?.toString() || '',
      name: backendService.title || backendService.nom || '',
      description: backendService.description || '',
      category: backendService.type || '',
      isActive: backendService.isActive || false,
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
    return request.serviceData || {};
  }
}