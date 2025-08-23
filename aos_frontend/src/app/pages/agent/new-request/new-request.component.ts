
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { RequestService } from '../../../services/request.service';
import { DemandeService, DemandeRequest } from '../../../services/demande.service';
import { AuthService } from '../../../services/auth.service';
import { Service, RequestPriority } from '../../../models/request.model';
import { FileUploadService, UploadProgress, UploadResponse } from '../../../services/file-upload.service';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    PageHeaderComponent
  ],
  template: `
    <div class="new-request-container">
      <app-page-header 
        title="Nouvelle Demande" 
        subtitle="Créez une nouvelle demande de service">
        <div slot="actions">
          <button mat-stroked-button routerLink="/agent/requests">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </app-page-header>

      <div class="request-content">
        <mat-horizontal-stepper #stepper>
          <!-- Step 1: Service Selection -->
          <mat-step [stepControl]="serviceForm" label="Choisir un service">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Sélectionner le type de service</mat-card-title>
                <mat-card-subtitle>Choisissez le service pour lequel vous souhaitez faire une demande</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="serviceForm" class="service-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Service</mat-label>
                    <mat-select formControlName="serviceId" (selectionChange)="onServiceChange($event.value)">
                      <mat-option *ngFor="let service of services" [value]="service.id">
                        {{ service.name }} - {{ service.category }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="serviceForm.get('serviceId')?.hasError('required')">
                      Le service est requis
                    </mat-error>
                  </mat-form-field>

                  <div class="service-description" *ngIf="selectedService">
                    <h4>Description du service</h4>
                    <p>{{ selectedService.description }}</p>
                    
                    <div class="required-documents" *ngIf="selectedService.requiredDocuments && selectedService.requiredDocuments.length > 0">
                      <h4>Documents requis</h4>
                      <ul>
                        <li *ngFor="let doc of selectedService.requiredDocuments">{{ doc }}</li>
                      </ul>
                    </div>
                  </div>
                </form>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" matStepperNext [disabled]="serviceForm.invalid">
                  Suivant
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 2: Request Details -->
          <mat-step [stepControl]="requestForm" label="Détails de la demande">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Informations de la demande</mat-card-title>
                <mat-card-subtitle>Remplissez les détails de votre demande</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="requestForm" class="request-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description générale</mat-label>
                    <textarea 
                      matInput 
                      formControlName="description" 
                      rows="4"
                      placeholder="Décrivez votre demande en détail..."></textarea>
                    <mat-error *ngIf="requestForm.get('description')?.hasError('required')">
                      La description est requise
                    </mat-error>
                  </mat-form-field>

                  <!-- Dynamic form fields based on selected service -->
                  <div class="dynamic-fields" *ngIf="selectedService && selectedService.formFields && selectedService.formFields.length > 0">
                    <h4>Informations spécifiques au service</h4>
                    <div *ngFor="let field of selectedService.formFields" class="dynamic-field">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ field.label }}</mat-label>
                        <input 
                          *ngIf="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
                          matInput 
                          [type]="field.type"
                          [formControlName]="field.name"
                          [placeholder]="field.placeholder || ''">
                        <input 
                          *ngIf="field.type === 'date'"
                          matInput 
                          type="date"
                          [formControlName]="field.name">
                        <input 
                          *ngIf="field.type === 'number'"
                          matInput 
                          type="number"
                          [formControlName]="field.name"
                          [placeholder]="field.placeholder || ''">
                        <textarea 
                          *ngIf="field.type === 'textarea'"
                          matInput 
                          [formControlName]="field.name"
                          [placeholder]="field.placeholder || ''"
                          rows="3"></textarea>
                        <mat-select 
                          *ngIf="field.type === 'select'"
                          [formControlName]="field.name">
                          <mat-option *ngFor="let option of field.options" [value]="option">
                            {{ option }}
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="requestForm.get(field.name)?.hasError('required') && field.required">
                          {{ field.label }} est requis
                        </mat-error>
                      </mat-form-field>
                    </div>
                  </div>
                </form>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button matStepperPrevious>Précédent</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="requestForm.invalid">
                  Suivant
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 3: Documents -->
          <mat-step label="Documents">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Documents justificatifs</mat-card-title>
                <mat-card-subtitle>Joignez les documents nécessaires à votre demande</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="document-upload-area" 
                     (dragover)="onDragOver($event)" 
                     (dragleave)="onDragLeave($event)" 
                     (drop)="onDrop($event)"
                     [class.drag-over]="isDragOver">
                  <mat-icon class="upload-icon">cloud_upload</mat-icon>
                  <p>Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</p>
                  <input type="file" multiple (change)="onFileSelect($event)" style="display: none;" #fileInput accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt">
                  <button mat-stroked-button (click)="fileInput.click()">
                    <mat-icon>attach_file</mat-icon>
                    Sélectionner des fichiers
                  </button>
                  <p class="file-types">Types acceptés: PDF, Word, Images, TXT</p>
                </div>

                <div class="uploaded-files" *ngIf="uploadedFiles.length > 0">
                  <h4>Fichiers sélectionnés ({{ uploadedFiles.length }})</h4>
                  <div class="file-summary">
                    <span class="total-size">Taille totale: {{ getTotalFileSize() }}</span>
                  </div>
                  <div class="file-list">
                    <div class="file-item" *ngFor="let file of uploadedFiles; let i = index">
                      <mat-icon [class]="getFileIconClass(file.name)">{{ getFileIcon(file.name) }}</mat-icon>
                      <div class="file-info">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <button mat-icon-button (click)="removeFile(i)" color="warn" title="Supprimer">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="required-docs-info" *ngIf="selectedService && selectedService.requiredDocuments && selectedService.requiredDocuments.length > 0">
                  <h4>Documents requis pour ce service :</h4>
                  <ul>
                    <li *ngFor="let doc of selectedService.requiredDocuments">{{ doc }}</li>
                  </ul>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button matStepperPrevious>Précédent</button>
                <button mat-raised-button color="primary" matStepperNext>
                  Suivant
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 4: Review & Submit -->
          <mat-step label="Validation">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Récapitulatif de la demande</mat-card-title>
                <mat-card-subtitle>Vérifiez les informations avant de soumettre</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="review-section">
                  <div class="review-item">
                    <h4>Service sélectionné</h4>
                    <p>{{ selectedService?.name }} - {{ selectedService?.category }}</p>
                  </div>

                  <div class="review-item">
                    <h4>Description</h4>
                    <p>{{ requestForm.get('description')?.value }}</p>
                  </div>

                  <!-- Show dynamic field values -->
                  <div class="review-item" *ngFor="let field of selectedService?.formFields || []">
                    <h4>{{ field.label }}</h4>
                    <p>{{ requestForm.get(field.name)?.value || 'Non spécifié' }}</p>
                  </div>

                  <div class="review-item" *ngIf="uploadedFiles.length > 0">
                    <h4>Documents joints ({{ uploadedFiles.length }})</h4>
                    <div class="review-files">
                      <div class="review-file-item" *ngFor="let file of uploadedFiles">
                        <mat-icon [class]="getFileIconClass(file.name)" class="review-file-icon">
                          {{ getFileIcon(file.name) }}
                        </mat-icon>
                        <div class="review-file-info">
                          <span class="review-file-name">{{ file.name }}</span>
                          <span class="review-file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                      </div>
                    </div>
                    <p class="review-total-size">Taille totale: {{ getTotalFileSize() }}</p>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button matStepperPrevious>Précédent</button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="submitRequest()"
                  [disabled]="isSubmitting">
                  <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                  {{ isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande' }}
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>
        </mat-horizontal-stepper>
      </div>
    </div>
  `,
  styles: [`
    .new-request-container {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .request-content {
      margin-top: 0;
    }

    .service-form,
    .request-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .service-description,
    .required-documents {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .service-description h4,
    .required-documents h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .service-description p {
      margin: 0;
      color: #6b7280;
    }

    .required-documents ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #6b7280;
    }

    .dynamic-fields {
      margin-top: 2rem;
      border-top: 1px solid #e5e7eb;
      padding-top: 2rem;
    }

    .dynamic-fields h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-weight: 600;
    }

    .dynamic-field {
      margin-bottom: 1rem;
    }

    .document-upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 3rem 2rem;
      text-align: center;
      background: #f9fafb;
      margin-bottom: 2rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .document-upload-area.drag-over {
      border-color: #3b82f6;
      background: #eff6ff;
      transform: scale(1.02);
    }

    .file-types {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
      margin-bottom: 0;
    }

    .upload-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .uploaded-files h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .file-summary {
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #f3f4f6;
      border-radius: 6px;
      text-align: center;
    }

    .total-size {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .file-item:hover {
      border-color: #3b82f6;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    }

    .file-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .file-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .file-size {
      font-size: 0.75rem;
      color: #6b7280;
    }

    /* File type icon styles */
    .file-pdf {
      color: #dc2626;
    }

    .file-doc {
      color: #2563eb;
    }

    .file-image {
      color: #059669;
    }

    .file-text {
      color: #7c3aed;
    }

    .file-default {
      color: #6b7280;
    }

    .required-docs-info {
      margin-top: 2rem;
      padding: 1rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
    }

    .required-docs-info h4 {
      margin: 0 0 0.5rem 0;
      color: #1e40af;
    }

    .required-docs-info ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #1e40af;
    }

    .review-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-item h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .review-item p,
    .review-item ul {
      margin: 0;
      color: #6b7280;
    }

    .review-item ul {
      padding-left: 1.5rem;
    }

    .review-files {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }

    .review-file-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .review-file-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .review-file-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .review-file-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .review-file-size {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .review-total-size {
      margin: 0.5rem 0 0 0;
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
      text-align: right;
      padding-top: 0.5rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .new-request-container {
        padding: 0.5rem;
      }

      .document-upload-area {
        padding: 2rem 1rem;
      }
    }

    /* Custom snackbar styles */
    ::ng-deep .warning-snackbar {
      background: #fef3c7 !important;
      color: #92400e !important;
      border-left: 4px solid #f59e0b !important;
    }

    ::ng-deep .warning-snackbar .mat-simple-snackbar-action {
      color: #92400e !important;
    }

    ::ng-deep .info-snackbar {
      background: #dbeafe !important;
      color: #1e40af !important;
      border-left: 4px solid #3b82f6 !important;
    }

    ::ng-deep .info-snackbar .mat-simple-snackbar-action {
      color: #1e40af !important;
    }

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
  `]
})
export class NewRequestComponent implements OnInit {
  serviceForm: FormGroup;
  requestForm: FormGroup;
  services: Service[] = [];
  selectedService: Service | null = null;
  uploadedFiles: File[] = [];
  isSubmitting = false;
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private demandeService: DemandeService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService
  ) {
    this.serviceForm = this.fb.group({
      serviceId: ['', Validators.required]
    });

    this.requestForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    if (!this.authService.isAuthenticated()) {
      console.error('User not authenticated');
      this.snackBar.open('Veuillez vous connecter pour accéder aux services', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login']);
      return;
    }

    this.requestService.getServices().subscribe({
      next: (services) => {
        console.log('Services loaded:', services);
        this.services = services.filter(s => s.isActive);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expirée. Veuillez vous reconnecter.', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.snackBar.open('Erreur lors du chargement des services', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  onServiceChange(serviceId: string): void {
    console.log('Service selected:', serviceId);
    this.selectedService = this.services.find(s => s.id === serviceId) || null;
    
    if (this.selectedService) {
      console.log('Selected service:', this.selectedService);
      console.log('Form fields:', this.selectedService.formFields);
      
      // Clear existing dynamic fields
      const currentFields = Object.keys(this.requestForm.controls);
      currentFields.forEach(field => {
        if (field !== 'description') {
          this.requestForm.removeControl(field);
        }
      });
      
      // Add new dynamic form fields
      if (this.selectedService.formFields && this.selectedService.formFields.length > 0) {
        this.selectedService.formFields.forEach(field => {
          const validators = field.required ? [Validators.required] : [];
          this.requestForm.addControl(field.name, this.fb.control('', validators));
        });
      }
    }
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    this.addFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(files);
    }
  }

  private addFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check file type
      if (!this.isValidFileType(file)) {
        this.snackBar.open(`Type de fichier non supporté: ${file.name}`, 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        continue;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open(`Fichier trop volumineux: ${file.name} (max 10MB)`, 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        continue;
      }
      
      // Check if file already exists
      if (this.uploadedFiles.some(f => f.name === file.name)) {
        this.snackBar.open(`Fichier déjà sélectionné: ${file.name}`, 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        continue;
      }
      
      this.uploadedFiles.push(file);
    }
  }

  private isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ];
    return allowedTypes.includes(file.type);
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTotalFileSize(): string {
    const totalBytes = this.uploadedFiles.reduce((total, file) => total + file.size, 0);
    return this.formatFileSize(totalBytes);
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

  getFileIconClass(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return 'file-pdf';
      case 'doc':
      case 'docx': return 'file-doc';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'file-image';
      case 'txt': return 'file-text';
      default: return 'file-default';
    }
  }

  submitRequest(): void {
    // Mark all fields as touched to trigger validation display
    this.serviceForm.markAllAsTouched();
    this.requestForm.markAllAsTouched();
    
    // Check if service is selected
    if (!this.selectedService) {
      this.snackBar.open('Veuillez sélectionner un service avant de soumettre', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Check if required documents are uploaded
    if (this.selectedService.requiredDocuments && this.selectedService.requiredDocuments.length > 0) {
      const uploadedDocNames = this.uploadedFiles.map(file => file.name.toLowerCase());
      const missingDocs = this.selectedService.requiredDocuments.filter(doc => 
        !uploadedDocNames.some(uploaded => uploaded.includes(doc.toLowerCase()) || doc.toLowerCase().includes(uploaded))
      );
      
      if (missingDocs.length > 0) {
        this.snackBar.open(`Documents requis manquants: ${missingDocs.join(', ')}`, 'Fermer', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
    }
    
    if (this.serviceForm.valid && this.requestForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // First upload files if any
      if (this.uploadedFiles.length > 0) {
        this.uploadFilesAndCreateRequest();
      } else {
        // Create request without files
        this.createRequest([]);
      }
    } else {
      // Show validation errors
      this.snackBar.open('Veuillez corriger les erreurs de validation avant de soumettre', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private uploadFilesAndCreateRequest(): void {
    console.log('Starting upload process with', this.uploadedFiles.length, 'files');
    
    // Show upload progress message
    this.snackBar.open('Téléversement des documents en cours...', 'Fermer', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });

    // Try to upload files first using the file upload service
    this.fileUploadService.uploadDocuments(this.uploadedFiles).subscribe({
      next: (uploadResponse: UploadResponse) => {
        console.log('Files uploaded successfully:', uploadResponse);
        console.log('Document paths received:', uploadResponse.documentPaths);
        
        if (uploadResponse.success && uploadResponse.documentPaths && uploadResponse.documentPaths.length > 0) {
          // Files were uploaded successfully, create request with actual document paths
          console.log('✅ Using uploaded document paths:', uploadResponse.documentPaths);
          this.createRequest(uploadResponse.documentPaths);
        } else {
          // Upload response indicates failure, fallback to file names
          console.log('⚠️ Upload response indicates failure, falling back to file names');
          const fileNames = this.uploadedFiles.map(file => file.name);
          this.createRequest(fileNames);
        }
      },
      error: (uploadError: any) => {
        console.error('Error uploading files:', uploadError);
        console.log('Upload error status:', uploadError.status);
        console.log('Upload error details:', uploadError);
        
        // Only use fallback for specific error statuses that indicate endpoint issues
        const fallbackStatuses = [0, 404, 501, 405, 502, 503, 504];
        console.log('Checking if status', uploadError.status, 'is in fallback statuses:', fallbackStatuses);
        
        if (fallbackStatuses.includes(uploadError.status)) {
          console.log(`✅ Upload endpoint not available (status: ${uploadError.status}), proceeding with file names`);
          
          let message = 'Téléversement des documents non disponible, création de la demande avec les noms des fichiers';
          if (uploadError.status === 0) {
            message = 'Endpoint de téléversement non implémenté, création de la demande avec les noms des fichiers';
          } else if (uploadError.status === 404) {
            message = 'Endpoint de téléversement non trouvé, création de la demande avec les noms des fichiers';
          } else if (uploadError.status === 500) {
            message = 'Erreur serveur lors du téléversement, création de la demande avec les noms des fichiers';
          }
          
          this.snackBar.open(message, 'Fermer', {
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
          
          // Proceed with creating the request using file names
          const fileNames = this.uploadedFiles.map(file => file.name);
          console.log('✅ Proceeding with fallback using file names:', fileNames);
          this.createRequest(fileNames);
        } else {
          console.log('❌ Status not in fallback list, showing error');
          this.isSubmitting = false;
          this.snackBar.open('Erreur lors du téléversement des documents', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  private createRequest(documentPaths: string[]): void {
    console.log('=== CREATE REQUEST CALLED ===');
    console.log('Creating request with document paths:', documentPaths);
    console.log('Document paths type:', typeof documentPaths);
    console.log('Document paths length:', documentPaths.length);
    
    // Prepare request data
    const demandeRequest: DemandeRequest = {
      serviceId: parseInt(this.serviceForm.value.serviceId),
      commentaire: this.requestForm.value.description,
      documentsJustificatifs: documentPaths,
      serviceData: this.getServiceData()
    };

    console.log('Submitting request:', demandeRequest);

    this.demandeService.createDemande(demandeRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Request created successfully:', response);
        
        // Check if the request was actually created successfully
        if (response && (response.id || response.success)) {
          this.snackBar.open('Demande créée avec succès!', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/agent/requests']);
        } else {
          // Handle case where response doesn't indicate success
          this.snackBar.open('Demande créée mais confirmation manquante', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
          this.router.navigate(['/agent/requests']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Erreur lors de la création de la demande:', error);
        
        // Check if the error is actually a success (sometimes backend returns error status even on success)
        if (error.error && (error.error.id || error.error.success)) {
          this.snackBar.open('Demande créée avec succès!', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/agent/requests']);
        } else if (error.status === 201 || error.status === 200) {
          // Sometimes the backend returns success status but in error callback
          this.snackBar.open('Demande créée avec succès!', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/agent/requests']);
        } else {
          // Show error only if request was not created
          this.snackBar.open('Erreur lors de la création de la demande', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  private getServiceData(): { [key: string]: any } {
    const serviceData: { [key: string]: any } = {};
    
    if (this.selectedService && this.selectedService.formFields) {
      // Ajouter les champs dynamiques du formulaire
      this.selectedService.formFields.forEach(field => {
        const value = this.requestForm.get(field.name)?.value;
        if (value !== null && value !== undefined && value !== '') {
          serviceData[field.name] = value;
        }
      });
    }
    
    console.log('Service data:', serviceData);
    return serviceData;
  }
}