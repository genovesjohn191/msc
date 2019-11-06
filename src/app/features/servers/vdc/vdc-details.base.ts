import {
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Subscription,
  Observable
} from 'rxjs';
import {
  take,
  tap,
  shareReplay
} from 'rxjs/operators';
import { unsubscribeSafely } from '@app/utilities';
import { McsResource } from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { VdcService } from '../vdc/vdc.service';

export abstract class VdcDetailsBase {
  public resource$: Observable<McsResource>;

  protected readonly apiService: McsApiService;
  protected readonly vdcService: VdcService;
  protected readonly translateService: TranslateService;
  protected readonly eventDispatcher: EventBusDispatcherService;

  private _resourcesDataChangeHandler: Subscription;

  constructor(
    protected injector: Injector,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    this.apiService = injector.get(McsApiService);
    this.vdcService = injector.get(VdcService);
    this.translateService = injector.get(TranslateService);
    this.eventDispatcher = injector.get(EventBusDispatcherService);

    this._registerDataEvents();
    this._subscribesToResource();
  }

  /**
   * Returns iops label placeholder
   */
  public get iopsLabelPlaceholder(): string {
    return this.translateService.instant('serversVdc.iopsLabel');
  }

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    unsubscribeSafely(this._resourcesDataChangeHandler);
  }

  /**
   * Contains all the methods you need to execute
   * when the selected vdc changes
   */
  protected abstract resourceChange(resource: McsResource): void;

  /**
   * This will listen to selected vdc
   * and get its value to vdc variable
   */
  private _subscribesToResource(): void {
    this.resource$ = this.vdcService.getResourceDetails().pipe(
      tap((resourceDetails) => this.resourceChange(resourceDetails)),
      shareReplay(1),
      take(1)
    );
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
