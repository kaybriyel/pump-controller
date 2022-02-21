import { TestBed } from '@angular/core/testing';

import { TankService } from './tank.service';

describe('TankService', () => {
  let service: TankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
