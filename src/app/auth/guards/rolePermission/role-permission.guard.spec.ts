import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { rolePermissionGuard } from './role-permission.guard';

describe('rolePermissionGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => rolePermissionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
