import { ChangeDetectorRef } from '@angular/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { McsTextContentProvider } from '@app/core';
import {
  unsubscribeSafely,
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';
import { McsResource } from '@app/models';
import { McsResourcesRepository } from '@app/services';
import { VdcService } from '../vdc/vdc.service';

export abstract class VdcDetailsBase {
  private _vdcSubscription: Subscription;
  private _resourcesUpdateSubscription: Subscription;
  private _destroySubject = new Subject<void>();

  /**
   * Selected VDC
   */
  private _selectedVdc: McsResource;
  public get selectedVdc(): McsResource { return this._selectedVdc; }
  public set selectedVdc(value: McsResource) {
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
    protected _resourcesRespository: McsResourcesRepository,
    protected _vdcService: VdcService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textContentProvider: McsTextContentProvider
  ) {
    this._selectedVdc = new McsResource();
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
   * Contains all the methods you need to execute
   * when the selected vdc changes
   */
  protected abstract vdcSelectionChange(): void;

  /**
   * This will listen to selected vdc
   * and get its value to vdc variable
   */
  private _listenToSelectedVdcStream(): void {
    this._vdcSubscription = this._vdcService.selectedVdcStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this._selectedVdc = response;
        this.vdcSelectionChange();
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listen to each resources data update
   * so that we could refresh the view of the corresponding component
   */
  private _listenToResourcesUpdate(): void {
    this._resourcesUpdateSubscription = this._resourcesRespository
      .dataChange()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
