import { Component } from '@angular/core';
import { McsAuthenticationService } from '../../core';

@Component({
  selector: 'mcs-default-page',
  templateUrl: './default-page.component.html',
  styles: [require('./default-page.component.scss')]
})

export class DefaultPageComponent {

  public constructor(private _authenticationService: McsAuthenticationService) {
    // This will normalize the url and will remove the token from the url
    this._authenticationService.normalizeUrl();
  }
}
