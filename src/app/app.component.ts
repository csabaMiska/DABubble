import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyProfilePopupComponent } from './features/my-profile-popup/my-profile-popup.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MyProfilePopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DABubble';
}
