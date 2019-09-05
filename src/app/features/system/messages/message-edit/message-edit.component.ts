import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  of,
  Observable,
  Subscription
} from 'rxjs';
import {
  tap,
  map,
  shareReplay,
  switchMap
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
  CommonDefinition,
  unsubscribeSafely
} from '@app/utilities';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { SystemMessageForm } from '@app/features-shared';
import { McsSystemMessageMapper } from '../message-mapper';

const SYSTEM_MESSAGE_DATEFORMAT = "yyyy-MM-dd'T'HH:mm z";
@Component({
  selector: 'mcs-message-edit',
  templateUrl: './message-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageEditComponent implements OnInit, IMcsNavigateAwayGuard, OnDestroy {

  public systemMessage$: Observable<McsSystemMessage>;
  private _systemMessageForm: SystemMessageForm;
  private _systemMessageDataChangeHandler: Subscription;

  @ViewChild('fgSystemMessageForm')
  private _fgSystemMessagesForm: IMcsFormGroup;

  constructor(
    private _dateTimeService: McsDateTimeService,
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _activatedRoute: ActivatedRoute,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this._subscribeToSystemMessageResolve();
    this._registerEvents();
  }

  /**
   * Destroys all the resources
   */
  public ngOnDestroy(): void {
    unsubscribeSafely(this._systemMessageDataChangeHandler);
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

  public get hasMessageChanged(): boolean {
    return getSafeProperty(this._fgSystemMessagesForm, (obj) => obj.isValid(), false)
      && this._systemMessageForm.hasChanged;
  }

  public get hasDirtyFormControls(): boolean {
    return getSafeProperty(this._fgSystemMessagesForm, (obj) => obj.getFormGroup().hasDirtyFormControls());
  }

  /**
   * Event that triggers when navigating away from the current page
   * and all the inputted setting on the form are checked
   */
  public canNavigateAway(): boolean {
    return !this.hasDirtyFormControls;
  }

  /**
   * Triggers when data change occurs on system message form
   * @param systemMessageForm System message form values
   */
  public onMessageFormDataChange(systemMessageForm: SystemMessageForm) {
    if (isNullOrEmpty(systemMessageForm)) { return; }
    this._systemMessageForm = systemMessageForm;
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
   * @param currentMessageId System Message Id to be validated and edited
   */
  public onEditMessage(currentMessageId: string): void {
    if (isNullOrEmpty(currentMessageId)) { return; }

    /**
     * TODO: Improve the logic on serialization of dates
     * Should be on one place only
     */
    this._systemMessageForm.start = this.serializeSystemMessageDate(this._systemMessageForm.start);
    this._systemMessageForm.expiry = this.serializeSystemMessageDate(this._systemMessageForm.expiry);
    let systemMessageValidate = McsSystemMessageMapper.mapToValidate(this._systemMessageForm, currentMessageId);

    this._apiService.validateSystemMessage(systemMessageValidate).pipe(
      switchMap((conflictMessages) => {
        if (isNullOrEmpty(conflictMessages)) { return of(null); }
        let systemMessageEdit = McsSystemMessageMapper.mapToEdit(this._systemMessageForm);

        return this._showMessageConfirmationDialog(
          systemMessageEdit,
          currentMessageId,
          conflictMessages.totalCollectionCount
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
  ): Observable<McsSystemMessageEdit> {
    return (conflictMessageCount > 0) ? this._showSaveConflictDialog(message, messageId) :
      this._showSaveDialog(message, messageId);
  }

  /**
   * Show the save conflict dialog
   * for conflicting messages
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   */
  private _showSaveConflictDialog(message: McsSystemMessageEdit, messageId: string): Observable<McsSystemMessageEdit> {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveConflictSystemMessageEdit.title'),
      message: this._translateService.instant('dialogSaveConflictSystemMessageEdit.message')
    } as DialogConfirmation<McsSystemMessageEdit>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    return dialogRef.afterClosed().pipe(
      switchMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._editSystemMessage(message, messageId);
      })
    );
  }

  /**
   * Show the save dialog
   * for none conflicting messages
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   */
  private _showSaveDialog(message: McsSystemMessageEdit, messageId: string): Observable<McsSystemMessageEdit> {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveSystemMessageEdit.title'),
      message: this._translateService.instant('dialogSaveSystemMessageEdit.message')
    } as DialogConfirmation<McsSystemMessageEdit>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    return dialogRef.afterClosed().pipe(
      switchMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._editSystemMessage(message, messageId);
      })
    );
  }

  /**
   * Create System Message based from the inputted data
   * @param message System message form values
   * @param messageId Id of the system message to be edited
   */
  private _editSystemMessage(message: McsSystemMessageEdit, messageId: string): Observable<McsSystemMessageEdit> {
    return this._apiService.editSystemMessage(messageId, message).pipe(
      tap(() => {
        this._fgSystemMessagesForm.getFormGroup().resetAllControls();
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

  /**
   * Registers the system message data change event
   */
  private _registerEvents(): void {
    this._systemMessageDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeSystemMessages, () => this._changeDetectorRef.markForCheck());
  }
}
