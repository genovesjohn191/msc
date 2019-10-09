import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { Subject } from 'rxjs';
import { IMcsDataChange } from '@app/core';
import {
  unsubscribeSafely,
  Guid
} from '@app/utilities';
import {
  OrderIdType,
  McsServerCreateAddOnAntiVirus,
  McsServerCreateAddOnSqlServer,
  McsServerCreateAddOnInview,
  McsServerCreateAddOnHids,
  Os
} from '@app/models';
import { AddOnDetails } from './addons-model';

const ADDON_ANTI_VIRUS_ID = Guid.newGuid().toString();
const ADDON_HIDS_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent
  implements OnDestroy, IMcsDataChange<Array<AddOnDetails<any>>> {
  public sqlServerAddOn = new AddOnDetails<McsServerCreateAddOnSqlServer>();
  public antiVirusAddOn = new AddOnDetails<McsServerCreateAddOnAntiVirus>();
  public hidsAddOn = new AddOnDetails<McsServerCreateAddOnHids>();

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
   * Event that emits when antivirus is selected
   * @param checkboxRef check
   */
  public onToggleAntiVirus(checkboxRef: any): void {
    this.antiVirusAddOn.selected = checkboxRef.checked;
    this.antiVirusAddOn.typeId = OrderIdType.CreateAddOnAntiVirus;
    this.antiVirusAddOn.referenceId = ADDON_ANTI_VIRUS_ID;
    this.notifyDataChange();
  }

  /**
   * Event that emits when Hids collapse panel has been toggled
   * @param collapse Collapse flag of the panel
   */
  public onToggleHids(collapse: boolean): void {
    this.hidsAddOn.selected = !collapse;
    this.hidsAddOn.typeId = OrderIdType.CreateAddOnHids;
    this.hidsAddOn.referenceId = ADDON_HIDS_ID;
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
   * Event that emits when Sql Server collapse panel has been toggled
   * @param collapse Collapse flag of the panel
   */
  public onToggleSqlServer(collapse: boolean): void {
    this.sqlServerAddOn.selected = !collapse;
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
   * Event that emits when Hids details has been changed
   * @param hidsDetails Updated Sql Server data
   */
  public onChangeHidsDetails(hidsDetails: McsServerCreateAddOnHids): void {
    this.hidsAddOn.properties = hidsDetails;
    this.notifyDataChange();
  }

  /**
   * Notifies the changes on the event parameter
   */
  public notifyDataChange(): void {
    this.dataChange.next([
      this.antiVirusAddOn,
      this.inviewAddOn,
      this.sqlServerAddOn,
      this.hidsAddOn
    ]);
    this._changeDetectorRef.markForCheck();
  }
}
