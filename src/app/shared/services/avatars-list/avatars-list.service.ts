import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarsListService {
  avatarsList: Array<string> = [
    'assets/img/profile-images/profile-1.png',
    'assets/img/profile-images/profile-2.png',
    'assets/img/profile-images/profile-3.png',
    'assets/img/profile-images/profile-4.png',
    'assets/img/profile-images/profile-5.png',
    'assets/img/profile-images/profile-6.png'
  ];
}
