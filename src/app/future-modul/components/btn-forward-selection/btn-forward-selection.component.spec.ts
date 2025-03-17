import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnForwardSelectionComponent } from './btn-forward-selection.component';

describe('BtnForwardSelectionComponent', () => {
  let component: BtnForwardSelectionComponent;
  let fixture: ComponentFixture<BtnForwardSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnForwardSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnForwardSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
