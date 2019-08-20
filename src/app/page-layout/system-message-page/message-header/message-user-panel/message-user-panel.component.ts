import {
  Component,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';
import { McsIdentity } from '@app/models';
import {
  CoreDefinition,
  McsAuthenticationService,
} from '@app/core';
import { EventBusPropertyListenOn } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-system-message-user-panel',
  templateUrl: './message-user-panel.component.html',
  styleUrls: ['./message-user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageUserPanelComponent {

  @ViewChild('systemMessagePopover')
  public systemMessagePopover: any;

  @EventBusPropertyListenOn(McsEvent.userChange)
  public activeUser$: Observable<McsIdentity>;

  public constructor(private _authenticationService: McsAuthenticationService) { }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  /**
   * Event that emits when user logged out
   */
  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

}
