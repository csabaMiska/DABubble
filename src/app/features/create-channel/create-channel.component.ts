import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-create-channel',
  imports: [MatCardModule, MatInputModule, MatFormFieldModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})

export class CreateChannelComponent {

  submit() {
    console.log('Formular wird übermittelt');
  }
}
