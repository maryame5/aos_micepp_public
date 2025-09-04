import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { AuthService } from '../../../services/auth.service';
import { ComplaintService } from '../../../services/complaint.service';

// Define the complaint request interface to match backend
interface ReclamationRequest {
  objet: string;
  contenu: string;
}

@Component({
  selector: 'app-new-complaint',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent
  ],
  template: `
    <div class="new-complaint-container">
      <app-page-header 
        title="Nouvelle Réclamation" 
        subtitle="Soumettez votre réclamation">
        <div slot="actions">
          <button mat-stroked-button routerLink="/agent/Reclamation">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </app-page-header>

      <div class="complaint-content">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Formulaire de réclamation</mat-card-title>
            <mat-card-subtitle>Veuillez remplir tous les champs requis</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="complaintForm" class="complaint-form">
              <mat-form-field  class="full-width">
                <mat-label>Objet de la réclamation *</mat-label>
                <input 
                  matInput 
                  formControlName="objet" 
                  placeholder="Ex: Problème de facturation, Service défaillant, etc."
                  maxlength="200">
                <mat-hint align="end">{{complaintForm.get('objet')?.value?.length || 0}}/200</mat-hint>
                <mat-error *ngIf="complaintForm.get('objet')?.hasError('required')">
                  L'objet est requis
                </mat-error>
                <mat-error *ngIf="complaintForm.get('objet')?.hasError('minlength')">
                  L'objet doit contenir au moins 5 caractères
                </mat-error>
              </mat-form-field>

              <mat-form-field  class="full-width">
                <mat-label>Contenu détaillé de la réclamation *</mat-label>
                <textarea 
                  matInput 
                  formControlName="contenu" 
                  rows="8"
                  placeholder="Décrivez votre réclamation en détail. Incluez toutes les informations pertinentes (dates, références, personnes impliquées, etc.)"
                  maxlength="2000"></textarea>
                <mat-hint align="end">{{complaintForm.get('contenu')?.value?.length || 0}}/2000</mat-hint>
                <mat-error *ngIf="complaintForm.get('contenu')?.hasError('required')">
                  Le contenu est requis
                </mat-error>
                <mat-error *ngIf="complaintForm.get('contenu')?.hasError('minlength')">
                  Le contenu doit contenir au moins 20 caractères
                </mat-error>
              </mat-form-field>

              <div class="form-info">
                <mat-icon>info</mat-icon>
                <div class="info-text">
                  <strong>Information importante :</strong>
                  <p>Votre réclamation sera traitée dans les meilleurs délais. Un accusé de réception vous sera envoyé par email.</p>
                  <p>Statut initial : <strong>En attente</strong></p>
                </div>
              </div>
            </form>
          </mat-card-content>

          <mat-card-actions class="card-actions">
            <button 
              mat-button 
              type="button" 
              (click)="onCancel()"
              [disabled]="isSubmitting">
              Annuler
            </button>
            <button 
              mat-raised-button 
              color="primary" 
              type="button"
              (click)="onSubmit()"
              [disabled]="complaintForm.invalid || isSubmitting">
              <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
              {{ isSubmitting ? 'Envoi en cours...' : 'Soumettre la réclamation' }}
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Preview card -->
        <mat-card class="preview-card" *ngIf="showPreview">
          <mat-card-header>
            <mat-card-title>Aperçu de votre réclamation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="preview-section">
              <h4>Objet :</h4>
              <p>{{ complaintForm.get('objet')?.value || 'Non spécifié' }}</p>
            </div>
            <div class="preview-section">
              <h4>Contenu :</h4>
              <p class="content-preview">{{ complaintForm.get('contenu')?.value || 'Non spécifié' }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .new-complaint-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .complaint-content {
      margin-top: 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .complaint-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem 0;
    }

    .full-width {
      width: 100%;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .form-info {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f0f8ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .form-info mat-icon {
      color: #1976d2;
      margin-top: 0.25rem;
    }

    .info-text {
      flex: 1;
    }

    .info-text strong {
      color: #1976d2;
      display: block;
      margin-bottom: 0.5rem;
    }

    .info-text p {
      margin: 0 0 0.5rem 0;
      color: #424242;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .info-text p:last-child {
      margin-bottom: 0;
    }

    .preview-card {
      background: #fafafa;
      border-left: 4px solid #4caf50;
    }

    .preview-section {
      margin-bottom: 1rem;
    }

    .preview-section:last-child {
      margin-bottom: 0;
    }

    .preview-section h4 {
      margin: 0 0 0.5rem 0;
      color: #424242;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .preview-section p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .content-preview {
      white-space: pre-line;
      max-height: 150px;
      overflow-y: auto;
      padding: 0.5rem;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    /* Form validation styles */
    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      border-color: #f44336;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .new-complaint-container {
        padding: 0.5rem;
      }

      .card-actions {
        flex-direction: column-reverse;
        gap: 0.5rem;
      }

      .card-actions button {
        width: 100%;
      }

      .form-info {
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-info mat-icon {
        align-self: flex-start;
      }
    }

    /* Success/Error snackbar styles */
    ::ng-deep .success-snackbar {
      background: #d1fae5 !important;
      color: #065f46 !important;
      border-left: 4px solid #10b981 !important;
    }

    ::ng-deep .success-snackbar .mat-simple-snackbar-action {
      color: #065f46 !important;
    }

    ::ng-deep .error-snackbar {
      background: #fee2e2 !important;
      color: #991b1b !important;
      border-left: 4px solid #dc2626 !important;
    }

    ::ng-deep .error-snackbar .mat-simple-snackbar-action {
      color: #991b1b !important;
    }

    ::ng-deep .warning-snackbar {
      background: #fef3c7 !important;
      color: #92400e !important;
      border-left: 4px solid #f59e0b !important;
    }

    ::ng-deep .warning-snackbar .mat-simple-snackbar-action {
      color: #92400e !important;
    }
  `]
})
export class NewComplaintComponent implements OnInit {
  complaintForm: FormGroup;
  isSubmitting = false;
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.complaintForm = this.fb.group({
      objet: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      contenu: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(2000)
      ]]
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Veuillez vous connecter pour soumettre une réclamation', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login']);
      return;
    }

    // Show preview when form values change
    this.complaintForm.valueChanges.subscribe(() => {
      this.showPreview = this.complaintForm.get('objet')?.value?.length > 0 || 
                       this.complaintForm.get('contenu')?.value?.length > 0;
    });
  }

  onSubmit(): void {
    if (this.complaintForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const reclamationRequest: ReclamationRequest = {
        objet: this.complaintForm.get('objet')?.value.trim(),
        contenu: this.complaintForm.get('contenu')?.value.trim()
      };

      console.log('Submitting complaint:', reclamationRequest);

      this.complaintService.createComplaint(reclamationRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Complaint submitted successfully:', response);
          
          this.snackBar.open('Réclamation soumise avec succès!', 'Fermer', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          
          // Reset form
          this.complaintForm.reset();
          this.showPreview = false;
          
          // Navigate back to complaints list or dashboard
          this.router.navigate(['/agent/Reclamation']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error submitting complaint:', error);
          
          let errorMessage = 'Erreur lors de la soumission de la réclamation';
          
          if (error.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Veuillez vérifier le formulaire.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 6000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.complaintForm.markAllAsTouched();
      
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  onCancel(): void {
    if (this.complaintForm.dirty) {
      if (confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données saisies seront perdues.')) {
        this.router.navigate(['/agent/Reclamation']);
      }
    } else {
      this.router.navigate(['/agent/Reclamation']);
    }
  }
}