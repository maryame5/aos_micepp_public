import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NewsService, DocumentPublicDTO } from '../../../services/news.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  template: `
    <!-- Section Hero avec image de fond -->
    <section class="relative h-[600px] bg-cover bg-center bg-no-repeat" 
             style="background-image: url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');">
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative z-10 flex items-center justify-center h-full">
        <div class="text-center text-white max-w-4xl mx-auto px-4">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            AOS MICEPP: Œuvrons ensemble pour le bien-être des agents du ministère
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-200">
            Votre partenaire privilégié pour l'accompagnement social des fonctionnaires
          </p>
          <div class="flex flex-col md:flex-row gap-4 justify-center">
            <a routerLink="/services" 
               class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <i class="fas fa-cogs"></i>
              <span>Découvrir nos services</span>
            </a>
            <a routerLink="/auth/login" 
               class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <i class="fas fa-user"></i>
              <span>Espace membre</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Introduction -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Bienvenue sur notre portail</h2>
        <div class="prose prose-lg mx-auto text-gray-600">
          <p class="text-center leading-relaxed">
                Bienvenue sur le site officiel de l'Association Sociale du Ministère de l'Investissement, 
                de la Convergence et de l'Évaluation des Politiques Publiques (AOS MICEPP).
              </p>
          <p class="text-center leading-relaxed mt-4">
                Nous sommes heureux de vous accueillir sur cet espace dédié à l'information, à l'engagement 
                et à la solidarité. Ce site a pour vocation de vous faire découvrir les initiatives menées 
                par l'association en faveur des agents du ministère et de leurs familles.
              </p>
            </div>
      </div>
    </section>

    <!-- Section Services avec Slider -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-800 mb-12 text-center">Nos Services</h2>
        
        <div class="relative">
          <!-- Boutons de navigation -->
          <button (click)="prevSlide()" 
                  class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <button (click)="nextSlide()" 
                  class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110">
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Container du slider -->
          <div class="overflow-hidden">
            <div class="flex transition-transform duration-500 ease-in-out" 
                 [style.transform]="'translateX(' + currentSlide * -100 + '%)'">
              
              <!-- Service 1 -->
              <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 px-4">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 p-6 h-full">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-umbrella-beach text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Colonies de vacances</h3>
                  <p class="text-gray-600 text-center mb-4">
                    Organisation de séjours pour enfants et familles durant les vacances scolaires.
                  </p>
                  <a routerLink="/services" class="text-blue-600 font-semibold hover:text-purple-600 text-center block transition-colors">
                    En savoir plus <i class="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>

              <!-- Service 2 -->
              <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 px-4">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 p-6 h-full">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-heartbeat text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Assistance médicale</h3>
                  <p class="text-gray-600 text-center mb-4">
                    Appui social et médical pour les agents et leurs familles.
                  </p>
                  <a routerLink="/services" class="text-purple-600 font-semibold hover:text-blue-600 text-center block transition-colors">
                    En savoir plus <i class="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>

              <!-- Service 3 -->
              <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 px-4">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 p-6 h-full">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-futbol text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Activités sportives</h3>
                  <p class="text-gray-600 text-center mb-4">
                    Promotion de la culture et du sport à travers des événements réguliers.
                  </p>
                  <a routerLink="/services" class="text-blue-600 font-semibold hover:text-purple-600 text-center block transition-colors">
                    En savoir plus <i class="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>

              <!-- Service 4 -->
              <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 px-4">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 p-6 h-full">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-graduation-cap text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Appui scolaire</h3>
                  <p class="text-gray-600 text-center mb-4">
                    Encadrement des enfants d'agents via du soutien scolaire et universitaire.
                  </p>
                  <a routerLink="/services" class="text-purple-600 font-semibold hover:text-blue-600 text-center block transition-colors">
                    En savoir plus <i class="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>

              <!-- Service 5 -->
              <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 px-4">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 p-6 h-full">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-bus text-2xl text-blue-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Transport des agents</h3>
                  <p class="text-gray-600 text-center mb-4">
                    Organisation de moyens de transport pour faciliter les déplacements.
                  </p>
                  <a routerLink="/services" class="text-blue-600 font-semibold hover:text-purple-600 text-center block transition-colors">
                    En savoir plus <i class="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>

              <!-- Service 6 -->
              <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 px-4">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 p-6 h-full">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-home text-2xl text-purple-600"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Aide au logement</h3>
                  <p class="text-gray-600 text-center mb-4">
                    Soutien aux agents dans la recherche ou l'aménagement de logement.
                  </p>
                  <a routerLink="/services" class="text-purple-600 font-semibold hover:text-blue-600 text-center block transition-colors">
                    En savoir plus <i class="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Actualités -->
    <section class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-800 mb-12 text-center">Actualités récentes</h2>

        <!-- Loading state -->
        <div *ngIf="isLoadingNews" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error state -->
        <div *ngIf="newsError && !isLoadingNews" class="text-center py-12">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-exclamation-triangle text-red-600 text-3xl mb-4"></i>
            <p class="text-red-700">{{ newsError }}</p>
          </div>
        </div>

        <!-- News grid -->
        <div *ngIf="!isLoadingNews && !newsError" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let article of recentNews" class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden">
            <!-- Image section -->
            <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
              <i *ngIf="!hasImageFile(article)" [class]="getFileTypeIcon(article.type) + ' text-6xl text-white'"></i>
              <img *ngIf="hasImageFile(article)" [src]="getImageUrl(article)" [alt]="article.titre"
                   class="w-full h-full object-cover">
            </div>

            <div class="p-6">
              <div class="flex items-center mb-3">
                <span class="text-sm text-gray-500">{{ formatDate(article.createdDate) }}</span>
                <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {{ getTypeLabel(article.type) }}
                </span>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3">
                {{ article.titre }}
              </h3>
              <div class="text-gray-600 mb-4" [innerHTML]="getExcerpt(article.description)"></div>
              <a [routerLink]="['/news/details', article.id]" class="text-blue-600 font-semibold hover:text-purple-600 transition-colors">
                Lire la suite <i class="fas fa-arrow-right ml-1"></i>
              </a>
            </div>
          </div>

          <!-- Empty state when no news -->
          <div *ngIf="recentNews.length === 0" class="col-span-full text-center py-12">
            <i class="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">Aucune actualité disponible pour le moment.</p>
          </div>
        </div>
      </div>
    </section>



    <!-- Footer -->
    <footer class="bg-gradient-to-r from-blue-700 to-purple-800 text-white py-12">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Colonne 1 -->
          <div>
            <h3 class="text-blue-200 font-bold text-lg mb-4">AOS MICEPP</h3>
            <p class="text-gray-200 text-sm leading-relaxed">
              Association des Œuvres Sociales du Ministère de l'Intérieur, des Collectivités Territoriales 
              et de l'Équipement, de la Politique de la Ville et du Patrimoine.
            </p>
          </div>
          
          <!-- Colonne 2 -->
          <div>
            <h3 class="text-blue-200 font-bold text-lg mb-4">Liens utiles</h3>
            <ul class="space-y-2">
              <li><a routerLink="/services" class="text-gray-200 hover:text-blue-200 transition-colors">Nos Services</a></li>
              <li><a routerLink="/news" class="text-gray-200 hover:text-blue-200 transition-colors">Actualités</a></li>
              <li><a routerLink="/contact" class="text-gray-200 hover:text-blue-200 transition-colors">Contact</a></li>
              <li><a href="#" class="text-gray-200 hover:text-blue-200 transition-colors">Documents</a></li>
            </ul>
          </div>
          
          <!-- Colonne 3 -->
          <div>
            <h3 class="text-blue-200 font-bold text-lg mb-4">Contact</h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-center space-x-2">
                <i class="fas fa-phone text-blue-200"></i>
                <span class="text-gray-200">+212 5XX XX XX XX</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-envelope text-blue-200"></i>
                <span class="text-gray-200">contact@aos-micepp.ma</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-map-marker-alt text-blue-200"></i>
                <span class="text-gray-200">Rabat, Maroc</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-600 mt-8 pt-8 text-center">
          <p class="text-gray-300 text-sm">
            © 2025 AOS MICEPP. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  private newsService = inject(NewsService);
  private sanitizer = inject(DomSanitizer);

  currentSlide = 0;
  totalSlides = 6;

  recentNews: DocumentPublicDTO[] = [];
  isLoadingNews = true;
  newsError: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadRecentNews();
  }

  loadRecentNews() {
    this.isLoadingNews = true;
    this.newsError = null;

    this.newsService.getAllDocuments().subscribe({
      next: (documents) => {
        // Sort by date descending and take first 3
        this.recentNews = documents
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .slice(0, 3);
        this.isLoadingNews = false;
      },
      error: (error) => {
        console.error('Error loading recent news:', error);
        this.newsError = 'Impossible de charger les actualités récentes.';
        this.isLoadingNews = false;
      }
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
  }

  // Helper methods for news display
  getTypeLabel(type: string): string {
    switch (type) {
      case 'news': return 'Actualité';
      case 'article': return 'Article';
      case 'document': return 'Document';
      case 'announcement': return 'Annonce';
      default: return type;
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
    const excerpt = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;

    return this.sanitizer.bypassSecurityTrustHtml(`<p>${excerpt}</p>`);
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

  getFileTypeIcon(type: string): string {
    switch (type) {
      case 'news': return 'newspaper';
      case 'article': return 'article';
      case 'document': return 'description';
      case 'announcement': return 'campaign';
      default: return 'insert_drive_file';
    }
  }
}
