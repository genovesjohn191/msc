import {
  ChangeDetectorRef,
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { McsAuthenticationIdentity } from '@app/core';
import { AccountStatus } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

type accountType = 'default' | 'impersonator' | 'anonymous';

@Directive({
  selector: '[mcsExclusiveForAccount]'
})

export class ExclusiveForAccountDirective {
  @Input()
  public set mcsExclusiveForAccount(account: accountType | accountType[]) {
    let types = typeof account === 'string' ? [account] : account;
    this._createViewForAccount(types);
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
  private _createViewForAccount(types: accountType[]): void {
    let showElement = isNullOrEmpty(types) ? true : false;

    types?.forEach(type => {
      let accountEnum = this._accountTypeMap.get(type);
      if (showElement) { return; }

      showElement = this._authIdentityService.activeAccountStatus === accountEnum;
    });

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
    this._accountTypeMap.set('anonymous', AccountStatus.Anonymous);
  }
}
