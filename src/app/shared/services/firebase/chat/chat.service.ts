import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, query, updateDoc, onSnapshot, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Message } from '../../../interface/message.model';
import { orderBy } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private collectionChatRef = collection(this.firestore, 'chats');

  private senderUidSubject = new BehaviorSubject<string>('');
  senderUid$ = this.senderUidSubject.asObservable();
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  getChatId(userFrom: string, userTo: string) {
    return userFrom < userTo ? `${userFrom}_${userTo}` : `${userTo}_${userFrom}`;
  }

  getMessages(senderId: string, receiverId: string): Observable<Message[]> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = collection(this.collectionChatRef, `${chatId}/messages`);
    const q = query(messageRef, orderBy('timestamp'));

    return new Observable<Message[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Message;
          messages.push({ ...data, messageId: doc.id });
        });
        observer.next(messages);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  sendMessage(senderId: string, receiverId: string, message: Partial<Message>): Observable<void> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = collection(this.collectionChatRef, `${chatId}/messages/`);
    return from(addDoc(messageRef, message)
      .then((docRef: any) => {
        const messageId = docRef.id;
        return updateDoc(docRef, { messageId: messageId });
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      })
    );
  }

  updateMessage(senderId: string, receiverId: string, messageId: string, message: Partial<Message>): Observable<void> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);
    return from(updateDoc(messageRef, message)
      .catch((error) => {
        console.error("Error updating message:", error);
      })
    );
  }

  deleteMessage(senderId: string, receiverId: string, messageId: string): Observable<void> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);
    return from(deleteDoc(messageRef)
      .catch((error) => {
        console.error("Error deleting message:", error);
      })
    );
  }
}