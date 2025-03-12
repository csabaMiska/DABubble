import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewportService } from './shared/services/viewport/viewport.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DABubble';
  private viewPortService = inject(ViewportService);
}
