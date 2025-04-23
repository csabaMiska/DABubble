import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ObjectPickerComponent } from '../../object-picker/object-picker.component';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';

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
export class HeaderSearchBarComponent implements OnInit {
  private firebaseUserService = inject(FirebaseUserService);

  objectSelectorIsOpen: boolean = false;
  inputRects: DOMRect = {} as DOMRect;

  searchTerm: string = '';
  filteredObjects: any[] = [];

  ngOnInit(): void {
    
  }

  onSearch() {
    // if (this.searchTerm.includes('@')) {
    //   const userSearchTerm = this.searchTerm.slice(1).toLowerCase(); 
    //   this.filteredObjects = this.testUsers.filter(user => 
    //     user.firstName.toLowerCase().includes(userSearchTerm) || 
    //     user.lastName.toLowerCase().includes(userSearchTerm) ||
    //     user.img.includes(userSearchTerm) ||
    //     user.status.includes(userSearchTerm)
    //   );
    // } else {
    //   this.filteredObjects = [];
    // }

    // if (this.searchTerm.includes('#')) {
    //   const channelSearchTerm = this.searchTerm.slice(1).toLowerCase(); 
    //   this.filteredObjects = this.testChannels.filter(channel => 
    //     channel.channelName.toLowerCase().includes(channelSearchTerm)
    //   );
    // } else {
    //   this.filteredObjects = [];
    // }
  }





  selectedObject(objectId: string) {
    console.log(objectId);
  }


  calculateObjectSelectorPosition(inputRect: DOMRect) {
    if (!inputRect) return {};

    return {
      position: 'fixed',
      top: `${Math.max(0, inputRect.bottom - 16)}px`,
      left: `${Math.max(0, inputRect.left + 20)}px`
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
