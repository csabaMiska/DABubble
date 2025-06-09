import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverOverlayMenuComponent } from './hover-overlay-menu.component';

describe('HoverOverlayMenuComponent', () => {
  let component: HoverOverlayMenuComponent;
  let fixture: ComponentFixture<HoverOverlayMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoverOverlayMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoverOverlayMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
