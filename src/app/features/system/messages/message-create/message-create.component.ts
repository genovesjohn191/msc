import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  of,
  Observable,
  BehaviorSubject
} from 'rxjs';
import {
  tap,
  finalize,
  switchMap
} from 'rxjs/operators';
import {
  IMcsNavigateAwayGuard,
  McsNavigationService,
  IMcsFormGroup
} from '@app/core';
import {
  McsSystemMessageCreate,
  RouteKey,
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition,
  unsubscribeSafely
} from '@app/utilities';
import {
  DialogConfirmation,
  DialogService,
} from '@app/shared';
import { McsApiService } from '@app/services';
import { SystemMessageForm } from '@app/features-shared';
import { McsSystemMessageMapper } from '../message-mapper';

@Component({
  selector: 'mcs-message-create',
  templateUrl: './message-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageCreateComponent implements IMcsNavigateAwayGuard, OnDestroy {

  private _creatingSystemMessage$ = new BehaviorSubject<boolean>(false);
  private _systemMessageForm: SystemMessageForm;

  @ViewChild('fgSystemMessageForm')
  private _fgSystemMessagesForm: IMcsFormGroup;

  constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {}

  /**
   * Destroys all the resources
   */
  public ngOnDestroy(): void {
    unsubscribeSafely(this._creatingSystemMessage$);
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
   * Event that emits when creating a system message
   */
  public creatingSystemMessage(): Observable<boolean> {
    return this._creatingSystemMessage$.asObservable();
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
   * Create message according to the inputs
   */
  public onCreateMessage(): void {
    this._fgSystemMessagesForm.getFormGroup().validateFormControls(true);
    if (!this.isFormValid) { return; }

    this._creatingSystemMessage$.next(true);

    let systemMessageValidate = McsSystemMessageMapper.mapToValidate(this._systemMessageForm);

    this._apiService.validateSystemMessage(systemMessageValidate).pipe(
      switchMap((conflictMessages) => {
        if (isNullOrEmpty(conflictMessages)) { return of(null); }
        let systemMessageCreate = McsSystemMessageMapper.mapToCreate(this._systemMessageForm);

        return this._showMessageConfirmationDialog(
          systemMessageCreate,
          conflictMessages.totalCollectionCount
        );
      }),
      finalize(() => this._creatingSystemMessage$.next(false))
    ).subscribe();
  }

  /**
   * Shows the type of message confirmation dialog
   * based on the inputted values
   * @param message System message form values
   * @param conflictMessageCount Number of conflict messages
   */
  private _showMessageConfirmationDialog(
    message: McsSystemMessageCreate,
    conflictMessageCount: number
  ): Observable<McsSystemMessageCreate> {
    return (conflictMessageCount > 0) ? this._showSaveConflictDialog(message) : this._showSaveDialog(message);
  }

  /**
   * Show the save conflict dialog
   * for conflicting messages
   * @param message System message form values
   */
  private _showSaveConflictDialog(message: McsSystemMessageCreate): Observable<McsSystemMessageCreate> {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveConflictSystemMessageNew.title'),
      message: this._translateService.instant('dialogSaveConflictSystemMessageNew.message')
    } as DialogConfirmation<McsSystemMessageCreate>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    return dialogRef.afterClosed().pipe(
      switchMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._createSystemMessage(message);
      })
    );
  }

  /**
   * Show the save dialog
   * for none conflicting messages
   * @param message System message form values
   */
  private _showSaveDialog(message: McsSystemMessageCreate): Observable<McsSystemMessageCreate> {
    let dialogData = {
      data: message,
      type: 'warning',
      title: this._translateService.instant('dialogSaveSystemMessageNew.title'),
      message: this._translateService.instant('dialogSaveSystemMessageNew.message')
    } as DialogConfirmation<McsSystemMessageCreate>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    return dialogRef.afterClosed().pipe(
      switchMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._createSystemMessage(message);
      })
    );
  }

  /**
   * Create System Message based from the inputted data
   * @param message System message form values
   */
  private _createSystemMessage(message: McsSystemMessageCreate): Observable<McsSystemMessageCreate> {
    return this._apiService.createSystemMessage(message).pipe(
      tap(() => {
        this._fgSystemMessagesForm.getFormGroup().resetAllControls();
        this._navigationService.navigateTo(RouteKey.SystemMessages);
      })
    );
  }
}
