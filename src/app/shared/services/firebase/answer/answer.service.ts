import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Message } from '../../../interface/message.model';
import { AnswerInfo } from '../../../interface/answer-info.model';
import { Reaction } from '../../../interface/reaction.model';
import { Emoji } from '../../../interface/emoji.model';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private firestore = inject(Firestore);

  private messageAnswarsIdSubject = new BehaviorSubject<AnswerInfo | null>(null);
  messageAnswares$ = this.messageAnswarsIdSubject.asObservable();
  private answersSubject = new BehaviorSubject<{ [key: string]: Message[] }>({});
  answers$ = this.answersSubject.asObservable();
  private reactionsSubject = new BehaviorSubject<{ [messageId: string]: any }>({});
  reactions$ = this.reactionsSubject.asObservable();

  setMessageAnswerInfo(messageId: string, chatIdOrChannelId: string, receiverId: string, senderId: string, messageFrom: string) {
    this.messageAnswarsIdSubject.next({ messageId, chatIdOrChannelId, receiverId, senderId, messageFrom });
  }

  getMessage(chatIdOrChannelId: string, messageId: string, messageFrom: string): Observable<Message | null> {
    const messageDocRef = doc(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}`);
    return new Observable<Message | null>((observer) => {
      const unsubscribe = onSnapshot(messageDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Message;
          observer.next({ ...data, messageId: docSnapshot.id });
        } else {
          observer.next(null);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  addAnswer(chatIdOrChannelId: string, messageId: string, messageFrom: string, answer: Partial<Message>): Observable<void> {
    const answersCollectionRef = collection(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers`);
    return from(addDoc(answersCollectionRef, answer)
      .then((docRef: any) => {
        const answerId = docRef.id;
        return updateDoc(docRef, { messageId: answerId, messageFrom: 'answers' });
      })
      .catch((error) => {
        console.error("Error sending answer:", error);
      })
    );
  }

  updateAnswer(chatIdOrChannelId: string, messageId: string, answerId: string, messageFrom: string, answer: Partial<Message>): Observable<void> {
    const answersCollectionRef = doc(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers/${answerId}`);
    return from(updateDoc(answersCollectionRef, answer)
      .catch((error) => {
        console.error("Error updating message:", error);
      })
    );
  }

  deleteAnswer(chatIdOrChannelId: string, messageId: string, answerId: string, messageFrom: string): Observable<void> {
    const answersCollectionRef = doc(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers/${answerId}`);
    return from(deleteDoc(answersCollectionRef)
      .catch((error) => {
        console.error("Error deleting message:", error);
      })
    );
  }

  getAnswers(chatIdOrChannelId: string, messageId: string, messageFrom: string): Observable<Message[]> {
    const answersRef = collection(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers`);
    const sortedQuery = query(answersRef, orderBy('timestamp'));
    return new Observable<Message[]>((observer) => {
      const unsubscribe = onSnapshot(sortedQuery, (querySnapshot) => {
        const answers: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Message;
          answers.push({ ...data, messageId: doc.id });
        });
        observer.next(answers);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  subscribeToAnswers(chatIdOrChannelId: string, messageId: string, messageFrom: string) {
    const answersRef = collection(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers`);
    const sortedQuery = query(answersRef, orderBy('timestamp'));

    return onSnapshot(sortedQuery, (querySnapshot) => {
      const answers: Message[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data() as Message;
        answers.push({ ...data, messageId: doc.id });
      });

      this.answersSubject.next({
        ...this.answersSubject.value,
        [messageId]: answers
      });
    }, (error) => {
      console.error("Error fetching answers:", error);
    });
  }

  subscribeToReactions(chatIdOrChannelId: string, messageId: string, messageFrom: string, answerId: string){
    const messageDocRef = doc(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers/${answerId}`);
    return onSnapshot(messageDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const messageData = docSnap.data();
        const reactions = messageData?.['reactions'] || {};

        this.reactionsSubject.next({
          ...this.reactionsSubject.value,
          [answerId]: this.sortReactions(reactions)
        });
      }
    }, (error) => {
      console.error("Error fetching reactions:", error);
    });
  }

  sortReactions(reactions: Reaction): { emoji: Emoji, counter: number }[] {
    return reactions
      ? Object.keys(reactions)
        .map(key => ({
          emoji: reactions[key].emoji,
          counter: reactions[key].counter
        }))
        .sort((b, a) => b.counter - a.counter)
      : [];
  }
}
