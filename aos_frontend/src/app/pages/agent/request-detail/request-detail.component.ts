import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { RequestService } from '../../../services/request.service';
import { DemandeService } from '../../../services/demande.service';
import { ServiceRequest, RequestStatus } from '../../../models/request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="request-detail-container">
      <app-page-header
        [title]="request?.title || 'Détail de la demande'" 
        subtitle="Consultez les détails et le suivi de votre demande">
        <div slot="actions">
          <button mat-stroked-button routerLink="/agent/requests">
            <mat-icon>arrow_back</mat-icon>
            Retour aux demandes
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="request-content" *ngIf="!isLoading && request">
        <div class="request-grid">
          <!-- Main Request Info -->
          <mat-card class="request-info-card">
            <mat-card-header>
              <mat-card-title>Informations générales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Statut</label>
                  <mat-chip [class]="getStatusClass(request.status)">
                    {{ getStatusLabel(request.status) }}
                  </mat-chip>
                </div>
                <div class="info-item">
                  <label>Date de création</label>
                  <span>{{ request.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>
                <div class="info-item" *ngIf="request.lastModifiedDate">
                  <label>Dernière modification</label>
                  <span>{{ request.lastModifiedDate | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>
                <div class="info-item" *ngIf="request.dueDate">
                  <label>Date d'échéance</label>
                  <span>{{ request.dueDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item" *ngIf="request.utilisateurNom">
                  <label>Utilisateur</label>
                  <span>{{ request.utilisateurNom }}</span>
                </div>
                <div class="info-item" *ngIf="request.utilisateurEmail">
                  <label>Email</label>
                  <span>{{ request.utilisateurEmail }}</span>
                </div>
                <div class="info-item" *ngIf="request.serviceNom">
                  <label>Service</label>
                  <span>{{ request.serviceNom }}</span>
                </div>
                <div class="info-item" *ngIf="request.assignedToUsername">
                  <label>Assigné à</label>
                  <span>{{ request.assignedToUsername }}</span>
                </div>
              </div>

              <mat-divider class="section-divider"></mat-divider>

              <div class="description-section">
                <h4>Description</h4>
                <p>{{ request.description }}</p>
              </div>

              <div class="service-data-section" *ngIf="request.serviceData">
                <h4>Données spécifiques du service</h4>
                <div *ngFor="let field of getServiceDataFields()">
                  <strong>{{ field.label }}:</strong> {{ field.value }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Documents -->
          <mat-card class="documents-card" *ngIf="request.documents.length > 0">
            <mat-card-header>
              <mat-card-title>Documents joints</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="documents-list">
                <div class="document-item" *ngFor="let doc of request.documents">
                  <mat-icon>{{ getFileIcon(doc.name) }}</mat-icon>
                  <div class="document-info">
                    <span class="document-name">{{ doc.name }}</span>
                     </div>
                  <button mat-icon-button (click)="downloadDocument(doc.id, request.id, doc.name)">
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          </div>
          <mat-card class="admin-comment-card" *ngIf="request.commentaire">
          <mat-card-header>
            <div class="comment-header">
              <mat-icon class="quote-icon">format_quote</mat-icon>
              <div class="comment-title-section">
                <mat-card-title>Commentaire de l'admin</mat-card-title>
              </div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="admin-comment-content">
              <p class="comment-text">{{ request.commentaire }}</p>
            </div>
          </mat-card-content>
        </mat-card>
    

          <!-- Response Document -->
          <mat-card class="response-document-card" *ngIf="request.documentReponse">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="section-icon">description</mat-icon>
                Document de réponse
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="response-document-content">
                <div class="document-item response-doc-item">
                  <mat-icon class="file-icon">{{ getFileIcon(request.documentReponse.name) }}</mat-icon>
                  <div class="document-info">
                    <span class="document-name">{{ request.documentReponse.name }}</span>
                  </div>
                  <button mat-icon-button color="primary" (click)="downloadDocument(request.documentReponse.id, request.id, request.documentReponse.name)">
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
                <div class="response-note">
                  <mat-icon class="info-icon">info</mat-icon>
                  <span>Ce document contient la réponse officielle à votre demande</span>
                </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

        <!-- Admin Comment Card -->


      <div class="empty-state" *ngIf="!isLoading && !request">
        <mat-icon class="empty-icon">assignment</mat-icon>
        <h3>Demande non trouvée</h3>
        <p>La demande que vous recherchez n'existe pas ou a été supprimée.</p>
        <button mat-raised-button color="primary" routerLink="/agent/requests">
          Retour aux demandes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .request-detail-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .request-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .request-info-card,
    .documents-card,
    .response-document-card,
    .admin-comment-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .info-item span {
      color: #6b7280;
    }

    .section-divider {
      margin: 1.5rem 0;
    }

    .description-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .description-section p {
      margin: 0;
      color: #6b7280;
      line-height: 1.6;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .document-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .document-name {
      font-weight: 500;
      color: #374151;
    }

    .document-size {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Response Document Styles */
    .response-document-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .response-doc-item {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #3b82f6;
      border-radius: 12px;
    }

    .file-icon {
      color: #3b82f6;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .response-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 3px solid #3b82f6;
    }

    .info-icon {
      color: #3b82f6;
      font-size: 1.25rem;
    }

    .response-note span {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
    }

    .section-icon {
      margin-right: 0.5rem;
      color: #3b82f6;
    }
    
    /* Admin Comment Styles */
    .admin-comment-card {
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-left: 4px solid #3b82f6;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .comment-title-section {
      flex: 1;
    }

    .admin-comment-content {
      position: relative;
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .quote-icon {
      position: absolute;
      top: -8px;
      left: -8px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      padding: 8px;
      font-size: 1.25rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .comment-text {
      margin: 0;
      color: #374151;
      line-height: 1.7;
      font-size: 0.95rem;
      padding-left: 1rem;
      font-style: italic;
    }

    .mat-chip.status-pending {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-in-progress {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-approved {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.status-rejected {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
    }

    .mat-chip.status-completed {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.status-en-attente {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-en-cours {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-acceptee {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.status-refusee {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 1rem 0;
      color: #374151;
    }

    .empty-state p {
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .request-detail-container {
        padding: 0.5rem;
      }

      .request-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  request: ServiceRequest | null = null;
  isLoading = true;
  requestId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private demandeService: DemandeService
  ) {}

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id');
    if (this.requestId) {
      this.loadRequest();
    }
  }

  loadRequest(): void {
    if (this.requestId) {
      this.requestService.getRequestById(this.requestId).subscribe({
        next: (request) => {
          this.request = request || null;
          this.isLoading = false;
          if (request) {
            this.requestService.getServiceSpecificData(request.serviceId, request.id).subscribe({
              next: (serviceData) => {
                if (this.request) {
                  this.request.serviceData = { ...this.request.serviceData, specificData: serviceData };
                }
              },
              error: (error) => console.error('Error fetching service specific data:', error)
            });
          }
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getStatusLabel(status: RequestStatus): string {
    const labels: Record<RequestStatus, string> = {
      [RequestStatus.PENDING]: 'En attente',
      [RequestStatus.IN_PROGRESS]: 'En cours',
      [RequestStatus.APPROVED]: 'Approuvée',
      [RequestStatus.REJECTED]: 'Rejetée',
      [RequestStatus.COMPLETED]: 'Terminée'
    };
    return labels[status];
  }

  getStatusClass(status: RequestStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      case 'txt': return 'article';
      default: return 'insert_drive_file';
    }
  }

  downloadDocument(documentId: string, demandeId: number, fileName: string): void {
    this.demandeService.downloadDocument(demandeId, parseInt(documentId)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        alert('Erreur lors du téléchargement du document');
      }
    });
  }

  getServiceDataFields(): { label: string, value: any }[] {
    if (!this.request?.serviceData?.specificData) return [];
    return Object.entries(this.request.serviceData.specificData).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value
    }));
  }
}