import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Subscription,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsDataStatusFactory
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { McsResourceStorage } from '@app/models';
import { ResourcesRepository } from '@app/features/resources';
import { VdcService } from '../vdc.service';
import { VdcDetailsBase } from '../vdc-details.base';

@Component({
  selector: 'mcs-vdc-storage',
  templateUrl: './vdc-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class VdcStorageComponent extends VdcDetailsBase implements OnInit, OnDestroy {
  public textContent: any;
  public dataStatusFactory: McsDataStatusFactory<McsResourceStorage[]>;

  public storagesSubscription: Subscription;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  /**
   * Returns all the resource storages
   */
  public get resourceStorages(): McsResourceStorage[] {
    return !isNullOrEmpty(this.selectedVdc.storage) ?
      this.selectedVdc.storage : new Array();
  }

  constructor(
    _resourcesRespository: ResourcesRepository,
    _vdcService: VdcService,
    _changeDetectorRef: ChangeDetectorRef,
    _textContentProvider: McsTextContentProvider
  ) {
    super(
      _resourcesRespository,
      _vdcService,
      _changeDetectorRef,
      _textContentProvider
    );
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.vdc.storage;
    this.initialize();
    this._getVdcStorage();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this.storagesSubscription);
  }

  /**
   * Get the current vdc storage
   */
  private _getVdcStorage(): void {
    let hasResource = getSafeProperty(this.selectedVdc, (obj) => obj.id);
    if (!hasResource) { return; }

    unsubscribeSafely(this.storagesSubscription);
    this.dataStatusFactory.setInProgress();
    this.storagesSubscription = this._resourcesRespository
      .findResourceStorage(this.selectedVdc)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this.dataStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => this.dataStatusFactory.setSuccessful(response));
  }
}
