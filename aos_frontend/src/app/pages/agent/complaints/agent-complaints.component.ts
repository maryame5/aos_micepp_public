import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { AuthService } from '../../../services/auth.service';
import { ComplaintService, ReclamationResponse, StatutReclamation } from '../../../services/complaint.service';

// Updated interface to match your backend model
interface Complaint {
  id: number;
  objet: string; // Changed from title
  contenu: string; // Changed from description
  statut: StatutReclamation; // Changed from status, using enum
  dateSoumission: string; // Changed from createdAt
  lastModifiedDate?: string; // Changed from updatedAt
}

@Component({
  selector: 'app-agent-complaints',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  
  template: `
    <div class="complaints-container">
      <app-page-header 
        title="Mes Réclamations" 
        subtitle="Consultez et gérez vos réclamations">
        <div slot="actions">
          <button mat-raised-button color="primary" routerLink="/agent/Reclamation/new">
            <mat-icon>add</mat-icon>
            Nouvelle réclamation
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="complaints-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field >
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Objet ou contenu...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field >
              <mat-label>Statut</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="EN_ATTENTE">En attente</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="RESOLUE">Résolue</mat-option>
                <mat-option value="FERMEE">Fermée</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>

            <button mat-icon-button (click)="loadComplaints()" title="Actualiser" [disabled]="isLoading">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('EN_ATTENTE').length }}</div>
              <div class="stat-label">En attente</div>
            </div>
            <mat-icon>schedule</mat-icon>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('EN_COURS').length }}</div>
              <div class="stat-label">En cours</div>
            </div>
            <mat-icon>sync</mat-icon>
          </div>

          <div class="stat-card resolved">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('RESOLUE').length + getComplaintsByStatus('FERMEE').length }}</div>
              <div class="stat-label">Traitées</div>
            </div>
            <mat-icon>check_circle</mat-icon>
          </div>
        </div>

        <!-- Complaints List -->
        <div class="complaints-list" *ngIf="filteredComplaints.length > 0; else noComplaints">
          <mat-card class="complaint-card" *ngFor="let complaint of filteredComplaints">
            <mat-card-header>
              <div class="complaint-header-content">
                <div class="complaint-title-section">
                  <mat-card-title>{{ complaint.objet }}</mat-card-title>
                  <mat-card-subtitle>{{ complaint.contenu | slice:0:150 }}{{ complaint.contenu.length > 150 ? '...' : '' }}</mat-card-subtitle>
                </div>
                <div class="complaint-status">
                  <mat-chip [class]="getStatusClass(complaint.statut)">
                    {{ getStatusLabel(complaint.statut) }}
                  </mat-chip>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="complaint-meta">
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>Créée le {{ formatDate(complaint.dateSoumission) }}</span>
                </div>
                <div class="meta-item" *ngIf="complaint.lastModifiedDate && complaint.lastModifiedDate !== complaint.dateSoumission">
                  <mat-icon>update</mat-icon>
                  <span>Modifiée le {{ formatDate(complaint.lastModifiedDate) }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>fingerprint</mat-icon>
                  <span>ID: {{ complaint.id }}</span>
                </div>
              </div>

              <div class="complaint-content" *ngIf="complaint.contenu.length <= 150">
                <p>{{ complaint.contenu }}</p>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="viewComplaint(complaint.id)">
                <mat-icon>visibility</mat-icon>
                Voir détails
              </button>
              <button mat-button *ngIf="canEditComplaint(complaint)" color="primary" disabled>
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button *ngIf="complaint.statut === 'RESOLUE'" color="accent" disabled>
                <mat-icon>thumb_up</mat-icon>
                Évaluer
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #noComplaints>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">report_problem</mat-icon>
              <h3>Aucune réclamation trouvée</h3>
              <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
              <p *ngIf="!hasActiveFilters() && !hasError">Vous n'avez pas encore créé de réclamation</p>
              <p *ngIf="hasError" class="error-message">{{ errorMessage }}</p>
              <button mat-raised-button color="primary" routerLink="/agent/Reclamation/new" *ngIf="!hasError">
                <mat-icon>add</mat-icon>
                Créer ma première réclamation
              </button>
              <button mat-button (click)="loadComplaints()" *ngIf="hasError">
                <mat-icon>refresh</mat-icon>
                Réessayer
              </button>
            </div>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .complaints-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .complaints-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .filters-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filters-container {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      padding: 1rem;
    }

    .filters-container mat-form-field {
      min-width: 200px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
    }

    .stat-card.pending {
      border-left-color: #f59e0b;
    }

    .stat-card.in-progress {
      border-left-color: #3b82f6;
    }

    .stat-card.resolved {
      border-left-color: #10b981;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .stat-card mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      opacity: 0.7;
    }

    .complaints-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .complaint-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .complaint-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .complaint-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .complaint-title-section {
      flex: 1;
    }

    .complaint-status {
      flex-shrink: 0;
      margin-left: 1rem;
    }

    .complaint-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    .meta-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .complaint-content {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #e5e7eb;
    }

    .complaint-content p {
      margin: 0;
      color: #374151;
      line-height: 1.5;
    }

    .mat-chip.status-en-attente {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-en-cours {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-resolue,
    .mat-chip.status-fermee {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .empty-state-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

    .error-message {
      color: #dc2626;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .complaints-container {
        padding: 0.5rem;
      }

      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-container mat-form-field {
        width: 100%;
        min-width: unset;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .complaint-header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .complaint-status {
        margin-left: 0;
        align-self: flex-start;
      }

      .complaint-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }

    /* Success/Error snackbar styles */
    ::ng-deep .success-snackbar {
      background: #d1fae5 !important;
      color: #065f46 !important;
      border-left: 4px solid #10b981 !important;
    }

    ::ng-deep .error-snackbar {
      background: #fee2e2 !important;
      color: #991b1b !important;
      border-left: 4px solid #dc2626 !important;
    }
  `]
})
export class AgentComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  isLoading = true;
  hasError = false;
  errorMessage = '';
  searchTerm = '';
  selectedStatus = '';

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    // Updated to use the corrected service method that returns an array
    this.complaintService.getComplaintsByUser().subscribe({
      next: (complaints: ReclamationResponse[]) => {
        console.log('Loaded user complaints:', complaints);
        
        // Map backend complaints to frontend format
        if (complaints && complaints.length > 0) {
          this.complaints = complaints.map(complaint => this.mapBackendComplaint(complaint));
        } else {
          this.complaints = [];
        }
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.hasError = true;
        
        console.error('Error loading complaints:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Redirection...';
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 404) {
          // No complaints found - this is normal for new users
          this.complaints = [];
          this.hasError = false;
          this.applyFilters();
        } else {
          this.errorMessage = error.userMessage || 'Erreur lors du chargement des réclamations';
          this.snackBar.open(this.errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }
  private mapBackendComplaint(backendComplaint: ReclamationResponse): Complaint {
    return {
      id: backendComplaint.id || 0,
      objet: backendComplaint.objet,
      contenu: backendComplaint.contenu,
      statut: backendComplaint.statut as StatutReclamation,
      dateSoumission: backendComplaint.dateSoumission,
      lastModifiedDate: backendComplaint.lastModifiedDate
    };
  }

  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const matchesSearch = !this.searchTerm || 
        complaint.objet.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        complaint.contenu.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || complaint.statut === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedStatus;
  }

  getComplaintsByStatus(status: string): Complaint[] {
    return this.complaints.filter(complaint => complaint.statut === status);
  }

  getStatusLabel(status: StatutReclamation): string {
    return this.complaintService.formatStatus(status);
  }

  getStatusClass(status: StatutReclamation): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  canEditComplaint(complaint: Complaint): boolean {
    return complaint.statut === StatutReclamation.EN_ATTENTE;
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

  viewComplaint(id: number): void {
    // Navigate to complaint detail - you'll need to implement this route
    this.router.navigate(['/agent/Reclamation/details', id]);
  }
}