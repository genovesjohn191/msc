import {
  of,
  Observable,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IMcsFormGroup,
  IMcsNavigateAwayGuard,
  McsNavigationService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { SystemMessageForm } from '@app/features-shared';
import {
  McsSystemMessage,
  McsSystemMessageEdit,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { McsSystemMessageMapper } from '../message-mapper';

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
    return getSafeProperty(this._fgSystemMessagesForm, (obj) => obj.getFormGroup().hasDirtyFormControls(), false);
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
   * Edit message according to the inputs
   * @param currentMessageId System Message Id to be validated and edited
   */
  public onEditMessage(currentMessageId: string): void {
    if (isNullOrEmpty(currentMessageId)) { return; }

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
      title: this._translateService.instant('dialog.systemMessageUpdateOverride.title'),
      message: this._translateService.instant('dialog.systemMessageUpdateOverride.message')
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
      title: this._translateService.instant('dialog.systemMessageUpdate.title'),
      message: this._translateService.instant('dialog.systemMessageUpdate.message')
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
