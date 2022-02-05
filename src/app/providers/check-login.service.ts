import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CrewAppState } from '../providers/crewapp-state';


@Injectable({
  providedIn: 'root'
})
export class CheckLogin implements CanActivate {

  constructor(private router: Router, private crewappstate: CrewAppState) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // console.log('[CheckLogin] next::: ', next);
    // console.log('[CheckLogin] state::: ', state);
    return false;
  }
}
