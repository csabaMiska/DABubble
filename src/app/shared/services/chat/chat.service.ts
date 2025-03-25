import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Message } from '../../interface/message.model';
import { orderBy } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private collectionChatRef = collection(this.firestore, 'chat');

  private receiverUidSubject = new BehaviorSubject<string>('');
  receiverUid$ = this.receiverUidSubject.asObservable();

  setUid(uid: string) {
    this.receiverUidSubject.next(uid);
  }

  getChatId(userFrom: string, userTo: string) {
    return userFrom < userTo ? `${userFrom}_${userTo}` : `${userTo}_${userFrom}`;
  }

  sendMessage(senderId: string, receiverId: string, message: Partial<Message>): Observable<void> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = collection(this.collectionChatRef, `${chatId}/messages/`);
    return from(addDoc(messageRef, message )
      .then((docRef: any) => {
        const messageId = docRef.id;
        return updateDoc(docRef, { messageId: messageId });
      })
      .catch((error) => {
        console.error(error);
      })
    );
  }

  updateMessage(senderId: string, receiverId: string, messageId: string, message: Partial<Message>): Observable<void> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);
    return from(updateDoc(messageRef, message));
  }

  getMessages(senderId: string, receiverId: string): Observable<Message[]> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = collection(this.collectionChatRef, `${chatId}/messages`);
    const q = query(messageRef, orderBy('timestamp'));
    return collectionData(q, { idField: 'messageId' }) as Observable<Message[]>;
  }
}
