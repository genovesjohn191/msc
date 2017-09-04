import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  McsAuthenticationService
} from '../../core';

@Directive({
  selector: '[mcsHasPermission]'
})

// TODO: Create the Unit test for this one, when the matrix for roles are available
export class HasPermissionDirective {
  @Input() set mcsHasPermission(requiredPermission: string[]) {
    if (this._authenticationService.hasPermission(requiredPermission)) {
      this._viewContainer.createEmbeddedView(this._templateRef);
    } else {
      this._viewContainer.clear();
    }
  }

  constructor(
    private _authenticationService: McsAuthenticationService,
    private _templateRef: TemplateRef<any>,
    private _viewContainer: ViewContainerRef
  ) { }
}
