import { Observable } from 'rxjs';
import {
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  McsBilling,
  McsOption
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

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

  @Input()
  public selectedAllByDefault: boolean;

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

  public get allAccountsAreSelected(): boolean {
    let formValues = this.ngControl.control.value;
    return formValues?.length === this._billingAccountCount;
  }

  public ngOnInit(): void {
    this._getBillingAccounts();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _getBillingAccounts(): void {
    this.billingAccounts$ = this._apiService.getBilling().pipe(
      switchMap((orderBillingCollection) => {
        return this._apiService.getBillingSummaries().pipe(
          map((reportBillingCollection) => {
            let orderBilling = getSafeProperty(orderBillingCollection, (obj) => obj.collection) || [];
            let reportBilling = getSafeProperty(reportBillingCollection, (obj) => obj.collection) || [];

            let billingAccounts: McsOption[] = [];

            reportBilling.forEach((report) => {
              report.parentServices.forEach((parentService) => {
                let isParentUnique = this._checkDuplicate(billingAccounts, parentService.billingAccountId);
                if (!isParentUnique) { return; }
                let parentOptionName = this.setOptionName(orderBilling, parentService.billingAccountId);
                billingAccounts.push(createObject(McsOption, {
                  text: `${parentOptionName} (${parentService.billingAccountId})`,
                  value: parentService.billingAccountId
                }))
                parentService.childBillingServices.forEach((childService) => {
                  let isChildUnique = this._checkDuplicate(billingAccounts, childService.billingAccountId);
                  if (!isChildUnique) { return; }
                  let childOptionName = this.setOptionName(orderBilling, childService.billingAccountId);
                  billingAccounts.push(createObject(McsOption, {
                    text: `${childOptionName} (${childService.billingAccountId})`,
                    value: childService.billingAccountId
                  }))
                });
              })
            })

            this._billingAccountCount = billingAccounts?.length;
            this._changeDetectorRef.markForCheck();
            return billingAccounts
          }),
          tap(billingAccounts => {
            if (isNullOrEmpty(billingAccounts)) { return; }
            this.selectedAllByDefault && this._selectRecords(...billingAccounts);
          })
        )
      })
    )
  }

  private setOptionName(orderBilling: McsBilling[], accountId: string): string {
    if (orderBilling?.length === 0) { return 'Unknown'; }

    let associatedOrderBilling = orderBilling.find((order) => order.id === accountId);
    if (isNullOrEmpty(associatedOrderBilling)) {
      return 'Unknown';
    }
    return associatedOrderBilling.name;
  }

  private _checkDuplicate(billingAccounts: McsOption[], accountBillingId: string): boolean {
    return billingAccounts.findIndex(billAccount => billAccount.value === accountBillingId) < 0;
  }

  private _selectRecords(...billingAccountIds: McsOption[]): void {
    if (isNullOrEmpty(billingAccountIds)) { return; }
    let accountIds = billingAccountIds.map(account => account.value);
    this.ngControl.control.setValue(accountIds);
  }
}