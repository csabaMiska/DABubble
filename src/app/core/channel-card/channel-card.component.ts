import { Component, Input } from '@angular/core';
import { Channel } from '../../shared/interface/channal.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-channel-card',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './channel-card.component.html',
  styleUrl: './channel-card.component.scss'
})
export class ChannelCardComponent {
  @Input() channel!: Channel
}
