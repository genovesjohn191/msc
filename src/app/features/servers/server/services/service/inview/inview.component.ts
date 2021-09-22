import { Subscription } from 'rxjs';

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  CoreConfig,
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  InviewLevel,
  McsJob,
  McsServer,
  RouteKey,
  ServerServicesAction,
  ServerServicesView
} from '@app/models';
import {
  replacePlaceholder,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ServerServiceActionDetail } from '../../strategy/server-service-action.context';
import { ServerServiceDetailBase } from '../server-service-detail.base';

@Component({
  selector: 'mcs-service-inview',
  templateUrl: './inview.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceInviewComponent extends ServerServiceDetailBase implements OnInit, OnDestroy {

  @Output()
  public raiseInviewLevel: EventEmitter<ServerServiceActionDetail>;

  private _inviewLabelMap: Map<InviewLevel, string>;
  private _onRaiseInviewHandler: Subscription;
  private _raiseInviewInProgress: boolean = false;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authIdentity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService,
    private _coreConfig: CoreConfig,
    private _translateService: TranslateService
  ) {
    super(ServerServicesView.Inview);
    this.raiseInviewLevel = new EventEmitter();
    this._createInviewMap();
  }

  ngOnInit(): void {
    this._registerEvents();
  }

  ngOnDestroy(): void {
    unsubscribeSafely(this._onRaiseInviewHandler);
  }


  /**
   * Returns specific description based on inview level
   * @param server server reference obj
   */
  public inviewLevelDescription(server: McsServer): string {
    if (!server.serviceChangeAvailable || this._raiseInviewInProgress) {
      return this._translateService.instant('serverServices.inview.inviewLevelDescription.unavailable');
    }

    return this._inviewLabelMap.get(server.inViewLevel);
  }

  /**
   * Returns true if the Inview level is Standard only and the Install base is set to true
   * @param server server reference obj
   */
  public raiseInviewButtonsShown(server: McsServer): boolean {
    return server.isInviewStandard && server.serviceChangeAvailable;
  }

  /**
   * Returns the macquarie inview url
   */
  public inviewUrl(): string {
    let inviewUrl = replacePlaceholder(
      CommonDefinition.INVIEW_URL,
      ['macviewUrl', 'companyId', 'inviewUrl', 'serviceId'],
      [this._coreConfig.macviewUrl, this._authIdentity.activeAccount.id, this._coreConfig.inviewUrl, this.server.serviceId]
    );

    return inviewUrl;
  }

  /**
   * Routes the user to the raise inview level ordering page
   * @param server server reference obj
   */
  public onRaiseInviewLevel(selectedServer: McsServer): void {
    this._navigationService.navigateTo(RouteKey.OrderServiceInviewRaise, [],
      { queryParams: {
        serviceId: selectedServer.serviceId
      }}
    );
  }

  /**
   * Sets the descriptions of different kind of inview level
   */
  private _createInviewMap(): void {
    this._inviewLabelMap = new Map();
    this._inviewLabelMap.set(
      InviewLevel.None, this._translateService.instant('serverServices.inview.inviewLevelDescription.none')
    );
    this._inviewLabelMap.set(
      InviewLevel.Standard, this._translateService.instant('serverServices.inview.inviewLevelDescription.standard')
    );
    this._inviewLabelMap.set(
      InviewLevel.Premium, this._translateService.instant('serverServices.inview.inviewLevelDescription.premium')
    );
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {

    this._onRaiseInviewHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerManagedRaiseInviewLevelEvent, this._onRaiseInviewLevel.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.jobServerManagedRaiseInviewLevelEvent);
  }

  /**
   * Listener for the raise inview level method call
   * @param job job object reference
   */
  private _onRaiseInviewLevel(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.inProgress) {
      this._raiseInviewInProgress = true;
      return;
    }
    this._raiseInviewInProgress = false;
    this._changeDetectorRef.markForCheck();
  }
}
