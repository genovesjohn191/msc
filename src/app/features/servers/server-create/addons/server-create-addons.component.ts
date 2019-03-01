import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { McsGuid } from '@app/core';
import {
  unsubscribeSafely,
  McsDataChange
} from '@app/utilities';
import {
  McsServerCreateAddOnAntiVirus,
  OrderIdType,
} from '@app/models';
import { AddOnDetails } from './addons-model';

const ADDON_ANTI_MALWARE_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent implements OnDestroy, McsDataChange<AddOnDetails[]> {
  public antiMalwareAddOn: AddOnDetails;

  @Output()
  public dataChange = new EventEmitter<AddOnDetails[]>();
  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.antiMalwareAddOn = new AddOnDetails();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits when antimalware collapse panel has been toggled
   * @param collapse Collapse flag of the panel
   */
  public onToggleAntiMalware(collapse: boolean): void {
    this.antiMalwareAddOn.selected = !collapse;
    this.notifyDataChange();
  }

  /**
   * Event that emits when anti malware details has been changed
   * @param antiMalwareDetails Updated Anti malware data
   */
  public onChangeAntiMalwareDetails(antiMalwareDetails: McsServerCreateAddOnAntiVirus): void {
    this.antiMalwareAddOn.addOnContent = antiMalwareDetails;
    this.antiMalwareAddOn.typeId = OrderIdType.CreateAddOnAntiMalware;
    this.antiMalwareAddOn.referenceId = ADDON_ANTI_MALWARE_ID;
    this.notifyDataChange();
  }

  /**
   * Notifies the changes on the event parameter
   */
  public notifyDataChange(): void {
    this.dataChange.next([this.antiMalwareAddOn]);
    this._changeDetectorRef.markForCheck();
  }
}
