import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../components/shared/header/header.component";
import { SidebarComponent } from "../../components/shared/sidebar/sidebar.component";
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
    
  
],
  template: `
    <div class="dashboard-layout">
       <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar -->
        <mat-sidenav 
          #drawer 
          class="sidenav" 
          fixedInViewport
          [attr.role]="'navigation'"
          [mode]="'over'"
          [opened]="false">
          <div class="sidebar-content">
            <div class="sidebar-header">
              <h3 class="sidebar-title">Navigation</h3>
            </div>
            
            <mat-nav-list class="sidebar-nav">
              <!-- Dashboard -->
              <a mat-list-item routerLink="/agent/dashboard" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Tableau de bord</span>
              </a>

             

              <!-- Requests -->
              <a mat-list-item routerLink="/agent/requests" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>assignment</mat-icon>
                <span matListItemTitle>Demandes</span>
              </a>

              <!-- Complaints -->
              <a mat-list-item routerLink="/agent/complaints" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>support_agent</mat-icon>
                <span matListItemTitle>Réclamations</span>
              </a>

              <mat-divider></mat-divider>

         
              <a mat-list-item routerLink="/agent/services" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>business_center</mat-icon>
                <span matListItemTitle>Services</span>
              </a>

              <a mat-list-item routerLink="/news" routerLinkActive="active" class="sidebar-link" >
                <mat-icon matListItemIcon>article</mat-icon>
                <span matListItemTitle>Actualités</span>
              </a>

              <mat-divider></mat-divider>


              <!-- Settings -->
              <a mat-list-item routerLink="/agent/settings" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>Paramètres</span>
              </a>
            </mat-nav-list>
          </div>
        </mat-sidenav>

        <mat-sidenav-content>
     <app-header (toggleSidebar)="drawer.toggle()" ></app-header>
       <main class="dashboard-main">
         <router-outlet></router-outlet>
       </main>
     </mat-sidenav-content>
      </mat-sidenav-container>
    </div>

    
        
    
  `,
 styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
    }

    .sidebar-content {
      padding: 0;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .sidebar-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .sidebar-nav {
      padding: 0;
    }

    .sidebar-link {
      color: #64748b;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .sidebar-link:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .sidebar-link.active {
      background: #dbeafe;
      color: #3b82f6;
      border-right: 3px solid #3b82f6;
    }

    .sidebar-link mat-icon {
      color: inherit;
    }

    .dashboard-main {
      min-height: calc(100vh - 64px);
      padding: 1rem;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
      
      .dashboard-main {
        padding: 0.5rem;
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}