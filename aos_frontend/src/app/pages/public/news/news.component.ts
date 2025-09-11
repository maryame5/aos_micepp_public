import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { NewsService, DocumentPublicDTO } from '../../../services/news.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="news-page">
      <app-page-header 
        title="Actualités" 
        subtitle="Restez informé de nos dernières nouvelles" 
        [showActions]="false">
      </app-page-header>
      
      <div class="news-content">
        <!-- Loading state -->
        <div class="loading-container" *ngIf="isLoading">
          <mat-spinner diameter="50"></mat-spinner>
          <p class="loading-text">Chargement des actualités...</p>
        </div>

        <!-- Error state -->
        <div class="error-container" *ngIf="error && !isLoading">
          <div class="error-content">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h3 class="error-title">Erreur de chargement</h3>
            <p class="error-message">{{ error }}</p>
            <button mat-raised-button color="primary" (click)="loadArticles()" class="retry-btn">
              <mat-icon>refresh</mat-icon>
              Réessayer
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div class="empty-container" *ngIf="!isLoading && !error && articles.length === 0">
          <div class="empty-content">
            <mat-icon class="empty-icon">article</mat-icon>
            <h3 class="empty-title">Aucune actualité disponible</h3>
            <p class="empty-message">Aucune actualité n'a été publiée pour le moment.</p>
          </div>
        </div>

        <!-- Articles grid -->
        <div class="news-grid" *ngIf="!isLoading && !error && articles.length > 0">
          <article class="news-card-wrapper" *ngFor="let article of articles; trackBy: trackByArticleId">
            <mat-card class="news-card">
              <!-- Article image placeholder or file type indicator -->
              <div class="news-image-container">
                <div class="news-image-placeholder" >
                  <div class="icon-wrapper">
                    <mat-icon class="file-type-icon">{{ getFileTypeIcon(article.type) }}</mat-icon>
                  </div>
                  <div class="overlay-gradient"></div>
                </div>
              
                
                <!-- Type chip overlay -->
                <div class="type-chip-overlay">
                  <mat-chip class="type-chip" [class]="'chip-' + article.type">
                    <mat-icon class="chip-icon">{{ getFileTypeIcon(article.type) }}</mat-icon>
                    {{ getTypeLabel(article.type) }}
                  </mat-chip>
                </div>
              </div>

              <div class="card-content">
                <mat-card-header class="custom-header">
                  <mat-card-title class="article-title">{{ article.titre }}</mat-card-title>
                  <mat-card-subtitle class="article-meta">
                    <span class="meta-item">
                      <mat-icon class="meta-icon">schedule</mat-icon>
                      {{ formatDate(article.createdDate) }}
                    </span>
                    <span class="meta-separator">•</span>
                    <span class="meta-item">
                      <mat-icon class="meta-icon">person</mat-icon>
                      {{ article.publishedByName }}
                    </span>
                  </mat-card-subtitle>
                </mat-card-header>

                <mat-card-content class="article-content">
                  <!-- Article excerpt from description -->
                  <div class="article-excerpt" [innerHTML]="getExcerpt(article.description)"></div>
                </mat-card-content>

                <mat-card-actions class="card-actions">
                  <div class="primary-actions">
                    <button mat-raised-button color="primary" (click)="viewArticleDetails(article)" class="read-more-btn">
                      <mat-icon>chevron_right</mat-icon>
                      Lire la suite
                    </button>
                  </div>
                  <div class="secondary-actions">
                    <button 
                      mat-icon-button 
                      (click)="shareArticle(article)" 
                      *ngIf="canShare()"
                      class="action-btn"
                      matTooltip="Partager">
                      <mat-icon>share</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      (click)="downloadDocument(article)" 
                      *ngIf="article.fileName"
                      class="action-btn"
                      matTooltip="Télécharger">
                      <mat-icon>download</mat-icon>
                    </button>
                  </div>
                </mat-card-actions>
              </div>
            </mat-card>
          </article>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Variables CSS */
    :host {
      --primary-color: #1976d2;
      --accent-color: #ff4081;
      --warn-color: #f44336;
      --success-color: #4caf50;
      --surface-color: #ffffff;
      --background-color: #fafafa;
      --text-primary: #212121;
      --text-secondary: #757575;
      --divider-color: #e0e0e0;
      --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.1);
      --shadow-medium: 0 4px 8px rgba(0, 0, 0, 0.12);
      --shadow-heavy: 0 8px 16px rgba(0, 0, 0, 0.16);
      --border-radius: 12px;
      --border-radius-small: 8px;
      --transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .news-page {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      background-color: var(--background-color);
      min-height: 100vh;
    }

    .news-content {
      margin-top: 2rem;
    }

    /* States communs */
    .loading-container, .error-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      min-height: 400px;
      text-align: center;
    }

    .loading-container {
      background: var(--surface-color);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-light);
    }

    .loading-text {
      margin-top: 1.5rem;
      color: var(--text-secondary);
      font-size: 1.1rem;
      font-weight: 500;
    }

    /* Error state */
    .error-container {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      border-radius: var(--border-radius);
      border: 1px solid rgba(244, 67, 54, 0.2);
    }

    .error-content {
      max-width: 400px;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--warn-color);
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }

    .error-title {
      color: var(--warn-color);
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .error-message {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .retry-btn {
      border-radius: var(--border-radius-small);
      font-weight: 500;
      padding: 0 2rem;
    }

    .retry-btn mat-icon {
      margin-right: 0.5rem;
    }

    /* Empty state */
    .empty-container {
      background: var(--surface-color);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-light);
    }

    .empty-content {
      max-width: 400px;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    .empty-title {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .empty-message {
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Grid des articles */
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 2rem;
      margin-top: 0;
    }

    .news-card-wrapper {
      display: flex;
      height: 100%;
    }

    .news-card {
      width: 100%;
      border-radius: var(--border-radius);
      border: none;
      box-shadow: var(--shadow-medium);
      transition: var(--transition);
      overflow: hidden;
      background: var(--surface-color);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .news-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-heavy);
    }

    .news-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      z-index: 1;
    }

    /* Image container */
    .news-image-container {
      height: 220px;
      position: relative;
      overflow: hidden;
      background: var(--background-color);
    }

    .news-image-placeholder {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .icon-wrapper {
      z-index: 2;
      position: relative;
    }

    .file-type-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .overlay-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
    }

    .image-wrapper {
      height: 100%;
      position: relative;
    }

    .news-image {
      height: 100%;
      width: 100%;
      object-fit: cover;
      transition: var(--transition);
    }

    .news-card:hover .news-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
    }

    /* Type chip overlay */
    .type-chip-overlay {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 3;
    }

    .type-chip {
      background: rgba(255, 255, 255, 0.95) !important;
      color: var(--text-primary) !important;
      font-weight: 500;
      border-radius: 20px !important;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .type-chip.chip-news {
      background: rgba(25, 118, 210, 0.9) !important;
      color: white !important;
    }

    .type-chip.chip-article {
      background: rgba(255, 64, 129, 0.9) !important;
      color: white !important;
    }

    .type-chip.chip-document {
      background: rgba(244, 67, 54, 0.9) !important;
      color: white !important;
    }

    .type-chip.chip-announcement {
      background: rgba(76, 175, 80, 0.9) !important;
      color: white !important;
    }

    .chip-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      margin-right: 0.25rem !important;
    }

    /* Card content */
    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .custom-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      padding-bottom: 0;
    }

    .article-title {
      font-size: 1.35rem !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      margin-bottom: 1rem !important;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-meta {
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      color: var(--text-secondary) !important;
      font-size: 0.875rem !important;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .meta-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
    }

    .meta-separator {
      color: var(--divider-color);
      font-weight: bold;
    }

    /* Article content */
    .article-content {
      padding: 1rem 1.5rem !important;
      flex: 1;
    }

    .article-excerpt {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.6;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .article-excerpt::ng-deep p {
      margin: 0.5rem 0;
    }

    .article-excerpt::ng-deep strong,
    .article-excerpt::ng-deep b {
      font-weight: 600;
      color: var(--text-primary);
    }

    .article-excerpt::ng-deep em,
    .article-excerpt::ng-deep i {
      font-style: italic;
    }

    /* Card actions */
    .card-actions {
      padding: 1rem 1.5rem 1.5rem 1.5rem !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-top: 1px solid var(--divider-color);
      margin-top: auto;
    }

    .primary-actions {
      flex: 1;
    }

    .read-more-btn {
      border-radius: var(--border-radius-small) !important;
      font-weight: 500 !important;
      text-transform: none !important;
    }

    .read-more-btn mat-icon {
      margin-left: 0.25rem;
      font-size: 1.2rem;
    }

    .secondary-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      color: var(--text-secondary) !important;
      transition: var(--transition);
    }

    .action-btn:hover {
      color: var(--primary-color) !important;
      background-color: rgba(25, 118, 210, 0.08) !important;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .news-card-wrapper {
      animation: fadeIn 0.5s ease-out;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .news-page {
        padding: 1rem;
      }

      .news-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .news-card-wrapper {
        min-width: unset;
      }

      .article-title {
        font-size: 1.2rem !important;
      }

      .article-meta {
        font-size: 0.8rem !important;
      }

      .custom-header {
        padding: 1rem 1rem 0.5rem 1rem;
      }

      .article-content {
        padding: 0.75rem 1rem !important;
      }

      .card-actions {
        padding: 0.75rem 1rem 1rem 1rem !important;
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .secondary-actions {
        justify-content: center;
      }

      .read-more-btn {
        width: 100%;
        justify-content: center;
      }

      .loading-container, .error-container, .empty-container {
        padding: 2rem 1rem;
        min-height: 300px;
      }

      .type-chip-overlay {
        top: 0.75rem;
        right: 0.75rem;
      }

      .news-image-container {
        height: 180px;
      }
    }

    @media (max-width: 480px) {
      .news-page {
        padding: 0.5rem;
      }

      .article-excerpt {
        -webkit-line-clamp: 2;
      }

      .error-icon, .empty-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
      }
    }

    /* Focus et accessibilité */
    .news-card:focus-within {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .read-more-btn:focus,
    .action-btn:focus,
    .retry-btn:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  `]
})
export class NewsComponent implements OnInit {
  private newsService = inject(NewsService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  articles: DocumentPublicDTO[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadArticles();
  }

  trackByArticleId(index: number, article: DocumentPublicDTO): number {
    return article.id;
  }

  loadArticles() {
    this.isLoading = true;
    this.error = null;
    
    this.newsService.getAllDocuments().subscribe({
      next: (documents) => {
        this.articles = documents.sort((a, b) => {
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.error = 'Impossible de charger les actualités. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  viewArticleDetails(article: DocumentPublicDTO) {
    this.router.navigate(['/news/details', article.id]);
  }

  shareArticle(article: DocumentPublicDTO) {
    if (navigator.share) {
      navigator.share({
        title: article.titre,
        text: this.getPlainTextExcerpt(article.description),
        url: window.location.origin + `/news/${article.id}`
      }).catch(err => console.log('Error sharing:', err));
    } else {
      const url = window.location.origin + `/news/${article.id}`;
      navigator.clipboard.writeText(url).then(() => {
        console.log('URL copiée dans le presse-papiers');
      }).catch(err => console.log('Error copying to clipboard:', err));
    }
  }

  downloadDocument(article: DocumentPublicDTO) {
    if (article.fileName) {
      this.newsService.downloadDocument(article.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = article.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading document:', error);
        }
      });
    }
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
      month: 'short',
      day: 'numeric'
    });
  }

  getExcerpt(htmlContent: string): SafeHtml {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    
    return this.sanitizer.bypassSecurityTrustHtml(`<p>${excerpt}</p>`);
  }

  getPlainTextExcerpt(htmlContent: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  }

  hasImageFile(article: DocumentPublicDTO): boolean {
    if (!article.fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => 
      article.fileName.toLowerCase().endsWith(ext)
    );
  }

  getImageUrl(article: DocumentPublicDTO): string {
    return `/api/documents/${article.id}/image`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  canShare(): boolean {
    return 'share' in navigator || 'clipboard' in navigator;
  }
}