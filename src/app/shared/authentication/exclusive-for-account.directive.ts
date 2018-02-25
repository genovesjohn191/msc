import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input
} from '@angular/core';
import {
  McsCookieService,
  CoreDefinition
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

// Account type enumeration
type accountType = 'default' | 'others';

@Directive({
  selector: '[mcsExclusiveForAccount]'
})

export class ExclusiveForAccountDirective {
  @Input() set mcsExclusiveForAccount(account: accountType) {
    this._createViewForAccount(account);
  }

  // TODO: Refactor to use account service instead
  private get _activeAccountType(): accountType {
    let activeAccount = this._cookieService.getItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    return (isNullOrEmpty(activeAccount)) ? 'default' : 'others';
  }

  constructor(
    private _cookieService: McsCookieService,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  private _createViewForAccount(account: accountType): void {
    if (this._activeAccountType === account) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
