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
import { McsFeatureFlag } from '@app/models';

@Directive({
  selector: '[isExperimental]'
})

/**
 * Usage
 * Access:*isExperimental="true"
 * Else: *isExperimental="true; else: templateName"
 */
export class IsExperimentalDirective implements OnChanges {
  @Input('isExperimental')
  public set isExperimental(value: boolean) { this._isExperimental = coerceBoolean(value); }
  private _isExperimental: boolean;

  @Input('isExperimentalValidateWhen')
  public set validateWhen(validateWhen: boolean) {
    this._validateWhen = coerceBoolean(validateWhen);
  }
  private _validateWhen: boolean = true;

  @Input('isExperimentalElse')
  public set elseTemplate(templateRef: TemplateRef<any>) { this._elseTemplate = templateRef; }
  private _elseTemplate: TemplateRef<any>;

  private _elseTemplateCreated: boolean = false;

  public get experimentalFeaturesEnabled(): boolean {
    return this._accessControlService.hasAccessToFeature(McsFeatureFlag.ExperimentalFeatures);
  }

  constructor(
    private _accessControlService: McsAccessControlService,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  public ngOnChanges(): void {
    this._removeElementBy();
  }

  /**
   * Removes the element from the DOM based on its permissions required and feature flag
   */
  private _removeElementBy(): void {
    let truthy = (this._isExperimental && this.experimentalFeaturesEnabled) ||
      (!this._isExperimental && !this.experimentalFeaturesEnabled);

    // Do nothing incase the validateWhen flag is false
    if (!this._validateWhen) {
      this._createHostTemplateView();
      return;
    }

    if (isNullOrEmpty(this._elseTemplate)) {
      truthy ?
        this._createHostTemplateView() :
        this._clearHostTemplateView();
    } else {
      truthy ?
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
