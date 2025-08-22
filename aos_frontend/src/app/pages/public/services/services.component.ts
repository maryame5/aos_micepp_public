import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { ServiceInfoService, ServiceInfo } from '../../../services/service-info.service';


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent, RouterModule],
  template: `
    <div class="services-page">
      <app-page-header title="Nos Services" subtitle="Découvrez tous les services disponibles" [showActions]="false"></app-page-header>
      
      <div class="services-content">
        <div class="loading-container" *ngIf="loading">
          <mat-spinner></mat-spinner>
          <p>Chargement des services...</p>
        </div>
        
        <div class="error-container" *ngIf="error">
          <div class="error-message">
            <mat-icon>error</mat-icon>
            <p>{{ error }}</p>
            <button mat-raised-button color="primary" (click)="loadServices()">Réessayer</button>
          </div>
        </div>
        
        <div class="services-grid" *ngIf="!loading && !error">
          <mat-card class="service-card" *ngFor="let service of services">
            <div class="service-icon">
              <mat-icon>{{ service.icon }}</mat-icon>
            </div>
            <mat-card-header>
              <mat-card-title>{{ service.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ service.description }}</p>
              <ul class="service-features">
                <li *ngFor="let feature of service.features">{{ feature }}</li>
              </ul>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" routerLink="/agent/new-request">Faire une demande</button>
              <button mat-button routerLink="/agent/requests/{{service.id}}">En savoir plus</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-page {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      
      p {
        margin-top: 1rem;
        color: #64748b;
      }
    }

    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      
      .error-message {
        text-align: center;
        background: #fff;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        
        mat-icon {
          font-size: 3rem;
          color: #e74c3c;
          margin-bottom: 1rem;
        }
        
        p {
          color: #e74c3c;
          margin-bottom: 1rem;
        }
      }
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .service-card {
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .service-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
    }

    .service-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .service-features {
      text-align: left;
      margin: 1rem 0;
      padding-left: 1rem;
    }

    .service-features li {
      margin: 0.5rem 0;
      color: #64748b;
    }
  `]
})
export class ServicesComponent implements OnInit {
  services: ServiceInfo[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private serviceInfoService: ServiceInfoService,
   
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  

  loadServices(): void {
    this.loading = true;
    this.error = null;
    
    this.serviceInfoService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des services';
        this.loading = false;
        console.error('Error loading services:', error);
      }
    });
  }
}