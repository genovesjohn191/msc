import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  AfterViewInit
} from '@angular/core';
import { McsAccessControlService } from '../../core';
import {
  coerceArray,
  refreshView
} from '../../utilities';

@Directive({
  selector: '[mcsAccessControl]'
})

/**
 * Usage
 * Access:*mcsAccessControl(['VmConfigurationEdit']; feature: 'vmConfiguration')
 * Permission: *mcsAccessControl(['VmAccess'];)
 * Feature: *mcsAccessControl([]; feature: 'experimentalFeature')
 */
export class AccessControlDirective implements AfterViewInit {

  private _requiredPermission: string[];
  @Input('mcsAccessControl')
  public set requiredPermission(requiredPermission: string[]) {
    this._requiredPermission = coerceArray(requiredPermission);
  }

  private _featureFlag: string;
  @Input('mcsAccessControlFeature')
  public set feature(featureFlag: string) {
    this._featureFlag = featureFlag;
  }

  constructor(
    private _accessControlService: McsAccessControlService,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  public ngAfterViewInit() {
    refreshView(() => {
      let hasAccess =
      this._accessControlService.hasAccess(this._requiredPermission, this._featureFlag);
      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
