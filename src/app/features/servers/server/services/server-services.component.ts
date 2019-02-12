import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable,
  throwError
} from 'rxjs';
import {
  takeUntil,
  tap,
  shareReplay,
  catchError
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  McsLoadingService,
  CoreDefinition,
  McsNotificationEventsService,
  McsAccessControlService,
  McsDataStatusFactory
} from '@app/core';
import {
  McsResourcesRepository,
  McsServersRepository
} from '@app/services';
import {
  animateFactory,
  unsubscribeSubject,
  isNullOrEmpty,
  replacePlaceholder,
  formatDate
} from '@app/utilities';
import {
  McsServerOsUpdatesDetails,
  McsJob,
  DataStatus,
  McsServer,
  McsResource,
  OsUpdatesStatus
} from '@app/models';
import { ServerDetailsBase } from '../server-details.base';
import { ServerService } from '../server.service';
import {
  OsUpdatesStatusConfiguration,
  ServerServicesActionDetails,
  ServerServicesView
} from './os-updates-status-configuration';

@Component({
  selector: 'mcs-server-services',
  templateUrl: './server-services.component.html',
  animations: [
    animateFactory.fadeIn
  ]
})
export class ServerServicesComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public textContent: any;
  public serverServicesView: ServerServicesView;
  public updateStatusConfiguration: OsUpdatesStatusConfiguration;
  public updatesDetails$: Observable<McsServerOsUpdatesDetails>;
  public dataStatusFactory: McsDataStatusFactory<McsServerOsUpdatesDetails>;

  private _destroySubject = new Subject<void>();
  private _updatesStatusSubtitleLabel: string;

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
      this.textContent.updatesScheduleLabel.scheduled :
      this.textContent.updatesScheduleLabel.unscheduled;
  }

  /**
   * Returns the warning svg key
   */
  public get updatesStatusSubtitleLabel(): string {
    return this._updatesStatusSubtitleLabel;
  }

  /**
   * Returns the enum type of the server services view
   */
  public get serverServicesViewOption(): typeof ServerServicesView {
    return ServerServicesView;
  }

  constructor(
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    _loadingService: McsLoadingService,
    protected _accessControlService: McsAccessControlService,
    protected _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService,
      _loadingService,
      _accessControlService
    );
    this.dataStatusFactory = new McsDataStatusFactory();
    this.updateStatusConfiguration = new OsUpdatesStatusConfiguration();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.services;
    this._getServerUpdateDetailsUsingServerId();
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
   * Event listener for setting the server services view
   * @param actionDetails includes viewmode and the to recall server details
   */
  public onServerServicesViewChange(actionDetails: ServerServicesActionDetails): void {
    this.serverServicesView = actionDetails.viewMode;
    this._changeDetectorRef.markForCheck();
    if (actionDetails.callServerDetails) {
      this._getServerUpdateDetailsUsingServerId();
    }
  }

  /**
   * Checks for available os-update/s
   * @param server selected server object reference
   */
  public inspectForAvailableOsUpdates(server: McsServer): void {
    this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Analysing);
    this._serversRepository.inspectServerForAvailableOsUpdates(
      server.id,
      { serverId: server.id }
    ).subscribe();
  }

  /**
   * Disable the inspect now button if the server is powered off
   */
  public inspectNowButtonDisabled(server: McsServer): boolean {
    return server.isPoweredOff || server.isProcessing;
  }

  /**
   * Disable the configure button if the server is processing, being analyse or update
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
  }

  /**
   * Listener for parameter changed events
   */
  private _getServerUpdateDetailsUsingServerId(): void {
    this._activatedRoute.parent.paramMap
      .subscribe((params: ParamMap) => {
        // TODO : server Id should be pass down to this component
        this._getServerUpdateDetails(params.get('id'));
        this._changeDetectorRef.markForCheck();
      });
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
   * Get the latest update details of the server from api
   * @param id job object reference
   */
  private _getServerUpdateDetails(id: string): void {

    this.dataStatusFactory.setInProgress();
    this.updatesDetails$ = this._serversRepository.getServerOsUpdatesDetails(id).pipe(
      shareReplay(1),
      tap((serverOsUpdateDetails) => {
        this.dataStatusFactory.setSuccessful(serverOsUpdateDetails);
        this.updateStatusConfiguration.setOsUpdateDetails(serverOsUpdateDetails);
        if (this.updateStatusConfiguration.status === OsUpdatesStatus.Analysing) {
          return;
        }
        let notYetInspected = isNullOrEmpty(serverOsUpdateDetails.lastInspectDate);
        if (notYetInspected) {
          this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Unanalysed);
          this._updatesStatusSubtitleLabel =
            this.updateStatusConfiguration.updatesStatusSubtitleLabel;
          return;
        }
        let status = serverOsUpdateDetails.updateCount > 0 ?
          OsUpdatesStatus.Outdated : OsUpdatesStatus.Updated;
        this.updateStatusConfiguration.setOsUpdateStatus(status);
        this._updatesStatusSubtitleLabel =
          this.updateStatusConfiguration.updatesStatusSubtitleLabel;
      }),
      catchError((error) => {
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
        this.dataStatusFactory.setError();
        return throwError(error);
      }),
    );
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
        this._getServerUpdateDetailsUsingServerId();
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
        this._updatesStatusSubtitleLabel = replacePlaceholder(
          this.updateStatusConfiguration.updatesStatusSubtitleLabel,
          'dateOfStart',
          formatDate(job.startedOn, 'ddd, DD MMM, HH:mm A'));
        break;
      case DataStatus.Success:
        this._getServerUpdateDetailsUsingServerId();
        break;
      case DataStatus.Error:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
        break;
      default:
        this.updateStatusConfiguration.setOsUpdateStatus(OsUpdatesStatus.Error);
    }
    this._changeDetectorRef.markForCheck();
  }
}
