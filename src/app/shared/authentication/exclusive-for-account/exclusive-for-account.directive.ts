import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { McsAuthenticationIdentity } from '@app/core';
import { AccountStatus } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

type accountType = 'default' | 'impersonator';

@Directive({
  selector: '[mcsExclusiveForAccount]'
})

export class ExclusiveForAccountDirective {
  @Input()
  public set mcsExclusiveForAccount(type: accountType) {
    type = isNullOrEmpty(type) ? 'default' : type;
    this._createViewForAccount(type);
  }

  private _accountTypeMap: Map<accountType, AccountStatus>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authIdentityService: McsAuthenticationIdentity,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) {
    this._initializeAccountTypeMap();
  }

  /**
   * Creates the view based on specific type of account
   * @param type Account name enumeration
   */
  private _createViewForAccount(type: accountType): void {
    let accountEnum = this._accountTypeMap.get(type);
    let showElement = this._authIdentityService.activeAccountStatus === accountEnum;
    showElement ? this.viewContainer.createEmbeddedView(this.templateRef) : this.viewContainer.clear();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initialize and sets the values of the Account type map
   */
  private _initializeAccountTypeMap() {
    this._accountTypeMap = new Map();
    this._accountTypeMap.set('default', AccountStatus.Default);
    this._accountTypeMap.set('impersonator', AccountStatus.Impersonator);
  }
}
