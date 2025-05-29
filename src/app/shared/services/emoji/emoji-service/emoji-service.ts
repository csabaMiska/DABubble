import { inject, Injectable } from '@angular/core';
import { DocumentSnapshot } from 'firebase/firestore/lite';
import { Reaction } from '../../../interface/reaction.model';
import { Emoji } from '../../../interface/emoji.model';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { deleteField, doc, DocumentReference, Firestore, onSnapshot, runTransaction, Transaction } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  private firestore = inject(Firestore);

  private reactionsSubject = new BehaviorSubject<{ [messageId: string]: any }>({});
  reactions$ = this.reactionsSubject.asObservable();

  subscribeToReactions(chatIdOrChannelId: string, messageId: string, messageFrom: string) {
    const messageDocRef = doc(this.firestore, `${messageFrom}/${chatIdOrChannelId}/messages/${messageId}`);

    return onSnapshot(messageDocRef, (docSnap) => {
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

  addUserReaction(chatIdOrChannelId: string, senderUid: string, messageId: string, originalMessageFrom: string, selectedEmoji: Emoji, answerId?: string, subMessageFrom?: string): Observable<void> {
    let messageDocRef: DocumentReference;
    if (subMessageFrom === 'answers') {
      messageDocRef = doc(this.firestore, `${originalMessageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers/${answerId}`);
    } else {
      messageDocRef = doc(this.firestore, `${originalMessageFrom}/${chatIdOrChannelId}/messages/${messageId}`);
    }

    return from(runTransaction(this.firestore, (transaction) =>
      transaction.get(messageDocRef).then(messageDoc => {
        if (!messageDoc.exists()) {
          console.error("Message doc doesn't exist", messageDocRef.path);
          throw new Error("Message does not exist");
        }

        let reactions = this.getReactionsFromMessage(messageDoc);
        const reactionKey = `emoji_${selectedEmoji.unicode}`;

        if (reactions[reactionKey]?.users.includes(senderUid)) {
          reactions = this.removeUserFromReaction(reactions, reactionKey, senderUid);
        } else {
          reactions = this.addNewReaction(reactions, reactionKey, senderUid, selectedEmoji);
        }

        this.updateFirestoreTransaction(transaction, messageDocRef, reactions);
      })
    ));
  }

  updateUserReaction(chatIdOrChannelId: string, senderUid: string, messageId: string, originalMessageFrom: string, selectedEmoji: Emoji, answerId?: string, subMessageFrom?: string): Observable<void> {
    let messageDocRef: DocumentReference;
    if (subMessageFrom === 'answers') {
      messageDocRef = doc(this.firestore, `${originalMessageFrom}/${chatIdOrChannelId}/messages/${messageId}/answers/${answerId}`);
    } else {
      messageDocRef = doc(this.firestore, `${originalMessageFrom}/${chatIdOrChannelId}/messages/${messageId}`);
    }

    return from(runTransaction(this.firestore, (transaction) =>
      transaction.get(messageDocRef).then(messageDoc => {
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

        this.updateFirestoreTransaction(transaction, messageDocRef, reactions);
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

  updateFirestoreTransaction(transaction: Transaction, messageDocRef: DocumentReference, reactions: Reaction) {
    if (Object.keys(reactions).length === 0) {
      transaction.update(messageDocRef, { reactions: deleteField() });
    } else {
      transaction.update(messageDocRef, { reactions });
    }
  }
}
