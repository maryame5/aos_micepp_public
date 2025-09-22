// agent-documents.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentDTO } from '../../../services/document.service';

@Component({
  selector: 'app-agent-documents',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="documents-container">
      <app-page-header 
        title="Mes Documents" 
        subtitle="Consultez et téléchargez tous vos documents liés à vos demandes">
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="documents-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field>
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Nom du document...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>


            <mat-form-field>
              <mat-label>Type de fichier</mat-label>
              <mat-select [(value)]="selectedType" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les types</mat-option>
                <mat-option *ngFor="let type of availableTypes" [value]="type">
                  {{ type }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Source</mat-label>
              <mat-select [(value)]="selectedSourceType" (selectionChange)="applyFilters()">
                <mat-option value="">Toutes les sources</mat-option>
                <mat-option value="JUSTIFICATIF">Documents envoyés</mat-option>
                <mat-option value="REPONSE">Documents reçus</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" matTooltip="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Statistics -->
        <div class="stats-container" *ngIf="documents.length > 0">
          <mat-card class="stat-card">
            <div class="stat-info">
              <mat-icon>description</mat-icon>
              <span class="stat-number">{{ documents.length }}</span>
              <span class="stat-label">Total Documents</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-info">
              <mat-icon>cloud_upload</mat-icon>
              <span class="stat-number">{{ getDocumentsBySourceType('JUSTIFICATIF').length }}</span>
              <span class="stat-label">Documents envoyés</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-info">
              <mat-icon>cloud_download</mat-icon>
              <span class="stat-number">{{ getDocumentsBySourceType('REPONSE').length }}</span>
              <span class="stat-label">Documents reçus</span>
            </div>
          </mat-card>
        </div>

        <!-- Documents Grid -->
        <div class="documents-grid" *ngIf="filteredDocuments.length > 0; else noDocuments">
          <mat-card class="document-card" *ngFor="let document of filteredDocuments">
            <div class="document-header">
              <div class="document-icon">
                <mat-icon [class]="getFileIconClass(document.type)">
                  {{ getFileIcon(document.type) }}
                </mat-icon>
              </div>
              <div class="document-source-badge" [class]="getSourceBadgeClass(document.sourceType)">
                {{ getSourceTypeLabel(document.sourceType) }}
              </div>
            </div>
            
            <mat-card-header>
              <mat-card-title matTooltip="{{ document.name }}">{{ document.name }}</mat-card-title>
              <mat-card-subtitle>{{ document.category }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p class="document-description" *ngIf="document.description">
                {{ document.description }}
              </p>
              
              <div class="document-meta">
                <div class="meta-item">
                  <mat-icon>business</mat-icon>
                  <span>{{ document.demandeReference }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>info</mat-icon>
                  <span class="statut-badge" [class]="getStatutClass(document.statutDemande)">
                    {{ getStatutLabel(document.statutDemande) }}
                  </span>
                </div>
                <div class="meta-item">
                  <mat-icon>insert_drive_file</mat-icon>
                  <span>{{ document.type }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>storage</mat-icon>
                  <span>{{ formatFileSize(document.size) }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>{{ document.uploadedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="downloadDocument(document)" color="primary">
                <mat-icon>download</mat-icon>
                Télécharger
              </button>
              <button mat-button (click)="previewDocument(document)" *ngIf="canPreview(document)">
                <mat-icon>visibility</mat-icon>
                Aperçu
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #noDocuments>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">description</mat-icon>
              <h3>{{ getEmptyStateTitle() }}</h3>
              <p>{{ getEmptyStateMessage() }}</p>
            </div>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .documents-content {
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
      min-width: 180px;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-info {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-info mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .document-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      padding-bottom: 4rem;
    }

    .document-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .document-card mat-card-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem 1rem 0 1rem;
      position: relative;
    }

    .document-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .document-icon mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .document-source-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-justificatif {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .badge-reponse {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .file-pdf { color: #dc2626; }
    .file-doc { color: #2563eb; }
    .file-image { color: #059669; }
    .file-archive { color: #7c3aed; }
    .file-default { color: #6b7280; }

    .document-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .document-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .meta-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .statut-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .statut-en-attente { background-color: #fff3cd; color: #856404; }
    .statut-en-cours { background-color: #cce5ff; color: #0066cc; }
    .statut-acceptee { background-color: #d4edda; color: #155724; }
    .statut-refusee { background-color: #f8d7da; color: #721c24; }

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
      .documents-container {
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

      .documents-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stats-container {
        grid-template-columns: 1fr;
      }

      .document-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }
    }
  `]
})
export class AgentDocumentsComponent implements OnInit {
  documents: DocumentDTO[] = [];
  filteredDocuments: DocumentDTO[] = [];
  availableCategories: string[] = [];
  availableTypes: string[] = [];
  isLoading = true;
  searchTerm = '';

  selectedType = '';
  selectedSourceType = '';

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadCategories();
    this.loadTypes();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getUserDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.snackBar.open('Erreur lors du chargement des documents', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.documentService.getDocumentCategories().subscribe({
      next: (categories) => {
        this.availableCategories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTypes(): void {
    this.documentService.getDocumentTypes().subscribe({
      next: (types) => {
        this.availableTypes = types;
      },
      error: (error) => {
        console.error('Error loading types:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredDocuments = this.documents.filter(document => {
      const matchesSearch = !this.searchTerm || 
        document.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        document.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        document.demandeReference?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
        const matchesType = !this.selectedType || document.type === this.selectedType;
      const matchesSourceType = !this.selectedSourceType || document.sourceType === this.selectedSourceType;
      
      return matchesSearch  && matchesType && matchesSourceType;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
  
    this.selectedType = '';
    this.selectedSourceType = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm  || !!this.selectedType || !!this.selectedSourceType;
  }

  getDocumentsBySourceType(sourceType: string): DocumentDTO[] {
    return this.documents.filter(doc => doc.sourceType === sourceType);
  }

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      'PDF': 'picture_as_pdf',
      'DOC': 'description',
      'DOCX': 'description',
      'JPG': 'image',
      'JPEG': 'image',
      'PNG': 'image',
      'ZIP': 'archive',
      'RAR': 'archive'
    };
    return icons[type.toUpperCase()] || 'insert_drive_file';
  }

  getFileIconClass(type: string): string {
    const classes: Record<string, string> = {
      'PDF': 'file-pdf',
      'DOC': 'file-doc',
      'DOCX': 'file-doc',
      'JPG': 'file-image',
      'JPEG': 'file-image',
      'PNG': 'file-image',
      'ZIP': 'file-archive',
      'RAR': 'file-archive'
    };
    return classes[type.toUpperCase()] || 'file-default';
  }

  getSourceBadgeClass(sourceType: string): string {
    return sourceType === 'JUSTIFICATIF' ? 'badge-justificatif' : 'badge-reponse';
  }

  getSourceTypeLabel(sourceType: string): string {
    return sourceType === 'JUSTIFICATIF' ? 'Envoyé' : 'Reçu';
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'statut-en-attente',
      'EN_COURS': 'statut-en-cours',
      'ACCEPTEE': 'statut-acceptee',
      'REFUSEE': 'statut-refusee'
    };
    return classes[statut] || 'statut-en-attente';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'ACCEPTEE': 'Acceptée',
      'REFUSEE': 'Refusée'
    };
    return labels[statut] || statut;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  canPreview(document: DocumentDTO): boolean {
    const previewableTypes = ['PDF', 'JPG', 'JPEG', 'PNG'];
    return previewableTypes.includes(document.type.toUpperCase());
  }

  downloadDocument(doc: DocumentDTO): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Téléchargement démarré', 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  previewDocument(document: DocumentDTO): void {
    if (this.canPreview(document)) {
      this.documentService.previewDocument(document.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (error) => {
          console.error('Error previewing document:', error);
          this.snackBar.open('Erreur lors de l\'aperçu', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getEmptyStateTitle(): string {
    if (this.hasActiveFilters()) {
      return 'Aucun document trouvé';
    }
    return 'Aucun document disponible';
  }

  getEmptyStateMessage(): string {
    if (this.hasActiveFilters()) {
      return 'Essayez de modifier vos critères de recherche ou effacez les filtres.';
    }
    return 'Vos documents apparaîtront ici une fois que vous aurez créé des demandes de services.';
  }
}