import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServiceInfo } from '../../../services/service-info.service';

@Component({
  selector: 'app-service-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="service-detail-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <div class="service-icon">
          <mat-icon>{{ data.icon }}</mat-icon>
        </div>
        <p class="description">{{ data.description }}</p>
        <h3>Fonctionnalités:</h3>
        <ul class="features">
          <li *ngFor="let feature of data.features">{{ feature }}</li>
        </ul>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Fermer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .service-detail-dialog {
      padding: 1rem;
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

    .description {
      text-align: center;
      margin-bottom: 1rem;
    }

    .features {
      text-align: left;
      padding-left: 1rem;
    }

    .features li {
      margin: 0.5rem 0;
    }
  `]
})
export class ServiceDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ServiceInfo) {}
}
