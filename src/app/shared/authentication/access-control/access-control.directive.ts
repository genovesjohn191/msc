import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges
} from '@angular/core';
import { McsAccessControlService } from '@app/core';
import {
  coerceArray,
  isNullOrEmpty
} from '@app/utilities';

@Directive({
  selector: '[mcsAccessControl]'
})

/**
 * Usage
 * Access:*mcsAccessControl="['VmConfigurationEdit']; feature: 'vmConfiguration'; else: template"
 * Permission: *mcsAccessControl="['VmAccess']"
 * Feature: *mcsAccessControl="[]; feature: 'experimentalFeature'"
 * Else: *mcsAccessControl="[]; feature: 'experimentalFeature'; else: templateName"
 */
export class AccessControlDirective implements OnChanges {
  @Input('mcsAccessControl')
  public set requiredPermission(value: string[]) { this._requiredPermission = coerceArray(value); }
  private _requiredPermission: string[];

  @Input('mcsAccessControlFeature')
  public set feature(featureFlag: string) { this._featureFlag = featureFlag; }
  private _featureFlag: string;

  @Input('mcsAccessControlElse')
  public set elseTemplate(templateRef: TemplateRef<any>) { this._elseTemplate = templateRef; }
  private _elseTemplate: TemplateRef<any>;

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

    if (isNullOrEmpty(this._elseTemplate)) {
      hasAccess ? this.viewContainer.createEmbeddedView(this.templateRef) :
        this.viewContainer.clear();
    } else {
      hasAccess ? this.viewContainer.createEmbeddedView(this.templateRef) :
        this.viewContainer.createEmbeddedView(this._elseTemplate);
    }
  }
}
