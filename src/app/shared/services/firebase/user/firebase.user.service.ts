import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, from, map, Observable, shareReplay } from 'rxjs';
import { User } from '../../../interface/user.model';
import { FirebaseAuthService } from '../auth/firebase.auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseUserService {
  private firestore = inject(Firestore);
  private firebaseAuthService = inject(FirebaseAuthService);
  private collectionUsersRef = collection(this.firestore, 'users');

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private usersSubject = new BehaviorSubject<User[]>([]);

  constructor() {
    this.firebaseAuthService.getCurrentUser().subscribe(user => {
      if (user) {
        this.getUserRealTime(user.uid).subscribe(userData => {
          this.setCurrentUser(userData ?? null); 
        });
      } else {
        this.setCurrentUser(null);
      }
    });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }
  
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  getUserRealTime(uid: string): Observable<User | undefined> {
    const userDoc = doc(this.collectionUsersRef, uid);
    return new Observable<User>((observer) => {
      const unsubscribe = onSnapshot(userDoc, (snapshot) => {
        if (snapshot.exists()) {
          observer.next(snapshot.data() as User); 
        }
      });
      return () => unsubscribe();
    });
  }

  getUsers(): Observable<User[]> {
    onSnapshot(this.collectionUsersRef,
      (snapshot) => {
        const users: User[] = [];
        snapshot.docs.forEach(doc => {
          const data = doc.data() as User;
          users.push({ ...data, uid: doc.id });
        });
        this.usersSubject.next(users);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );
    return this.usersSubject.asObservable();
  }

  addUser(user: Partial<User>): Observable<void> {
    if (!user.uid) throw new Error('User UID is required');
    const userDoc = doc(this.collectionUsersRef, user.uid);
    return from(setDoc(userDoc, user, { merge: true }));
  }

  updateUser(uid: string, user: Partial<User>): Observable<void> {
    const userDoc = doc(this.collectionUsersRef, uid);
    return from(updateDoc(userDoc, user));
  }

  deleteUser(uid: string): Observable<void> {
    const userDoc = doc(this.collectionUsersRef, uid);
    return from(deleteDoc(userDoc));
  }
}

