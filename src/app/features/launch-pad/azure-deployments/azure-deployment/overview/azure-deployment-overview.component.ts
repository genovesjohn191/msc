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
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { AzureDeploymentService } from '../azure-deployment.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogDialogComponent } from '@app/shared';

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
    let reloadConfirmationRef = this._snackBar.open('Variables reloaded successfully.', 'Undo', {
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
    this._snackBar.open('Failed to save deployment updates.', 'OK', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['warn-snackbar']
    });
  }

  public _showSaveNotification(): void {
    this._snackBar.open('Variables saved successfully.', '', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  public saveVariables(): void {
    const loadSaveStateDialogRef =
      this._dialog.open(ConfirmationDialogDialogComponent, { data: {
        title: 'Terraform Deployment',
        message: `Save variable changes to ${this.deployment.name}?`,
        okText: 'Yes',
        cancelText: 'Cancel',
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