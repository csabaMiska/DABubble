import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { observable, Observable } from 'rxjs';
import { User } from '../../../interface/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseUserService {
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  getAllUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<User[]>;
  }

 getUserById(userId: string): Observable<User | null> {
  const userDocRef = doc(this.firestore, `users/${userId}`);
  return docData(userDocRef, { idField: 'uid' }) as Observable<User | null>;
}

  addUser(userData: Partial<User>): Observable<void> {
    const userDocRef = doc(this.usersCollection, userData.uid);
    return new Observable<void>((observer) => {
      setDoc(userDocRef, userData)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  updateUser(userId: string, userData: Partial<User>): Observable<void> {
    const userDocRef = doc(this.usersCollection, userId);
    return new Observable<void>((observer) => {
      updateDoc(userDocRef, userData)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  deleteUser(userId: string): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return new Observable<void>((observer) => {
      deleteDoc(userDocRef)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}

