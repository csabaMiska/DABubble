import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-privacy-policy',
  imports: [MatCardModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit {
  ngOnInit(): void {
    document.body.style.overflowY = 'auto';
  }
  ngOnDestroy(): void {
    document.body.style.overflowY = 'hidden';
  }
}
