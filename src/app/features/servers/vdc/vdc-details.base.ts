import {
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  unsubscribeSafely,
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';
import { McsResource } from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { VdcService } from '../vdc/vdc.service';

export abstract class VdcDetailsBase {

  protected readonly apiService: McsApiService;
  protected readonly vdcService: VdcService;
  protected readonly translateService: TranslateService;
  protected readonly eventDispatcher: EventBusDispatcherService;

  private _vdcSubscription: Subscription;
  private _resourcesDataChangeHandler: Subscription;
  private _destroySubject = new Subject<void>();

  /**
   * Selected VDC
   */
  private _selectedVdc: McsResource;
  public get selectedVdc(): McsResource { return this._selectedVdc; }
  public set selectedVdc(value: McsResource) {
    this._selectedVdc = value;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Returns iops label placeholder
   */
  public get iopsLabelPlaceholder(): string {
    return this.translateService.instant('serversVdc.iopsLabel');
  }

  constructor(
    protected injector: Injector,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    this._selectedVdc = new McsResource();
    this._registerDataEvents();
  }

  protected initialize(): void {
    this._listenToSelectedVdcStream();
  }

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    unsubscribeSafely(this._vdcSubscription);
    unsubscribeSafely(this._resourcesDataChangeHandler);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Contains all the methods you need to execute
   * when the selected vdc changes
   */
  protected abstract vdcSelectionChange(): void;

  /**
   * This will listen to selected vdc
   * and get its value to vdc variable
   */
  private _listenToSelectedVdcStream(): void {
    this._vdcSubscription = this.vdcService.selectedVdcStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this._selectedVdc = response;
        this.vdcSelectionChange();
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Registers the data events
   */
  private _registerDataEvents(): void {
    this._resourcesDataChangeHandler = this.eventDispatcher.addEventListener(
      McsEvent.dataChangeResources, this._onResourcesDataChanged.bind(this));
  }

  /**
   * Event that emits when the resources data has been changed
   */
  private _onResourcesDataChanged(): void {
    this.changeDetectorRef.markForCheck();
  }
}
