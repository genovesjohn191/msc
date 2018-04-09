import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges
} from '@angular/core';
import { McsAccessControlService } from '../../core';
import { coerceArray } from '../../utilities';

@Directive({
  selector: '[mcsAccessControl]'
})

/**
 * Usage
 * Access:*mcsAccessControl(['VmConfigurationEdit']; feature: 'vmConfiguration')
 * Permission: *mcsAccessControl(['VmAccess'];)
 * Feature: *mcsAccessControl([]; feature: 'experimentalFeature')
 */
export class AccessControlDirective implements OnChanges {

  private _requiredPermission: string[];
  @Input('mcsAccessControl')
  public set requiredPermission(value: string[]) {
    this._requiredPermission = coerceArray(value);
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

  public ngOnChanges() {
    // We need to put this under onChanges in order
    // to wait for observable calls to update the DOM
    this._removeElementByAccessControl();
  }

  /**
   * Removes the element from the DOM based on its permissions required and feature flag
   */
  private _removeElementByAccessControl(): void {
    let hasAccess = this._accessControlService
      .hasAccess(this._requiredPermission, this._featureFlag);

    hasAccess ? this.viewContainer.createEmbeddedView(this.templateRef) :
      this.viewContainer.clear();
  }
}
