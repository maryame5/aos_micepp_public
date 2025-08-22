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
    data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/agent/dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/agent/requests/agent-requests.component').then(m => m.AgentRequestsComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/agent/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        path: 'new-request',
        loadComponent: () => import('./pages/agent/new-request/new-request.component').then(m => m.NewRequestComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        path: 'complaints',
        loadComponent: () => import('./pages/agent/complaints/agent-complaints.component').then(m => m.AgentComplaintsComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/agent/documents/agent-documents.component').then(m => m.AgentDocumentsComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/agent/profile/agent-profile.component').then(m => m.AgentProfileComponent),
        data: { roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.SUPPORT] }
      },
      {
        
        path: 'services',
        loadComponent: () => import('./pages/public/services/services.component').then(m => m.ServicesComponent)
         
      

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