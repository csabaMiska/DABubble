import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSignUp } from './app-sign-up';

describe('AppSignUp', () => {
  let component: AppSignUp;
  let fixture: ComponentFixture<AppSignUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSignUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSignUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
