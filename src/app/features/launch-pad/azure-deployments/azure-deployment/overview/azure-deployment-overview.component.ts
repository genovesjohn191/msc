import {
  throwError,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsApiService } from '@app/services';
import {
  DialogActionType,
  DialogResult,
  DialogResultAction,
  DialogService2
} from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { AzureDeploymentService } from '../azure-deployment.service';
import {
  McsTerraformDeployment,
  McsTerraformTag
} from '@app/models';

@Component({
  selector: 'mcs-azure-deployment-overview',
  templateUrl: './azure-deployment-overview.component.html',
  styleUrls: ['../../azure-deployments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentOverviewComponent implements OnDestroy {
  public deployment$: Observable<McsTerraformDeployment>;
  public variablesEditMode: boolean = false;
  public templateVariables: string = '';
  public viewTemplateVariable: boolean = false;

  private _variableCache: string;
  private _variableChangesCache: string;
  private _destroySubject = new Subject<void>();
  private _dialogSubject = new Subject<void>();
  private _snackBarSubject = new Subject<void>();

  public constructor(
    private _changeDetector: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _apiService: McsApiService,
    private _deploymentService: AzureDeploymentService,
    private _dialogService: DialogService2,
    private _translateService: TranslateService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._subscribeToDeploymentDetails();
    this._watchDeploymentChanges();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._dialogSubject);
    unsubscribeSafely(this._snackBarSubject);
  }

  public hasVariableChanges(deployment: McsTerraformDeployment): boolean {
    let diff: string = deployment.tfvars.replace(this._variableCache, '').trim();
    return !isNullOrEmpty(diff);
  }

  public onVariablesChanged(param: string): void {
    if (isNullOrEmpty(this._variableCache)) {
      this._variableCache = param;
    }
  }

  public edit(): void {
    this.variablesEditMode = true;
    this._changeDetector.markForCheck();
  }

  public resetVariables(deployment: McsTerraformDeployment): void {
    let hasChanges: boolean = this.hasVariableChanges(deployment);
    this._variableChangesCache = deployment.tfvars;
    deployment.tfvars = this._variableCache;
    this.variablesEditMode = false;
    this._changeDetector.markForCheck();

    if (hasChanges) {
      this._showResetNotification(deployment);
    }
  }

  public saveVariables(deployment: McsTerraformDeployment): void {
    let dialogRef = this._dialogService.openConfirmation({
      type: DialogActionType.Info,
      title: this._translateService.instant('dialog.terraformDeploymentSaveVariables.title'),
      message: this._translateService.instant('dialog.terraformDeploymentSaveVariables.message', {
        deploymentName: deployment.name
      }),
      confirmText: this._translateService.instant('action.yes'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._save(deployment);
      })
    ).subscribe();
  }

  public _showResetNotification(deployment: McsTerraformDeployment): void {
    let reloadConfirmationRef = this._snackBar.open(
      this._translateService.instant('snackBar.terraformDeploymentCancelVariableEditNotification'),
      this._translateService.instant('action.undo'),
      {
        duration: 10000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

    reloadConfirmationRef.onAction()
      .pipe(takeUntil(this._snackBarSubject))
      .subscribe(() => {
        this.variablesEditMode = true;
        deployment.tfvars = this._variableChangesCache;
        this._changeDetector.markForCheck();
      });
  }

  public contentCopied(): void {
    this._snackBar.open(
    this._translateService.instant('snackBar.terraformDeploymentActivitiesLogCopy'),
    '',
    {
      duration: CommonDefinition.SNACKBAR_STANDARD_DURATION,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
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
      this._translateService.instant('snackBar.terraformDeploymentSaveVariablesSuccessNotification'),
      '',
      {
        duration: CommonDefinition.SNACKBAR_STANDARD_DURATION,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
  }

  private _save(deployment: McsTerraformDeployment): void {
    this._apiService.updateTerraformDeployment(deployment.id, {
      name: deployment.name,
      tfvars: deployment.tfvars,
      tag: deployment.tag
    }).pipe(
      catchError(() => {
        this._changeDetector.markForCheck();

        this._showFailureNotification();
        return throwError('Terraform deployment update endpoint failed.');
      })
    ).subscribe((response: McsTerraformDeployment) => {
      this._variableCache = deployment.tfvars;
      this.variablesEditMode = false;
      this._changeDetector.markForCheck();

      this._showSaveNotification();
    });
  }

  private _subscribeToDeploymentDetails(): void {
    this.deployment$ = this._deploymentService.getDeploymentDetails().pipe(
      takeUntil(this._destroySubject),
      tap((deployment: McsTerraformDeployment) => {
        this._getTagInfo(deployment);
      }),
      shareReplay(1)
    );
  }

  private _getTagInfo(deployment: McsTerraformDeployment): void {
    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, deployment.companyId]
    ]);

    this._apiService.getTerraformTag(deployment.tag, optionalHeaders)
    .pipe(catchError(() => {
      this.templateVariables = `Unable to retrieve template variables for ${deployment.tagName}`;
      this._changeDetector.markForCheck();

      return throwError('Terraform deployment tag details endpoint failed.');
    }))
    .subscribe((response: McsTerraformTag) => {
      this.templateVariables = response.tfvars;
      this._changeDetector.markForCheck();
    });
  }

  private _watchDeploymentChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeTerraformDeployments, (payload) => {
      this._getTagInfo(payload[0]);
      this._changeDetector.markForCheck();
    });
  }
}