import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  EventEmitter,
  Output,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  Subject,
  Observable
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IMcsDataChange,
  IMcsFormGroup
} from '@app/core';
import {
  unsubscribeSafely,
  Guid,
  getSafeProperty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  OrderIdType,
  McsServerCreateAddOnAntiVirus,
  McsServerCreateAddOnSqlServer,
  McsServerCreateAddOnInview,
  McsServerCreateAddOnHids,
  McsBackUpAggregationTarget,
  Os,
  McsOrderServerBackupAdd,
  McsOrderVmBackupAdd
} from '@app/models';
import { AddOnDetails } from './addons-model';

const ADDON_ANTI_VIRUS_ID = Guid.newGuid().toString();
const ADDON_HIDS_ID = Guid.newGuid().toString();
const ADDON_VM_BACKUP_ID = Guid.newGuid().toString();
const ADDON_SERVER_BACKUP_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent
  implements OnDestroy, OnInit, IMcsDataChange<Array<AddOnDetails<any>>> {
  public vmBackupAddOn = new AddOnDetails<McsOrderVmBackupAdd>();
  public serverBackupAddOn = new AddOnDetails<McsOrderServerBackupAdd>();
  public antiVirusAddOn = new AddOnDetails<McsServerCreateAddOnAntiVirus>();
  public sqlServerAddOn = new AddOnDetails<McsServerCreateAddOnSqlServer>();
  public hidsAddOn = new AddOnDetails<McsServerCreateAddOnHids>();
  public inviewAddOn = new AddOnDetails<McsServerCreateAddOnInview>();

  public aggregationTargets$: Observable<McsBackUpAggregationTarget[]>;

  @Input()
  public osType: Os;

  @Input()
  public storageSize: number;

  @Output()
  public dataChange = new EventEmitter<Array<AddOnDetails<any>>>();

  @ViewChild('fgAddOnBackupVm')
  private _fgAddOnBackupVm: IMcsFormGroup;

  @ViewChild('fgBackupServer')
  private _fgBackupServer: IMcsFormGroup;

  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._getAggregationTarget();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns true when the target to create is windows
   */
  public get isWindows(): boolean {
    return this.osType === Os.Windows;
  }

  /**
   * Returns true when the whole form is valid
   */
  public get isFormValid(): boolean {
    let vmBackupSelected = getSafeProperty(this.vmBackupAddOn, (obj) => obj.selected, false);
    let vmBackupFormValid = vmBackupSelected ?
      getSafeProperty(this._fgAddOnBackupVm, (obj) => obj.isValid(), false) : !vmBackupSelected;

    let serverBackupSelected = getSafeProperty(this.serverBackupAddOn, (obj) => obj.selected, false);
    let serverBackupFormValid = serverBackupSelected ?
      getSafeProperty(this._fgBackupServer, (obj) => obj.isValid(), false) : !serverBackupSelected;

    return vmBackupFormValid && serverBackupFormValid;
  }

  /**
   * Event that emits when vm backup is selected
   * @param collapse Collapse flag of the panel
   */
  public onToggleVmBackUp(collapse: boolean): void {
    this.vmBackupAddOn.selected = !collapse;
    this.vmBackupAddOn.typeId = OrderIdType.AddVmBackup;
    this.vmBackupAddOn.referenceId = ADDON_VM_BACKUP_ID;
    this.notifyDataChange();
  }

  /**
   * Event that emits when vm backup item has been changed
   * @param vmBackUpContent content to be set
   */
  public onChangeVmBackUpDetails(vmBackUpDetails: McsOrderVmBackupAdd): void {
    this.vmBackupAddOn.properties = vmBackUpDetails;
    this.notifyDataChange();
  }

  /**
   * Event that emits when server backup is selected
   * @param collapse Collapse flag of the panel
   */
  public onToggleServerBackUp(collapse: boolean): void {
    this.serverBackupAddOn.selected = !collapse;
    this.serverBackupAddOn.typeId = OrderIdType.AddServerBackup;
    this.serverBackupAddOn.referenceId = ADDON_SERVER_BACKUP_ID;
    this.notifyDataChange();
  }

  /**
   * Event that emits when server backup item has been changed
   * @param vmBackUpContent content to be set
   */
  public onChangeServerBackUpDetails(serverBackUpDetails: McsOrderServerBackupAdd): void {
    this.serverBackupAddOn.properties = serverBackUpDetails;
    this.notifyDataChange();
  }

  /**
   * Event that emits when antivirus is selected
   * @param checkboxRef boolean flag coming from the checkbox
   */
  public onToggleAntiVirus(checkboxRef: any): void {
    this.antiVirusAddOn.selected = checkboxRef.checked;
    this.antiVirusAddOn.typeId = OrderIdType.AddAntiVirus;
    this.antiVirusAddOn.referenceId = ADDON_ANTI_VIRUS_ID;
    this.notifyDataChange();
  }

  /**
   * Event that emits when Hids collapse panel has been toggled
   * @param collapse Collapse flag of the panel
   */
  public onToggleHids(collapse: boolean): void {
    this.hidsAddOn.selected = !collapse;
    this.hidsAddOn.typeId = OrderIdType.AddHids;
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
   * @param hidsDetails Updated hids details
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
      this.serverBackupAddOn,
      this.vmBackupAddOn,
      this.antiVirusAddOn,
      this.inviewAddOn,
      this.sqlServerAddOn,
      this.hidsAddOn
    ]);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get the list of aggregation target that will be used in backup
   */
  private _getAggregationTarget(): void {
    this.aggregationTargets$ = this._apiService.getBackupAggregationTargets()
      .pipe(
        map((response) => response && response.collection)
      );
  }
}
