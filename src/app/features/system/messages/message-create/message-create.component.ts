import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  throwError,
  of,
  Observable
} from 'rxjs';
import {
  catchError,
  concatMap,
  tap
} from 'rxjs/operators';
import {
  IMcsNavigateAwayGuard,
  CoreDefinition,
  McsNavigationService,
  IMcsFormGroup
} from '@app/core';
import {
  McsSystemMessageCreate,
  RouteKey,
  McsDateSerialization
} from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  DialogConfirmation,
  DialogService,
  DialogRef,
  DialogConfirmationComponent
} from '@app/shared';
import { McsApiService } from '@app/services';
import { SystemMessageForm } from '@app/features-shared';

@Component({
  selector: 'mcs-message-create',
  templateUrl: './message-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageCreateComponent implements OnDestroy, IMcsNavigateAwayGuard {

  public createMessageSubscription: any;
  public startDate: any;
  public expiryDate: any;
  private _systemMessageFormData: McsSystemMessageCreate;
  private _dateConverter: McsDateSerialization;
  private _hasConfirmedDialog: boolean = false;
  private dialogDataTitle: string;
  private dialogDataMessage: string;
  private dialogData: DialogConfirmation<McsSystemMessageCreate>;
  private dialogRef: DialogRef<DialogConfirmationComponent>;

  @ViewChild('fgSystemMessageForm')
  private _fgSystemMessagesForm: IMcsFormGroup;

  constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    this._systemMessageFormData = new McsSystemMessageCreate();
    this._dateConverter = new McsDateSerialization();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.createMessageSubscription);
  }

  public get servicesIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  /**
   * Event that triggers when navigating away from the current page
   * and all the inputted setting on the form are checked
   */
  public canNavigateAway(): boolean {
    return this._hasConfirmedDialog || this.isFormValid;
  }

  public get isFormValid(): boolean {
    return getSafeProperty(this._fgSystemMessagesForm, (obj) => obj.isValid(), false);
  }

  /**
   * Create message according to the inputs
   */
  public onCreateMessage(): void {
    // Check all the controls and set the focus on the first invalid control
    this._systemMessageFormData.start = this.serializeSystemMessageDates(this._systemMessageFormData.start);
    this._systemMessageFormData.expiry = this.serializeSystemMessageDates(this._systemMessageFormData.expiry);
    this._apiService.validateSystemMessage(this._systemMessageFormData).pipe(
      concatMap((conflictMessages) => {
        return this._showMessageConfirmationDialog(
          this._systemMessageFormData, conflictMessages.totalCollectionCount).pipe(
            concatMap((dialogResult) => {
              if (isNullOrEmpty(dialogResult)) { return of(null); }
              return this._apiService.createSystemMessage(this._systemMessageFormData).pipe(
                tap(() => {
                  this._hasConfirmedDialog = true;
                  this._navigationService.navigateTo(RouteKey.SystemMessages);
                }),
                catchError((error) => {
                  unsubscribeSafely(this.createMessageSubscription);
                  this._changeDetectorRef.markForCheck();
                  return throwError(error);
                })
              );
            })
          );
      }),
      catchError((error) => {
        unsubscribeSafely(this.createMessageSubscription);
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe();
  }

  /**
   * Get system message form values
   * @param systemMessageForm System message form values
   */
  public onFormData(systemMessageForm: SystemMessageForm) {
    this._systemMessageFormData.start = systemMessageForm.start;
    this._systemMessageFormData.expiry = systemMessageForm.expiry;
    this._systemMessageFormData.type = systemMessageForm.type;
    this._systemMessageFormData.severity = systemMessageForm.severity;
    this._systemMessageFormData.message = systemMessageForm.message;
    this._systemMessageFormData.enabled = systemMessageForm.enabled;
  }

  /**
   * Serialize start and expiry date of system message
   * @param date Date to be serialize
   */
  public serializeSystemMessageDates(date: string): string {
    return getSafeProperty(date, () => this._dateConverter.serialize(new Date(date)).replace(/"/g,''), '');
  }

  /**
   * Shows the type of message confirmation dialog
   * based on the inputted values whether it has a conflict
   * message or not
   * @param message System message form values
   * @param conflictMessageCount Number of conflict messages
   */
  private _showMessageConfirmationDialog(
    message: McsSystemMessageCreate,
    conflictMessageCount: number
  ): Observable<any> {

    if (conflictMessageCount > 0) {
      this.createSaveConflictConfirmationDialog(message);
    } else {
      this.createSaveEnabledConfirmationDialog(message);
    }

    this.dialogRef = this._dialogService.openConfirmation(this.dialogData);
    return this.dialogRef.afterClosed();
  }

  /**
   * Create save conflict confirmation dialog
   * when there is a conflicting message
   */
  private createSaveConflictConfirmationDialog(message: McsSystemMessageCreate): void {
    this.dialogDataTitle = this._translateService.instant('dialogSaveConflictMessage.title');
    this.dialogDataMessage = this._translateService.instant('dialogSaveConflictMessage.message');
    this.dialogData = {
      data: message,
      title: this.dialogDataTitle,
      message: this.dialogDataMessage,
      type: 'warning'
    };
  }

  /**
   * Create save enabled confirmation dialog
   * when there is no conflicting message
   */
  private createSaveEnabledConfirmationDialog(message: McsSystemMessageCreate): void {
    this.dialogDataTitle = this._translateService.instant('dialogSaveEnabledMessage.title');
    this.dialogDataMessage = this._translateService.instant('dialogSaveEnabledMessage.message');
    this.dialogData = {
      data: message,
      title: this.dialogDataTitle,
      message: this.dialogDataMessage,
      type: 'warning'
    };
  }

}
