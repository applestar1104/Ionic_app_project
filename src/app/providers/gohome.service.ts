import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CrewAppState } from '../providers/crewapp-state';


@Injectable({
  providedIn: 'root'
})
export class GoHome implements CanActivate {

  constructor(private router: Router, private crewappstate: CrewAppState) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.crewappstate.getLastUrl() !== undefined && !this.crewappstate.getLastUrl().includes('home')) {
      this.router.navigate(['app/tabs/home']);
      return false;
    }

    return true;
  }
}
