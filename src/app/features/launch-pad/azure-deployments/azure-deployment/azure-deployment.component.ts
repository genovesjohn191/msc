import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  of,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsJob,
  McsRouteInfo,
  McsTerraformDeployment,
  RouteKey
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { AzureDeploymentService } from './azure-deployment.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogDialogComponent } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { McsApiService } from '@app/services';

@Component({
  selector: 'mcs-azure-deployment',
  templateUrl: './azure-deployment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentComponent implements OnInit, OnDestroy {
  public deployment$: Observable<McsTerraformDeployment>;
  public deployment: McsTerraformDeployment;
  public selectedTabId$: Observable<string>;

  private _dialogSubject = new Subject<void>();
  private _routerHandler: Subscription;

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _deploymentService: AzureDeploymentService,
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService,
    private _dialog: MatDialog,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this._listenToRouteChange();
  }

  public ngOnInit(): void {
    this._subscribeToResolve();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._dialogSubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadAzureDeploymentDetails,
      [this.deployment.id,  tab.id]
    );
  }

  public planClicked(): void {
    const planDialogRef =
    this._dialog.open(ConfirmationDialogDialogComponent, { data: {
      title: 'Azure Deployment-01',
      message: `Run a plan against ${this.deployment.name}?`,
      okText: this._translateService.instant('action.ok'),
      cancelText: this._translateService.instant('action.cancel'),
    } });

    planDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result) {
        this._plan();
      }
    });
  }

  public applyClicked(): void {
    const applyDialogRef =
    this._dialog.open(ConfirmationDialogDialogComponent, { data: {
      title: 'Azure Deployment-01',
      message: `Apply ${this.deployment.name}?`,
      okText: this._translateService.instant('action.ok'),
      cancelText: this._translateService.instant('action.cancel'),
    } });

    applyDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result) {
        this._apply();
      }
    });
  }

  public planAndApplyClicked(): void {
    const planAndApplyDialogRef =
    this._dialog.open(ConfirmationDialogDialogComponent, { data: {
      title: 'Azure Deployment-01',
      message: `Run a plan and apply against ${this.deployment.name}?`,
      okText: this._translateService.instant('action.ok'),
      cancelText: this._translateService.instant('action.cancel'),
    } });

    planAndApplyDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result) {
        this._apply();
      }
    });
  }

  public upgradeClicked(): void {

  }

  public renameClicked(): void {

  }

  private _plan(): void {
    this.deployment.isProcessing = true;

    this._apiService.createTerraformDeploymentPlan(this.deployment.id)
    .pipe(catchError(() => {
      this.deployment.isProcessing = false;
      this._changeDetector.markForCheck();
      return throwError('Terraform deployment plan endpoint failed.');
    }))
    .subscribe((response: McsJob) => {
      this.deployment.isProcessing = false;
      this._changeDetector.markForCheck();
    });
  }

  private _apply(): void {
    this._apiService.applyTerraformDeploymentPlan(this.deployment.id)
    .pipe(catchError(() => {
      this.deployment.isProcessing = false;
      this._changeDetector.markForCheck();
      return throwError('Terraform deployment apply endpoint failed.');
    }))
    .subscribe((response: McsJob) => {
      this.deployment.isProcessing = false;
      this._changeDetector.markForCheck();
    });
  }

  private _subscribeToResolve(): void {
    this.deployment$ = this._activatedRoute.data.pipe(
      map((resolver) => {
        return getSafeProperty(resolver, (obj) => obj.deployment);
      }),
      tap((deployment) => {
        if (isNullOrEmpty(deployment)) { return; }
        this.deployment = deployment;
        this._deploymentService.setDeploymentDetails(deployment);
      }),
      shareReplay(1)
    );
  }

  private _listenToRouteChange(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        let paramsIndex = tabUrl.indexOf('?');
        if (paramsIndex >= 0) {
          tabUrl = tabUrl.substr(0, paramsIndex);
        }
        this.selectedTabId$ = of(tabUrl);
      });
  }
}