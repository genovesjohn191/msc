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
import { ConfirmationDialogDialogComponent } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';

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
    private _translateService: TranslateService
  ) {
    this._subscribeToDeploymentDetails();
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

  public resetVariables(): void {
    this._variableChangesCache = this.deployment.tfvars;
    this.deployment.tfvars = this._variableCache;
    this._changeDetector.markForCheck();
    this._showResetNotification();
  }

  public _showResetNotification(): void {
    let reloadConfirmationRef = this._snackBar.open(
    this._translateService.instant('snackBar.terraformDeploymentReloadVariablesSuccessNotification'),
    this._translateService.instant('action.undo'),
    {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    reloadConfirmationRef.onAction()
    .pipe(takeUntil(this._snackBarSubject))
    .subscribe(() => {
      this.deployment.tfvars = this._variableChangesCache;
      this._changeDetector.markForCheck();
    });
  }

  public _showFailureNotification(): void {
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

  public _showSaveNotification(): void {
    this._snackBar.open(
      this._translateService.instant('snackBar.terraformDeploymentSaveVariablesSuccessNotification'), '', {
      duration: CommonDefinition.SNACKBAR_STANDARD_DURATION,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  public saveVariables(): void {
    const loadSaveStateDialogRef =
      this._dialog.open(ConfirmationDialogDialogComponent, { data: {
        title: this._translateService.instant('dialog.terraformDeploymentSaveVariables.title'),
        message: this._translateService.instant('dialog.terraformDeploymentSaveVariables.message',
          { deploymentName: this.deployment.name }),
        okText: this._translateService.instant('action.yes'),
        cancelText: this._translateService.instant('action.cancel'),
      } });

    loadSaveStateDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result) {
        this._save();
        this._changeDetector.markForCheck();
      }
    });
  }

  private _save(): void {
    this.hasError = false;
    this.processing = true;
    this.deployment.busy = true;

    this._apiService.updateTerraformDeployment(this.deployment.id, this.deployment)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this.deployment.busy = false;
      this._changeDetector.markForCheck();

      this._showFailureNotification();
      return throwError('Terraform deployment update endpoint failed.');
    }))
    .subscribe((response: McsTerraformDeployment) => {
      this._variableCache = this.deployment.tfvars;
      this.hasError = false;
      this.processing = false;
      this.deployment.busy = false;
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
}