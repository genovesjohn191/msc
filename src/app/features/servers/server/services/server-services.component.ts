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
  distinctUntilChanged
} from 'rxjs/operators';
import {
  McsDataStatusFactory,
  McsDateTimeService,
  CoreConfig,
  McsAuthenticationIdentity,
  McsServerPermission,
  McsNavigationService
} from '@app/core';
import {
  animateFactory,
  replacePlaceholder,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import {
  McsServerOsUpdatesDetails,
  McsJob,
  McsServer,
  McsResource,
  OsUpdatesStatus,
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesInspectRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesRequest,
  DataStatus,
  InviewLevel,
  RouteKey,
  McsServerBackupVm,
  McsServerBackupServer,
  ServerServicesView
} from '@app/models';
import { FormMessage } from '@app/shared';
import { McsEvent } from '@app/events';
import { ServerDetailsBase } from '../server-details.base';
import {
  OsUpdatesStatusConfiguration,
  OsUpdatesActionDetails
} from './os-updates-status-configuration';

const OS_UPDATE_TIMEZONE = 'Australia/Sydney';
const OS_UPDATE_DATEFORMAT = `EEEE, d MMMM, yyyy 'at' h:mm a`;

@Component({
  selector: 'mcs-server-services',
  templateUrl: './server-services.component.html',
  animations: [
    animateFactory.fadeIn
  ]
})
export class ServerServicesComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public serverServicesView: ServerServicesView;
  public updateStatusConfiguration: OsUpdatesStatusConfiguration;
  public updatesDetails$: Observable<McsServerOsUpdatesDetails>;
  public serverBackUpVm$: Observable<McsServerBackupVm>;
  public serverBackUpServer$: Observable<McsServerBackupServer>;
  public serviceView$: Observable<ServerServicesView>;
  public dataStatusFactory: McsDataStatusFactory<McsServerOsUpdatesDetails>;
  public serverPermission: McsServerPermission;

  private _inspectOsUpdateHandler: Subscription;
  private _applyOsUpdateHandler: Subscription;
  private _onRaiseInviewHandler: Subscription;
  private _serviceViewChange = new BehaviorSubject<ServerServicesView>(ServerServicesView.Default);
  private _updateStartedDate: Date;
  private _raiseInviewInProgress: boolean = false;
  private _inviewLabelMap: Map<InviewLevel, string>;

  @ViewChild('formMessage', { static: false })
  private _formMessage: FormMessage;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _authIdentity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService,
    private _coreConfig: CoreConfig,
    private _dateTimeService: McsDateTimeService,
    private _translateService: TranslateService
  ) {
    super(_injector, _changeDetectorRef);
    this.dataStatusFactory = new McsDataStatusFactory();
    this.updateStatusConfiguration = new OsUpdatesStatusConfiguration();
  }

  public ngOnInit() {
    this._populateInviewMap();
    this._registerEvents();
    this._getServiceView();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._inspectOsUpdateHandler);
    unsubscribeSafely(this._applyOsUpdateHandler);
    unsubscribeSafely(this._onRaiseInviewHandler);
  }

  /**
   * Returns the clock icon key
   */
  public get clockKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOCK;
  }

  /**
   * Returns the chevron left key
   */
  public get chevronLeftKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns the warning svg key
   */
  public get warningSvgKey(): string {
    return CommonDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Returns the updates schedule label depending if there is schedule set or not
   */
  public get updatesScheduleLabel(): string {
    return this.updateStatusConfiguration.hasSchedule ?
      this._translateService.instant('serverServices.operatingSystemUpdates.updatesScheduleLabel.scheduled') :
      this._translateService.instant('serverServices.operatingSystemUpdates.updatesScheduleLabel.unscheduled');
  }

  /**
   * Returns the updates status subtitle label for Updated/Outdated/Error status
   * also returns the subtitle label for inspected server with status Analysing/Updating
   */
  public get updatesStatusSubtitleLabelDefault(): string {
    if (!this.updateStatusConfiguration.hasBeenInspectedBefore) {
      return this.updateStatusConfiguration.updatesStatusSubtitleLabel;
    }

    let formattedDate = this._dateTimeService.formatDate(
      new Date(this.updateStatusConfiguration.lastInspectedDate),
      OS_UPDATE_DATEFORMAT,
      OS_UPDATE_TIMEZONE
    );

    return replacePlaceholder(
      this.updateStatusConfiguration.updatesStatusSubtitleLabel,
      'lastInspectDate',
      formattedDate
    );
  }

  /**
   * Returns the updates status subtitle label for Updating status
   */
  public get updatesStatusSubtitleLabelUpdating(): string {
    let formattedDate = this._dateTimeService.formatDate(
      this._updateStartedDate,
      OS_UPDATE_DATEFORMAT,
      OS_UPDATE_TIMEZONE
    );

    return replacePlaceholder(
      this.updateStatusConfiguration.updatesStatusSubtitleLabel,
      'dateOfStart',
      formattedDate);
  }

  /**
   * Returns the enum type of the server services view
   */
  public get serverServicesViewOption(): typeof ServerServicesView {
    return ServerServicesView;
  }

  /**
   * Returns the enum type of the os update status
   */
  public get osUpdateStatusOption(): typeof OsUpdatesStatus {
    return OsUpdatesStatus;
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
  public onSaveSchedule(actionDetails: OsUpdatesActionDetails): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this._saveSchedule(actionDetails.server, actionDetails.requestData).pipe(
      tap(() => {
        this.refreshServerResource();
      })
    ).subscribe();
  }

  /**
   * Event listener for deleting the schedule
   * @param actionDetails includes the request data and the server reference
   */
  public onDeleteSchedule(actionDetails: OsUpdatesActionDetails): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this._deleteSchedule(actionDetails.server).pipe(
      tap(() => {
        this.refreshServerResource();
      })
    ).subscribe();
  }

  /**
   * Event listener for applying updates on the server
   * @param actionDetails includes the request data and the server reference
   */
  public onApplyUpdates(actionDetails: OsUpdatesActionDetails): void {
    this._serviceViewChange.next(ServerServicesView.Default);
    this._applyUpdates(actionDetails.server, actionDetails.requestData).subscribe();
  }

  /**
   * Checks for available os-update/s
   * @param server selected server object reference
   */
  public inspectForAvailableOsUpdates(server: McsServer): void {
    this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Analysing);
    let inspectRequest = new McsServerOsUpdatesInspectRequest();
    inspectRequest.clientReferenceObject = {
      serverId: server.id
    };
    this.apiService.inspectServerForAvailableOsUpdates(server.id, inspectRequest).subscribe();
  }

  /**
   * Disable the inspect now button if the server is powered off or processing
   * @param server selected server object reference
   */
  public inspectNowButtonDisabled(server: McsServer): boolean {
    return server.isPoweredOff || server.isProcessing;
  }

  /**
   * Disable the configure button if the server is processing, being analyse or update
   * @param server selected server object reference
   */
  public configureButtonDisabled(server: McsServer): boolean {
    return this.updateStatusConfiguration.configureScheduleButtonDisabled || server.isProcessing;
  }

  /**
   * Returns specific description based on inview level
   * @param server selected server object reference
   */
  public inviewLevelDescription(server: McsServer): string {
    if (!server.serviceChangeAvailable || this._raiseInviewInProgress) {
      return this._translateService.instant('serverServices.inview.inviewLevelDescription.unavailable');
    }

    return this._inviewLabelMap.get(server.inViewLevel);
  }

  /**
   * Returns true if the Inview level is Standard only and the Install base is set to true
   */
  public raiseInviewButtonsShown(server: McsServer): boolean {
    return server.isInviewStandard && server.serviceChangeAvailable;
  }

  /**
   * Returns true if the Inview level is not None
   */
  public goToInviewButtonsShown(server: McsServer): boolean {
    return !server.isInviewNone;
  }

  /**
   * Returns the macquarie inview url
   */
  public inviewUrl(server: McsServer): string {
    let inviewUrl = replacePlaceholder(
      CommonDefinition.INVIEW_URL,
      ['macviewUrl', 'companyId', 'inviewUrl', 'serviceId'],
      [this._coreConfig.macviewUrl, this._authIdentity.activeAccount.id, this._coreConfig.inviewUrl, server.serviceId]
    );

    return inviewUrl;
  }

  /**
   * Routes the user to the raise inview level ordering page
   */
  public raiseInviewLevel(server: McsServer): void {
    this.eventDispatcher.dispatch(McsEvent.serverRaiseInviewSelected, server);
    this._navigationService.navigateTo(RouteKey.OrderServiceInviewRaise);
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
    this.serverPermission = new McsServerPermission(server);
    this._getServerUpdateDetails(server.id);
    this._getServerBackupVm(server.id);
    this._getServerBackupServer(server.id);
  }

  /**
   * Event that emtis when the resource has been changed
   * @param resource Resource details of the selected server
   */
  protected resourceChange(_resource: McsResource): void {
    this._changeDetectorRef.markForCheck();
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
    this._onRaiseInviewHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerManagedRaiseInviewLevelEvent, this._onRaiseInviewLevel.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobServerOsUpdateInspect);
    this.eventDispatcher.dispatch(McsEvent.jobServerOsUpdateApply);
    this.eventDispatcher.dispatch(McsEvent.jobServerManagedRaiseInviewLevelEvent);
  }

  /**
   * Sets the descriptions of different kind of inview level
   */
  private _populateInviewMap(): void {
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
   * Returns the selected server as an observable
   */
  private _getServiceView(): void {
    this.serviceView$ = this._serviceViewChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Listener for the inspect server for os-updates method call
   * @param job job object reference
   */
  private _onInspectForAvailableOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
      return;
    }

    // Refresh everything when all job is done
    if (job.inProgress) {
      this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Analysing);
    } else {
      this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Unanalysed);
      this.refreshServerResource();
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener for the apply os updates on server method call
   * @param job job object reference
   */
  private _onApplyServerOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
      return;
    }

    // Refresh everything when all job is done
    if (job.inProgress) {
      this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Updating);
      this._updateStartedDate = job.startedOn;
    } else {
      this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Updated);
      this.refreshServerResource();
    }
    this._changeDetectorRef.markForCheck();
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

  /**
   * Get the latest update details of the server from api
   * @param id job object reference
   */
  private _getServerUpdateDetails(id: string): void {

    this.dataStatusFactory.setInProgress();
    this.updatesDetails$ = this.apiService.getServerOsUpdatesDetails(id).pipe(
      catchError((error) => {
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
        this.dataStatusFactory.setError();
        return throwError(error);
      }),
      shareReplay(1),
      tap((serverOsUpdateDetails) => {
        this.dataStatusFactory.setSuccessful(serverOsUpdateDetails);
        this.updateStatusConfiguration.setOsUpdateDetails(serverOsUpdateDetails);
        if (this.updateStatusConfiguration.status === OsUpdatesStatus.Analysing
          || this.updateStatusConfiguration.status === OsUpdatesStatus.Updating) {
          return;
        }
        if (!this.updateStatusConfiguration.hasBeenInspectedBefore) {
          this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Unanalysed);
          return;
        }
        let status = serverOsUpdateDetails.updateCount > 0 ?
          OsUpdatesStatus.Outdated : OsUpdatesStatus.Updated;
        this.updateStatusConfiguration.setOsUpdateStatus(status);
      })
    );
  }

  /**
   * Apply the selected os updates on the server
   * @param server selected server reference
   * @param request request containing the update ids
   */
  private _applyUpdates(server: McsServer, request: McsServerOsUpdatesRequest): Observable<McsJob> {
    return this.apiService.updateServerOs(server.id, request);
  }

  /**
   * Save/Update os-update schedule based from serverId and request param
   * @param server selected server reference
   * @param request request containing the cron (schedule)
   */
  private _saveSchedule(
    server: McsServer,
    request: McsServerOsUpdatesScheduleRequest
  ): Observable<McsServerOsUpdatesSchedule> {
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
}
