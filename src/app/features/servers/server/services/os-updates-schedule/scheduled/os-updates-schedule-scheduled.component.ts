import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter
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
  tap
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
  formatTime
} from '@app/utilities';
import {
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesCategory,
  McsServer,
  Day,
  McsCronUtility,
  OsUpdatesScheduleType
} from '@app/models';
import { McsServersRepository } from '@app/services';
import {
  DialogConfirmation,
  DialogConfirmationComponent
} from '@app/shared';
import { TreeNode } from '@angular/router/src/utils/tree';
import {
  OsUpdatesScheduleDetails,
  ScheduleDay,
  DayFrequency
} from './os-updates-schedule-details';
import { OsUpdatesActionDetails } from '../../os-updates-status-configuration';

@Component({
  selector: 'mcs-server-os-updates-schedule-scheduled',
  templateUrl: './os-updates-schedule-scheduled.component.html',
  host: {
    'class': 'block'
  },
  animations: [
    animateFactory.fadeIn
  ]
})
export class OsUpdatesScheduleScheduledComponent implements OnInit {
  public textContent: any;

  public categories: McsServerOsUpdatesCategory[];
  public scheduleDetails: OsUpdatesScheduleDetails;
  public scheduleDate: McsServerOsUpdatesSchedule;
  public runOnceScheduleDay: Day;
  public scheduleType: OsUpdatesScheduleType;

  public osUpdatesCategories$: Observable<McsServerOsUpdatesCategory[]>;
  public scheduleDate$: Observable<McsServerOsUpdatesSchedule>;

  public categoriesStatusFactory: McsDataStatusFactory<McsServerOsUpdatesCategory[]>;
  public scheduleDateStatusFactory: McsDataStatusFactory<McsServerOsUpdatesSchedule[]>;
  public selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>;

  public timeOptions: string[] = [];
  public dayPeriodOptions: string[] = [];

  // Form variables
  public fgSchedule: FormGroup;
  public fcRecurringScheduleTime: FormControl;
  public fcRecurringSchedulePeriod: FormControl;
  public fcRunOnceScheduleTime: FormControl;
  public fcRunOnceSchedulePeriod: FormControl;

  @Input()
  public selectedServer: McsServer;

  @Output()
  public saveSchedule: EventEmitter<OsUpdatesActionDetails>;

  @Output()
  public deleteSchedule: EventEmitter<OsUpdatesActionDetails>;

  private _initialCategoryList: McsServerOsUpdatesCategory[];

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
    if (this.selectedNodes.length <= 0) { return true; }

    if (this.hasSchedule && this.scheduleDate.runOnce) {
      let scheduleDayArray = [this.runOnceScheduleDay];
      let currentCronSelected = this._createCronStringRequest(
        this.fcRunOnceScheduleTime.value,
        this.fcRunOnceSchedulePeriod.value,
        scheduleDayArray);
      let sameCronOption = this.scheduleDate.crontab === currentCronSelected;
      let sameCategorySelection = !this._categorySelectionHasChanged();
      return sameCronOption && sameCategorySelection;
    }
    return false;
  }

  /**
   * Returns true if there are no selected categories and no change in the form, false otherwise
   */
  public get isRecurringSaveButtonDisabled(): boolean {
    if (this.selectedNodes.length <= 0 || !this.scheduleDetails.hasSelection) { return true; }

    if (this.hasSchedule && !this.scheduleDate.runOnce) {
      let currentCronSelected = this._createCronStringRequest(
        this.fcRecurringScheduleTime.value,
        this.fcRecurringSchedulePeriod.value,
        this.scheduleDetails.selectedScheduleDaysAsArray);
      let sameCronOption = this.scheduleDate.crontab === currentCronSelected;
      let sameCategorySelection = !this._categorySelectionHasChanged();
      return sameCronOption && sameCategorySelection;
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
    this.categoriesStatusFactory = new McsDataStatusFactory();
    this.scheduleDateStatusFactory = new McsDataStatusFactory();
    this.selectedNodes = new Array<TreeNode<McsServerOsUpdatesCategory>>();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.services.scheduled;
    this._initializeFormData();
    this._initializeTreeSource();
    this._getScheduleDate();
  }

  /**
   * Listener method whenever there is a change in selection on the tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onTreeChange(_selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>): void {
    this.selectedNodes = _selectedNodes;
  }

  /**
   * Emits an event to save/update the os-update schedule as Run Once
   */
  public saveRunOnceSchedule(): void {
    let request = new McsServerOsUpdatesScheduleRequest();
    let scheduleDayArray = [this.runOnceScheduleDay];
    request.runOnce = true; // RunOnce
    request.categories = [];
    request.crontab = this._createCronStringRequest(
      this.fcRunOnceScheduleTime.value,
      this.fcRunOnceSchedulePeriod.value,
      scheduleDayArray
    );
    this.selectedNodes.forEach((selection) => request.categories.push(selection.value.id));
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
      this.fcRecurringSchedulePeriod.value,
      this.scheduleDetails.selectedScheduleDaysAsArray
    );
    request.categories = [];
    this.selectedNodes.forEach((selection) => request.categories.push(selection.value.id));
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
   * @param event event reference
   * @param scheduleDay scheduleDay reference to be toggle
   */
  public toggleScheduleDay(event: any, scheduleDay: ScheduleDay): void {
    scheduleDay.checked = event.checked;
  }

  /**
   * Toggles all the days
   */
  public scheduleEveryday(): void {
    if (this.scheduleDetails.isEveryday) {
      this.scheduleDetails.resetDays();
    } else {
      this.scheduleDetails.setDaysByFrequency(DayFrequency.Everyday);
    }
  }

  /**
   * Toggles all the days applicable for Weekdays
   */
  public scheduleWeekdays(): void {
    if (this.scheduleDetails.isWeekdays) {
      this.scheduleDetails.resetDays();
    } else {
      this.scheduleDetails.setDaysByFrequency(DayFrequency.Weekdays);
    }
  }

  /**
   * Toggles all the days applicable for Weekends
   */
  public scheduleWeekends(): void {
    if (this.scheduleDetails.isWeekends) {
      this.scheduleDetails.resetDays();
    } else {
      this.scheduleDetails.setDaysByFrequency(DayFrequency.Weekends);
    }
  }

  /**
   * Toggles the node in the tree view if it is present in the categories list of the schedule date
   * @param osUpdateCategory category reference
   */
  public tickNodeIfSelected(osUpdateCategory: McsServerOsUpdatesCategory): boolean {
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
    this.fcRecurringScheduleTime = new FormControl('', [CoreValidators.required]);
    this.fcRecurringSchedulePeriod = new FormControl('', [CoreValidators.required]);
    this.fcRunOnceScheduleTime = new FormControl('', [CoreValidators.required]);
    this.fcRunOnceSchedulePeriod = new FormControl('', [CoreValidators.required]);

    // Register Form Groups using binding
    this.fgSchedule = new FormGroup({
      fcRecurringScheduleTime: this.fcRecurringScheduleTime,
      fcRecurringSchedulePeriod: this.fcRecurringSchedulePeriod,
      fcRunOnceScheduleTime: this.fcRunOnceScheduleTime,
      fcRunOnceSchedulePeriod: this.fcRunOnceSchedulePeriod,
    });
    // Initialize Time and Period selections
    this.timeOptions = this.textContent.timeSelection.split(',');
    this.dayPeriodOptions = this.textContent.dayPeriod.split(',');
  }

  /**
   * Initializes the data source of the os updates table and os updates category table
   */
  private _initializeTreeSource(): void {
    this.categoriesStatusFactory.setInProgress();
    this.osUpdatesCategories$ = this._serversRepository.getServerOsUpdatesCategories().pipe(
      map((response) => response.filter(
        (category) => category.osType === this.selectedServer.operatingSystem.type)
      ),
      tap((osUpdates) => {
        this.categoriesStatusFactory.setSuccessful(osUpdates);
      }),
      catchError((error) => {
        this.categoriesStatusFactory.setError();
        return throwError(error);
      })
    );
  }

  /**
   * Get the schedule date from api, if there are multiple entries, the first one will be used
   */
  private _getScheduleDate(): void {
    this.scheduleDateStatusFactory.setInProgress();
    this.scheduleDate$ = this._serversRepository
      .getServerOsUpdatesSchedule(this.selectedServer.id)
      .pipe(
        catchError((error) => {
          this.scheduleDate = undefined;
          this.scheduleDateStatusFactory.setError();
          return throwError(error);
        }),
        tap((schedules) => {
          if (!isNullOrEmpty(schedules)) {
            this.scheduleDate = schedules[0];
            this.scheduleType = this.scheduleDate.runOnce ?
              OsUpdatesScheduleType.RunOnce : OsUpdatesScheduleType.Recurring;
            this._mapScheduleDateToUi();
          }
          this.scheduleDateStatusFactory.setSuccessful(schedules);
          this._changeDetectorRef.markForCheck();
        }),
        map((schedules) => {
          if (!isNullOrEmpty(schedules)) {
            return schedules[0];
          }
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
    return McsCronUtility.buildCronWeekly(new Array(minute), new Array(hour), daysOfWeek);
  }

  /**
   * Maps the existing Schedule to the UI components
   */
  private _mapScheduleDateToUi(): void {
    if (!this.hasSchedule) { return; }
    let cronJson = McsCronUtility.parseCronStringToJson(this.scheduleDate.crontab);
    let convertedTime = formatTime(cronJson.hour + ':' + cronJson.minute, 'HH:mm', 'h:mm A');
    let convertedTimeArray = convertedTime.split(' ');
    if (this.scheduleDate.runOnce) {
      this.fcRunOnceSchedulePeriod.setValue(convertedTimeArray[1]);
      this.fcRunOnceScheduleTime.setValue(convertedTimeArray[0]);
      this.runOnceScheduleDay = cronJson.dayOfWeek[0];
    } else {
      this.fcRecurringSchedulePeriod.setValue(convertedTimeArray[1]);
      this.fcRecurringScheduleTime.setValue(convertedTimeArray[0]);
      this.scheduleDetails.setDays(...cronJson.dayOfWeek);
    }
    // Clone category selection
    this._initialCategoryList = this.scheduleDate.categories.slice();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns true if there is a change in the category selection, false otherwise
   */
  private _categorySelectionHasChanged(): boolean {
    let notEqualLength = this._initialCategoryList.length !==
      this.selectedNodes.length;
    if (notEqualLength) { return true; }

    let mockRecords = this._initialCategoryList.slice();
    deleteArrayRecord(mockRecords, (item) => {
      return !!this.selectedNodes.find((record) => record.value.id === item.id);
    });
    return mockRecords.length !== 0;
  }

  /**
   * Shows the schedule dialog
   * @param server Server to be detached
   * @param title title to be displaye on the dialog box
   * @param message message to be displayed on the dialog box
   */
  private _showScheduleDialog(
    server: McsServer,
    title: string,
    message: string,
    confirmText: string
  ): Observable<any> {

    let data = {
      data: server,
      type: 'warning',
      title, message,
      confirmText
    } as DialogConfirmation<McsServer>;
    let dialogRef = this._dialogService.open(DialogConfirmationComponent, { data, size: 'medium' });

    return dialogRef.afterClosed();
  }
}
