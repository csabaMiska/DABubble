import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserInputComponent } from './add-user-input.component';

describe('AddUserInputComponent', () => {
  let component: AddUserInputComponent;
  let fixture: ComponentFixture<AddUserInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
