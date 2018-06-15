import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Subscription,
  Observable
} from 'rxjs/Rx';
import { ServerStorage } from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsDataStatusFactory
} from '../../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '../../../../utilities';
import { ServersResourcesRepository } from '../../servers-resources.repository';
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
  public dataStatusFactory: McsDataStatusFactory<ServerStorage[]>;

  public storagesSubscription: Subscription;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  /**
   * Returns all the resource storages
   */
  public get resourceStorages(): ServerStorage[] {
    return !isNullOrEmpty(this.selectedVdc.storage) ?
      this.selectedVdc.storage : new Array();
  }

  constructor(
    _serversResourcesRespository: ServersResourcesRepository,
    _vdcService: VdcService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider
  ) {
    super(
      _serversResourcesRespository,
      _vdcService,
      _changeDetectorRef
    );
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.vdc.storage;
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
    this.storagesSubscription = this._serversResourcesRespository
      .findResourceStorage(this.selectedVdc)
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.dataStatusFactory.setSuccesfull(response);
      });
  }
}
