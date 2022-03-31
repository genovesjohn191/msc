import { Component } from '@angular/core';
import { McsAuthenticationIdentity } from '@app/core';
import { McsIdentity } from '@app/models';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-interstitial-user-panel',
  templateUrl: './interstitial-user-panel.component.html',
  styleUrls: ['./interstitial-user-panel.component.scss']
})

export class InterstitialUserPanelComponent {

  public constructor(
    private _authenticationIdentity: McsAuthenticationIdentity
  ) { }

  public get currentUser(): McsIdentity {
    return this._authenticationIdentity.user;
  }

}
