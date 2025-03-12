import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProfilePopupComponent } from './my-profile-popup.component';

describe('MyProfilePopupComponent', () => {
  let component: MyProfilePopupComponent;
  let fixture: ComponentFixture<MyProfilePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProfilePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProfilePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
