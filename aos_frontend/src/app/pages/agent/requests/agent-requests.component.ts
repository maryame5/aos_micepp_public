
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
import { RequestService } from '../../../services/request.service';
import { DemandeService, Demande } from '../../../services/demande.service';
import { AuthService } from '../../../services/auth.service';
import { ServiceRequest, RequestStatus } from '../../../models/request.model';

@Component({
  selector: 'app-agent-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    PageHeaderComponent,
    LoadingComponent,
    MatSelectModule
  ],
  
  template: `
    <div class="requests-container">
      <app-page-header 
        title="Mes Demandes" 
        subtitle="Consultez et suivez toutes vos demandes">
        <div slot="actions">
          <button mat-raised-button color="primary" routerLink="/agent/new-request">
            <mat-icon>add</mat-icon>
            Nouvelle demande
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="requests-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field>
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Titre ou description...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field >
              <mat-label>Statut</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="EN_ATTENTE">En attente</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="ACCEPTEE">Acceptée</mat-option>
                <mat-option value="REFUSEE">Refusée</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-content">
              <div class="stat-number">{{ getRequestsByStatus('EN_ATTENTE').length }}</div>
              <div class="stat-label">En attente</div>
            </div>
            <mat-icon>hourglass_empty</mat-icon>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-number">{{ getRequestsByStatus('EN_COURS').length }}</div>
              <div class="stat-label">En cours</div>
            </div>
            <mat-icon>sync</mat-icon>
          </div>

          <div class="stat-card completed">
            <div class="stat-content">
              <div class="stat-number">{{ getRequestsByStatus('ACCEPTEE').length + getRequestsByStatus('REFUSEE').length }}</div>
              <div class="stat-label">Terminées</div>
            </div>
            <mat-icon>check_circle</mat-icon>
          </div>
        </div>

        <!-- Requests List -->
        <div class="requests-list" *ngIf="filteredRequests.length > 0; else noRequests">
          <mat-card class="request-card" *ngFor="let demande of filteredRequests">
            <mat-card-header>
              <div class="request-header-content">
                <div class="request-title-section">
                  <mat-card-title>{{ demande.serviceNom || 'Service non défini' }}</mat-card-title>
                  <mat-card-subtitle>{{ demande.commentaire | slice:0:150 }}<span *ngIf="demande.commentaire.length > 150">...</span></mat-card-subtitle>
                </div>
                <div class="request-status">
                  <mat-chip [class]="getStatusClass(demande.statut)">
                    {{ getStatusLabel(demande.statut) }}
                  </mat-chip>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="request-meta">
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>Créée le {{ demande.dateSoumission | date:'dd/MM/yyyy' }}</span>
                </div>
              
                <div class="meta-item" *ngIf="demande.documentsJustificatifs && demande.documentsJustificatifs.length > 0">
                  <mat-icon>attach_file</mat-icon>
                  <span>{{ demande.documentsJustificatifs.length }} document(s)</span>
                </div>
                <div class="meta-item">
                  <mat-icon>category</mat-icon>
                  <span>ID Service: {{ demande.serviceId }}</span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button [routerLink]="['/agent/requests', demande.id]">
                <mat-icon>visibility</mat-icon>
                Voir détails
              </button>
              <button mat-button *ngIf="canEditRequest(demande)" color="primary">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button *ngIf="demande.documentsJustificatifs && demande.documentsJustificatifs.length > 0">
                <mat-icon>attach_file</mat-icon>
                Documents ({{ demande.documentsJustificatifs.length }})
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #noRequests>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">assignment</mat-icon>
              <h3>Aucune demande trouvée</h3>
              <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
              <p *ngIf="!hasActiveFilters()">Vous n'avez pas encore créé de demande</p>
              <button mat-raised-button color="primary" routerLink="/agent/new-request">
                <mat-icon>add</mat-icon>
                Créer ma première demande
              </button>
            </div>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .requests-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .requests-content {
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

    .stat-card.completed {
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

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .request-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .request-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .request-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .request-title-section {
      flex: 1;
    }

    .request-status {
      flex-shrink: 0;
      margin-left: 1rem;
    }

    .request-meta {
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

    .mat-chip.status-pending {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-in-progress {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-completed,
    .mat-chip.status-approved {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.status-rejected {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
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

    @media (max-width: 768px) {
      .requests-container {
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

      .request-header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .request-status {
        margin-left: 0;
        align-self: flex-start;
      }

      .request-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AgentRequestsComponent implements OnInit {
  requests: Demande[] = [];
  filteredRequests: Demande[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus = '';

  constructor(
    private requestService: RequestService,
    private demandeService: DemandeService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      console.error('User not authenticated');
      this.snackBar.open('Veuillez vous connecter pour accéder à vos demandes', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login']);
      this.isLoading = false;
      return;
    }

    // Charger les demandes directement depuis DemandeService
    this.demandeService.getUserDemandes().subscribe({
      next: (demandes) => {
        console.log('Demandes loaded:', demandes);
        this.requests = demandes;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expirée. Veuillez vous reconnecter.', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(demande => {
      const matchesSearch = !this.searchTerm || 
        demande.commentaire.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.serviceId.toString().includes(this.searchTerm.toLowerCase()) ;
      
      const matchesStatus = !this.selectedStatus || demande.statut === this.selectedStatus;
      
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

  getRequestsByStatus(status: string): Demande[] {
    return this.requests.filter(demande => demande.statut === status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'ACCEPTEE': 'Acceptée',
      'REFUSEE': 'Refusée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-in-progress',
      'ACCEPTEE': 'status-completed',
      'REFUSEE': 'status-rejected'
    };
    return classMap[status] || 'status-pending';
  }

  canEditRequest(demande: Demande): boolean {
    return demande.statut === 'EN_ATTENTE';
  }
}