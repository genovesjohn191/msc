import {
  of,
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
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsRouteInfo,
  McsTerraformDeployment,
  McsTerraformDeploymentCreateActivity,
  RouteKey,
  TerraformDeploymentActivityType
} from '@app/models';
import { McsApiService } from '@app/services';
import { ConfirmationDialogDialogComponent } from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { AzureDeploymentService } from './azure-deployment.service';

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
    this._watchDeploymentChanges();
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
      [this.deployment.id, tab.id]
    );
  }

  public planClicked(): void {
    const planDialogRef =
      this._dialog.open(ConfirmationDialogDialogComponent, {
        data: {
          title: 'Azure Deployment-01',
          message: `Run a plan against ${this.deployment.name}?`,
          okText: this._translateService.instant('action.ok'),
          cancelText: this._translateService.instant('action.cancel'),
        }
      });

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
      this._dialog.open(ConfirmationDialogDialogComponent, {
        data: {
          title: 'Azure Deployment-01',
          message: `Apply ${this.deployment.name}?`,
          okText: this._translateService.instant('action.ok'),
          cancelText: this._translateService.instant('action.cancel'),
        }
      });

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
      this._dialog.open(ConfirmationDialogDialogComponent, {
        data: {
          title: 'Azure Deployment-01',
          message: `Run a plan and apply against ${this.deployment.name}?`,
          okText: this._translateService.instant('action.ok'),
          cancelText: this._translateService.instant('action.cancel'),
        }
      });

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
    let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
      confirm: true,
      type: TerraformDeploymentActivityType.Plan,
      clientReferenceObject: {
        terraformDeploymentId: this.deployment.id
      }
    });

    this._apiService.createTerraformDeploymentActivity(this.deployment.id, requestPayload).subscribe();
  }

  private _apply(): void {
    let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
      confirm: true,
      type: TerraformDeploymentActivityType.Apply,
      clientReferenceObject: {
        terraformDeploymentId: this.deployment.id
      }
    });

    this._apiService.createTerraformDeploymentActivity(this.deployment.id, requestPayload).subscribe();
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

  private _watchDeploymentChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeTerraformDeployments, (payload) => {
      this._changeDetector.markForCheck();
    });
  }
}