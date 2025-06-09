import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTimestampComponent } from './message-timestamp.component';

describe('MessageTimestampComponent', () => {
  let component: MessageTimestampComponent;
  let fixture: ComponentFixture<MessageTimestampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageTimestampComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageTimestampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
