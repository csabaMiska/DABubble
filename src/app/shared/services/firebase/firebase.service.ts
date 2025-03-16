import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  verifyPasswordResetCode,
  applyActionCode,
  checkActionCode
} from '@angular/fire/auth';
import { confirmPasswordReset } from 'firebase/auth';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth = inject(Auth);
  private emailVerifiedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  emailVerified$: Observable<boolean> = this.emailVerifiedSubject.asObservable();

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
        // console.log('Verification email sent.');
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
          this.checkemailverification(user);
          observer.next(userCredential);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  checkemailverification(user: User) {
    if (!user.emailVerified) {
      this.emailVerifiedSubject.next(false);
    } else {
      this.emailVerifiedSubject.next(true);
    }
  }

  emailverification(oobCode: string): Observable<void> {
    return new Observable((observer) => {
      applyActionCode(this.auth, oobCode)
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
    });
  }

  checkactionmail(oobCode: string): Observable<{ email: string | null | undefined }> {
    return new Observable((observer) => {
      checkActionCode(this.auth, oobCode)
      .then((info) => {
        observer.next({ email: info.data.email });
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      })
    });
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

  sendpasswordresetmail(email: string): Observable<void> {
    return new Observable((observer) => {
      fetchSignInMethodsForEmail(this.auth, email)
        .then((signInMethods) => {
          if (signInMethods.length === 0) {
            observer.error('Diese E-Mail-Adresse ist nicht registriert.');
            return;
          }
          return sendPasswordResetEmail(this.auth, email);
        })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error.message);
        });
    });
  }

  resetpassword(oobCode: string, password: string): Observable<void> {
    return new Observable((observer) => {
      confirmPasswordReset(this.auth, oobCode, password)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        })
    });
  }

  verifycode(oobCode: string): Observable<void> {
    return new Observable((observer) => {
      verifyPasswordResetCode(this.auth, oobCode)
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      })
    });
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
