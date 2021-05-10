import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Observable,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  shareReplay,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import { McsTerraformDeployment } from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { AzureDeploymentService } from '../azure-deployment.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-azure-deployment-overview',
  templateUrl: './azure-deployment-overview.component.html',
  styleUrls: ['../../azure-deployments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentOverviewComponent implements OnDestroy {
  public get hasVariableChanges(): boolean {
    let diff: string = this.deployment.tfvars.replace(this._variableCache, '').trim();
    return !isNullOrEmpty(diff);
  }

  public deployment$: Observable<McsTerraformDeployment>;
  public deployment: McsTerraformDeployment;
  public hasError: boolean;
  public processing: boolean;
  public variablesEditMode: boolean = false;

  // private _deployment: McsTerraformDeployment;
  private _variableCache: string;
  private _variableChangesCache: string;
  private _dialogSubject = new Subject<void>();
  private _snackBarSubject = new Subject<void>();

  public constructor(
    private _changeDetector: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _apiService: McsApiService,
    private _deploymentService: AzureDeploymentService,
    private _dialog: MatDialog,
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

  public onVariablesChanged(param: string): void {
    if (isNullOrEmpty(this._variableCache)) {
      this._variableCache = param;
    }
  }

  public edit(): void {
    this.variablesEditMode = true;
    this._changeDetector.markForCheck();
  }

  public resetVariables(): void {
    let hasChanges: boolean = this.hasVariableChanges;
    this._variableChangesCache = this.deployment.tfvars;
    this.deployment.tfvars = this._variableCache;
    this.variablesEditMode = false;
    this._changeDetector.markForCheck();

    if (hasChanges) {
      this._showResetNotification();
    }
  }

  public saveVariables(): void {
    const saveVariablesDialogRef =
      this._dialog.open(ConfirmationDialogComponent, { data: {
        title: this._translateService.instant('dialog.terraformDeploymentSaveVariables.title'),
        message: this._translateService.instant('dialog.terraformDeploymentSaveVariables.message',
          { deploymentName: this.deployment.name }),
        okText: this._translateService.instant('action.yes'),
        cancelText: this._translateService.instant('action.cancel'),
      } });

    saveVariablesDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result) {
        this._save();
        this._changeDetector.markForCheck();
      }
    });
  }

  public _showResetNotification(): void {
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
      this.deployment.tfvars = this._variableChangesCache;
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
    this._translateService.instant('snackBar.terraformDeploymentSaveVariablesSuccessNotification'),
    '',
    {
      duration: CommonDefinition.SNACKBAR_STANDARD_DURATION,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private _save(): void {
    this.hasError = false;
    this.processing = true;
    this.deployment.isProcessing = true;

    this._apiService.updateTerraformDeployment(this.deployment.id, {
      name: this.deployment.name,
      tfvars: this.deployment.tfvars,
      tag: this.deployment.tag
    })
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this.deployment.isProcessing = false;
      this._changeDetector.markForCheck();

      this._showFailureNotification();
      return throwError('Terraform deployment update endpoint failed.');
    }))
    .subscribe((response: McsTerraformDeployment) => {
      this._variableCache = this.deployment.tfvars;
      this.hasError = false;
      this.processing = false;
      this.deployment.isProcessing = false;
      this.variablesEditMode = false;
      this._changeDetector.markForCheck();

      this._showSaveNotification();
    });
  }

  private _subscribeToDeploymentDetails(): void {
    this.deployment$ = this._deploymentService.getDeploymentDetails().pipe(
      take(1),
      tap((deploymentDetails) => {
        this.deployment = deploymentDetails;
      }),
      shareReplay(1)
    );
  }

  private _watchDeploymentChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeTerraformDeployments, (payload) => {
      this._changeDetector.markForCheck();
    });
  }
}