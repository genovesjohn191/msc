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

export class HasPermissionDirective {
  @Input() set mcsHasPermission(requiredPermission: string[]) {
    if (this._authenticationService.hasPermission(requiredPermission)) {
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
