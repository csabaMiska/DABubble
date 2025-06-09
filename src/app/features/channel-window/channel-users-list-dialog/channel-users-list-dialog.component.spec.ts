import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelUsersListDialogComponent } from './channel-users-list-dialog.component';

describe('ChannelUsersListDialogComponent', () => {
  let component: ChannelUsersListDialogComponent;
  let fixture: ComponentFixture<ChannelUsersListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelUsersListDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelUsersListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
