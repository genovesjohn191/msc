import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { McsAuthenticationService } from '../../core';
import { coerceArray } from '../../utilities';

@Directive({
  selector: '[mcsHasPermission]'
})

export class HasPermissionDirective {
  @Input() set mcsHasPermission(requiredPermission: string[]) {
    if (this._authenticationService.hasPermission(coerceArray(requiredPermission))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  constructor(
    private _authenticationService: McsAuthenticationService,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }
}
