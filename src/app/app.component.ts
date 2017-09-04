/*
 * Angular 2 decorators and services
 */
import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { McsRoutePermissionGuard } from './core';
/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'mcs-app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./app.component.scss')],
  templateUrl: './app.component.html'
})

export class AppComponent {

  constructor(private _routePermissionGuard: McsRoutePermissionGuard) {
    // All implementation on the start should be added here
  }
}
