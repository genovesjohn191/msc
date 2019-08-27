import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  of,
  Observable
} from 'rxjs';
import {
  concatMap,
  tap,
  map,
  shareReplay
} from 'rxjs/operators';
import {
  IMcsNavigateAwayGuard,
  McsNavigationService,
  IMcsFormGroup,
  McsDateTimeService
} from '@app/core';
import {
  RouteKey,
  McsSystemMessageEdit,
  McsSystemMessage
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import { McsApiService } from '@app/services';
import { SystemMessageForm } from '@app/features-shared';
import { ActivatedRoute } from '@angular/router';

const SYSTEM_MESSAGE_DATEFORMAT = "yyyy-MM-dd'T'HH:mm z";
@Component({
  selector: 'mcs-message-edit',
  templateUrl: './message-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageEditComponent implements OnInit, IMcsNavigateAwayGuard {

  public systemMessage$: Observable<McsSystemMessage>;
  private _systemMessageFormData: McsSystemMessageEdit;
  private _isMessageEdited: boolean;

  @ViewChild('fgSystemMessageForm')
  private _fgSystemMessagesForm: IMcsFormGroup;

  constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _dateTimeService: McsDateTimeService,
    private _activatedRoute: ActivatedRoute,
  ) {
    this._systemMessageFormData = new McsSystemMessageEdit();
  }

  public ngOnInit() {
    this._subscribeToSystemMessageResolve();
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
    return this._isMessageEdited || !this.hasDirtyFormControls;
  }

  /**
   * Get system message form values
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
   * Edit message according to the inputs
   * @param systemMessage System Message data to be edited
   */
  public onEditMessage(systemMessage: McsSystemMessage): void {
    this._apiService.validateSystemMessage(this._systemMessageFormData).pipe(
      tap((conflictMessages) => {
        this._showMessageConfirmationDialog(
          this._systemMessageFormData,
          systemMessage.id,
          conflictMessages.totalCollectionCount,
          );
      })
    ).subscribe();
  }

  /**
   * Shows the type of message confirmation dialog
   * based on the inputted values
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   * @param conflictMessageCount Number of conflict messages
   */
  private _showMessageConfirmationDialog(
    message: McsSystemMessageEdit,
    messageId: string,
    conflictMessageCount: number
  ): void {
    if (conflictMessageCount > 0) {
      this._showSaveConflictDialog(message, messageId);
    } else {
      this._showSaveDialog(message, messageId);
    }
  }

  /**
   * Show the save conflict dialog
   * for conflicting messages
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   */
  private _showSaveConflictDialog(message: McsSystemMessageEdit, messageId: string): void {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveConflictSystemMessageEdit.title'),
      message: this._translateService.instant('dialogSaveConflictSystemMessageEdit.message')
    } as DialogConfirmation<McsSystemMessageEdit>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._editSystemMessage(this._systemMessageFormData, messageId);
      })
    ).subscribe();
  }

  /**
   * Show the save dialog
   * for none conflicting messages
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   */
  private _showSaveDialog(message: McsSystemMessageEdit, messageId: string): void {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveSystemMessageEdit.title'),
      message: this._translateService.instant('dialogSaveSystemMessageEdit.message')
    } as DialogConfirmation<McsSystemMessageEdit>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._editSystemMessage(this._systemMessageFormData, messageId);
      })
    ).subscribe();
  }

  /**
   * Create System Message based from the inputted data
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   */
  private _editSystemMessage(message: McsSystemMessageEdit, messageId: string): Observable<McsSystemMessageEdit> {
    return this._apiService.editSystemMessage(messageId, message).pipe(
      tap(() => {
        this._isMessageEdited = true;
        this._navigationService.navigateTo(RouteKey.SystemMessages);
      })
    );
  }

  /**
   * Subscribe to message edit resolver
   */
  private _subscribeToSystemMessageResolve(): void {
    this.systemMessage$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.message)),
      shareReplay(1)
    );
  }

}
