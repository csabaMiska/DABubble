import { Directive, EventEmitter, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Directive({
  selector: '[appWindowWidth]',
  standalone: true
})
export class WindowWidthDirective {
  mobilViewOn: boolean = false;
  tabletViewOn: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe(['(max-width: 800px)', '(max-width: 1200px)'])
      .subscribe(result => {
        this.mobilViewOn = result.breakpoints['(max-width: 800px)'] || false;
        this.tabletViewOn = result.breakpoints['(max-width: 1200px)'] || false;
      });
  }

}


