import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { McsServerHidsOptions } from '@app/models';
import { OptionsApiService } from '@app/services';
import { ServerHids } from './server-hids';

@Component({
  selector: 'mcs-hids-addon',
  templateUrl: './hids.addon.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'hids-wrapper'
  }
})

export class HidsAddOnComponent implements OnInit, OnDestroy {
  public hidsOptions: McsServerHidsOptions;
  public hids: ServerHids;
  public hidsServiceVariants: string[];
  public hidsProtectionLevels: string[];
  public hidsPolicyTemplates: string[];

  public selectedHidsServiceVariant: string;
  public selectedHidsProtectionLevel: string;
  public selectedHidsPolicyTemplate: string;

  @Output()
  public change: EventEmitter<ServerHids> = new EventEmitter();

  private _hidsOptionsSubscription: Subscription;

  public constructor(private _optionsApiService: OptionsApiService) {
    this.hidsOptions = new McsServerHidsOptions();
    this.hidsServiceVariants = new Array();
    this.hidsProtectionLevels = new Array();
    this.hidsPolicyTemplates = new Array();
    this.hids = new ServerHids();
  }

  public ngOnInit(): void {
    this._getHidsOptions();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._hidsOptionsSubscription);
  }

  /**
   * This will set the HIDS service variant value
   * and notify change parameter
   */
  public onServiceVariantChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * This will set the HIDS protection level value
   * and notify change parameter
   */
  public onProtectionLevelChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * This will set the HIDS policy template value
   * and notify change parameter
   */
  public onPolicyTemplateChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * Get HIDS options from the API
   */
  private _getHidsOptions(): void {
    this._hidsOptionsSubscription = this._optionsApiService.getHidsOptions()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }

        this.hidsOptions = response.content;

        if (!isNullOrEmpty(this.hidsOptions)) {
          this._setHidsServiceVariants(this.hidsOptions.serviceVariants);
          this._setHidsProtectionLevels(this.hidsOptions.protectionLevels);
          this._setHidsPolicyTemplates(this.hidsOptions.policyTemplates);

          this.selectedHidsServiceVariant = this._setSelectDefaultValue(
            this.hidsOptions.serviceVariants, 10);
          this.selectedHidsProtectionLevel = this._setSelectDefaultValue(
            this.hidsOptions.protectionLevels, 0);
          this.selectedHidsPolicyTemplate = this._setSelectDefaultValue(
            this.hidsOptions.policyTemplates, 0);
        }
      });
  }

  /**
   * Set HIDS Service Variants
   * @param serviceVariants HIDS Service Variants
   */
  private _setHidsServiceVariants(serviceVariants: string[]): void {
    if (isNullOrEmpty(serviceVariants)) { return; }
    this.hidsServiceVariants = serviceVariants;
  }

  /**
   * Set HIDS Protection Levels
   * @param protectionLevels HIDS Protection Levels
   */
  private _setHidsProtectionLevels(protectionLevels: string[]): void {
    if (isNullOrEmpty(protectionLevels)) { return; }
    this.hidsProtectionLevels = protectionLevels;
  }

  /**
   * Set HIDS Policy Templates
   * @param policyTemplates HIDS Policy Templates
   */
  private _setHidsPolicyTemplates(policyTemplates: string[]): void {
    if (isNullOrEmpty(policyTemplates)) { return; }
    this.hidsPolicyTemplates = policyTemplates;
  }

  /**
   * Set the default value of the select dropdown
   * @param options Options where to select the value
   * @param index Index of the value to be set
   */
  private _setSelectDefaultValue(options: string[], index: number): string {
    if (isNullOrEmpty(options)) { return undefined; }

    return (index >= 0 && index < (options.length)) ?
      options[index] : options[0];
  }

  /**
   * Event that emits whenever there are changes in the model
   */
  private _notifyChangeParameter(): void {
    this.hids.serviceVariant = this.selectedHidsServiceVariant;
    this.hids.protectionLevel = this.selectedHidsProtectionLevel;
    this.hids.policyTemplate = this.selectedHidsPolicyTemplate;
    this.change.emit(this.hids);
  }
}
