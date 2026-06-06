import { TestBed } from '@angular/core/testing';

import { PaperService } from './paper.servie';

describe('Paper', () => {
  let service: PaperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
