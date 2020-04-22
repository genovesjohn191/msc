import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  OnInit,
  Injector
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  throwError,
  Subscription,
  BehaviorSubject
} from 'rxjs';
import {
  tap,
  shareReplay,
  catchError,
  concatMap,
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import { McsDataStatusFactory } from '@app/core';
import {
  animateFactory,
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty
} from '@app/utilities';
import {
  McsServerOsUpdatesDetails,
  McsJob,
  McsServer,
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesSchedule,
  DataStatus,
  McsServerBackupVm,
  McsServerBackupServer,
  ServerServicesView,
  HostSecurityAgentStatus,
  McsServerHostSecurityHidsItem,
  McsServerHostSecurityAntiVirusItem
} from '@app/models';
import { FormMessage } from '@app/shared';
import { McsEvent } from '@app/events';
import { ServerDetailsBase } from '../server-details.base';
import {
  ServerServiceActionDetail,
  ServerServiceActionContext
} from './strategy/server-service-action.context';

type ServerHostSecurityStatusDetails = {
  icon: string;
  status: HostSecurityAgentStatus;
  label?: string;
  hids?: McsServerHostSecurityHidsItem;
  antiVirus?: McsServerHostSecurityAntiVirusItem;
};

@Component({
  selector: 'mcs-server-services',
  templateUrl: './server-services.component.html',
  animations: [
    animateFactory.fadeIn
  ]
})
export class ServerServicesComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public serverServicesView: ServerServicesView;
  public updatesDetails$: Observable<McsServerOsUpdatesDetails>;
  public serverBackUpVm$: Observable<McsServerBackupVm>;
  public serverBackUpServer$: Observable<McsServerBackupServer>;
  public serverHostSecurityDetails$: Observable<ServerHostSecurityStatusDetails>;
  public serviceView$: Observable<ServerServicesView>;
  public currentJob$: Observable<McsJob>;
  public dataStatusFactory: McsDataStatusFactory<McsServerOsUpdatesDetails>;

  private _inspectOsUpdateHandler: Subscription;
  private _applyOsUpdateHandler: Subscription;
  private _serviceViewChange = new BehaviorSubject<ServerServicesView>(ServerServicesView.Default);
  private _currentJobMapChange: BehaviorSubject<McsJob>;
  private _strategyActionContext: ServerServiceActionContext;
  private _hostSecurityStatusDetailsMap: Map<HostSecurityAgentStatus, ServerHostSecurityStatusDetails>;

  @ViewChild('formMessage', { static: false })
  private _formMessage: FormMessage;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService
  ) {
    super(_injector, _changeDetectorRef);
    this._currentJobMapChange = new BehaviorSubject<McsJob>(null);
    this._strategyActionContext = new ServerServiceActionContext(_injector);
    this.dataStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this._registerEvents();
    this._subscribeToServiceView();
    this._subscribeToJobsMap();
    this._createStatusMap();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._inspectOsUpdateHandler);
    unsubscribeSafely(this._applyOsUpdateHandler);
  }

  /**
   * Returns the chevron left key
   */
  public get chevronLeftKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns the enum type of the server services view
   */
  public get serverServicesViewOption(): typeof ServerServicesView {
    return ServerServicesView;
  }

  /**
   * Sets the view type of server services
   * @param viewMode View mode to be set as displayed
   */
  public setViewMode(serviceView: ServerServicesView) {
    this._serviceViewChange.next(serviceView);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event listener for saving the schedule
   * @param actionDetails includes the request data and the server reference
   */
  public onSaveSchedule(actionDetails: ServerServiceActionDetail): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this._saveSchedule(actionDetails.server, actionDetails.payload).pipe(
      tap(() => {
        this.refreshServerResource();
      })
    ).subscribe();
  }

  /**
   * Event listener for deleting the schedule
   * @param actionDetails includes the request data and the server reference
   */
  public onDeleteSchedule(actionDetails: ServerServiceActionDetail): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this._deleteSchedule(actionDetails.server).pipe(
      tap(() => {
        this.refreshServerResource();
      })
    ).subscribe();
  }

  /**
   * Event listener for applying updates on the server
   * @param detail obj detail reference of the action
   */
  public onPatchUpdates(detail: ServerServiceActionDetail): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this.executeAction(detail);
  }

  /**
   * Execute an action based on the provided type
   * @param detail obj detail reference of the action
   */
  public executeAction(detail: ServerServiceActionDetail): void {
    this._strategyActionContext.setActionStrategyByType(detail);
    this._strategyActionContext.executeAction();
  }

  /**
   * Routes the user to the corresponding service view
   */
  public onViewChange(serviceView: ServerServicesView): void {
    this._serviceViewChange.next(serviceView);
  }

  /**
   * Event that emits when the selected server has been changed
   * @param server Server details of the selected record
   */
  protected serverChange(server: McsServer): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this._getServerOsUpdatesDetails(server.id);
    this._getServerBackupVm(server.id);
    this._getServerBackupServer(server.id);
    this._getServerHostSecurity(server.id);
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._inspectOsUpdateHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerOsUpdateInspect, this._onInspectForAvailableOsUpdates.bind(this)
    );
    this._applyOsUpdateHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerOsUpdateApply, this._onApplyServerOsUpdates.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobServerOsUpdateInspect);
    this.eventDispatcher.dispatch(McsEvent.jobServerOsUpdateApply);
  }

  /**
   * Listener for the inspect server for os-updates method call
   * @param job job object reference
   */
  private _onInspectForAvailableOsUpdates(job: McsJob): void {
    this._updateJobMap(job);
  }

  /**
   * Listener for the apply os updates on server method call
   * @param job job object reference
   */
  private _onApplyServerOsUpdates(job: McsJob): void {
    this._updateJobMap(job);
  }

  /**
   * Refreshes the resource when the Job received is completed
   * @param job job object reference
   */
  private _updateJobMap(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    this._currentJobMapChange.next(job);
    if (job.dataStatus === DataStatus.Error) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this.refreshServerResource();
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initializes the server hids status map
   */
  private _createStatusMap(): void {
    this._hostSecurityStatusDetailsMap = new Map();

    this._hostSecurityStatusDetailsMap.set(HostSecurityAgentStatus.Active, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      status: HostSecurityAgentStatus.Active
    });
    this._hostSecurityStatusDetailsMap.set(HostSecurityAgentStatus.Warning, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      status: HostSecurityAgentStatus.Warning
    });
    this._hostSecurityStatusDetailsMap.set(HostSecurityAgentStatus.Inactive, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      status: HostSecurityAgentStatus.Inactive
    });
    this._hostSecurityStatusDetailsMap.set(HostSecurityAgentStatus.Error, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      status: HostSecurityAgentStatus.Error
    });
  }


  /**
   * Save/Update os-update schedule based from serverId and request param
   * @param server selected server reference
   * @param request request containing the cron (schedule)
   */
  private _saveSchedule(server: McsServer, request: McsServerOsUpdatesScheduleRequest): Observable<McsServerOsUpdatesSchedule> {
    // TODO: extract and put in the appropriate strategy action
    // TODO : find a better way of saving, currently deleting all then saving the new schedule
    return this.apiService.deleteServerOsUpdatesSchedule(server.id).pipe(
      catchError((httpError) => {
        this._formMessage.showMessage('error', {
          messages: httpError.errorMessages,
          fallbackMessage: this._translateService.instant('serverServices.operatingSystemUpdates.updateErrorMessage')
        });
        return throwError(httpError);
      }),
      concatMap(() => {
        return this.apiService.updateServerOsUpdatesSchedule(server.id, request).pipe(
          tap(() => {
            this._formMessage.showMessage('success', {
              messages: this._translateService.instant('serverServices.operatingSystemUpdates.updateSuccessMessage')
            });
          })
        );
      })
    );
  }

  /**
   * Deletes the os-update schedule of the server
   * @param server selected server reference
   */
  private _deleteSchedule(server: McsServer): Observable<boolean> {
    // TODO: extract and put in the appropriate strategy action
    return this.apiService.deleteServerOsUpdatesSchedule(server.id).pipe(
      catchError((httpError) => {
        this._formMessage.showMessage('error', {
          messages: httpError.errorMessages,
          fallbackMessage: this._translateService.instant('serverServices.operatingSystemUpdates.deleteErrorMessage')
        });
        return throwError(httpError);
      }),
      tap(() => {
        this._formMessage.showMessage('success', {
          messages: this._translateService.instant('serverServices.operatingSystemUpdates.deleteSuccessMessage')
        });
      })
    );
  }

  /**
   * Returns the selected server as an observable
   */
  private _subscribeToServiceView(): void {
    this.serviceView$ = this._serviceViewChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Returns the selected server as an observable
   */
  private _subscribeToJobsMap(): void {
    this.currentJob$ = this._currentJobMapChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Get the latest os updates details of the server from api
   * @param id job object reference
   */
  private _getServerOsUpdatesDetails(id: string): void {
    this.dataStatusFactory.setInProgress();
    this.updatesDetails$ = this.apiService.getServerOsUpdatesDetails(id).pipe(
      catchError((error) => {
        this.dataStatusFactory.setError();
        return throwError(error);
      }),
      shareReplay(1),
      tap((serverOsUpdateDetails) => this.dataStatusFactory.setSuccessful(serverOsUpdateDetails))
    );
  }

  /**
   * Get the vm backup summary of the server
   * @param id selected server id
   */
  private _getServerBackupVm(id: string): void {
    this.serverBackUpVm$ = this.apiService.getServerBackupVm(id);
  }

  /**
   * Get the server backup summary of the server
   * @param id selected server id
   */
  private _getServerBackupServer(id: string): void {
    this.serverBackUpServer$ = this.apiService.getServerBackupServer(id);
  }

  /**
   * Get the host security details of the server
   * @param id selected server id
   */
  private _getServerHostSecurity(id: string): void {
    this.serverHostSecurityDetails$ = this.apiService.getServerHostSecurity(id).pipe(
      map((hostSecurity) => {
        let agentStatus = getSafeProperty(hostSecurity, (obj) => obj.agentStatus);
        if (this._hostSecurityStatusDetailsMap.has(agentStatus)) {
          let hostSecurityDetails: ServerHostSecurityStatusDetails = this._hostSecurityStatusDetailsMap.get(hostSecurity.agentStatus);
          let activeLabel = this._translateService.instant('serverServices.hostSecurity.activeLabel.agentConfigured');
          hostSecurityDetails.label = hostSecurityDetails.status !== HostSecurityAgentStatus.Active ?
            getSafeProperty(hostSecurity, (obj) => obj.agentStatusMessages[0], '') : activeLabel;
          hostSecurityDetails.hids = hostSecurity.hids;
          hostSecurityDetails.antiVirus = hostSecurity.antiVirus;
          return hostSecurityDetails;
        }
      })
    );
  }
}
