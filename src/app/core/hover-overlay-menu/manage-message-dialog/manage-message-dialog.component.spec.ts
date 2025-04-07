import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMessageDialogComponent } from './manage-message-dialog.component';

describe('ManageMessageDialogComponent', () => {
  let component: ManageMessageDialogComponent;
  let fixture: ComponentFixture<ManageMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMessageDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
