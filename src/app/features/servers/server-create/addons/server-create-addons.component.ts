import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  McsGuid,
  IMcsDataChange
} from '@app/core';
import { unsubscribeSafely } from '@app/utilities';
import {
  OrderIdType,
  McsServerCreateAddOnAntiVirus,
  McsServerCreateAddOnSqlServer,
  McsServerCreateAddOnInview,
  Os,
} from '@app/models';
import { AddOnDetails } from './addons-model';

const ADDON_ANTI_MALWARE_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent
  implements OnDestroy, IMcsDataChange<Array<AddOnDetails<any>>> {
  public sqlServerAddOn = new AddOnDetails<McsServerCreateAddOnSqlServer>();
  public antiMalwareAddOn = new AddOnDetails<McsServerCreateAddOnAntiVirus>();
  public inviewAddOn = new AddOnDetails<McsServerCreateAddOnInview>();

  @Input()
  public osType: Os;

  @Output()
  public dataChange = new EventEmitter<Array<AddOnDetails<any>>>();
  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this.dataChange);
  }

  /**
   * Returns true when the target to create is windows
   */
  public get isWindows(): boolean {
    return this.osType === Os.Windows;
  }

  /**
   * Event that emits when Sql Server collapse panel has been toggled
   * @param collapse Collapse flag of the panel
   */
  public onToggleSqlServer(collapse: boolean): void {
    this.sqlServerAddOn.selected = !collapse;
    this.notifyDataChange();
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
    this.antiMalwareAddOn.properties = antiMalwareDetails;
    this.antiMalwareAddOn.typeId = OrderIdType.CreateAddOnAntiMalware;
    this.antiMalwareAddOn.referenceId = ADDON_ANTI_MALWARE_ID;
    this.notifyDataChange();
  }

  /**
   * Event that emits when Sql Server details has been changed
   * @param sqlServerDetails Updated Sql Server data
   */
  public onChangeSqlServerDetails(sqlServerDetails: McsServerCreateAddOnSqlServer): void {
    this.sqlServerAddOn.properties = sqlServerDetails;
    this.notifyDataChange();
  }

  /**
   * Event that emits when iview item has been changed
   * @param inviewContent Inview to be set
   */
  public onChangeInviewDetails(inviewContent: McsServerCreateAddOnInview): void {
    this.inviewAddOn.properties = inviewContent;
    this.inviewAddOn.selected = true;
    this.notifyDataChange();
  }

  /**
   * Notifies the changes on the event parameter
   */
  public notifyDataChange(): void {
    this.dataChange.next([
      this.antiMalwareAddOn,
      this.inviewAddOn,
      this.sqlServerAddOn
    ]);
    this._changeDetectorRef.markForCheck();
  }
}
