import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-channel',
  imports: [MatCardModule, MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})

export class CreateChannelComponent {
  channelName: string = '';
  channelDescription: string = '';

  updateChannelName() {
    if (!this.channelName.startsWith("#")) {
      this.channelName = "#" + this.channelName;
    }
  }

  submit() {
    this.updateChannelName();

    console.log('Formular wird übermittelt');
    console.log('Channel-Name:', this.channelName);
    console.log('Channel-Beschreibung:', this.channelDescription);
    // Bei FormGroup-Zuweisung leeren sich Input-Felder automatisch
  }
}
