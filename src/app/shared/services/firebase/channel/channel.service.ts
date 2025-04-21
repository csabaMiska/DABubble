import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, orderBy, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Channel } from '../../../interface/channal.model';
import { User } from '../../../interface/user.model';
import { Message } from '../../../interface/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private firestore = inject(Firestore);
  private collectionChannelRef = collection(this.firestore, 'channels');

  getChannels(): Observable<Channel[]> {
    return new Observable<Channel[]>((observer) => {
      const unsubscribe = onSnapshot(this.collectionChannelRef, (querySnapshot) => {
        const channels: Channel[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Channel;
          channels.push({ ...data, channelId: doc.id });
        });
        observer.next(channels);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  getChannelById(channelId: string): Observable<Channel> {
    const channelRef = doc(this.collectionChannelRef, `${channelId}`);
    return new Observable<Channel>((observer) => {
      const unsubscribe = onSnapshot(channelRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Channel;
          observer.next({ ...data, channelId: docSnap.id });
        } else {
          observer.next({} as Channel);
        }
      }, (error) => {
        observer.error(error);
      });
      return () => unsubscribe();
    });
  }

  createChannel(channel: Partial<Channel>, channelId: string) {
    const channelRef = doc(this.collectionChannelRef, `${channelId}`);
    return from(setDoc(channelRef, channel)
      .then(() => {
        return updateDoc(channelRef, { channalId: channelId });
      })
      .catch((error) => {
        console.error("Error creating new Channel:", error);
      })
    );
  }

  updateChannel(channalId: string, channal: Partial<Channel>) {
    const channelRef = doc(this.collectionChannelRef, `${channalId}`);
    return from(updateDoc(channelRef, channal)
      .catch((error) => {
        console.error("Error updating Channel:", error);
      })
    );
  }

  deleteChannel(channalId: string) { 
    const channelRef = doc(this.collectionChannelRef, `${channalId}`);
    return from(deleteDoc(channelRef)
      .catch((error) => {
        console.error("Error deleting Channel:", error);
      })
    );
  }

  addUserToChannel(channelId: string, channel: Partial<Channel>) {
    const channelRef = doc(this.collectionChannelRef, `${channelId}`);
    return from(setDoc(channelRef, channel, { merge: true })
      .catch((error) => {
        console.error("Error add Users to Channel:", error);
      })
    );
  }

  removeUserFromChannel() { }

  getChannelMessages(channalId: string): Observable<Message[]> {
    const channelMessagesRef = collection(this.collectionChannelRef, `${channalId}/messages`);
    const q = query(channelMessagesRef, orderBy('timestamp'));

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

  addMessageToChannel(channalId: string, message: Partial<any>): Observable<void> {
    const channelMessagesRef = collection(this.collectionChannelRef, `${channalId}/messages/`);
    return from(addDoc(channelMessagesRef, message)
      .then((docRef: any) => {
        const messageId = docRef.id;
        return updateDoc(docRef, { messageId: messageId });
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      })
    );
  }

  updateMessage(channalId: string, messageId: string, message: Partial<any>): Observable<void> {
    const channelMessageRef = doc(this.collectionChannelRef, `${channalId}/messages/${messageId}`);
    return from(updateDoc(channelMessageRef, message)
      .catch((error) => {
        console.error("Error updating message:", error);
      })
    );
  }

  deleteMessage(channalId: string, messageId: string): Observable<void> {
    const channelMessageRef = doc(this.collectionChannelRef, `${channalId}/messages/${messageId}`);
    return from(deleteDoc(channelMessageRef)
      .catch((error) => {
        console.error("Error deleting message:", error);
      })
    );
  }
}
