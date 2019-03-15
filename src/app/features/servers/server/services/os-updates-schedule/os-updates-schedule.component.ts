import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  throwError,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  map,
  tap,
  concatMap
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreValidators,
  McsDialogService,
  McsDataStatusFactory
} from '@app/core';
import {
  animateFactory,
  isNullOrEmpty,
  deleteArrayRecord,
  formatTime,
  buildCronWeekly,
  parseCronStringToJson
} from '@app/utilities';
import {
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesCategory,
  McsServer,
  OsUpdatesScheduleType,
  Day
} from '@app/models';
import { McsServersRepository } from '@app/services';
import {
  DialogConfirmation,
  DialogConfirmationComponent,
  McsFormGroupDirective
} from '@app/shared';
import { TreeNode } from '@angular/router/src/utils/tree';
import { OsUpdatesScheduleDetails } from './os-updates-schedule-details';
import { OsUpdatesActionDetails } from '../os-updates-status-configuration';

@Component({
  selector: 'mcs-server-os-updates-schedule',
  templateUrl: './os-updates-schedule.component.html',
  host: {
    'class': 'block'
  },
  animations: [
    animateFactory.fadeIn
  ]
})
export class OsUpdatesScheduleComponent implements OnInit {
  public textContent: any;

  public recurringCategories: McsServerOsUpdatesCategory[];
  public runOnceCategories: McsServerOsUpdatesCategory[];
  public scheduleDetails: OsUpdatesScheduleDetails;
  public scheduleDate: McsServerOsUpdatesSchedule;
  public scheduleType: OsUpdatesScheduleType;

  public osUpdatesScheduleConfiguration$: Observable<McsServerOsUpdatesSchedule>;
  public configurationStatusFactory: McsDataStatusFactory<any>;

  public timeOptions: string[] = [];
  public dayPeriodOptions: string[] = [];

  // Form variables
  public fgSchedule: FormGroup;
  public fcRecurringScheduleDay: FormControl;
  public fcRecurringScheduleTime: FormControl;
  public fcRecurringScheduleTimePeriod: FormControl;
  public fcRunOnceScheduleDay: FormControl;
  public fcRunOnceScheduleTime: FormControl;
  public fcRunOnceScheduleTimePeriod: FormControl;

  @Input()
  public selectedServer: McsServer;

  @Output()
  public saveSchedule: EventEmitter<OsUpdatesActionDetails>;

  @Output()
  public deleteSchedule: EventEmitter<OsUpdatesActionDetails>;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _initialScheduleCategoryList: McsServerOsUpdatesCategory[];
  private _initialCronJson: any;

  /**
   * Returns the enum type of the server services view
   */
  public get scheduleTypeOption(): typeof OsUpdatesScheduleType {
    return OsUpdatesScheduleType;
  }

  /**
   * Returns the description based on the schedule set
   */
  public get description(): string {
    if (!this.hasSchedule) {
      return this.textContent.description.default;
    }
    if (this.isRunOnce) {
      return this.textContent.description.runonce;
    } else {
      return this.textContent.description.recurring;
    }
  }

  /**
   * Returns true/false depending if there is a schedule set
   */
  public get hasSchedule(): boolean {
    return !isNullOrEmpty(this.scheduleDate);
  }

  /**
   * Returns true/false depending if there is a schedule set
   */
  public get isRunOnce(): boolean {
    return this.scheduleDate.runOnce;
  }

  /**
   * Returns true if there are no selected categories and no change in the form, false otherwise
   */
  public get isRunOnceSaveButtonDisabled(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return true; }

    let hasSelectedCategories = this.runOnceCategories.filter(
      (category) => category.isSelected
    ).length > 0;
    let allRequiredFieldsAreSet = hasSelectedCategories && this._formGroup.isValid();

    if (!allRequiredFieldsAreSet) { return true; }

    if (this.hasSchedule && this.scheduleDate.runOnce) {
      return !this._hasPendingRunOnceScheduleChanges();
    }
    return false;
  }

  /**
   * Returns true if there are no selected categories and no change in the form, false otherwise
   */
  public get isRecurringSaveButtonDisabled(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return true; }

    let hasSelectedCategories = this.recurringCategories.filter(
      (category) => category.isSelected
    ).length > 0;
    let allRequiredFieldsAreSet = hasSelectedCategories &&
      this.scheduleDetails.hasSelection &&
      this._formGroup.isValid();

    if (!allRequiredFieldsAreSet) { return true; }

    if (this.hasSchedule && !this.scheduleDate.runOnce) {
      return !this._hasPendingRecurringScheduleChanges();
    }
    return false;
  }

  constructor(
    private _dialogService: McsDialogService,
    protected _serversRepository: McsServersRepository,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textProvider: McsTextContentProvider
  ) {
    this.saveSchedule = new EventEmitter();
    this.deleteSchedule = new EventEmitter();
    this.scheduleDetails = new OsUpdatesScheduleDetails();
    this.configurationStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.services.schedule;
    this._initializeFormData();
    this._getOsUpdatesScheduleConfiguration();
  }

  /**
   * Emits an event to save/update the os-update schedule as Run Once
   */
  public saveRunOnceSchedule(): void {
    let request = new McsServerOsUpdatesScheduleRequest();
    let scheduleDayArray = [this.fcRunOnceScheduleDay.value];
    request.runOnce = true; // RunOnce
    request.categories = [];
    request.crontab = this._createCronStringRequest(
      this.fcRunOnceScheduleTime.value,
      this.fcRunOnceScheduleTimePeriod.value,
      scheduleDayArray
    );
    this.runOnceCategories.forEach(
      (category) => {
        if (category.isSelected) { request.categories.push(category.id); }
      }
    );
    let actionDetails = { server: this.selectedServer, requestData: request };

    if (this.hasSchedule) {
      this._showScheduleDialog(
        this.selectedServer,
        this.textContent.updateDialogTitle,
        this.textContent.updateDialogMessage,
        this.textContent.saveConfirmText,
      ).pipe(
        tap((dialogResult) => {
          if (isNullOrEmpty(dialogResult)) { return of(undefined); }
          this.saveSchedule.emit(actionDetails);
        })).subscribe();
    } else {
      this.saveSchedule.emit(actionDetails);
    }
  }

  /**
   * Emits an event to save/update the os-update schedule as Recurring
   */
  public saveRecurringSchedule(): void {
    let request = new McsServerOsUpdatesScheduleRequest();
    request.runOnce = false; // Recurring
    request.crontab = this._createCronStringRequest(
      this.fcRecurringScheduleTime.value,
      this.fcRecurringScheduleTimePeriod.value,
      this.scheduleDetails.selectedScheduleDaysAsArray
    );
    request.categories = [];
    this.recurringCategories.forEach(
      (category) => {
        if (category.isSelected) { request.categories.push(category.id); }
      }
    );
    let actionDetails = { server: this.selectedServer, requestData: request };

    if (this.hasSchedule) {
      this._showScheduleDialog(this.selectedServer,
        this.textContent.updateDialogTitle,
        this.textContent.updateDialogMessage,
        this.textContent.saveConfirmText,
      ).pipe(
        tap((dialogResult) => {
          if (isNullOrEmpty(dialogResult)) { return of(undefined); }
          this.saveSchedule.emit(actionDetails);
        })).subscribe();
    } else {
      this.saveSchedule.emit(actionDetails);
    }
  }

  /**
   * Emits an event to delete the os-update schedule of the server
   */
  public deleteExistingSchedule(): void {
    this._showScheduleDialog(
      this.selectedServer,
      this.textContent.deleteDialogTitle,
      this.textContent.deleteDialogMessage,
      this.textContent.deleteConfirmText,
    ).pipe(
      tap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(undefined); }
        this.deleteSchedule.emit({ server: this.selectedServer });
      })
    ).subscribe();
  }

  /**
   * Toggles the schedule day based on checkbox value
   */
  public toggleScheduleDay(): void {
    this.scheduleDetails.setDays(...this.fcRecurringScheduleDay.value);
  }

  /**
   * Event listener whenever schedule type change
   */
  public onScheduleTypeChange(): void {
    if (!this.hasSchedule) { return; }

    let formattedTime = this._initialCronJson.hour + ':' + this._initialCronJson.minute;
    let convertedTime = formatTime(formattedTime, 'HH:mm', 'h:mm A');
    let convertedTimeArray = convertedTime.split(' ');
    if (this.scheduleType === OsUpdatesScheduleType.Recurring && !this.scheduleDate.runOnce) {
      this._setRecurringFormControls(
        convertedTimeArray[1],
        convertedTimeArray[0],
        this._initialCronJson.dayOfWeek
      );
      this.recurringCategories = this._mapSelectedCategories(
        this.recurringCategories, this._initialScheduleCategoryList
      );
      return;
    }
    if (this.scheduleType === OsUpdatesScheduleType.RunOnce && this.scheduleDate.runOnce) {
      this._setRunOnceFormControls(
        convertedTimeArray[1],
        convertedTimeArray[0],
        this._initialCronJson.dayOfWeek[0]
      );
      this.runOnceCategories = this._mapSelectedCategories(
        this.runOnceCategories, this._initialScheduleCategoryList
      );
      return;
    }
    this.recurringCategories.forEach((category) => category.isSelected = false);
    this.runOnceCategories.forEach((category) => category.isSelected = false);
    this.scheduleDetails.resetDays();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener method whenever there is a change in selection on the runonce tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onRunOnceTreeChange(_selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>): void {
    this.runOnceCategories.forEach((category) => {
      category.isSelected = !isNullOrEmpty(_selectedNodes.find(
        (selectedNode) => category.id === selectedNode.value.id));
    });
  }

  /**
   * Listener method whenever there is a change in selection on the recurring tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onRecurringTreeChange(_selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>): void {
    this.recurringCategories.forEach((category) => {
      category.isSelected = !isNullOrEmpty(_selectedNodes.find(
        (selectedNode) => category.id === selectedNode.value.id));
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggles the node in the tree view if it is present in the categories list of the schedule date
   * @param osUpdateCategory category reference
   */
  public isCategorySelected(osUpdateCategory: McsServerOsUpdatesCategory): boolean {
    if (!this.hasSchedule) { return false; }
    if (this.scheduleType === OsUpdatesScheduleType.Recurring && this.scheduleDate.runOnce) {
      return false;
    }
    if (this.scheduleType === OsUpdatesScheduleType.RunOnce && !this.scheduleDate.runOnce) {
      return false;
    }
    return !!this.scheduleDate.categories.find((category) => category.id === osUpdateCategory.id);
  }

  /**
   * Form groups and Form controls registration area
   */
  private _initializeFormData(): void {
    // Register Form Controls
    this.fcRecurringScheduleDay = new FormControl('', [CoreValidators.required]);
    this.fcRecurringScheduleTime = new FormControl('', [CoreValidators.required]);
    this.fcRecurringScheduleTimePeriod = new FormControl('', [CoreValidators.required]);
    this.fcRunOnceScheduleDay = new FormControl('', [CoreValidators.required]);
    this.fcRunOnceScheduleTime = new FormControl('', [CoreValidators.required]);
    this.fcRunOnceScheduleTimePeriod = new FormControl('', [CoreValidators.required]);

    // Register Form Groups using binding
    this.fgSchedule = new FormGroup({
      fcRecurringScheduleDay: this.fcRecurringScheduleDay,
      fcRecurringScheduleTime: this.fcRecurringScheduleTime,
      fcRecurringSchedulePeriod: this.fcRecurringScheduleTimePeriod,
      fcRunOnceScheduleDay: this.fcRunOnceScheduleDay,
      fcRunOnceScheduleTime: this.fcRunOnceScheduleTime,
      fcRunOnceSchedulePeriod: this.fcRunOnceScheduleTimePeriod,
    });
    // Initialize Time and Period selections
    // TODO : can be created by loop
    this.timeOptions = this.textContent.timeSelection.split(',');
    this.dayPeriodOptions = this.textContent.dayPeriod.split(',');
  }

  /**
   * Get the Categories and Schedule date of the current server
   */
  private _getOsUpdatesScheduleConfiguration() {
    this.configurationStatusFactory.setInProgress();
    this.osUpdatesScheduleConfiguration$ =
      this._getOsUpdatesCategories().pipe(concatMap((categories) => {
        return this._getScheduleDate(categories);
      }), tap((result) => {
        this.configurationStatusFactory.setSuccessful(result);
      }), catchError((error) => {
        this.configurationStatusFactory.setError();
        return throwError(error);
      }));
  }

  /**
   * Get the list of categories of the current server
   */
  private _getOsUpdatesCategories(): Observable<McsServerOsUpdatesCategory[]> {
    return this._serversRepository.getServerOsUpdatesCategories().pipe(
      map((response) => response.filter(
        (category) => category.osType === this.selectedServer.operatingSystem.type)
      ),
      tap((categories) => {
        this.runOnceCategories = categories.slice();
        this.recurringCategories = categories.slice();
      }),
      catchError((error) => throwError(error))
    );
  }

  /**
   * Get the schedule date from api, if there are multiple entries, the first one will be used
   * @param categories categories list reference where the selected categories of the user are map
   */
  private _getScheduleDate(
    categories: McsServerOsUpdatesCategory[]
  ): Observable<McsServerOsUpdatesSchedule> {
    return this._serversRepository
      .getServerOsUpdatesSchedule(this.selectedServer.id)
      .pipe(
        catchError((error) => {
          this.scheduleDate = undefined;
          return throwError(error);
        }),
        tap((schedules) => {
          if (!isNullOrEmpty(schedules)) {
            this.scheduleDate = schedules[0];
            this.scheduleType = this.scheduleDate.runOnce ?
              OsUpdatesScheduleType.RunOnce : OsUpdatesScheduleType.Recurring;
            this._setInitialScheduleReference();

            let selectedCategories = this._mapSelectedCategories(
              categories, this.scheduleDate.categories
            );
            if (this.scheduleDate.runOnce) {
              this.runOnceCategories = selectedCategories;
            } else {
              this.recurringCategories = selectedCategories;
            }
          }
          this._changeDetectorRef.markForCheck();
        }),
        map((schedules) => {
          if (!isNullOrEmpty(schedules)) { return schedules[0]; }
          return new McsServerOsUpdatesSchedule();
        })
      );
  }

  /**
   * Create the cron string for the OS Updates Schedule Request with the proper format
   * @param time time in string
   * @param period period in string (AM, PM)
   * @param daysOfWeek days of week in array
   */
  private _createCronStringRequest(time: string, period: string, daysOfWeek: number[]): string {
    let timeWithPeriod = time + ' ' + period;
    let convertedTimeArray = formatTime(timeWithPeriod, 'hh:mm a').split(':');
    let hour = convertedTimeArray[0];
    let minute = convertedTimeArray[1];
    return buildCronWeekly([minute], [hour], daysOfWeek);
  }

  /**
   * Maps the existing Schedule to the UI components
   */
  private _setInitialScheduleReference(): void {
    if (!this.hasSchedule) { return; }
    this._initialCronJson = parseCronStringToJson(this.scheduleDate.crontab);
    this._initialScheduleCategoryList = this.scheduleDate.categories.slice();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the form controls of the recurring schedule
   * @param period period selected by the user
   * @param time time selected by the user
   * @param days days selected by the user
   */
  private _setRecurringFormControls(period: string, time: string, days: Day[]): void {
    this.fcRecurringScheduleTimePeriod.setValue(period);
    this.fcRecurringScheduleTime.setValue(time);
    this.fcRecurringScheduleDay.setValue(days);
    this.scheduleDetails.setDays(...days);
  }

  /**
   * Sets the form controls of the run once schedule
   * @param period period selected by the user
   * @param time time selected by the user
   * @param day day selected by the user
   */
  private _setRunOnceFormControls(period: string, time: string, day: Day): void {
    this.fcRunOnceScheduleTimePeriod.setValue(period);
    this.fcRunOnceScheduleTime.setValue(time);
    this.fcRunOnceScheduleDay.setValue(day);
  }

  /**
   * Returns true if there are current changes in the schedule options of runonce schedule
   */
  private _hasPendingRunOnceScheduleChanges(): boolean {
    let scheduleDayArray = [this.fcRunOnceScheduleDay.value];
    let currentCronSelected = this._createCronStringRequest(
      this.fcRunOnceScheduleTime.value,
      this.fcRunOnceScheduleTimePeriod.value,
      scheduleDayArray
    );
    let differentCronOption = this.scheduleDate.crontab !== currentCronSelected;
    let differentCategorySelection = this._categorySelectionHasChanged(this.runOnceCategories);
    return differentCronOption || differentCategorySelection;
  }

  /**
   * Returns true if there are current changes in the schedule options of recurring schedule
   */
  private _hasPendingRecurringScheduleChanges(): boolean {
    let currentCronSelected = this._createCronStringRequest(
      this.fcRecurringScheduleTime.value,
      this.fcRecurringScheduleTimePeriod.value,
      this.scheduleDetails.selectedScheduleDaysAsArray
    );
    let differentCronOption = this.scheduleDate.crontab !== currentCronSelected;
    let differentCategorySelection = this._categorySelectionHasChanged(this.recurringCategories);
    return differentCronOption || differentCategorySelection;
  }

  /**
   * Returns true if there is a change in the category selection, false otherwise
   * @param categories list of categories to be checked
   */
  private _categorySelectionHasChanged(categories: McsServerOsUpdatesCategory[]): boolean {

    let selectedCategories = categories.filter((category) => category.isSelected);
    if (this._initialScheduleCategoryList.length !== selectedCategories.length) { return true; }

    let cloneCategoryList = this._initialScheduleCategoryList.slice();
    deleteArrayRecord(cloneCategoryList, (item) => {
      return !!categories.find((record) => record.id === item.id);
    });

    return cloneCategoryList.length !== 0;
  }

  /**
   * Maps and returns the list of categories with the selected values
   * @param categories list of categories
   * @param selectedCategories selected categories
   */
  private _mapSelectedCategories(
    categories: McsServerOsUpdatesCategory[],
    selectedCategories: McsServerOsUpdatesCategory[]
  ): McsServerOsUpdatesCategory[] {
    let cloneCategories = categories.slice();
    cloneCategories.forEach((category) => {
      category.isSelected = !isNullOrEmpty(selectedCategories.find(
        (selectedCategory) => category.id === selectedCategory.id
      ));
    });

    return categories;
  }

  /**
   * Shows the schedule dialog
   * @param server Server to be detached
   * @param title title to be displaye on the dialog box
   * @param message message to be displayed on the dialog box
   * @param confirmText text label of the confirm button
   */
  private _showScheduleDialog(
    server: McsServer,
    title: string,
    message: string,
    confirmText: string
  ): Observable<any> {
    let data = {
      data: server, type: 'warning', title, message, confirmText
    } as DialogConfirmation<McsServer>;
    let dialogRef = this._dialogService.open(DialogConfirmationComponent, { data, size: 'medium' });

    return dialogRef.afterClosed();
  }
}
