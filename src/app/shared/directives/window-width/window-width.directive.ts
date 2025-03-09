import { Directive, EventEmitter, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Directive({
  selector: '[appWindowWidth]',
  standalone: true
})
export class WindowWidthDirective {
  mobilViewOn: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe(['(max-width: 800px)'])
      .subscribe(result => {
        this.mobilViewOn = result.matches;
      });
  }

}


