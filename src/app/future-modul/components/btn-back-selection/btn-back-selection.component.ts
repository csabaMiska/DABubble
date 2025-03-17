import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSharedModule } from './../../../shared/material-module/mat-shared.module';

@Component({
  selector: 'app-btn-back-selection',
  imports: [CommonModule, RouterModule, MatSharedModule],
  styleUrl: './btn-back-selection.component.scss',
  template: `
    <div>
      <button
        class="btnSelf disableTextSelection"
        [ngClass]="buttonClass"
        [disabled]="disabled"
        [routerLink]="routerLink"
      >
        <mat-icon class="arrow-back-mat-icon">arrow_back</mat-icon>
      </button>
    </div>
  `,
})
export class BtnBackSelectionComponent {
  @Input() buttonClass: string = '';
  @Input() disabled: boolean = false;
  @Input() routerLink: string | any[] = '';
}
