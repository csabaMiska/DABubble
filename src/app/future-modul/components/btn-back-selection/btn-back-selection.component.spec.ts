import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnBackSelectionComponent } from './btn-back-selection.component';

describe('BtnBackSelectionComponent', () => {
  let component: BtnBackSelectionComponent;
  let fixture: ComponentFixture<BtnBackSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnBackSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnBackSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
