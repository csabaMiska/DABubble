import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, query, runTransaction, Transaction, updateDoc, DocumentReference, deleteField, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Message } from '../../../interface/message.model';
import { orderBy } from 'firebase/firestore';
import { DocumentSnapshot } from 'firebase/firestore/lite';
import { Reaction } from '../../../interface/reaction.model';
import { Emoji } from '../../../interface/emoji.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private collectionChatRef = collection(this.firestore, 'chats');

  private receiverUidSubject = new BehaviorSubject<string>('');
  receiverUid$ = this.receiverUidSubject.asObservable();
  private senderUidSubject = new BehaviorSubject<string>('');
  senderUid$ = this.senderUidSubject.asObservable();
  private reactionsSubject = new BehaviorSubject<{ [messageId: string]: any }>({});
  reactions$ = this.reactionsSubject.asObservable();

  setReceiverUid(uid: string) {
    this.receiverUidSubject.next(uid);
  }

  getChatId(userFrom: string, userTo: string) {
    return userFrom < userTo ? `${userFrom}_${userTo}` : `${userTo}_${userFrom}`;
  }

  getMessages(senderId: string, receiverId: string): Observable<Message[]> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = collection(this.collectionChatRef, `${chatId}/messages`);
    const q = query(messageRef, orderBy('timestamp'));
    return collectionData(q, { idField: 'messageId' }) as Observable<Message[]>;
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
        console.error(error);
      })
    );
  }

  updateMessage(senderId: string, receiverId: string, messageId: string, message: Partial<Message>): Observable<void> {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);
    return from(updateDoc(messageRef, message));
  }

  subscribeToReactions(senderId: string, receiverId: string, messageId: string) {
    const chatId = this.getChatId(senderId, receiverId);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);

    return onSnapshot(messageRef, (docSnap) => {
      if (docSnap.exists()) {
        const messageData = docSnap.data();
        const reactions = messageData?.['reactions'] || {};

        this.reactionsSubject.next({
          ...this.reactionsSubject.value,
          [messageId]: this.sortReactions(reactions)
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

  addUserReaction(senderUid: string, receiverUid: string, messageId: string, selectedEmoji: Emoji): Observable<void> {
    const chatId = this.getChatId(senderUid, receiverUid);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);

    return from(runTransaction(this.firestore, (transaction) =>
      transaction.get(messageRef).then(messageDoc => {
        if (!messageDoc.exists()) {
          return
        }

        let reactions = this.getReactionsFromMessage(messageDoc);
        const reactionKey = `emoji_${selectedEmoji.unicode}`;

        if (reactions[reactionKey]?.users.includes(senderUid)) {
          reactions = this.removeUserFromReaction(reactions, reactionKey, senderUid);
        } else {
          reactions = this.addNewReaction(reactions, reactionKey, senderUid, selectedEmoji);
        }

        this.updateFirestoreTransaction(transaction, messageRef, reactions);
      })
    ));
  }

  updateUserReaction(senderUid: string, receiverUid: string, messageId: string, selectedEmoji: Emoji): Observable<void> {
    const chatId = this.getChatId(senderUid, receiverUid);
    const messageRef = doc(this.collectionChatRef, `${chatId}/messages/${messageId}`);

    return from(runTransaction(this.firestore, (transaction) =>
      transaction.get(messageRef).then(messageDoc => {
        if (!messageDoc.exists()) {
          return;
        }

        let reactions = this.getReactionsFromMessage(messageDoc);
        const reactionKey = `emoji_${selectedEmoji.unicode}`;

        if (!reactions[reactionKey]) {
          reactions[reactionKey] = { users: [], counter: 0 };
        }

        const users: string[] = reactions[reactionKey].users;

        if (users.includes(senderUid)) {
          reactions[reactionKey].counter--;
          reactions[reactionKey].users = users.filter(user => user !== senderUid);
        } else {
          reactions[reactionKey].counter++;
          reactions[reactionKey].users.push(senderUid);
        }

        if (reactions[reactionKey].counter === 0) {
          delete reactions[reactionKey];
        }

        this.updateFirestoreTransaction(transaction, messageRef, reactions);
      })
    ));
  }

  getReactionsFromMessage(messageDoc: DocumentSnapshot<any>) {
    return messageDoc.data()?.['reactions'] || {};
  }

  removeUserFromReaction(reactions: any, reactionKey: string, senderUid: string) {
    reactions[reactionKey].users = reactions[reactionKey].users.filter((uid: string) => uid !== senderUid);
    reactions[reactionKey].counter--;

    if (reactions[reactionKey].counter === 0) {
      delete reactions[reactionKey];
    }
    return reactions;
  }

  addNewReaction(reactions: any, reactionKey: string, senderUid: string, selectedEmoji: Emoji) {
    if (!reactions[reactionKey]) {
      reactions[reactionKey] = {
        emoji: selectedEmoji,
        users: [senderUid],
        counter: 1
      };
    } else {
      if (!reactions[reactionKey].users.includes(senderUid)) {
        reactions[reactionKey].users.push(senderUid);
        reactions[reactionKey].counter = reactions[reactionKey].users.length;
      }
    }
    return reactions;
  }

  updateFirestoreTransaction(transaction: Transaction, messageRef: DocumentReference, reactions: Reaction) {
    if (Object.keys(reactions).length === 0) {
      transaction.update(messageRef, { reactions: deleteField() });
    } else {
      transaction.update(messageRef, { reactions });
    }
  }
}
