import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './header-search-bar.component.html',
  styleUrl: './header-search-bar.component.scss'
})
export class HeaderSearchBarComponent {
  testUsers: Array<{ firstName: string, lastName: string, img: string, status: 'online' | 'offline' | 'busy' }> = [
    { firstName: 'Bruce', lastName: 'Wayne', img: '1', status: 'online' },
    { firstName: 'Kent', lastName: 'Clark', img: '3', status: 'offline' },
    { firstName: 'Lois', lastName: 'Lane', img: '6', status: 'busy' },
    { firstName: 'Alfed', lastName: 'Pennyworth', img: '4', status: 'online' },
    { firstName: 'James', lastName: 'Gordon', img: '2', status: 'busy' }
  ];

  testChannels: Array<{ channelName: string }> = [
    { channelName: 'Gotham-City-News' },
    { channelName: 'Start-City-News' },
    { channelName: 'Jokers-News' },
    { channelName: 'GCPD' },
    { channelName: 'Rasz-al-Gul' }
  ];

  private eRef = inject(ElementRef);

  searchTerm: string = '';
  filteredUsers: Array<{ firstName: string, lastName: string, img: string, status: 'online' | 'offline' | 'busy'}> = [];
  filteredChannels: Array<{ channelName: string }> = [];

  onSearch() {
    if (this.searchTerm.includes('@')) {
      const userSearchTerm = this.searchTerm.slice(1).toLowerCase(); 
      this.filteredUsers = this.testUsers.filter(user => 
        user.firstName.toLowerCase().includes(userSearchTerm) || 
        user.lastName.toLowerCase().includes(userSearchTerm) ||
        user.img.includes(userSearchTerm) ||
        user.status.includes(userSearchTerm)
      );
    } else {
      this.filteredUsers = [];
    }

    if (this.searchTerm.includes('#')) {
      const channelSearchTerm = this.searchTerm.slice(1).toLowerCase(); 
      this.filteredChannels = this.testChannels.filter(channel => 
        channel.channelName.toLowerCase().includes(channelSearchTerm)
      );
    } else {
      this.filteredChannels = [];
    }
  }

  onSelectUser(user: { firstName: string, lastName: string }) {
    const mention = `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`;
    this.searchTerm = mention; 
    this.filteredUsers = [];
  }

  onSelectChannel(channel: { channelName: string }) {
    const selectedChannel = `#${channel.channelName.toLowerCase()}`;
    this.searchTerm = selectedChannel 
    this.filteredChannels = []; 
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.filteredUsers = [];
      this.filteredChannels = [];
    }
  }
}
