import { Component, Input } from '@angular/core';
import { CustomDatePipe } from '../../shared/pipe/custom.date.pipe';

@Component({
  selector: 'app-message-timestamp',
  standalone: true,
  imports: [
    CustomDatePipe
  ],
  templateUrl: './message-timestamp.component.html',
  styleUrl: './message-timestamp.component.scss'
})
export class MessageTimestampComponent {
@Input() timestamp!: string;

}
