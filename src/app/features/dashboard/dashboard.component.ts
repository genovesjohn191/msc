import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsAuthenticationService,
  CoreConfig,
  CoreDefinition,
  McsNavigationService
} from '@app/core';
import { RouteKey } from '@app/models';

@Component({
  selector: 'mcs-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardComponent implements OnInit {

  public constructor(
    private _navigationService: McsNavigationService,
    private _coreConfig: CoreConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationService: McsAuthenticationService
  ) {}

  public ngOnInit() {
    this._changeDetectorRef.markForCheck();
  }

  public get userPermissionsImageKey(): string {
    return CoreDefinition.ASSETS_IMAGE_USER_PERMISSIONS;
  }

  /**
   * Returns the macquarie view url
   */
  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
  }

  /**
   * Returns the user details url
   */
  public get userDetailsUrl(): string {
    return `${this.macviewUrl}/UserManagement/SearchUser.aspx`;
  }

  /**
   * Sign out the currently logged user
   */
  public signOut(): void {
    this._authenticationService.logOut();
  }

  /**
   * Navigates to create ticket page
   */
  public gotoCreateTicket(): void {
    this._navigationService.navigateTo(RouteKey.TicketCreate);
  }
}
