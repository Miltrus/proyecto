import { CanMatchFn } from '@angular/router';

export const hasRoleGuard: CanMatchFn = (route, segments) => {
  return true;
};
