import {
  Component,
  ViewEncapsulation,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CoreConfig } from '@app/core';
import { coerceBoolean } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

type OrderAgreementType = 'chargesQuoted' | 'charges';
@Component({
  selector: 'mcs-order-agreement',
  templateUrl: './mcs-order-agreement.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class OrderAgreementComponent {

  @Input()
  public get orderAgreementType(): OrderAgreementType {
    return this._orderAgreementType;
  }
  public set orderAgreementType(value: OrderAgreementType) {
    this._orderAgreementType = value;
  }
  private _orderAgreementType: OrderAgreementType = 'charges';

  @Input()
  public get wrapAgreement(): boolean {
    return this._wrapAgreement;
  }
  public set wrapAgreement(value: boolean) {
    this._wrapAgreement = coerceBoolean(value);
  }
  private _wrapAgreement: boolean = true;

  private _orderAgreementMap: Map<OrderAgreementType, string>;

  public get orderAgreement(): string {
    return this._orderAgreementMap.get(this._orderAgreementType);
  }

  constructor(
    private _coreConfig: CoreConfig,
    private _translateService: TranslateService,
  ) {
    this._initializeOrderAgreementMap();
  }

  /**
   * Returns the url of macquarie terms and conditions
   */
  public get mcsTermsAndConditions(): string {
    return this._coreConfig.termsAndConditionsUrl;
  }

  /**
   * Initialize the key value pairs of the Order Agreement Map
   */
  private _initializeOrderAgreementMap() {
    this._orderAgreementMap = new Map();
    this._orderAgreementMap.set(
      'chargesQuoted',
      this._translateService.instant('orderAgreement.agreementChargesQuoted')
    );
    this._orderAgreementMap.set(
      'charges',
      this._translateService.instant('orderAgreement.agreementCharges')
    );
  }
}
