import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth = inject(Auth);

  register(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          this.sendVerificationEmail(user);
          observer.next(userCredential);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  sendVerificationEmail(user: User) {
    sendEmailVerification(user)
      .then(() => {
        console.log('Verification email sent.');
      })
      .catch((error) => {
        console.error('Verification email error:', error);
      });
  }

  login(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          this.checkEmailVerification(user);
          observer.next(userCredential);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  checkEmailVerification(user: User) {
    if (!user.emailVerified) {
      console.log('Email not verified.');
    } else {
      console.log('Email verified.');
    }
  }

  loginanonymous(): Observable<any> {
    return new Observable((observer) => {
      signInAnonymously(this.auth)
        .then((userCredential) => {
          const user = userCredential.user;
          observer.next(userCredential);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  loginwithgoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return new Observable((observer) => {
      signInWithPopup(this.auth, provider)
        .then((userCredential) => {
          observer.next(userCredential);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  logout(): Observable<any> {
    return from(signOut(this.auth));
  }

  getCurrentUser(): Observable<any> {
    return new Observable((observer) => {
      this.auth.onAuthStateChanged((user) => {
        observer.next(user);
        observer.complete();
      });
    });
  }
}
