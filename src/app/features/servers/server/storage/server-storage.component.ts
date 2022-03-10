import {
  of,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsServerPermission,
  McsTableDataSource2
} from '@app/core';
import { McsEvent } from '@app/events';
import { ServerManageStorage } from '@app/features-shared';
import {
  McsFeatureFlag,
  McsFilterInfo,
  McsJob,
  McsQueryParam,
  McsResourceStorage,
  McsServer,
  McsServerStorageDevice,
  McsServerStorageDeviceUpdate
} from '@app/models';
import {
  ComponentHandlerDirective,
  DialogConfirmation,
  DialogService
} from '@app/shared';
import {
  addOrUpdateArrayRecord,
  animateFactory,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition,
  Guid
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ServerDetailsBase } from '../server-details.base';

// Enumeration
export enum ServerDiskMethodType {
  None = 0,
  AddDisk = 1,
  ExpandDisk = 2,
  DeleteDisk = 3
}

// Constants
const SERVER_MAXIMUM_DISKS = 14;
const SERVER_DISK_NEW_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-server-storage',
  templateUrl: './server-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'block'
  }
})

export class ServerStorageComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public resourceStorages$: Observable<McsResourceStorage[]>;
  public manageStorage: ServerManageStorage;
  public selectedStorage: McsResourceStorage;
  public selectedDisk: McsServerStorageDevice;
  public isSorting: boolean;

  public readonly disksDataSource: McsTableDataSource2<McsServerStorageDevice>;
  public readonly disksColumns: McsFilterInfo[];

  private _sortDirection: string;
  private _sortField: string;
  private _inProgressDisk: string;
  private _newDisk: McsServerStorageDevice;
  private _serverDisksCache: Observable<McsServerStorageDevice[]>;
  private _destroySubject = new Subject<void>();
  private _serverDisksChange = new BehaviorSubject<McsServerStorageDevice[]>(null);
  private _snapshotCount: number;

  private _createDiskHandler: Subscription;
  private _updateDiskHandler: Subscription;
  private _deleteDiskHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public get storageIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STORAGE;
  }

  /**
   * Returns the enum type of the server disk method
   */
  public get serverDiskMethodTypeEnum(): any {
    return ServerDiskMethodType;
  }

  public get hasServerSnapshot(): boolean {
    return !isNullOrEmpty(this._snapshotCount);
  }

  /**
   * Returns the disk type based on the method currently invoked
   */
  private _diskMethodType: ServerDiskMethodType = ServerDiskMethodType.AddDisk;
  public get diskMethodType(): ServerDiskMethodType { return this._diskMethodType; }
  public set diskMethodType(value: ServerDiskMethodType) {
    if (this._diskMethodType !== value) {
      this._diskMethodType = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _dialogService: DialogService
  ) {
    super(_injector, _changeDetectorRef);
    this.manageStorage = new ServerManageStorage();
    this.diskMethodType = ServerDiskMethodType.AddDisk;
    this.disksDataSource = new McsTableDataSource2(this._getServerDisks.bind(this));
    this.disksColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'storageDevice' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'storageProfile' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'capacity' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
    ];
    this.disksDataSource.registerColumnsFilterInfo(this.disksColumns);
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._createDiskHandler);
    unsubscribeSafely(this._updateDiskHandler);
    unsubscribeSafely(this._deleteDiskHandler);
  }

  public getPowerStatePermission(server: McsServer): McsServerPermission {
    return new McsServerPermission(server);
  }

  /**
   * Event that emits when data in storage component has been changed
   * @param manageStorage Manage Storage content
   */
  public onStorageChanged(manageStorage: ServerManageStorage): void {
    if (isNullOrEmpty(manageStorage)) { return; }
    this.manageStorage = manageStorage;
    this.selectedStorage = this.manageStorage.storage;
  }

  /**
   * Returns true when the disks has reached its limitation
   */
  public hasReachedDisksLimit(server: McsServer): boolean {
    return !isNullOrEmpty(server.storageDevices) &&
      server.storageDevices.length >= SERVER_MAXIMUM_DISKS;
  }

  /**
   * Returns true when user can add disk
   */
  public canAddDisk(server: McsServer, resourceStorages: McsResourceStorage[]): boolean {
    return !this.hasReachedDisksLimit(server) && !isNullOrEmpty(resourceStorages);
  }

  /**
   * Returns true when there is a selected storage when adding disk and the input is valid
   */
  public get inputIsValid(): boolean {
    return !isNullOrEmpty(this.manageStorage)
      && this.manageStorage.valid;
  }

  /**
   * Returns true when the input is valid and the disk can be added
   */
  public get addDiskEnabled(): boolean {
    return !isNullOrEmpty(this.manageStorage)
      && this.inputIsValid
      && this.manageStorage.sizeMB > 0;
  }

  /**
   * Returns true when the Storage data has been changed and input is valid
   */
  public get expandDiskEnabled(): boolean {
    let storageHasChanged = this.manageStorage.sizeMB > this.selectedDisk.sizeMB;
    return storageHasChanged && this.inputIsValid;
  }

  /**
   * Opens the expand disk window
   * @param disk Disk to be edited
   */
  public openExpandDiskWindow(disk: McsServerStorageDevice): void {
    if (isNullOrEmpty(disk)) { return; }
    this.selectedDisk = disk;
    this.diskMethodType = ServerDiskMethodType.ExpandDisk;
  }

  
  public onSortChange(sortState: Sort, server: McsServer) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this._updateTableDataSource(server);
  }

  /**
   * Closes the expand disk window
   */
  public closeExpandDiskWindow(): void {
    this._resetStorageValues();
  }

  /**
   * Add disk to the current server
   */
  public addDisk(server: McsServer): void {
    let diskValues = new McsServerStorageDeviceUpdate();
    let diskName = this._translateService.instant('serverStorage.diskName');
    diskValues.storageProfile = this.manageStorage.storage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: server.id,
      name: `${diskName} ${server.storageDevices.length + 1}`,
      storageProfile: this.manageStorage.storage.name,
      sizeMB: this.manageStorage.sizeMB
    };

    this.apiService.createServerStorage(server.id, diskValues).subscribe();
  }

  /**
   * Deletes the selected disk
   * @param disk Storage disk to be deleted
   */
  public deleteDisk(server: McsServer, disk: McsServerStorageDevice): void {
    let dialogData = {
      data: disk,
      type: 'warning',
      title: this._translateService.instant('dialog.mediaDetach.title'),
      message: this._translateService.instant('dialog.mediaDetach.message', { media_name: disk.name })
    } as DialogConfirmation<McsServerStorageDevice>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    this.selectedDisk = disk;
    dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let diskValues = new McsServerStorageDeviceUpdate();
      diskValues.clientReferenceObject = {
        serverId: server.id,
        diskId: this.selectedDisk.id,
        storageProfile: this.selectedDisk.storageProfile,
        sizeMB: this.selectedDisk.sizeMB
      };
      this.apiService.deleteServerStorage(server.id, this.selectedDisk.id, diskValues).subscribe();
    });
  }

  /**
   * Expands the storage of the selected disk
   */
  public expandDisk(server: McsServer): void {
    let diskValues = new McsServerStorageDeviceUpdate();
    diskValues.name = this.selectedStorage.name;
    diskValues.storageProfile = this.selectedStorage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: server.id,
      diskId: this.selectedDisk.id
    };

    this.closeExpandDiskWindow();
    this.apiService.updateServerStorage(server.id, this.selectedDisk.id, diskValues).subscribe();
  }

  /**
   * Returns true when inputted disk is currently in-progress
   * @param disk Disk to be checked
   */
  public diskIsInProgress(disk: McsServerStorageDevice): boolean {
    if (isNullOrEmpty(disk)) { return false; }
    let newDiskId = getSafeProperty(this._newDisk, (obj) => obj.id);
    return disk.id === newDiskId || disk.id === this._inProgressDisk;
  }

  /**
   * Event that emits when the selected server has been changed
   * @param server Server details of the selected record
   */
  protected serverChange(server: McsServer): void {
    this.validateDedicatedFeatureFlag(server, McsFeatureFlag.DedicatedVmStorageView);
    this._resetStorageValues();
    this._updateTableDataSource(server);
    this._getServerSnapshots(server);

    let resourceId = getSafeProperty(server, (obj) => obj.platform.resourceId);
    this._getResourceStorages(resourceId);
  }

  /**
   * Initializes the data source of the disks table
   */
  private _updateTableDataSource(server?: McsServer): void {
    let queryParam = new McsQueryParam();
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    let serverDiskDataSource: Observable<McsServerStorageDevice[]>;
    if (!isNullOrEmpty(server)) {
      serverDiskDataSource = this.apiService.getServerStorage(server.id, queryParam).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((records) => this._serverDisksCache = of(records)));
    }

    let tableDataSource = (isNullOrEmpty(this._serverDisksCache) || !isNullOrEmpty(this._sortDirection)) ?
      serverDiskDataSource : this._serverDisksCache;

    let hasNewRecord = !isNullOrEmpty(this._newDisk) && !isNullOrEmpty(tableDataSource);
    if (hasNewRecord) {
      tableDataSource = tableDataSource.pipe(
        map((result) => {
          result = addOrUpdateArrayRecord(result, this._newDisk, false,
            (item) => item.id === SERVER_DISK_NEW_ID);
          return result;
        })
      );
    }

    tableDataSource.pipe(
      take(1),
      tap(dataRecords => this._serverDisksChange.next(dataRecords || []))
    ).subscribe();
  }

  /**
   * Reset storage form values to initial
   */
  private _resetStorageValues(): void {
    this.diskMethodType = ServerDiskMethodType.AddDisk;
    this._serverDisksCache = null;
    this.manageStorage = new ServerManageStorage();
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Register disk jobs events
   */
  private _registerEvents(): void {
    this._createDiskHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerDiskCreate, this._onCreateServerDisk.bind(this)
    );

    this._updateDiskHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerDiskUpdate, this._onUpdateServerDisk.bind(this)
    );

    this._deleteDiskHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerDiskDelete, this._onUpdateServerDisk.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobServerDiskCreate);
    this.eventDispatcher.dispatch(McsEvent.jobServerDiskUpdate);
    this.eventDispatcher.dispatch(McsEvent.jobServerDiskDelete);
  }

  /**
   * Event that emits when creating a server disk
   * @param job Emitted job content
   */
  private _onCreateServerDisk(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._newDisk = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._newDisk = new McsServerStorageDevice();
    this._newDisk.id = SERVER_DISK_NEW_ID;
    this._newDisk.name = job.clientReferenceObject.name;
    this._newDisk.sizeMB = job.clientReferenceObject.sizeMB;
    this._newDisk.storageProfile = job.clientReferenceObject.storageProfile;
    this._updateTableDataSource();
  }

  /**
   * Event that emits when updating a server disk
   * @param jobs Emitted job content
   */
  private _onUpdateServerDisk(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._inProgressDisk = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._inProgressDisk = job.clientReferenceObject.diskId;
  }

  /**
   * Get the resource storage to the selected server
   */
  private _getResourceStorages(resourceId: string): void {
    if (isNullOrEmpty(resourceId)) { return; }

    this.resourceStorages$ = this.apiService.getResourceStorages(resourceId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection)),
      shareReplay(1)
    );
  }

  /**
   * Gets the server disks based on observable
   */
   private _getServerDisks(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerStorageDevice>> {
    return this._serverDisksChange.pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response, response?.length)
      })
    );
  }

  private _getServerSnapshots(server: McsServer): void {
    this.apiService.getServerSnapshots(server.id).pipe(
      catchError((error) => {
        return throwError(error);
      })
    ).subscribe((snapshots) => {
      this._snapshotCount = getSafeProperty(snapshots, (obj) => obj.totalCollectionCount);
    });
  }
}
