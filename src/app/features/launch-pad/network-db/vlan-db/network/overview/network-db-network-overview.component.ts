import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import {
  JobStatus,
  McsJob,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkDelete,
  RouteKey
} from '@app/models';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  DialogActionType,
  DialogResult,
  DialogResultAction,
  DialogService2
} from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { McsApiService } from '@app/services';
import {
  createObject,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsNavigationService } from '@app/core';

@Component({
  selector: 'mcs-network-db-network-overview',
  templateUrl: './network-db-network-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkOverviewComponent implements OnDestroy {
  public network$: Observable<McsNetworkDbNetwork>;
  public onEditMode = false;
  public watchedJob: McsJob;
  private _dialogSubject = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _jobEventHandler: Subscription;

  public constructor(
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _dialogService: DialogService2,
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetector: ChangeDetectorRef
    ) {
      this._subscribeToNetworkDetails();
      this._watchNetworkDbChanges();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._dialogSubject);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._jobEventHandler);
  }

  private _subscribeToNetworkDetails(): void {
    this.network$ = this._networkDetailService.getNetworkDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _watchNetworkDbChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeNetworkDbNetworksEvent, (payload) => {
      this._changeDetector.markForCheck();
    });
  }

  public editClicked(networkId: string): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadNetworkDbNetworkDetails,
      [networkId, 'edit']
    );
  }

  public deleteClicked(network: McsNetworkDbNetwork): void {
    let dialogRef = this._dialogService.openConfirmation({
      title: this._translateService.instant('networkDb.deleteDialog.title'),
      type: DialogActionType.Warning,
      message: this._translateService.instant('networkDb.deleteDialog.message'),
      confirmText: this._translateService.instant('action.delete'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._delete(network);
      })
    ).subscribe();
  }

  private _delete(network: McsNetworkDbNetwork): void {
    let deleteDetails = createObject(McsNetworkDbNetworkDelete, {
      clientReferenceObject: {
        networkId: network.id
      }
    });

    this._changeDetector.markForCheck();
    this._apiService.deleteNetworkDbNetwork(network.id, deleteDetails).pipe(
      map(response =>{
        this._watchThisJob(response);
      })
    ).subscribe();
  }

  private _watchThisJob(job: McsJob): void {
    this.watchedJob = job;
    this._jobEventHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobUpdatesReceived.bind(this));
  }

  private _onJobUpdatesReceived(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.watchedJob.id;
    if (!watchedJob)  { return; }
    this.watchedJob = job;
    // Successful
    if (job.status === JobStatus.Completed) {
      this._navigationService.navigateTo(RouteKey.LaunchPadNetworkDbNetworks);
    }
  }
}