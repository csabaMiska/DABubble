import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ObjectPickerComponent } from '../../object-picker/object-picker.component';
import { combineLatest, forkJoin, of, switchMap, take } from 'rxjs';
import { SearchService } from '../../../shared/services/firebase/search/search.service';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';

@Component({
  selector: 'app-header-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ObjectPickerComponent
  ],
  templateUrl: './header-search-bar.component.html',
  styleUrl: './header-search-bar.component.scss'
})
export class HeaderSearchBarComponent {
  private searchService = inject(SearchService);
  private firebaseAuthService =  inject(FirebaseAuthService)

  editableContentEmpty: boolean = true;
  objectSelectorIsOpen: boolean = false;
  inputRects: DOMRect = {} as DOMRect;

  searchTerm: string = '';
  filteredObjects: any[] = [];
  isLoading!: boolean;

  onSearchChange() {
    this.isLoading = true;
    const term = this.searchTerm.trim();
  
    if (term.length > 0) {
      this.objectSelectorIsOpen = true;
      const inputElement = document.querySelector('.search-input') as HTMLElement;
      this.inputRects = inputElement.getBoundingClientRect();
      this.firebaseAuthService.getCurrentUser().pipe(
        take(1),
        switchMap(user => {
          if (!user) {
            return of([]);
          }
          const currentUserUid = user.uid;
          return forkJoin([
            this.searchService.searchUser(term),
            this.searchService.searchChannel(term, currentUserUid),
            this.searchService.searchInChannels(term, currentUserUid)
          ]);
        })
      ).subscribe(([userResults, channelResult, contentResults]) => {
        this.filteredObjects = [...userResults, ...channelResult, ...contentResults];
        console.log(this.filteredObjects);
        this.isLoading = false;
      });
    } else {
      this.objectSelectorIsOpen = false;
      this.filteredObjects = [];
    }
  }
  
  selectedObject(objectId: string) {
    console.log(objectId);
    if (this.searchTerm) {
      this.searchTerm = '';
    }
    this.filteredObjects = [];
    this.objectSelectorIsOpen = false;

  }

  calculateObjectSelectorPosition(inputRect: DOMRect) {
    if (!inputRect) return {};

    return {
      position: 'fixed',
      top: `${Math.max(0, inputRect.bottom - 16)}px`,
      left: `${Math.max(0, inputRect.left + 65)}px`
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.isClickInsideObjectSelector(event);
    if (!clickedInside) {
      this.objectSelectorIsOpen = false;
    }
  }

  isClickInsideObjectSelector(event: MouseEvent): boolean {
    const objectSelector = document.querySelector('app-object-picker');
    return objectSelector?.contains(event.target as Node) ?? false;
  }
}
