import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import 'emoji-picker-element';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [],
  providers: [WindowWidthDirective],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmojiPickerComponent implements OnInit, OnDestroy, OnChanges {
  private windowWidthDirectives = inject(WindowWidthDirective)
  pickerPosition = { top: '0', left: '0' };
  @Input() buttonRect!: DOMRect;

  ngOnInit() {
    this.calculatePickerPosition();
    window.addEventListener('resize', this.handleResize);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['buttonRect'] && this.buttonRect) {
      this.calculatePickerPosition();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (this.buttonRect) {
      this.calculatePickerPosition();
    }
  }

  calculatePickerPosition() {
    const isMobile = this.windowWidthDirectives.mobilViewOn;
    const pickerWidth = isMobile ? 280 : 350;
    const pickerHeight = isMobile ? 240 : 400;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = this.buttonRect.left;
    let top = this.buttonRect.bottom;

    if (left + pickerWidth > windowWidth) {
      left = windowWidth - pickerWidth - 10;
    }

    if (top + pickerHeight > windowHeight) {
      top = this.buttonRect.top - pickerHeight - 5;
    }

    this.pickerPosition = {
      top: `${Math.max(0, top)}px`,
      left: `${Math.max(0, left)}px`
    };
  }
}
