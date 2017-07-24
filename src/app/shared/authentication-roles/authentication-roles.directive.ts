import {
  Directive,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  McsAuthenticationService,
  McsAuthenticationIdentity
} from '../../core';

@Directive({
  selector: '[mcsAuthenticationRoles]'
})

// TODO: Create the Unit test for this one, when the matrix for roles are available
export class AuthenticationRolesDirective implements OnInit, OnDestroy {
  @Input()
  public mcsAuthenticationRoles: string[];

  constructor(
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) {
    this.mcsAuthenticationRoles = new Array();
  }

  public ngOnInit() {
    this._setElementDisplay();
  }

  public ngOnDestroy() {
    this.mcsAuthenticationRoles.slice();
    this.mcsAuthenticationRoles = null;
  }

  private _setElementDisplay(): void {
    // If the user is not authorized removed the element in the DOM
    if (!this._isAuthorized()) {
      this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'none');
    }
  }

  private _isAuthorized(): boolean {
    // True by default, so that all implemented element without inputs are authorized
    let authorized: boolean = true;

    // Check for user role if it is validate
    for (let inputtedRole of this.mcsAuthenticationRoles) {
      let role: string;
      role = this._authenticationIdentity.roles.find((userRole) => {
        return inputtedRole.localeCompare(userRole) === 0 ? true : false;
      });

      if (role) {
        authorized = true;
        break;
      }
    }
    return authorized;
  }
}
