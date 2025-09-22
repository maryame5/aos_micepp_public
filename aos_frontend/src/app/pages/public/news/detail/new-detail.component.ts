import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NewsService, DocumentPublicDTO } from '../../../../services/news.service';
import { PageHeaderComponent } from "../../../../components/shared/page-header/page-header.component";
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    PageHeaderComponent
  ],
  template: `
    <div class="news-detail-page">
      <!-- Page Header with Back Button -->
      <app-page-header
        title="Détail de l'actualité"
        subtitle="Lecture complète de l'article"
        [showActions]="true">
        <!-- Header content -->
        <div slot="actions" class="header-actions">
          <button mat-button (click)="goBack()" class="header-back-button">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </app-page-header>

      <!-- Loading state -->
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="loading-text">Chargement de l'article...</p>
      </div>

      <!-- Error state -->
      <div class="error-container" *ngIf="error && !isLoading">
        <div class="error-content">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3 class="error-title">Article introuvable</h3>
          <p class="error-message">{{ error }}</p>
          <div class="error-actions">
            <button mat-raised-button color="primary" (click)="goBack()" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
              Retour aux actualités
            </button>
            <button mat-button (click)="retry()" class="retry-btn">
              <mat-icon>refresh</mat-icon>
              Réessayer
            </button>
          </div>
        </div>
      </div>

      <!-- Article content -->
      <div class="article-container" *ngIf="!isLoading && !error && article">
        <!-- Article card -->
        <mat-card class="article-card">
          <!-- Article header with centered title -->
          <div class="article-header-wrapper">
            <mat-card-header class="article-header">
              <!-- Type chip centered -->
              <div class="article-type-section">
                <mat-chip class="type-chip" [class]="'chip-' + article.type">
                  <mat-icon class="chip-icon">{{ getFileTypeIcon(article.type) }}</mat-icon>
                  {{ getTypeLabel(article.type) }}
                </mat-chip>
              </div>
              
              <!-- Centered title -->
              <div class="article-title-section">
                <mat-card-title class="article-title">{{ article.titre }}</mat-card-title>
              </div>
            </mat-card-header>
          </div>



          <!-- Article image if it's an image file -->
          <div class="article-image-section" *ngIf="hasImageFile(article)">
            <div class="article-image-container">
              <img [src]="getImageUrl(article)" [alt]="article.titre" class="article-image" (error)="onImageError($event)">
            </div>
          </div>

          <!-- Article content avec style Quill -->
          <mat-card-content class="article-content">
            <div class="content-wrapper">
              <div class="ql-container ql-snow content-body">
                <div class="ql-editor article-description" [innerHTML]="getSafeHtml(article.description)"></div>
              </div>
            </div>
          </mat-card-content>

          <!-- Document section à la fin -->
          <div class="document-section" *ngIf="article.fileName">
            <div class="section-header">
              <h3>Document joint</h3>
              <mat-icon>attachment</mat-icon>
            </div>
            <div class="document-preview">
              <div class="document-info">
                <div class="doc-icon-wrapper">
                  <mat-icon class="doc-icon">{{ getFileTypeIcon(article.type) }}</mat-icon>
                </div>
                <div class="doc-details">
                  <h4>{{ article.fileName }}</h4>
                  <div class="doc-actions">
                    <button mat-raised-button color="primary" (click)="downloadDocument()" class="doc-btn">
                      <mat-icon>download</mat-icon>
                      Télécharger
                    </button>
                    <button mat-button (click)="previewDocument()" class="doc-btn">
                      <mat-icon>visibility</mat-icon>
                      Aperçu
                    </button>
                    <button mat-button (click)="printDocument()" class="doc-btn">
                      <mat-icon>print</mat-icon>
                      Imprimer
                    </button>
                    <button mat-icon-button (click)="shareDocument()" matTooltip="Partager le document">
                      <mat-icon>share</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Article footer with author and date like signature -->
          <div class="article-footer" *ngIf="article">
            <div class="footer-signature">
              <div class="signature-content">
                <div class="author-info">
                  <mat-icon class="signature-icon">person</mat-icon>
                  <span class="author-name">{{ article.publishedByName }}</span>
                </div>
                <div class="date-info">
                  <mat-icon class="signature-icon">schedule</mat-icon>
                  <span class="publish-date">{{ formatDate(article.createdDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    /* Variables CSS harmonisées avec l'application */
    :host {
      --primary-color: #1976d2;
      --accent-color: #ff4081;
      --warn-color: #f44336;
      --success-color: #4caf50;
      --surface-color: #ffffff;
      --background-color: #f8f9fa;
      --text-primary: #1a1a1a;
      --text-secondary: #6b7280;
      --divider-color: #e5e7eb;
      --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.08);
      --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.08);
      --shadow-heavy: 0 10px 25px rgba(0, 0, 0, 0.12);
      --border-radius: 16px;
      --border-radius-small: 10px;
      --transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .news-detail-page {
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--background-color) 0%, var(--surface-color) 100%);
      min-height: 100vh;
    }

    /* Header actions styling */
    .header-actions {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .header-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .publish-date, .author {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .publish-date mat-icon, .author mat-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
    }

    .meta-separator {
      color: var(--divider-color);
      font-weight: bold;
    }

    .header-back-button {
      color: var(--primary-color) !important;
      background: rgba(25, 118, 210, 0.1) !important;
      border-radius: var(--border-radius-small) !important;
      font-weight: 500;
      transition: var(--transition);
    }

    .header-back-button:hover {
      background: rgba(25, 118, 210, 0.15) !important;
    }

    .header-back-button mat-icon {
      margin-right: 0.5rem;
    }

    /* Loading state */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      min-height: 400px;
      background: var(--surface-color);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-light);
      text-align: center;
      margin-top: 2rem;
    }

    .loading-text {
      margin-top: 1.5rem;
      color: var(--text-secondary);
      font-size: 1.1rem;
      font-weight: 500;
    }

    /* Error state */
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 2rem;
      margin-top: 2rem;
    }

    .error-content {
      text-align: center;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      padding: 3rem 2rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-medium);
      border: 2px solid rgba(239, 68, 68, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      font-size: 4rem !important;
      width: 4rem !important;
      height: 4rem !important;
      color: var(--warn-color);
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }

    .error-title {
      color: var(--warn-color);
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .error-message {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .back-btn, .retry-btn {
      border-radius: var(--border-radius-small) !important;
      font-weight: 500;
    }

    .back-btn mat-icon, .retry-btn mat-icon {
      margin-right: 0.5rem;
    }

    /* Article container */
    .article-container {
      animation: fadeIn 0.5s ease-out;
      margin-top: 2rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Article card */
    .article-card {
      border-radius: var(--border-radius);
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: var(--shadow-medium);
      overflow: hidden;
      background: var(--surface-color);
      position: relative;
    }

    .article-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%);
      z-index: 1;
    }

    /* Article header with centered layout */
    .article-header-wrapper {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }

    .article-header {
      padding: 2rem 2rem 1.5rem 2rem;
      text-align: center;
    }

    /* Type chip centered */
    .article-type-section {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .type-chip {
      font-weight: 500 !important;
      font-size: 0.75rem !important;
      border-radius: 20px !important;
      border: 1px solid rgba(255, 255, 255, 0.8);
    }

    .type-chip.chip-news {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%) !important;
      color: white !important;
    }

    .type-chip.chip-article {
      background: linear-gradient(135deg, #ff4081 0%, #ff80ab 100%) !important;
      color: white !important;
    }

    .type-chip.chip-document {
      background: linear-gradient(135deg, #f44336 0%, #ef5350 100%) !important;
      color: white !important;
    }

    .type-chip.chip-announcement {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%) !important;
      color: white !important;
    }

    .chip-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      margin-right: 0.25rem !important;
    }

    /* Centered title */
    .article-title-section {
      display: flex;
      justify-content: center;
    }

    .article-title {
      font-size: 2rem !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      color: var(--text-primary);
      margin: 0 !important;
      text-align: center;
      max-width: 100%;
    }

    /* Article image section */
    .article-image-section {
      padding: 2rem;
      background: var(--surface-color);
      border-bottom: 1px solid var(--divider-color);
    }

    .article-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 100%;
      overflow: hidden;
      border-radius: var(--border-radius-small);
      box-shadow: var(--shadow-light);
    }

    .article-image {
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: var(--border-radius-small);
      transition: var(--transition);
    }

    .article-image:hover {
      transform: scale(1.02);
    }

    /* Article content avec styles Quill */
    .article-content {
      padding: 2rem !important;
    }

    .content-wrapper {
      max-width: none;
    }

    /* Styles Quill pour le contenu */
    .ql-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.125rem;
      line-height: 1.7;
      color: var(--text-primary);
      border: none;
    }

    .ql-editor {
      padding: 0;
      border: none;
      outline: none;
    }

    .ql-editor h1, .ql-editor h2, .ql-editor h3, 
    .ql-editor h4, .ql-editor h5, .ql-editor h6 {
      font-weight: 600;
      color: var(--text-primary);
      margin: 2rem 0 1rem 0;
      line-height: 1.3;
    }

    .ql-editor h1 { font-size: 2rem; }
    .ql-editor h2 { font-size: 1.75rem; }
    .ql-editor h3 { font-size: 1.5rem; }
    .ql-editor h4 { font-size: 1.25rem; }

    .ql-editor p {
      margin: 1.25rem 0;
      line-height: 1.7;
    }

    .ql-editor strong, .ql-editor b {
      font-weight: 600;
      color: var(--text-primary);
    }

    .ql-editor em, .ql-editor i {
      font-style: italic;
    }

    .ql-editor ul, .ql-editor ol {
      margin: 1.5rem 0;
      padding-left: 2rem;
    }

    .ql-editor li {
      margin: 0.75rem 0;
      line-height: 1.6;
    }

    .ql-editor blockquote {
      border-left: 4px solid var(--primary-color);
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      background: rgba(25, 118, 210, 0.05);
      border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
      font-style: italic;
      color: var(--text-secondary);
    }

    .ql-editor code {
      background: #f1f5f9;
      color: #e11d48;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    .ql-editor pre {
      background: #1a1a1a;
      color: #f8f9fa;
      padding: 1.5rem;
      border-radius: var(--border-radius-small);
      overflow-x: auto;
      margin: 2rem 0;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .ql-editor a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .ql-editor a:hover {
      text-decoration: underline;
    }

    /* Document section */
    .document-section {
      background: rgba(248, 249, 250, 0.7);
      border-top: 1px solid var(--divider-color);
      padding: 2rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .section-header mat-icon {
      color: var(--text-secondary);
      font-size: 1.5rem;
    }

    .document-preview {
      background: var(--surface-color);
      border-radius: var(--border-radius-small);
      padding: 1.5rem;
      box-shadow: var(--shadow-light);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .document-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .doc-icon-wrapper {
      width: 4rem;
      height: 4rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .doc-icon {
      font-size: 2rem !important;
      width: 2rem !important;
      height: 2rem !important;
      color: white;
    }

    .doc-details {
      flex: 1;
    }

    .doc-details h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .doc-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .doc-btn {
      border-radius: var(--border-radius-small) !important;
      font-weight: 500 !important;
      font-size: 0.9rem !important;
    }

    .doc-btn mat-icon {
      margin-right: 0.5rem;
      font-size: 1.1rem !important;
    }

    /* Footer signature */
    .article-footer {
      border-top: 1px solid var(--divider-color);
      background: rgba(248, 249, 250, 0.7);
      padding: 1.5rem 2rem !important;
    }

    .footer-signature {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .signature-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-end;
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-style: italic;
    }

    .author-info, .date-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .signature-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      color: var(--text-secondary);
    }

    .author-name, .publish-date {
      font-weight: 500;
    }

    /* Footer actions */
    .footer-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .footer-btn {
      color: var(--text-secondary) !important;
      background: rgba(25, 118, 210, 0.05) !important;
      border-radius: var(--border-radius-small) !important;
      font-weight: 500 !important;
      transition: var(--transition);
    }

    .footer-btn:hover {
      color: var(--primary-color) !important;
      background: rgba(25, 118, 210, 0.1) !important;
    }

    .footer-btn mat-icon {
      margin-right: 0.5rem;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .news-detail-page {
        padding: 1rem;
      }

      .header-actions {
        flex-direction: column;
        gap: 1rem;
      }

      .header-meta {
        order: 2;
        font-size: 0.8rem;
      }

      .header-back-button {
        order: 1;
      }

      .article-header {
        padding: 1.5rem 1rem 1rem 1rem;
      }

      .article-content {
        padding: 1.5rem 1rem !important;
      }

      .article-title {
        font-size: 1.5rem !important;
      }



      .document-section {
        padding: 1.5rem 1rem;
      }

      .document-info {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .doc-actions {
        justify-content: center;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
      }

      .footer-actions {
        flex-direction: column;
      }

      .footer-btn {
        width: 100%;
        justify-content: center;
      }

      .ql-editor h1 { font-size: 1.75rem; }
      .ql-editor h2 { font-size: 1.5rem; }
      .ql-editor h3 { font-size: 1.25rem; }
    }

    @media (max-width: 480px) {
      .header-meta {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }

      .ql-container {
        font-size: 1rem;
      }

      .error-icon {
        font-size: 3rem !important;
        width: 3rem !important;
        height: 3rem !important;
      }

      .doc-actions {
        flex-direction: column;
        width: 100%;
      }

      .doc-btn {
        width: 100%;
        justify-content: center;
      }

      .header-back-button {
        font-size: 0.875rem;
      }
    }

    /* Focus et accessibilité */
    .article-card:focus-within {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    button:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  `]
})
export class NewsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private newsService = inject(NewsService);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private apiUrl = `${environment.apiUrl}/documents`;
  
  private http: HttpClient = inject(HttpClient);

  article: DocumentPublicDTO | null = null;
  isLoading = true;
  error: string | null = null;
  articleId: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.articleId = params['id'];
      if (this.articleId) {
        this.loadArticle();
      } else {
        this.error = 'Identifiant d\'article manquant';
        this.isLoading = false;
      }
    });
  }

  loadArticle() {
    if (!this.articleId) return;

    this.isLoading = true;
    this.error = null;

    this.newsService.getDocumentById(+this.articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.isLoading = false;
        document.title = `${article.titre} - Actualités`;
      },
      error: (error) => {
        console.error('Error loading article:', error);
        this.error = 'Article introuvable ou inaccessible';
        this.isLoading = false;
      }
    });
  }

  retry() {
    this.loadArticle();
  }

  goBack() {
    this.router.navigate(['/news']);
  }

  shareArticle() {
    if (!this.article) return;

    const url = window.location.href;
    const title = this.article.titre;
    const text = this.getPlainTextExcerpt(this.article.description);

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Lien copié dans le presse-papiers', 'Fermer', {
          duration: 3000
        });
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
        this.snackBar.open('Impossible de copier le lien', 'Fermer', {
          duration: 3000
        });
      });
    }
  }

  shareDocument() {
    if (!this.article || !this.article.fileName) return;
    
    const url = `${window.location.origin}/api/documents/${this.article.id}/download`;
    const title = `Document: ${this.article.fileName}`;

    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch(err => console.log('Error sharing document:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Lien du document copié', 'Fermer', {
          duration: 3000
        });
      });
    }
  }

  downloadDocument() {
    if (!this.article || !this.article.fileName) return;

    this.newsService.downloadDocument(this.article.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.article!.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Téléchargement démarré', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  previewDocument() {
    if (!this.article) return;
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      this.snackBar.open('Impossible d\'ouvrir la fenêtre d\'aperçu', 'Fermer', {
        duration: 3000
      });
      return;
    }
    this.newsService.downloadDocument(this.article.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        previewWindow.document.write(`
          <html>
            <head>
              <title>Aperçu - ${this.article!.titre}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                iframe { border: none; width: 100%; height: calc(100vh - 40px); }
              </style>
            </head>
            <body>
              <iframe src="${url}"></iframe>
            </body>
          </html>
        `);
        previewWindow.document.close();
        previewWindow.focus();
      },
      error: (error) => {
        console.error('Error fetching document for preview:', error);
        this.snackBar.open('Erreur lors de la préparation de l\'aperçu', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  printArticle() {
    window.print();
  }

  printDocument() {
    if (!this.article) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.snackBar.open('Impossible d\'ouvrir la fenêtre d\'impression', 'Fermer', {
        duration: 3000
      });
      return;
    }
    this.newsService.downloadDocument(this.article.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        printWindow.document.write(`
          <html>
            <head>
              <title>${this.article!.titre}</title>
            </head>
            <body style="margin:0; padding:0;">
              <iframe src="${url}" style="border:none; width:100%; height:100vh;"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error: (error) => {
        console.error('Error fetching document for print:', error);
        this.snackBar.open('Erreur lors de la préparation de l\'impression', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'news': return 'primary';
      case 'article': return 'accent';
      case 'document': return 'warn';
      case 'announcement': return '';
      default: return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'news': return 'Actualité';
      case 'article': return 'Article';
      case 'document': return 'Document';
      case 'announcement': return 'Annonce';
      default: return type;
    }
  }

  getFileTypeIcon(type: string): string {
    switch (type) {
      case 'news': return 'newspaper';
      case 'article': return 'article';
      case 'document': return 'description';
      case 'announcement': return 'campaign';
      default: return 'insert_drive_file';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSafeHtml(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  getPlainTextExcerpt(htmlContent: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText;
  }

  canShare(): boolean {
    return 'share' in navigator || 'clipboard' in navigator;
  }

  hasImageFile(article: DocumentPublicDTO): boolean {
    if (!article.fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext =>
      article.fileName.toLowerCase().endsWith(ext)
    );
  }

  getImageUrl(article: DocumentPublicDTO): string {
    let imageUrl = '';
    this.http.get(`${this.apiUrl}/public/${article.id}/image`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        imageUrl = URL.createObjectURL(blob);
      },
      error: (error) => {
        console.error('Error fetching image:', error);
      }
    });
    return imageUrl;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
