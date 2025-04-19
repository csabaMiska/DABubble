import { inject, Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Channel } from '../../../interface/channal.model';
import { User } from '../../../interface/user.model';

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

  updateChannel() { }

  deleteChannel() { }

  addUserToChannel(channelId: string, channel: Partial<Channel>) {
    const channelRef = doc(this.collectionChannelRef, `${channelId}`);
    return from(setDoc(channelRef, channel, { merge: true })
      .catch((error) => {
        console.error("Error add Users to Channel:", error);
      })
    );
  }

  removeUserFromChannel() { }

  getChannelMessages() { }

  getChannelMembers() { }
}
