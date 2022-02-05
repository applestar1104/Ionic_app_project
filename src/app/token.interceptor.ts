import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CrewAppState } from './providers/crewapp-state';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private crewappstate: CrewAppState
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log('[ErrorInterceptor] request::: ', request);

    return next.handle(request).pipe(catchError(err => {
      console.log('[ErrorInterceptor] error::: ', err);
      let error;
      // const error = err.error.message || err.statusText;
      if (err.error || err.statusText) {
        if (err.error.message) {
          error = err.error.message;
        } else {
          error = err.statusText;
        }
      }

      this.crewappstate.presentToast(error, 'danger');

      if (err instanceof HttpErrorResponse) {

        if (err.error.message === 'The incoming token has expired') {
          this.crewappstate.showSideMenu(false); // BC-470
          this.router.navigateByUrl('/login', { replaceUrl: true });
        } else if (err.error.message === 'Refresh Token has expired') {
          this.crewappstate.showSideMenu(false); // BC-470
          this.router.navigateByUrl('/login', { replaceUrl: true });
        } else {
          // this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      }

      return throwError(error);

    }));
  } // intercept
}
