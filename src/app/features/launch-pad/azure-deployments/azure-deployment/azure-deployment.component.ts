import {
  of,
  throwError,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  TerraformDeploymentRenameDialogComponent,
  TerraformTagChangeDialogComponent
} from '@app/features-shared';
import {
  McsRouteInfo,
  McsTerraformDeployment,
  McsTerraformDeploymentCreateActivity,
  McsTerraformDeploymentUpdate,
  McsTerraformTag,
  McsTerraformTagQueryParams,
  RouteKey,
  TerraformDeploymentActivityType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogActionType,
  DialogResult,
  DialogResultAction,
  DialogService2
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid
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
  public selectedTabId$: Observable<string>;

  private _dialogSubject = new Subject<void>();
  private _destroySubject = new Subject<void>();

  private _routerHandler: Subscription;
  private _availableTags: McsTerraformTag[] = [];

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _deploymentService: AzureDeploymentService,
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService,
    private _dialogService: DialogService2,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _snackBar: MatSnackBar,
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
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any, deployment: McsTerraformDeployment): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadAzureDeploymentDetails,
      [deployment.id, tab.id]
    );
  }

  public planClicked(deployment: McsTerraformDeployment): void {
    let dialogRef = this._dialogService.openConfirmation({
      title: `${deployment.name} (${deployment.companyName})`,
      message: `Run a plan on ${deployment.name} (${deployment.tagName})?`,
      confirmText: this._translateService.instant('action.ok'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._plan(deployment);
      })
    ).subscribe();
  }

  public applyClicked(deployment: McsTerraformDeployment): void {
    let dialogRef = this._dialogService.openConfirmation({
      title: `${deployment.name} (${deployment.companyName})`,
      message: `Run apply on ${deployment.name} (${deployment.tagName})?`,
      confirmText: this._translateService.instant('action.ok'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._apply(deployment);
      })
    ).subscribe();
  }

  public destroyClicked(deployment: McsTerraformDeployment): void {
    let dialogRef = this._dialogService.openMatchConfirmation({
      type: DialogActionType.Warning,
      valueToMatch: deployment.name,
      placeholder: this._translateService.instant('dialog.terraformDeploymentDestroy.placeholder'),
      title: this._translateService.instant('dialog.terraformDeploymentDestroy.title'),
      message: this._translateService.instant('dialog.terraformDeploymentDestroy.message', {
        name: deployment.name
      }),
      width: '30rem',
      confirmText: this._translateService.instant('action.destroy'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm || !result?.data) { return of(null); }
        this._destroy(deployment);
      })
    ).subscribe();
  }

  public changeTagClicked(deploymentDetails: McsTerraformDeployment): void {
    let dialogRef = this._dialogService.open(TerraformTagChangeDialogComponent, {
      data: {
        title: `Change tag for '${deploymentDetails.name}'`,
        message: `Existing Tag: ${deploymentDetails.tagName}?`,
        deployment: deploymentDetails,
        availableTags: this._availableTags
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || isNullOrEmpty(result)) { return; }

      this._saveDeploymentChanges({
        name: deploymentDetails.name,
        tfvars: deploymentDetails.tfvars,
        tag: result.id
      }, deploymentDetails);
    });
  }

  public renameClicked(deploymentDetails: McsTerraformDeployment): void {
    let dialogRef = this._dialogService.open(TerraformDeploymentRenameDialogComponent, {
      data: {
        title: `Rename deployment '${deploymentDetails.name}'`,
        deployment: deploymentDetails,
        newName: deploymentDetails.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!isNullOrEmpty(result) && deploymentDetails.name !== result) {
          this._saveDeploymentChanges({
            name: result,
            tfvars: deploymentDetails.tfvars,
            tag: deploymentDetails.tag
          }, deploymentDetails);
        }
      }
    });
  }

  private _plan(deployment: McsTerraformDeployment): void {
    let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
      confirm: true,
      type: TerraformDeploymentActivityType.Plan,
      clientReferenceObject: {
        terraformDeploymentId: deployment.id,
        terraformActivityRefId: Guid.newGuid().toString(),
        type: TerraformDeploymentActivityType.Plan
      }
    });

    this._apiService.createTerraformDeploymentActivity(deployment.id, requestPayload).subscribe();
  }

  private _apply(deployment: McsTerraformDeployment): void {
    let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
      confirm: true,
      type: TerraformDeploymentActivityType.Apply,
      clientReferenceObject: {
        terraformDeploymentId: deployment.id,
        terraformActivityRefId: Guid.newGuid().toString(),
        type: TerraformDeploymentActivityType.Apply
      }
    });

    this._apiService.createTerraformDeploymentActivity(deployment.id, requestPayload).subscribe();
  }

  private _destroy(deployment: McsTerraformDeployment): void {
    let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
      confirm: true,
      type: TerraformDeploymentActivityType.Destroy,
      clientReferenceObject: {
        terraformDeploymentId: deployment.id,
        terraformActivityRefId: Guid.newGuid().toString(),
        type: TerraformDeploymentActivityType.Plan
      }
    });

    this._apiService.createTerraformDeploymentActivity(deployment.id, requestPayload).subscribe();
  }

  private _saveDeploymentChanges(payload: McsTerraformDeploymentUpdate, deployment: McsTerraformDeployment): void {
    this._changeDetector.markForCheck();

    this._apiService.updateTerraformDeployment(deployment.id, payload).pipe(
      catchError(() => {
        this._showFailureNotification();
        return throwError('Terraform deployment update endpoint failed.');
      })
    ).subscribe((response: McsTerraformDeployment) => {
      this._showSaveNotification();
    });
  }

  private _subscribeToResolve(): void {
    this.deployment$ = this._activatedRoute.data.pipe(
      map((resolver) => {
        return getSafeProperty(resolver, (obj) => obj.deployment);
      }),
      tap((deployment) => {
        if (isNullOrEmpty(deployment)) { return; }
        this._deploymentService.setDeploymentDetails(deployment);
        this._loadAvailableTags(deployment);
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

  private _showFailureNotification(): void {
    this._snackBar.open(
      this._translateService.instant('snackBar.terraformDeploymentSaveFailureNotification'),
      this._translateService.instant('action.ok'),
      {
        duration: CommonDefinition.SNACKBAR_ACTIONABLE_DURATION,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: CommonDefinition.SNACKBAR_WARN_CLASS
      });
  }

  private _showSaveNotification(): void {
    this._snackBar.open(
      this._translateService.instant('snackBar.terraformDeploymentSaveSuccessNotification'),
      '',
      {
        duration: CommonDefinition.SNACKBAR_STANDARD_DURATION,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
  }

  private _loadAvailableTags(deployment: McsTerraformDeployment): void {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, deployment.companyId]
    ]);

    let param = new McsTerraformTagQueryParams();
    param.pageSize = 2000;
    param.moduleId = deployment.moduleId;

    this._apiService.getTerraformTags(param, optionalHeaders)
      .pipe(
        takeUntil(this._destroySubject),
        map((response) => response && response.collection))
      .subscribe((response) => {
        this._availableTags = response;
      });
  }
}