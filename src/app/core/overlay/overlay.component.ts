import { transition, trigger, useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { overlayInAnimation } from '../../shared/animations/overlay-in-animation';
import { overlayOutAnimation } from '../../shared/animations/overlay-out-animation';
import { OverlayService } from '../../shared/services/overlay/overlay.service';
import { Subscription } from 'rxjs';

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
export class OverlayComponent implements OnInit {
  private overlayService = inject(OverlayService);

  showOverlay: boolean = false;
  textOverlay: string = '';
  showIconOverlay: boolean = false;
  iconOverlay: string = '';

  private sub = Subscription.EMPTY;

  ngOnInit() {
    this.sub = this.overlayService.overlayMessage$.subscribe((message) => {
      if (message) {
        this.textOverlay = message.text;
        this.showIconOverlay = message.showIcon ?? false;
        this.iconOverlay = message.icon;
        this.showOverlay = true;
      } else {
        this.showOverlay = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
