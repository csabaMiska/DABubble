import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthActionHandlerComponent } from './auth-action-handler.component';

describe('AuthActionHandlerComponent', () => {
  let component: AuthActionHandlerComponent;
  let fixture: ComponentFixture<AuthActionHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthActionHandlerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthActionHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
