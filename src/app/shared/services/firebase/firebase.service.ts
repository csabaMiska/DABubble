import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  private userPath =
    'Datenbank-Bubble/Datenbank-Bubble/Benutzer/W8d4eW38q3Hw83Tz827V';

  // Nutzerdaten aus Firestore abrufen
  async getUserData(): Promise<any> {
    const userRef = doc(this.firestore, this.userPath);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  }

  async updateUserData(updatedData: any) {
    console.log('🔥 Update Firestore mit:', updatedData); // Debugging
    const userRef = doc(this.firestore, this.userPath);
    await updateDoc(userRef, updatedData);
  }
}
