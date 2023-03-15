import {
  forkJoin,
  Observable
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
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
  implements IFieldSelectBillingAccount, OnInit, OnChanges, OnDestroy {

  @Input()
  public selectedAllByDefault: boolean;

  @Input()
  public sourceType: 'billing-summaries' | 'billing-avd' = 'billing-summaries';

  public billingOptions$: Observable<McsOption[]>;

  private _billingAccountCount: number;
  private _billingAccountMap = new Map<string, McsBilling>();

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
    this._initializeBillingAccounts();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let typeChange = changes['sourceType'];
    if (isNullOrEmpty(typeChange)) { return; }

    // TODO: We want to remove it from now, since the obtainment of billing account
    // would get twice in api once this one is uncommented.
    // Otherwise, we can declare a subject pipe and do a exhaustMap instead
    // this._initializeBillingAccounts();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _initializeBillingAccounts(): void {
    this._getBillingAccountsAsync().pipe(
      tap(() => this._updateBillingAccountsDataSource())
    ).subscribe();
  }

  private _updateBillingAccountsDataSource(): void {
    let asyncFunc: () => Observable<McsOption[]>;

    switch (this.sourceType) {
      case 'billing-avd':
        asyncFunc = this._getBillingAvdSummariesAsync.bind(this);
        break;
      case 'billing-summaries':
      default:
        asyncFunc = this._getBillingSummariesAsync.bind(this);
        break;
    }

    this.billingOptions$ = asyncFunc().pipe(
      tap(options => {
        this._billingAccountCount = options?.length;
        this._changeDetectorRef.markForCheck();

        if (isNullOrEmpty(options) || !this.selectedAllByDefault) { return; }
        this._selectRecords(...options);
      })
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getBillingAvdSummariesAsync(): Observable<McsOption[]> {
    return forkJoin([
      this._getBillingSummariesAsync(),
      this._getBillingAccountsByDailyUsersAsync(),
      this._getBillingAccountsByDailyAverageAsync()
    ]).pipe(
      map(([summaryOptions, dailyUsersOptions, dailyAverageOptions]) => {
        let consolidatedOptions = new Array<McsOption>();

        [...(summaryOptions || []), ...(dailyUsersOptions || []), ...(dailyAverageOptions || [])]?.forEach(option => {
          let optionFound = consolidatedOptions.find(item => item.value === option.value);
          if (!isNullOrEmpty(optionFound)) { return; }
          consolidatedOptions.push(option);
        });
        return consolidatedOptions;
      })
    );
  }

  private _getBillingAccountsByDailyUsersAsync(): Observable<McsOption[]> {
    return this._apiService.getAvdDailyUsers().pipe(
      map((response) => {
        let dailyUsers = response?.collection || [];
        let filteredOptions = new Array<McsOption>();

        dailyUsers?.forEach(user => {
          if (isNullOrEmpty(user)) { return; }

          user.services?.forEach(service => {
            let billingAccount = this._billingAccountMap.get(service.billingAccountId);
            if (isNullOrEmpty(billingAccount) || !!filteredOptions?.find(option => option.value === billingAccount.id)) { return; }

            filteredOptions.push(createObject(McsOption, {
              text: `${billingAccount.name} (${billingAccount.id})`,
              value: billingAccount.id
            }));
          });
        });
        return filteredOptions;
      })
    );
  }

  private _getBillingAccountsByDailyAverageAsync(): Observable<McsOption[]> {
    return this._apiService.getAvdDailyAverageUsers().pipe(
      map((response) => {
        let averageUsers = response?.collection || [];
        let filteredOptions = new Array<McsOption>();

        averageUsers?.forEach(user => {
          if (isNullOrEmpty(user)) { return; }

          user.services?.forEach(service => {
            let billingAccount = this._billingAccountMap.get(service.billingAccountId);
            if (isNullOrEmpty(billingAccount) || !!filteredOptions?.find(option => option.value === billingAccount.id)) { return; }

            filteredOptions.push(createObject(McsOption, {
              text: `${billingAccount.name} (${billingAccount.id})`,
              value: billingAccount.id
            }));
          });
        });
        return filteredOptions;
      })
    );
  }

  private _getBillingSummariesAsync(): Observable<McsOption[]> {
    return this._apiService.getBillingSummaries().pipe(
      map((reportBillingCollection) => {
        let orderBilling = Array.from(this._billingAccountMap.values()) || [];
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
        return billingAccounts
      })
    );
  }

  private _getBillingAccountsAsync(): Observable<McsBilling[]> {
    return this._apiService.getBilling().pipe(
      tap(billings => {
        this._billingAccountMap.clear();
        let billingAccounts = billings?.collection || [];
        billingAccounts.forEach(billingAccount => {
          this._billingAccountMap.set(billingAccount.id, billingAccount);
        });
      }),
      map(billingRef => billingRef?.collection)
    );
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