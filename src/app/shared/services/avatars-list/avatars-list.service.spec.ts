import { TestBed } from '@angular/core/testing';

import { AvatarsListService } from './avatars-list.service';

describe('AvatarsListService', () => {
  let service: AvatarsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
