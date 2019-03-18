import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject,
  Observable,
  throwError
} from 'rxjs';
import {
  takeUntil,
  tap,
  shareReplay,
  catchError,
  concatMap
} from 'rxjs/operators';
import {
  McsErrorHandlerService,
  McsLoadingService,
  CoreDefinition,
  McsNotificationEventsService,
  McsAccessControlService,
  McsDataStatusFactory,
  McsDateTimeService
} from '@app/core';
import {
  McsResourcesRepository,
  McsServersRepository
} from '@app/services';
import {
  animateFactory,
  unsubscribeSubject,
  isNullOrEmpty,
  replacePlaceholder
} from '@app/utilities';
import {
  McsServerOsUpdatesDetails,
  McsJob,
  DataStatus,
  McsServer,
  McsResource,
  OsUpdatesStatus,
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesRequest
} from '@app/models';
import { FormMessage } from '@app/shared';
import { ServerDetailsBase } from '../server-details.base';
import { ServerService } from '../server.service';
import {
  OsUpdatesStatusConfiguration,
  OsUpdatesActionDetails,
  ServerServicesView
} from './os-updates-status-configuration';
import { ServersService } from '../../servers.service';

const OS_UPDATE_TIMEZONE = 'Australia/Sydney';
const OS_UPDATE_DATEFORMAT = "EEEE, d MMMM, yyyy 'at' h:mm a";
@Component({
  selector: 'mcs-server-services',
  templateUrl: './server-services.component.html',
  animations: [
    animateFactory.fadeIn
  ]
})
export class ServerServicesComponent extends ServerDetailsBase implements OnDestroy {
  public serverServicesView: ServerServicesView;
  public updateStatusConfiguration: OsUpdatesStatusConfiguration;
  public updatesDetails$: Observable<McsServerOsUpdatesDetails>;
  public dataStatusFactory: McsDataStatusFactory<McsServerOsUpdatesDetails>;

  @ViewChild('formMessage')
  private _formMessage: FormMessage;

  private _destroySubject = new Subject<void>();
  private _updateStartedDate: Date;

  /**
   * Returns the clock icon key
   */
  public get clockKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOCK;
  }

  /**
   * Returns the chevron left key
   */
  public get chevronLeftKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns the warning svg key
   */
  public get warningSvgKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Returns the updates schedule label depending if there is schedule set or not
   */
  public get updatesScheduleLabel(): string {
    return this.updateStatusConfiguration.hasSchedule ?
      this._translateService.instant('serverServices.updatesScheduleLabel.scheduled') :
      this._translateService.instant('serverServices.updatesScheduleLabel.unscheduled');
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

  constructor(
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _errorHandlerService: McsErrorHandlerService,
    _loadingService: McsLoadingService,
    protected _accessControlService: McsAccessControlService,
    protected _changeDetectorRef: ChangeDetectorRef,
    private _dateTimeService: McsDateTimeService,
    private _serversService: ServersService,
    private _translateService: TranslateService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _errorHandlerService,
      _loadingService,
      _accessControlService
    );
    this.dataStatusFactory = new McsDataStatusFactory();
    this.updateStatusConfiguration = new OsUpdatesStatusConfiguration();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Sets the view type of server services
   * @param viewMode View mode to be set as displayed
   */
  public setViewMode(viewMode: ServerServicesView) {
    this.serverServicesView = viewMode;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event listener for saving the schedule
   * @param actionDetails includes the request data and the server reference
   */
  public onSaveSchedule(actionDetails: OsUpdatesActionDetails): void {
    this.serverServicesView = ServerServicesView.Default;
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
    this.serverServicesView = ServerServicesView.Default;
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
    this.serverServicesView = ServerServicesView.Default;
    this._applyUpdates(actionDetails.server, actionDetails.requestData).subscribe();
  }

  /**
   * Checks for available os-update/s
   * @param server selected server object reference
   */
  public inspectForAvailableOsUpdates(server: McsServer): void {
    this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Analysing);
    this._serversRepository.inspectServerForAvailableOsUpdates(
      server.id, { serverId: server.id }
    ).subscribe();
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
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected selectionChange(_server: McsServer, _resource: McsResource): void {
    this.serverServicesView = ServerServicesView.Default;
    this._registerJobEvents();
    this._getServerUpdateDetails(_server.id);
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    if (!isNullOrEmpty(this._destroySubject.observers)) { return; }

    this._notificationEvents.inspectServerForAvailableOsUpdate
      .pipe(takeUntil(this._destroySubject))
      .subscribe(this.onInspectForAvailableOsUpdates.bind(this));

    this._notificationEvents.applyServerOsUpdates
      .pipe(takeUntil(this._destroySubject))
      .subscribe(this.onApplyServerOsUpdates.bind(this));
  }

  /**
   * Listener for the inspect server for os-updates method call
   * @param job job object reference
   */
  private onInspectForAvailableOsUpdates(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Analysing);
        break;
      case DataStatus.Success:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Unanalysed);
        this.refreshServerResource();
        break;
      case DataStatus.Error:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
        break;
      default:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener for the apply os updates on server method call
   * @param job job object reference
   */
  private onApplyServerOsUpdates(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Updating);
        this._updateStartedDate = job.startedOn;
        break;
      case DataStatus.Success:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Updated);
        this.refreshServerResource();
        break;
      case DataStatus.Error:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
        break;
      default:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get the latest update details of the server from api
   * @param id job object reference
   */
  private _getServerUpdateDetails(id: string): void {

    this.dataStatusFactory.setInProgress();
    this.updatesDetails$ = this._serversRepository.getServerOsUpdatesDetails(id).pipe(
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
    this._serversService.setServerSpinner(server);
    return this._serversRepository.updateServerOs(server, request).pipe(
      catchError((error) => {
        this._serversService.clearServerSpinner(server);
        return throwError(error);
      }),
      tap(() => {
        this._serversService.clearServerSpinner(server);
      })
    );
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
    this._serversService.setServerSpinner(server);
    return this._serversRepository.
      deleteServerOsUpdatesSchedule(server.id).pipe(
        catchError((httpError) => {
          this._serversService.clearServerSpinner(server);
          this._formMessage.showMessage('error', {
            messages: httpError.errorMessages,
            fallbackMessage: this._translateService.instant('serverServices.updateErrorMessage')
          });
          return throwError(httpError);
        }),
        concatMap(() => {
          return this._serversRepository.updateServerOsUpdatesSchedule(server.id, request).pipe(
            tap(() => {
              this._serversService.clearServerSpinner(server);
              this._formMessage.showMessage('success', {
                messages: this._translateService.instant('serverServices.updateSuccessMessage')
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

    this._serversService.setServerSpinner(server);
    return this._serversRepository.deleteServerOsUpdatesSchedule(server.id).pipe(
      catchError((httpError) => {
        this._serversService.clearServerSpinner(server);
        this._formMessage.showMessage('error', {
          messages: httpError.errorMessages,
          fallbackMessage: this._translateService.instant('serverServices.deleteErrorMessage')
        });
        return throwError(httpError);
      }),
      tap(() => {
        this._serversService.clearServerSpinner(server);
        this._formMessage.showMessage('success', {
          messages: this._translateService.instant('serverServices.deleteSuccessMessage')
        });
      })
    );
  }
}
