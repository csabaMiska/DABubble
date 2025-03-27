import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBottomSheetComponent } from './status-bottom-sheet.component';

describe('StatusBottomSheetComponent', () => {
  let component: StatusBottomSheetComponent;
  let fixture: ComponentFixture<StatusBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBottomSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
