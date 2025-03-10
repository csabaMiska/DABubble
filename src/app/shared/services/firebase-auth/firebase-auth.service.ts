import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  constructor(private afAuth: AngularFireAuth) {}

  signInWithEmailAndPassword(email: string, password: string): Observable<any> {
    // Wir wandeln das Promise in ein Observable um
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }
}
