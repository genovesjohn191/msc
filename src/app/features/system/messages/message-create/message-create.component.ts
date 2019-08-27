import {
  Component,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  of,
  Observable
} from 'rxjs';
import {
  tap,
  concatMap
} from 'rxjs/operators';
import {
  IMcsNavigateAwayGuard,
  McsNavigationService,
  IMcsFormGroup,
  McsDateTimeService
} from '@app/core';
import {
  McsSystemMessageCreate,
  RouteKey,
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  DialogConfirmation,
  DialogService,
} from '@app/shared';
import { McsApiService } from '@app/services';
import { SystemMessageForm } from '@app/features-shared';

const SYSTEM_MESSAGE_DATEFORMAT = "yyyy-MM-dd'T'HH:mm z";
@Component({
  selector: 'mcs-message-create',
  templateUrl: './message-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageCreateComponent implements IMcsNavigateAwayGuard {

  private _systemMessageFormData: McsSystemMessageCreate;
  private _isMessageCreated: boolean;

  @ViewChild('fgSystemMessageForm')
  private _fgSystemMessagesForm: IMcsFormGroup;

  constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _dateTimeService: McsDateTimeService,
  ) {
    this._systemMessageFormData = new McsSystemMessageCreate();
  }

  public get servicesIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get isFormValid(): boolean {
    return getSafeProperty(this._fgSystemMessagesForm, (obj) => obj.isValid(), false);
  }

  public get hasDirtyFormControls(): boolean {
    return getSafeProperty(this._fgSystemMessagesForm, (obj) => obj.getFormGroup().hasDirtyFormControls());
  }

  /**
   * Event that triggers when navigating away from the current page
   * and all the inputted setting on the form are checked
   */
  public canNavigateAway(): boolean {
    return this._isMessageCreated || !this.hasDirtyFormControls;
  }

  /**
   * Triggers when data change occurs on system message form
   * @param systemMessageForm System message form values
   */
  public onMessageFormDataChange(systemMessageForm: SystemMessageForm) {
    this._systemMessageFormData.start = this.serializeSystemMessageDate(systemMessageForm.start);
    this._systemMessageFormData.expiry = this.serializeSystemMessageDate(systemMessageForm.expiry);
    this._systemMessageFormData.type = systemMessageForm.type;
    this._systemMessageFormData.severity = systemMessageForm.severity;
    this._systemMessageFormData.message = systemMessageForm.message;
    this._systemMessageFormData.enabled = systemMessageForm.enabled;
  }

  /**
   * Serialize start and expiry date of system message
   * @param date Date to be serialize
   */
  public serializeSystemMessageDate(date: string): string {
    if (isNullOrEmpty(date)) { return ''; }
    if (!isNaN(Date.parse(date))) {
      let datetime = this._dateTimeService.formatDateString(
        date,
        SYSTEM_MESSAGE_DATEFORMAT,
        CommonDefinition.TIMEZONE_SYDNEY
      );
      return datetime;
    }
    return date;
  }

  /**
   * Create message according to the inputs
   */
  public onCreateMessage(): void {
    this._apiService.validateSystemMessage(this._systemMessageFormData).pipe(
      tap((conflictMessages) => {
        this._showMessageConfirmationDialog(this._systemMessageFormData, conflictMessages.totalCollectionCount);
      })
      ).subscribe();
  }

  /**
   * Shows the type of message confirmation dialog
   * based on the inputted values
   * @param message System message form values
   * @param conflictMessageCount Number of conflict messages
   */
  private _showMessageConfirmationDialog(message: McsSystemMessageCreate, conflictMessageCount: number): void {
    if (conflictMessageCount > 0) {
      this._showSaveConflictDialog(message);
    } else {
      this._showSaveDialog(message);
    }
  }

  /**
   * Show the save conflict dialog
   * for conflicting messages
   * @param message System message form values
   */
  private _showSaveConflictDialog(message: McsSystemMessageCreate): void {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveConflictSystemMessageNew.title'),
      message: this._translateService.instant('dialogSaveConflictSystemMessageNew.message')
    } as DialogConfirmation<McsSystemMessageCreate>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._createSystemMessage(this._systemMessageFormData);
      })
    ).subscribe();
  }

  /**
   * Show the save dialog
   * for none conflicting messages
   * @param message System message form values
   */
  private _showSaveDialog(message: McsSystemMessageCreate): void {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveSystemMessageNew.title'),
      message: this._translateService.instant('dialogSaveSystemMessageNew.message')
    } as DialogConfirmation<McsSystemMessageCreate>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._createSystemMessage(this._systemMessageFormData);
      })
    ).subscribe();
  }

  /**
   * Create System Message based from the inputted data
   * @param message System message form values
   */
  private _createSystemMessage(message: McsSystemMessageCreate): Observable<McsSystemMessageCreate> {
    return this._apiService.createSystemMessage(message).pipe(
      tap(() => {
        this._isMessageCreated = true;
        this._navigationService.navigateTo(RouteKey.SystemMessages);
      })
    );
  }
}
