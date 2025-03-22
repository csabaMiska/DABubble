import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { User } from '../../../interface/user.model';

@Injectable({ providedIn: 'root' })
export class FirebaseUserService {
  private firestore = inject(Firestore);
  private collectionUserRef = collection(this.firestore, 'users');

  getUserById(uid: string): Observable<User | undefined> {
    const userDoc = doc(this.firestore, 'users', uid);
    return from(getDoc(userDoc)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as User) : undefined))
    );
  }

  getUsers(): Observable<User[]> {
    return from(getDocs(this.collectionUserRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => doc.data() as User))
    );
  }

  addUser(user: Partial<User>): Observable<void> {
    if (!user.uid) throw new Error('User UID is required');
    const userDoc = doc(this.collectionUserRef, user.uid);
    return from(setDoc(userDoc, user, { merge: true }));
  }

  updateUser(uid: string, user: Partial<User>): Observable<void> {
    const userDoc = doc(this.collectionUserRef, uid);
    return from(updateDoc(userDoc, user));
  }

  deleteUser(uid: string): Observable<void> {
    const userDoc = doc(this.collectionUserRef, uid);
    return from(deleteDoc(userDoc));
  }

  getUserRealTime(uid: string): Observable<User | undefined> {
    const userDoc = doc(this.collectionUserRef, uid);
    return new Observable<User>((observer) => {
      onSnapshot(userDoc, (snapshot) => {
        if (snapshot.exists()) {
          observer.next(snapshot.data() as User); 
        }
      });
    });
  }
}

