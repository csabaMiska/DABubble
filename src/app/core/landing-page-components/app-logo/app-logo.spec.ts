import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppLogo } from './app-logo';

describe('WelcomeLogo', () => {
  let component: AppLogo;
  let fixture: ComponentFixture<AppLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
