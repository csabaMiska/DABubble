import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';
import { UserCardComponent } from '../user-card/user-card.component';
import { ChannelCardComponent } from '../channel-card/channel-card.component';

@Component({
  selector: 'app-object-picker',
  standalone: true,
  imports: [
    CommonModule,
    UserCardComponent,
    ChannelCardComponent
  ],
  templateUrl: './object-picker.component.html',
  styleUrl: './object-picker.component.scss'
})
export class ObjectPickerComponent {
  @Input() contents!: any[];
  @Output() selectedObject = new EventEmitter<{objectId: string}>();

  selectUser(objectId: string) {
    this.selectedObject.emit({ objectId });
  }
}
