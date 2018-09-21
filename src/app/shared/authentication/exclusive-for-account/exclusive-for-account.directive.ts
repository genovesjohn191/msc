import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { McsAuthenticationIdentity } from '@app/core';
import {
  isNullOrEmpty,
  containsString
} from '@app/utilities';

@Directive({
  selector: '[mcsExclusiveForAccount]'
})

export class ExclusiveForAccountDirective {
  @Input()
  public set mcsExclusiveForAccount(accountEnumName: string) {
    this._createViewForAccount(accountEnumName);
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authIdentityService: McsAuthenticationIdentity,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  /**
   * Creates the view based on specific type of account
   * @param accountEnumName Account name enumeration
   */
  private _createViewForAccount(accountEnumName: string): void {
    let showElement = !isNullOrEmpty(accountEnumName) &&
      containsString(this._authIdentityService.activeAccountStatus, accountEnumName);
    showElement ?
      this.viewContainer.createEmbeddedView(this.templateRef) :
      this.viewContainer.clear();
    this._changeDetectorRef.markForCheck();
  }
}
