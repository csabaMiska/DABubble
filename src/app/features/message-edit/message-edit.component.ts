import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../../shared/interface/message.model';
import { MessageService } from '../../shared/services/message/message.service';
import { FormsModule } from '@angular/forms';
import { MessageData } from '../../shared/interface/message-data.model';
import { Mention } from '../../shared/interface/mention.model';
import { EmojiPickerComponent } from '../../core/emoji-picker/emoji-picker.component';
import { Emoji } from '../../shared/interface/emoji.model';
import { ObjectPickerComponent } from '../../core/object-picker/object-picker.component';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { filter, map, take, switchMap, of } from 'rxjs';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { SearchService } from '../../shared/services/firebase/search/search.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    EmojiPickerComponent,
    ObjectPickerComponent
  ],
  templateUrl: './message-edit.component.html',
  styleUrl: './message-edit.component.scss'
})
export class MessageEditComponent implements OnChanges, AfterViewInit {
  @Input() message!: Message;
  @Input() content!: User | Channel;
  @Output() updateMessage = new EventEmitter<{ messageId: string, messageData: MessageData }>();

  @ViewChild('editableDiv') editableDiv!: ElementRef<HTMLDivElement>;
  private elementRef = inject(ElementRef);
  private messageService = inject(MessageService);
  private firebaseUserService = inject(FirebaseUserService);
  private channelService = inject(ChannelService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private searchService = inject(SearchService);

  textareaShouldFocus = true;
  messageContent: string = '';
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.renderMessageContentToEditor();
      this.textareaShouldFocus = true;
      this.focusTextarea();
      this.setInputEmojiPickerId();
    }
  }

  ngAfterViewInit(): void {
    this.renderMessageContentToEditor();
  }

  onEditInput() {
    this.messageContent = this.editableDiv.nativeElement.innerText;
  }

  focusTextarea() {
    if (this.textareaShouldFocus) {
      setTimeout(() => {
        if (this.editableDiv) {
          this.editableDiv.nativeElement.focus();
          this.textareaShouldFocus = false;
        }
      });
    }
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

  cancelEdit(messageID: string) {
    this.messageService.setMessageEditMode(null);
  }

  saveMessage(messageID: string) {
    const editorEl = this.editableDiv.nativeElement as HTMLElement;
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

      this.updateMessage.emit({messageId: messageID, messageData});

      this.messageContent = '';
      editorEl.innerHTML = '';
    }

    this.messageService.setMessageEditMode(null);
  }

  renderMessageContentToEditor(): void {
    if (!this.editableDiv || !this.message) return;

    const { text, mentions } = this.message.content;
    let result = text;

    mentions?.forEach((mention) => {
      const regex = new RegExp(`\\${mention.symbol}${mention.label}(?!\\w)`, 'g');
      const html = `<span class="mention" contenteditable="false" data-symbol="${mention.symbol}" data-id="${mention.id}">${mention.symbol}${mention.label}</span>`;
      result = result.replace(regex, html);
    });

    this.editableDiv.nativeElement.innerHTML = result;
    this.messageContent = text;
  }

  extractMentionsFromEditor(): Mention[] {
    const mentions: Mention[] = [];
    const mentionSpans = this.editableDiv.nativeElement.querySelectorAll('span.mention');

    mentionSpans.forEach(span => {
      const symbol = span.getAttribute('data-symbol');
      const id = span.getAttribute('data-id');
      const label = span.textContent?.replace(symbol || '', '') || '';

      if (symbol && id && label) {
        mentions.push({
          symbol: symbol as '@' | '#',
          id,
          label,
        });
      }
    });

    return mentions;
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
    const clickedTextarea = this.editableDiv?.nativeElement?.contains(event.target as Node);

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
      if (this.editableDiv.nativeElement.contains(range.startContainer)) {
        this.savedRange = range;
      }
    }
  }

  handleEmojiSelection(selectedEmoji: Emoji) {
    const emoji = selectedEmoji?.unicode || selectedEmoji.unicode;

    this.insertHtmlAtCursor(emoji);
    this.messageContent = this.editableDiv.nativeElement.innerText;
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

  updateMessageContentFromEditor() {
    this.messageContent = this.editableDiv.nativeElement.innerText || '';
  }

  insertMention(object: any, symbol: string): void {
    this.deleteMentionQuery();

    const editor = this.editableDiv.nativeElement;
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

  deleteMentionQuery() {
    const sel = window.getSelection();
    if (!sel || !this.mentionMatch) return;

    const editor = this.editableDiv.nativeElement;
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

    const inputElement = this.editableDiv.nativeElement;
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
}
