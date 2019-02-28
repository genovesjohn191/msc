import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  distinctUntilChanged,
  debounceTime,
  takeUntil
} from 'rxjs/operators';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsServerCreateAddOnAntiVirus,
  McsOrderItemCreate
} from '@app/models';
import { AddOnsModel } from './addons-model';
import { ServerCreateFlyweightContext } from '../server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent implements OnInit, OnDestroy {
  public addOnsDetails: AddOnsModel = new AddOnsModel();

  private _antiMalwareIsEnabled: boolean;
  private _selectedItemsChanges = new Subject<any[]>();
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext
  ) {
  }

  public ngOnInit() {
    this._subscribeToSelectedAddOnsChanges();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public antiMalwareCheckedChange(collapse: boolean): void {
    this._antiMalwareIsEnabled = !collapse;
    this._notifyPricingChanges();
  }

  public onChangeAntiMalwareDetails(antiMalwareDetails: McsServerCreateAddOnAntiVirus): void {
    this.addOnsDetails.setAntiMalwareOrderDetails(
      antiMalwareDetails,
      this._serverCreateFlyweightContext.orderReferenceId
    );
    this._notifyPricingChanges();
  }

  private _notifyPricingChanges(): void {
    let selectedAddOns: McsOrderItemCreate[] = [];

    // Check and add the anti malware
    if (this._antiMalwareIsEnabled) {
      selectedAddOns.push(this.addOnsDetails.antiMalware);
    }
    this._selectedItemsChanges.next(selectedAddOns);
  }

  private _subscribeToSelectedAddOnsChanges(): void {
    this._selectedItemsChanges.pipe(
      takeUntil(this._destroySubject),
      debounceTime(2000),
      distinctUntilChanged((first, second) => JSON.stringify(first) === JSON.stringify(second))
    ).subscribe((response) => {
      if (isNullOrEmpty(this._serverCreateFlyweightContext.order)) { return; }
      this._updatedAddOns(response);
      this._changeDetectorRef.markForCheck();
    });
  }

  private _updatedAddOns(selectedAddOns: McsOrderItemCreate[]): void {
    this._serverCreateFlyweightContext.updateAddOns(selectedAddOns).subscribe();
  }
}
