import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessagesUserListComponent } from './direct-messages-user-list.component';

describe('DirectMessagesUserListComponent', () => {
  let component: DirectMessagesUserListComponent;
  let fixture: ComponentFixture<DirectMessagesUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessagesUserListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectMessagesUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
