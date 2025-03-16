import { transition, trigger, useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { slideInAnimation } from '../../shared/animations/slide-in-animation';
import { slideOutAnimation } from '../../shared/animations/slide-out-animation';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        useAnimation(slideInAnimation, {
          params: {
            timing: '500ms ease-in',
            from: 'translateY(200%)',
            between: 'translateY(100%)',
            to: 'translateY(0)'
          }
        }),
      ]),
      transition(':leave', [
        useAnimation(slideOutAnimation, {
          params: {
            timing: '500ms ease-in',
            from: 'translateY(0)',
            between: 'translateY(100%)',
            to: 'translateY(200%)'
          }
        })
      ]),
    ]),
  ],

})
export class OverlayComponent {
  @Input() textOverlay!: string;
  @Input() iconOverlay!: boolean;
  @Input() showOverlay!: boolean;
}
