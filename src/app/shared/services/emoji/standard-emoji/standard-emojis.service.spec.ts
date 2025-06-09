import { TestBed } from '@angular/core/testing';

import { StandardEmojisService } from './standard-emojis.service';

describe('StandardEmojiService', () => {
  let service: StandardEmojisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardEmojisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
