import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, GuardResult, MaybeAsync } from '@angular/router';
import { first, map, Observable, tap } from 'rxjs';
import { FirebaseAuthService } from './shared/services/firebase/auth/firebase.auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private firebaseAuthService = inject(FirebaseAuthService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            this.firebaseAuthService.getCurrentUser().subscribe(user => {
              if (user) {
                observer.next(true);
              } else {
                this.router.navigate(['sign-in']);
                observer.next(false);
              }
              observer.complete();
            });
          });
    }
}

