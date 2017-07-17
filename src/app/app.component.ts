/*
 * Angular 2 decorators and services
 */
import {
  OnInit,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  Params} from '@angular/router';
import { CoreDefinition } from './core/';
import { McsAuthService } from './core/';
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
export class AppComponent implements OnInit {
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: McsAuthService
  ) { }

  public ngOnInit() {
    this._listenToBearerTokenUpdate();
  }

  private _listenToBearerTokenUpdate() {
    this._activatedRoute.queryParams.subscribe((params: Params) => {
      let authToken: string = params[CoreDefinition.QUERY_PARAM_BEARER];
      if (authToken) {
        this._authService.authToken = authToken;
      }
    });
  }
}
