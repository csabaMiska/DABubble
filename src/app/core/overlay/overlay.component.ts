import { transition, trigger, useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { overlayInAnimation } from '../../shared/animations/overlay-in-animation';
import { overlayOutAnimation } from '../../shared/animations/overlay-out-animation';

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
        useAnimation(overlayInAnimation, {
          params: {
            timing: '500ms ease-in',
            from: 'translateY(200%)',
            between: 'translateY(100%)',
            to: 'translateY(0)'
          }
        }),
      ]),
      transition(':leave', [
        useAnimation(overlayOutAnimation, {
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
