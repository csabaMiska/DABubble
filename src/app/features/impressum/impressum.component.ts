import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-impressum',
  imports: [MatCardModule],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss',
})
export class ImpressumComponent implements OnInit {
  ngOnInit(): void {
    document.body.style.overflowY = 'auto';
  }
  ngOnDestroy(): void {
    document.body.style.overflowY = 'hidden';
  }
}
