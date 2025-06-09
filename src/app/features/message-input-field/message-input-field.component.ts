import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';
import { MessageData } from '../../shared/interface/message-data.model';
import { Mention } from '../../shared/interface/mention.model';
import { EmojiPickerComponent } from '../../core/emoji-picker/emoji-picker.component';
import { Emoji } from '../../shared/interface/emoji.model';
import { CommonModule } from '@angular/common';
import { ObjectPickerComponent } from '../../core/object-picker/object-picker.component';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { map, filter, take, switchMap, of } from 'rxjs';
import { SearchService } from '../../shared/services/firebase/search/search.service';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';

@Component({
  selector: 'app-message-input-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    EmojiPickerComponent,
    ObjectPickerComponent
  ],
  templateUrl: './message-input-field.component.html',
  styleUrl: './message-input-field.component.scss'
})
export class MessageInputFieldComponent implements OnInit, OnChanges {
  @Input() content!: User | Channel;
  @Output() messageSent = new EventEmitter<MessageData>();

  @ViewChild('messageEditor') messageEditor!: ElementRef<HTMLDivElement>;
  private elementRef = inject(ElementRef);
  private channelService = inject(ChannelService);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private searchService = inject(SearchService);

  messageReceiver!: string;
  messageContent: string = '';
  placeholderText: string = '';
  inputEmojiPickerId!: string;
  objectSelectorIsOpen: boolean = false;
  loadedObjects: any[] = [];
  isLoading!: boolean;

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};
  pickerBtnRects: DOMRect = {} as DOMRect;
  pickerPosition = { bottom: '0', left: '0' };
  savedRange: Range | null = null;
  mentionMatch: string | null = null;

  ngOnInit(): void {
    this.messageContent = '';
    this.placeholderText = 'Nachricht an';
    this.setMessageReceiver();
    this.setInputEmojiPickerId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.setMessageReceiver();
      this.focusTextarea();
      this.messageContent = '';
    }
  }

  onInput(event: Event): void {
    this.messageContent = this.messageEditor.nativeElement.innerText;
  }

  setMessageReceiver(): void {
    if (!this.content || !('type' in this.content)) {
      this.placeholderText = 'Antworten...';
      this.messageReceiver = ''
    } else if (this.content.type === 'User') {
      this.messageReceiver = (this.content as User).name || '';
    } else if (this.content.type === 'Channel') {
      const channelTitle = (this.content as Channel).title;
      this.messageReceiver = '#' + channelTitle;
    }
    this.messageContent = '';
  }

  setInputEmojiPickerId(): void {
    if (!this.content || !('type' in this.content)) {
      this.inputEmojiPickerId = 'answers';
    } else if (this.content.type === 'User') {
      this.inputEmojiPickerId = (this.content as User).uid;
    } else if (this.content.type === 'Channel') {
      this.inputEmojiPickerId = (this.content as Channel).channelId;
    }
  }

  focusTextarea() {
    setTimeout(() => {
      if (this.messageEditor) {
        this.messageEditor.nativeElement.focus();
      }
    });
  }

  handleEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.getCurrentMessage();
    }
  }

  getCurrentMessage() {
    const editorEl = this.messageEditor.nativeElement as HTMLElement;
    const html = editorEl.innerHTML.trim();

    if (!html) return;

    const clone = editorEl.cloneNode(true) as HTMLElement;
    const spans = clone.querySelectorAll('span.mention');
    const mentions: Mention[] = [];

    spans.forEach((span) => {
      const content = span.textContent || '';
      const symbol = content[0] as '@' | '#';
      const label = content.substring(1);
      const id = span.getAttribute('data-mention-id') || '';

      mentions.push({ symbol, label, id });
      span.replaceWith(document.createTextNode(content));
    });

    const text = clone.textContent?.trim() || '';

    if (text.length > 0) {
      const messageData: MessageData = {
        text,
        mentions
      };

      this.messageSent.emit(messageData);

      this.messageContent = '';
      editorEl.innerHTML = '';
    }
  }

  openEmojiPicker(event: MouseEvent, inputEmojiPickerId: string) {
    this.closeObjectSelector();
    this.showEmojiPicker[inputEmojiPickerId] = !this.showEmojiPicker[inputEmojiPickerId];
    if (this.showEmojiPicker[inputEmojiPickerId]) {
      this.buttonRects[inputEmojiPickerId] = (event.currentTarget as HTMLElement).getBoundingClientRect();
    } else {
      delete this.buttonRects[inputEmojiPickerId];
    }
  }

  @HostListener('document:click', ['$event'])
  onbodyClick(event: MouseEvent) {
    const clickedTextarea = this.messageEditor?.nativeElement?.contains(event.target as Node);

    if (!this.elementRef.nativeElement.contains(event.target) && !clickedTextarea) {
      this.closeEmojiPickers();
      this.closeObjectSelector();
    }
  }

  closePickers() {
    this.closeEmojiPickers();
    this.closeObjectSelector();
  }

  closeEmojiPickers() {
    this.showEmojiPicker = {};
    this.buttonRects = {};
  }

  closeObjectSelector() {
    this.objectSelectorIsOpen = false;
    this.pickerBtnRects = {} as DOMRect;
  }

  @HostListener('mouseup')
  @HostListener('keyup')
  saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (this.messageEditor.nativeElement.contains(range.startContainer)) {
        this.savedRange = range;
      }
    }
  }

  handleEmojiSelection(selectedEmoji: Emoji) {
    const emoji = selectedEmoji?.unicode || selectedEmoji.unicode;

    this.insertHtmlAtCursor(emoji);
    this.messageContent = this.messageEditor.nativeElement.innerText;
    this.closeEmojiPickers();
  }

  insertHtmlAtCursor(html: string) {
    const range = this.savedRange;
    if (!range) return;

    const el = document.createElement('div');
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null, lastNode: ChildNode | null = null;

    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }

    range.deleteContents();
    range.insertNode(frag);

    if (lastNode) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(newRange);
      this.savedRange = newRange;
    }
  }

  calculateObjectSelectorPosition(buttonRect: DOMRect) {
    if (!buttonRect) return {};

    const bottom = window.innerHeight - buttonRect.top;
    const left = buttonRect.left + 40;

    this.pickerPosition = {
      bottom: `${bottom}px`,
      left: `${left}px`
    };

    return this.pickerPosition;
  }

  openUserSelector(event: MouseEvent) {
    this.closeEmojiPickers();
    this.objectSelectorIsOpen = !this.objectSelectorIsOpen;
    this.pickerBtnRects = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.calculateObjectSelectorPosition(this.pickerBtnRects)
    this.loadUsersForObjectPicker();
  }

  loadUsersForObjectPicker() {
    this.isLoading = true;
    if (this.content.type === 'User') {
      const receiverUid = (this.content as User).uid || '';
      this.loadChatUser(receiverUid);
      this.isLoading = false;
    } else if (this.content.type === 'Channel') {
      this.loadChannelMembers();
      this.isLoading = false;
    }
  }

  loadChatUser(receiverUid: string) {
    this.firebaseUserService.getUserRealTime(receiverUid).pipe(
      filter(user => !!user),
      map(user => {
        const result = {
          type: 'user' as const,
          data: user
        };
        return result;
      })
    ).subscribe(result => {
      this.loadedObjects = [result];
    });
  }

  loadChannelMembers() {
    this.channelService.channelMembers$.pipe(
      filter(members => !!members && members.length > 0),
      map(members => {
        return members.map(member => ({
          type: 'user' as const,
          data: member
        }));
      })
    ).subscribe(users => {
      this.loadedObjects = users;
    });
  }

  addMentionToMessage(object: any, objectType: string) {
    if (objectType === 'user') {
      this.insertMention(object, '@');
    } else if (objectType === 'channel') {
      this.insertMention(object, '#');
    }
    this.closeObjectSelector();
  }

  insertMention(object: any, symbol: string) {
    this.deleteMentionQuery();

    const editor = this.messageEditor.nativeElement;
    const space = document.createTextNode('\u00A0');
    const span = document.createElement('span');
    const rawText = object.name || object.title || '';
    const objectid = object.uid || object.channelId || '';

    span.className = 'mention';
    span.textContent = `${symbol}${rawText.toLowerCase().replace(/\s+/g, '')}`;
    span.setAttribute('contenteditable', 'false');
    span.setAttribute('data-mention-id', objectid);

    editor.appendChild(span);
    editor.appendChild(space);

    const range = document.createRange();
    range.setStartAfter(space);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);


    this.updateMessageContentFromEditor();
    this.mentionMatch = null;
  }

  updateMessageContentFromEditor() {
    this.messageContent = this.messageEditor.nativeElement.innerText || '';
  }

  onKeyup(event: KeyboardEvent): void {
    const selection = window.getSelection();
    if (!selection || !selection.focusNode) return;

    const textBeforeCursor = selection.focusNode.textContent?.substring(0, selection.focusOffset) || '';
    const match = textBeforeCursor.match(/([@#])(\w*)$/);

    if (!match) {
      this.objectSelectorIsOpen = false;
      this.loadedObjects = [];
      this.mentionMatch = null;
      return;
    }

    const symbol = match[1];
    const query = match[2];
    this.mentionMatch = match[0];

    const inputElement = this.messageEditor.nativeElement;
    this.pickerBtnRects = inputElement.getBoundingClientRect();
    this.calculateObjectSelectorPosition(this.pickerBtnRects)

    this.isLoading = true;
    this.objectSelectorIsOpen = true;

    this.firebaseAuthService.getCurrentUser().pipe(
      take(1),
      switchMap(user => {
        if (!user) return of([]);
        const currentUserUid = user.uid;

        if (symbol === '@') {
          return this.searchService.searchUser('@' + query).pipe(
            map(results => results.map(r => ({ ...r, symbol: '@' })))
          );
        } else if (symbol === '#') {
          return this.searchService.searchChannel('#' + query, currentUserUid).pipe(
            map(results => results.map(r => ({ ...r, symbol: '#' })))
          );
        }

        return of([]);
      })
    ).subscribe(results => {
      this.loadedObjects = results;
      this.isLoading = false;
    });
  }

  deleteMentionQuery() {
    const sel = window.getSelection();
    if (!sel || !this.mentionMatch) return;

    const editor = this.messageEditor.nativeElement;
    const matchStr = this.mentionMatch;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    let found = false;

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const text = node.textContent || '';
      const regex = new RegExp(`(^|\\s)${this.escapeRegExp(matchStr)}(?=\\s|$)`);
      const match = text.match(regex);

      if (match) {
        const index = match.index || 0;

        const startIndex = index + match[1].length;
        const before = text.slice(0, startIndex);
        const after = text.slice(startIndex + matchStr.length);

        node.textContent = before + after;

        const range = document.createRange();
        range.setStart(node, before.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        found = true;
        break;
      }
    }
  }

  escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}