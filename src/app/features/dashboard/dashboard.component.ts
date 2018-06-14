import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsTextContentProvider,
  McsAuthenticationService,
  CoreDefinition
} from '../../core';
import { resolveEnvVar } from '../../utilities';

@Component({
  selector: 'mcs-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardComponent implements OnInit {
  public textContent: any;

  public constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContent: McsTextContentProvider,
    private _authenticationService: McsAuthenticationService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContent.content.dashboard;
    this._changeDetectorRef.markForCheck();
  }

  public get userPermissionsImageKey(): string {
    return CoreDefinition.ASSETS_IMAGE_USER_PERMISSIONS;
  }

  /**
   * Returns the macquarie view url
   */
  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  /**
   * Returns the user details url
   */
  public get userDetailsUrl(): string {
    return `${this.macquarieViewUrl}/UserManagement/SearchUser.aspx`;
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
    this._router.navigate(['./tickets/create']);
  }
}
