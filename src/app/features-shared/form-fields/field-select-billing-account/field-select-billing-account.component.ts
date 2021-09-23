import { Observable } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  map,
  switchMap
} from 'rxjs/operators';
import {
  McsBilling,
  McsOption
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import { McsApiService } from '@app/services';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectBillingAccount } from './field-select-billing-account';


@Component({
  selector: 'mcs-field-select-billing-account',
  templateUrl: './field-select-billing-account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-select-billing-account'
  }
})
export class FieldSelectBillingAccountComponent
  extends FormFieldBaseComponent2<string[]>
  implements IFieldSelectBillingAccount, OnInit, OnDestroy {

  public billingAccounts$: Observable<McsOption[]>;

  private _billingAccountCount: number;

  constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_injector);
  }

  public get hasMultipleBillingAccount(): boolean {
    return this._billingAccountCount > 1;
  }

  public ngOnInit(): void {
    this._getBillingAccounts();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public valueChange(billingAccountId): void {
    this.writeValue(billingAccountId.value);
  }

  private _getBillingAccounts(): void {
    this.billingAccounts$ = this._apiService.getBilling().pipe(
      switchMap((orderBillingCollection) => {
        return this._apiService.getBillingSummaries().pipe(
          map((reportBillingCollection) => {
            let orderBilling = getSafeProperty(orderBillingCollection, (obj) => obj.collection) || [];
            let reportBilling = getSafeProperty(reportBillingCollection, (obj) => obj.collection) || [];

            let billingAccounts: McsOption[] = [];

            orderBilling.forEach((order) => {
              reportBilling.forEach((report) => {
                report.parentServices.forEach((parentService) => {
                  let isParentUnique = this._checkDuplicate(billingAccounts, parentService.billingAccountId);
                  if (!isParentUnique) { return; }
                  let parentOptionText = this.setOptionText(order, parentService.billingAccountId);
                  billingAccounts.push(createObject(McsOption, {
                    text: `${parentOptionText} (${parentService.billingAccountId})`,
                    value: parentService.billingAccountId
                  }))
                  parentService.childBillingServices.forEach((childService) => {
                    let isChildUnique = this._checkDuplicate(billingAccounts, childService.billingAccountId);
                    if (!isChildUnique) { return; }
                    let childOptionText = this.setOptionText(order, childService.billingAccountId);
                    billingAccounts.push(createObject(McsOption, {
                      text: `${childOptionText} (${childService.billingAccountId})`,
                      value: childService.billingAccountId
                    }))
                  });
                })
              })
            })
            this._billingAccountCount = billingAccounts?.length;
            this._changeDetectorRef.markForCheck();
            return billingAccounts
          })
        )
      })
    )
  }

  private setOptionText(order: McsBilling, accountId: string): string {
    if (order.id === accountId) {
      return order.name;
    }
    return 'Unknown';
  }

  private _checkDuplicate(billingAccounts: McsOption[], accountBillingId: string): boolean {
    return billingAccounts.findIndex(billAccount => billAccount.value === accountBillingId) < 0;
  }
}