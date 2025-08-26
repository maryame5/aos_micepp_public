// request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServiceRequest, RequestStatus, RequestPriority, Service, Document } from '../models/request.model';
import { environment } from '../../environments/environment';
import { DemandeService, Demande, DemandeRequest, DocumentJustificatif } from './demande.service';
import { BackendServiceService, BackendService } from './backend-service.service';
import { FileUploadService } from './file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private demandeService: DemandeService,
    private backendServiceService: BackendServiceService,
    private fileUploadService: FileUploadService
  ) {}

  getRequests(): Observable<ServiceRequest[]> {
    return this.demandeService.getAllDemandes().pipe(
      switchMap(demandes => {
        if (!demandes || demandes.length === 0) return of([]);
        const serviceRequests = demandes.map(demande =>
          this.backendServiceService.getServiceById(demande.service.id).pipe(
            map(service => this.convertDemandeToServiceRequestWithFullService(demande, service)),
            catchError(() => of(this.convertDemandeToServiceRequest(demande)))
          )
        );
        return forkJoin(serviceRequests);
      }),
      catchError(error => {
        console.error('Error fetching requests:', error);
        return of([]);
      })
    );
  }

  getRequestById(id: string): Observable<ServiceRequest | undefined> {
    return this.demandeService.getDemandeById(parseInt(id)).pipe(
      switchMap(demande => {
        if (!demande) return of(undefined);
        return this.backendServiceService.getServiceById(demande.service.id).pipe(
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
          this.backendServiceService.getServiceById(demande.service.id).pipe(
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
      commentaire: request.description!,
      serviceData: this.extractServiceData(request)
    };

    return this.demandeService.createDemande(demandeRequest, files).pipe(
      map(response => ({
        id: response.id.toString(),
        userId: request.userId!,
        serviceId: request.serviceId!,
        title: request.title!,
        description: request.description!,
        status: RequestStatus.PENDING,
        priority: request.priority || RequestPriority.MEDIUM,
        documents: files.map((file, index) => ({
          id: `${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: '', // URL will be set when fetching the demande
          uploadedAt: new Date()
        })),
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      catchError(error => {
        console.error('Error creating request:', error);
        throw error;
      })
    );
  }

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

  getServiceSpecificData(serviceId: string, demandeId: string): Observable<any> {
    return this.demandeService.getDemandeServiceData(parseInt(demandeId)).pipe(
      catchError(error => {
        console.error('Error fetching service specific data:', error);
        return of({});
      })
    );
  }

  private convertDemandeToServiceRequestWithFullService(demande: Demande, service: BackendService): ServiceRequest {
    return {
      id: demande.id.toString(),
      userId: demande.utilisateur?.id?.toString() || '',
      serviceId: demande.service.id.toString(),
      title: `Demande ${service.title || service.nom}`,
      description: demande.commentaire,
      status: this.convertBackendStatusToFrontend(demande.statut),
      priority: RequestPriority.MEDIUM,
      documents: this.convertDocumentJustificatifs(demande.documentsJustificatifs, demande.id),
      comments: [],
      createdAt: new Date(demande.dateSoumission),
      updatedAt: demande.lastModifiedDate ? new Date(demande.lastModifiedDate) : new Date(demande.dateSoumission),
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
      id: demande.id.toString(),
      userId: demande.utilisateur?.id?.toString() || '',
      serviceId: demande.service.id.toString(),
      title: `Demande ${demande.service.nom}`,
      description: demande.commentaire,
      status: this.convertBackendStatusToFrontend(demande.statut),
      priority: RequestPriority.MEDIUM,
      documents: this.convertDocumentJustificatifs(demande.documentsJustificatifs, demande.id),
      comments: [],
      createdAt: new Date(demande.dateSoumission),
      updatedAt: demande.lastModifiedDate ? new Date(demande.lastModifiedDate) : new Date(demande.dateSoumission)
    };
  }

  // Fixed method to handle DocumentJustificatif objects instead of string paths
  private convertDocumentJustificatifs(documentsJustificatifs: DocumentJustificatif[] | undefined, demandeId: number): Document[] {
    if (!documentsJustificatifs || documentsJustificatifs.length === 0) {
      return [];
    }
    
    return documentsJustificatifs.map((doc) => ({
      id: doc.id.toString(),
      name: doc.fileName,
      type: doc.contentType,
      size: 0, // Size not available from DocumentJustificatif
      url: `${environment.apiUrl}/demandes/${demandeId}/documents/${doc.id}`,
      uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date()
    }));
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
    return request.serviceData || {};
  }
}