import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService, ReclamationResponse, StatutReclamation } from '../../../../services/complaint.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';

@Component({
  selector: 'app-complaint-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="complaint-detail-container">
      <app-page-header
        title="Détails de la réclamation"
        subtitle="Consultez les informations détaillées de votre réclamation">
        <div slot="actions">
          <button mat-raised-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="complaint-content" *ngIf="!isLoading && complaint">
        <mat-card class="complaint-card">
          <mat-card-header>
            <mat-card-title>{{ complaint.objet }}</mat-card-title>
            <mat-card-subtitle>ID: {{ complaint.id }}</mat-card-subtitle>
            <mat-chip [class]="getStatusClass(complaint.statut)">
              {{ getStatusLabel(complaint.statut) }}
            </mat-chip>
          </mat-card-header>

          <mat-card-content>
            <div class="complaint-details">
              <div class="detail-section">
                <h3>Description</h3>
                <p>{{ complaint.contenu }}</p>
              </div>

              <div class="detail-section" *ngIf="complaint.utilisateur">
                <h3>Utilisateur</h3>
                <p>{{ complaint.utilisateur.firstName }} {{ complaint.utilisateur.lastName }}</p>
                <p>{{ complaint.utilisateur.email }}</p>
              </div>

              <div class="detail-section" *ngIf="complaint.assignedTo">
                <h3>Assigné à</h3>
                <p>{{ complaint.assignedTo.firstName }} {{ complaint.assignedTo.lastName }}</p>
                <p>{{ complaint.assignedTo.email }}</p>
              </div>

              <div class="detail-section">
                <h3>Dates</h3>
                <p><strong>Soumise le:</strong> {{ formatDate(complaint.dateSoumission) }}</p>
                <p *ngIf="complaint.lastModifiedDate"><strong>Modifiée le:</strong> {{ formatDate(complaint.lastModifiedDate) }}</p>
              </div>

              <div class="detail-section" *ngIf="complaint.commentaire && isTreated()">
                <h3>Réponse de l'administrateur</h3>
                <div class="admin-response">
                  <p>{{ complaint.commentaire }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="error-state" *ngIf="!isLoading && !complaint && hasError">
        <mat-icon class="error-icon">error</mat-icon>
        <h3>Erreur lors du chargement</h3>
        <p>{{ errorMessage }}</p>
        <button mat-raised-button color="primary" (click)="loadComplaint()">
          <mat-icon>refresh</mat-icon>
          Réessayer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .complaint-detail-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .complaint-content {
      margin-top: 2rem;
    }

    .complaint-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .complaint-card mat-card-header {
      margin-bottom: 1rem;
    }

    .complaint-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-section {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1rem;
    }

    .detail-section:last-child {
      border-bottom: none;
    }

    .detail-section h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .detail-section p {
      margin: 0.25rem 0;
      color: #6b7280;
      line-height: 1.5;
    }

    .admin-response {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .admin-response p {
      margin: 0;
      color: #1e40af;
      font-style: italic;
    }

    .mat-chip.status-en-attente {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-affectee {
      background-color: #e0e7ff !important;
      color: #3730a3 !important;
    }

    .mat-chip.status-en-cours {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-resolue,
    .mat-chip.status-cloturee {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .error-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #64748b;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      color: #dc2626;
    }

    .error-state h3 {
      margin: 1rem 0;
      color: #374151;
    }

    .error-state p {
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .complaint-detail-container {
        padding: 0.5rem;
      }

      .detail-section h3 {
        font-size: 1rem;
      }
    }
  `]
})
export class ComplaintDetailComponent implements OnInit {
  complaint: ReclamationResponse | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadComplaint();
  }

  loadComplaint(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.hasError = true;
      this.errorMessage = 'ID de réclamation manquant';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.complaintService.getComplaintById(+id).subscribe({
      next: (complaint: ReclamationResponse) => {
        this.complaint = complaint;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.hasError = true;
        console.error('Error loading complaint:', error);
        this.errorMessage = error.userMessage || 'Erreur lors du chargement de la réclamation';
        this.snackBar.open(this.errorMessage, 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.complaintService.formatStatus(status as StatutReclamation);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  isTreated(): boolean {
    return this.complaint?.statut === 'RESOLUE' || this.complaint?.statut === 'CLOTUREE';
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  goBack(): void {
    this.router.navigate(['/agent/Reclamation']);
  }
}
