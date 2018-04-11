import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input
} from '@angular/core';
import {
  McsCookieService,
  CoreDefinition
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';

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
    private _templateRef: TemplateRef<any>,
    private _viewContainer: ViewContainerRef
  ) { }

  private _createViewForAccount(account: accountType): void {
    if (this._activeAccountType === account) {
      this._viewContainer.createEmbeddedView(this._templateRef);
    } else {
      this._viewContainer.clear();
    }
  }
}
