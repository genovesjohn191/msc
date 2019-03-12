import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges
} from '@angular/core';
import { McsAccessControlService } from '@app/core';
import {
  isNullOrEmpty,
  coerceArray,
  coerceBoolean
} from '@app/utilities';

@Directive({
  selector: '[mcsAccessControl]'
})

/**
 * Usage
 * Access:*mcsAccessControl="['VmConfigurationEdit']; feature: 'vmConfiguration'; else: template"
 * Permission: *mcsAccessControl="['DedicatedVmAccess']"
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

  @Input('mcsAccessControlValidateWhen')
  public set validateWhen(validateWhen: boolean) {
    this._validateWhen = coerceBoolean(validateWhen);
  }
  private _validateWhen: boolean = true;

  @Input('mcsAccessControlElse')
  public set elseTemplate(templateRef: TemplateRef<any>) { this._elseTemplate = templateRef; }
  private _elseTemplate: TemplateRef<any>;

  private _elseTemplateCreated: boolean = false;

  constructor(
    private _accessControlService: McsAccessControlService,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  public ngOnChanges(): void {
    this._removeElementByAccessControl();
  }

  /**
   * Removes the element from the DOM based on its permissions required and feature flag
   */
  private _removeElementByAccessControl(): void {
    // Do nothing incase the validateWhen flag is false
    if (!this._validateWhen) {
      this._createHostTemplateView();
      return;
    }

    let hasAccess = this._accessControlService
      .hasAccess(this._requiredPermission, this._featureFlag);

    if (isNullOrEmpty(this._elseTemplate)) {
      hasAccess ?
        this._createHostTemplateView() :
        this._clearHostTemplateView();
    } else {
      hasAccess ?
        this._createHostTemplateView() :
        this._createElseTemplateView();
    }
  }

  /**
   * Creates the else template view when the feature/permission is not exist
   */
  private _createElseTemplateView(): void {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this._elseTemplate);
    this._elseTemplateCreated = true;
  }

  /**
   * Creates the host template of the element view
   */
  private _createHostTemplateView(): void {
    let templateViewFound = this.viewContainer.get(0);
    if (!isNullOrEmpty(templateViewFound) && !this._elseTemplateCreated) { return; }

    this.viewContainer.createEmbeddedView(this.templateRef);
    this._elseTemplateCreated = false;
  }

  /**
   * Clears the element from the DOM
   */
  private _clearHostTemplateView(): void {
    this.viewContainer.clear();
  }
}
