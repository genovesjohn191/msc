import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import { BillingServiceItem } from '@app/features-shared/report-widget/billing-service/billing-service-item';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectBillingService } from './field-select-billing-service';

@Component({
  selector: 'mcs-field-select-billing-service',
  templateUrl: './field-select-billing-service.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-select-billing-service'
  }
})
export class FieldSelectBillingServiceComponent
  extends FormFieldBaseComponent2<any>
  implements IFieldSelectBillingService, OnDestroy {

  private _billingServiceOptions: BillingServiceItem[] = [];
  private _initialBillingServices: BillingServiceItem[] = [];

  @Input()
  public get billingServices(): BillingServiceItem[] { return this._billingServiceOptions; }
  public set billingServices(services: BillingServiceItem[]) {
    this._initialBillingServices = services;
    this._billingServiceOptions = this._setBillingServiceOptions(this._initialBillingServices);
  }

  constructor(_injector: Injector) {
    super(_injector);
  }

  public get hasMultipleBillingServices(): boolean {
    return this._billingServiceOptions?.length > 1;
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _setBillingServiceOptions(services: BillingServiceItem[]): BillingServiceItem[] {
    let billingServices: BillingServiceItem[] = [];
    if (services?.length > 1) {
      services.forEach((service) => {
        let isServiceUnique = this._checkDuplicate(billingServices, service.serviceId);
        if (!isServiceUnique) { return; }
        billingServices.push(service);
      })
    }
    return billingServices;
  }

  private _checkDuplicate(services: BillingServiceItem[], serviceId: string): boolean {
    return services.findIndex(service => service.serviceId === serviceId) < 0;
  }
}