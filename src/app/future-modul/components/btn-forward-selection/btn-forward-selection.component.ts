import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSharedModule } from './../../../shared/material-module/mat-shared.module';

@Component({
  selector: 'app-btn-forward-selection',
  imports: [CommonModule, RouterModule, MatSharedModule],
  styleUrl: './btn-forward-selection.component.scss',
  template: `
    <div>
      <button
        class="btnSelf disableTextSelection"
        [ngClass]="buttonClass"
        [disabled]="disabled"
        [routerLink]="routerLink"
      >
        Weiter
      </button>
    </div>
  `,
})
export class BtnForwardSelectionComponent {
  @Input() buttonClass: string = '';
  @Input() disabled: boolean = false;
  @Input() routerLink: string | any[] = '';
}
