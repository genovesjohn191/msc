import {
  Component,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';
import { McsIdentity } from '@app/models';
import { McsAuthenticationIdentity, McsAuthenticationService } from '@app/core';
import { EventBusPropertyListenOn } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-system-message-user-panel',
  templateUrl: './message-user-panel.component.html',
  styleUrls: ['./message-user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageUserPanelComponent {

  @ViewChild('systemMessagePopover')
  public systemMessagePopover: any;

  public constructor(
    private _authenticationService: McsAuthenticationService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) { }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get currentUser(): McsIdentity {
    return this._authenticationIdentity.user;
  }

  /**
   * Event that emits when user logged out
   */
  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

}
