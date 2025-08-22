import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';
import { User, UserRole } from '../../../models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="sidebar-container" [class.rtl]="isRTL()" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo">
          <mat-icon class="logo-icon">account_balance</mat-icon>
          <span class="logo-text" *ngIf="!collapsed">AOS MICEPP</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <nav class="sidebar-nav">
        <mat-list>
          <div *ngFor="let item of getMenuItems()">
            <mat-list-item 
              *ngIf="!item.children"
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle *ngIf="!collapsed">{{ item.label }}</span>
            </mat-list-item>

            <!-- Submenu items -->
            <div *ngIf="item.children" class="submenu">
              <div class="submenu-header" *ngIf="!collapsed">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
              </div>
              <mat-list-item 
                *ngFor="let child of item.children"
                [routerLink]="child.route"
                routerLinkActive="active"
                class="nav-item submenu-item">
                <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                <span matListItemTitle *ngIf="!collapsed">{{ child.label }}</span>
              </mat-list-item>
            </div>
          </div>
        </mat-list>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar-container {
      height: 100vh;
      background: white;
      border-right: 1px solid #e2e8f0;
      overflow-y: auto;
      width: 250px;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
    }

    .sidebar-container.rtl {
      border-right: none;
      border-left: 1px solid #e2e8f0;
      left: auto;
      right: 0;
    }

    .sidebar-container.collapsed {
      width: 60px;
    }

    .sidebar-header {
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .sidebar-nav {
      padding: 1rem 0;
    }

    .nav-item {
      margin: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      background-color: #f1f5f9;
    }

    .nav-item.active {
      background-color: #e0e7ff;
      color: #3730a3;
    }

    .nav-item.active mat-icon {
      color: #3730a3;
    }

    .submenu {
      margin: 0.5rem 0;
    }

    .submenu-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      color: #4b5563;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .submenu-item {
      padding-left: 2rem !important;
      font-size: 0.875rem;
    }

    .rtl .submenu-item {
      padding-left: 1rem !important;
      padding-right: 2rem !important;
    }

    @media (max-width: 768px) {
      .sidebar-container {
        width: 200px;
      }
      .sidebar-container.collapsed {
        width: 0;
        overflow: hidden;
      }
      .logo-text {
        display: none;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  
  currentUser: User | null = null;

  private menuItems: MenuItem[] = [
    {
      label: 'Accueil',
      icon: 'home',
      route: '/',
    },
    {
      label: 'Services',
      icon: 'business_center',
      route: '/services',
    },
    {
      label: 'Actualités',
      icon: 'article',
      route: '/news',
    },
    {
      label: 'Contact',
      icon: 'contact_mail',
      route: '/contact',
    },
    {
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/agent/dashboard',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT]
    },
    {
      label: 'Mes demandes',
      icon: 'request_page',
      route: '/agent/requests',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT]
    },
    {
      label: 'Nouvelle demande',
      icon: 'add_circle',
      route: '/agent/new-request',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT]
    },
    {
      label: 'Mes réclamations',
      icon: 'report_problem',
      route: '/agent/complaints',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT]
    },
    {
      label: 'Documents',
      icon: 'description',
      route: '/agent/documents',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT]
    }
  ];

  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });
    } catch (error) {
      console.error('Error initializing sidebar:', error);
    }
  }

  getMenuItems(): MenuItem[] {
    try {
      return this.menuItems.filter(item => {
        if (!item.roles) return true;
        if (!this.currentUser) return false;
        return item.roles.includes(this.currentUser.role);
      }).map(item => ({
        ...item,
        children: item.children?.filter(child => {
          if (!child.roles) return true;
          if (!this.currentUser) return false;
          return child.roles.includes(this.currentUser.role);
        })
      }));
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  isRTL(): boolean {
    try {
      return this.languageService.isRTL();
    } catch (error) {
      return false;
    }
  }
}