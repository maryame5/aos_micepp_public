import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    try {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/auth/login']);
        return false;
      }

      const requiredRoles = route.data['roles'] as UserRole[];
      console.log('Required roles:', requiredRoles);
      
      const currentUser = this.authService.getCurrentUser();
      console.log('Current user:', currentUser);

      if (requiredRoles && requiredRoles.length > 0) {
        if (!this.authService.hasAnyRole(requiredRoles)) {
          console.log('User does not have required roles');
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}