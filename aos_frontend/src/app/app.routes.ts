import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/public/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/public/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./pages/public/news/news.component').then(m => m.NewsComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/public/contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  },

  // Authentication routes
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      
      {
        path: 'change-password',
        loadComponent: () => import('./pages/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      }
    ]
  },

  // Agent routes
  {
    path: 'agent',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/agent/dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/agent/requests/agent-requests.component').then(m => m.AgentRequestsComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/agent/request-detail/request-detail.component').then(m => m.RequestDetailComponent)
      },
      {
        path: 'new-request',
        loadComponent: () => import('./pages/agent/new-request/new-request.component').then(m => m.NewRequestComponent)
      },
      {
        path: 'complaints',
        loadComponent: () => import('./pages/agent/complaints/agent-complaints.component').then(m => m.AgentComplaintsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/agent/documents/agent-documents.component').then(m => m.AgentDocumentsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/agent/profile/agent-profile.component').then(m => m.AgentProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  
  // Error routes
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./pages/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/404'
  }
];