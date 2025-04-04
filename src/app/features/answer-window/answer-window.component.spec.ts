import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerWindowComponent } from './answer-window.component';

describe('AnswerWindowComponent', () => {
  let component: AnswerWindowComponent;
  let fixture: ComponentFixture<AnswerWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerWindowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
