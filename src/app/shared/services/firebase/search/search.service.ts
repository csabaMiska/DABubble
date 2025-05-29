import { inject, Injectable } from '@angular/core';
import { collection, collectionGroup, Firestore, getDocs } from '@angular/fire/firestore';
import { catchError, combineLatest, filter, forkJoin, from, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { FirebaseUserService } from '../user/firebase.user.service';
import { ChannelService } from '../channel/channel.service';
import { Channel } from '../../../interface/channal.model';
import { Message } from '../../../interface/message.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private firestore = inject(Firestore);
  private firebaseUserService = inject(FirebaseUserService);
  private channelService = inject(ChannelService);

  searchUser(text: string): Observable<any[]> {
    const searchTerm = text.toLowerCase();

    if (searchTerm.includes('@')) {
      const atIndex = searchTerm.lastIndexOf('@');
      const userSearchTerm = searchTerm.substring(atIndex + 1);
      return this.firebaseUserService.getUsers().pipe(
        take(1),
        map(users => users
          .filter(user => user.name.toLowerCase().includes(userSearchTerm))
          .map(user => ({
            type: 'user',
            data: user
          }))
        )
      );
    }

    return of([]);
  }

  searchChannel(text: string, currentUserUid: string): Observable<any[]> {
    const searchTerm = text.toLowerCase();

    if (searchTerm.includes('#')) {
      const hashIndex = searchTerm.lastIndexOf('#');
      const channelSearchTerm = searchTerm.substring(hashIndex + 1);
      return this.channelService.getChannels().pipe(
        take(1),
        map(channels => channels
          .filter(channel =>
            channel.members?.[currentUserUid] &&
            channel.title.toLowerCase().includes(channelSearchTerm))
          .map(channel => ({
            type: 'channel',
            data: channel
          }))
        )
      );
    }

    return of([]);
  }

  searchInChannels(term: string, currentUserUid: string): Observable<any[]> {
    return combineLatest([
      this.searchInChannelDescriptions(term, currentUserUid),
      this.searchInMessages(term, currentUserUid),
      this.searchInAnswers(term, currentUserUid)
    ]).pipe(
      map(([descriptions, messages, answers]) => [...descriptions, ...messages, ...answers])
    );
  }

  private searchInChannelDescriptions(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();

    return from(getDocs(collection(this.firestore, 'channels'))).pipe(
      map(snapshot =>
        snapshot.docs
          .map(doc => {
            const data = doc.data() as Channel;
            return { ...data, id: doc.id };
          })
          .filter(channel =>
            channel.members && channel.members[currentUserUid] &&
            channel.description?.toLowerCase().includes(lowerTerm)
          )
          .map(channel => ({
            type: 'channel-description',
            data: channel
          }))
      )
    );
  }

  private searchInMessages(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();

    return combineLatest([
      this.searchInChannelMessages(term, currentUserUid),
      this.searchInChatMessages(term, currentUserUid)
    ]).pipe(
      map(([channelMessages, chatMessages]) => [...channelMessages, ...chatMessages])
    );
  }

  private searchInChannelMessages(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();

    return from(getDocs(collectionGroup(this.firestore, 'messages'))).pipe(
      switchMap(snapshot => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data() as Message;
          return { ...data, id: doc.id, path: doc.ref.path };
        });

        const checks$ = messages.map(message => {
          const pathSegments = message.path.split('/');
          const isChannel = pathSegments[0] === 'channels';
          if (isChannel) {
            const channelId = pathSegments[1];
            return this.isUserInChannel(channelId, currentUserUid).pipe(
              map(isInChannel => ({
                message,
                isInChannel
              }))
            );
          }
          return of({ message, isInChannel: false });
        });

        return forkJoin(checks$);
      }),
      map(results =>
        results
          .filter(res => res.isInChannel && res.message.content?.toLowerCase().includes(lowerTerm))
          .map(res => ({
            type: 'channel-message',
            data: res.message
          }))
      )
    );
  }

  private searchInChatMessages(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();
  
    return from(getDocs(collectionGroup(this.firestore, 'messages'))).pipe(
      map(snapshot => {
        return snapshot.docs
          .map(doc => {
            const data = doc.data() as Message;
            return { ...data, id: doc.id, path: doc.ref.path };
          })
          .filter(message => {
            const pathSegments = message.path.split('/');
            const isChat = pathSegments[0] === 'chats';
            const chatId = pathSegments[1];
  
            return (
              isChat &&
              this.isUserInChat(chatId, currentUserUid) &&
              message.content?.toLowerCase().includes(lowerTerm)
            );
          })
          .map(message => ({
            type: 'chat-message',
            data: message
          }));
      })
    );
  }
   
  private searchInAnswers(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();

    return combineLatest([
      this.searchInChannelAnswers(term, currentUserUid),
      this.searchInChatAnswers(term, currentUserUid)
    ]).pipe(
      map(([channelAnswers, chatAnswers]) => [...channelAnswers, ...chatAnswers])
    );
  }

  private searchInChannelAnswers(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();

    return from(getDocs(collectionGroup(this.firestore, 'answers'))).pipe(
      switchMap(snapshot => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data() as Message;
          return { ...data, id: doc.id, path: doc.ref.path };
        });

        const filtered$ = messages.map(answer => {
          const pathSegments = answer.path.split('/');
          const isChannel = pathSegments[0] === 'channels';
          const channelId = pathSegments[1];

          if (!isChannel || !channelId) return of(null);

          return this.isUserInChannel(channelId, currentUserUid).pipe(
            map(isInChannel => {
              if (isInChannel && answer.content?.toLowerCase().includes(lowerTerm)) {
                return {
                  type: 'channel-answer',
                  data: answer
                };
              }
              return null;
            })
          );
        });

        return forkJoin(filtered$).pipe(
          map(results => results.filter(result => result !== null))
        );
      })
    );
  }

  private searchInChatAnswers(term: string, currentUserUid: string): Observable<any[]> {
    const lowerTerm = term.toLowerCase();
  
    return from(getDocs(collectionGroup(this.firestore, 'answers'))).pipe(
      map(snapshot => {
        return snapshot.docs
          .map(doc => {
            const data = doc.data() as Message;
            return { ...data, id: doc.id, path: doc.ref.path };
          })
          .filter(answer => {
            const pathSegments = answer.path.split('/');
            const isChat = pathSegments[0] === 'chats';
            const chatId = pathSegments[1];
  
            return (
              isChat &&
              this.isUserInChat(chatId, currentUserUid) &&
              answer.content?.toLowerCase().includes(lowerTerm)
            );
          })
          .map(answer => ({
            type: 'chat-answer',
            data: answer
          }));
      })
    );
  }
  
  private isUserInChat(chatId: string, currentUserUid: string): boolean {
    const [senderUid, receiverUid] = chatId.split('_');
    return senderUid === currentUserUid || receiverUid === currentUserUid;
  }

  private isUserInChannel(channelId: string, currentUserUid: string): Observable<boolean> {
    return this.channelService.getChannelByIdToSearchValidation(channelId).pipe(
      map(channel => !!channel.members && !!channel.members[currentUserUid])
    );
  }

}
