import { ChangeDetectorRef } from '@angular/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServerResource } from '../models';
import { ServersResourcesRepository } from '../servers-resources.repository';
import { VdcService } from '../vdc/vdc.service';
import { McsTextContentProvider } from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject
} from '../../../utilities';

export abstract class VdcDetailsBase {
  private _vdcSubscription: Subscription;
  private _resourcesUpdateSubscription: Subscription;
  private _destroySubject = new Subject<void>();

  /**
   * Selected VDC
   */
  private _selectedVdc: ServerResource;
  public get selectedVdc(): ServerResource { return this._selectedVdc; }
  public set selectedVdc(value: ServerResource) {
    this._selectedVdc = value;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns iops label placeholder
   */
  public get iopsLabelPlaceholder(): string {
    return this._textContentProvider.content
      .servers.vdc.shared.iopsLabel;
  }

  constructor(
    protected _serversResourcesRespository: ServersResourcesRepository,
    protected _vdcService: VdcService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textContentProvider: McsTextContentProvider
  ) {
    this.selectedVdc = new ServerResource();
  }

  protected initialize(): void {
    this._listenToSelectedVdcStream();
    this._listenToResourcesUpdate();
  }

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    unsubscribeSafely(this._vdcSubscription);
    unsubscribeSafely(this._resourcesUpdateSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * This will listen to selected vdc
   * and get its value to vdc variable
   */
  private _listenToSelectedVdcStream(): void {
    this._vdcSubscription = this._vdcService.selectedVdcStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.selectedVdc = response;
      });
  }

  /**
   * Listen to each resources data update
   * so that we could refresh the view of the corresponding component
   */
  private _listenToResourcesUpdate(): void {
    this._resourcesUpdateSubscription = this._serversResourcesRespository
      .dataRecordsChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
