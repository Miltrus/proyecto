import { CanMatchFn } from '@angular/router';

export const isLoggedInGuard: CanMatchFn = (route, segments) => {
  return true;
};
