import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, GuardResult, MaybeAsync } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from './shared/services/firebase/firebase.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private firebaseService = inject(FirebaseService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            this.firebaseService.getCurrentUser().subscribe({
                next: (user) => {
                    if (user) {
                        observer.next(true);
                    } else {
                        this.router.navigate(['sign-in']);
                        observer.next(false);
                    }
                    observer.complete();
                },
                error: (error) => {
                    console.error(error);
                    this.router.navigate(['sign-in']);
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }
}