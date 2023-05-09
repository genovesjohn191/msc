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
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInputEvent
} from '@angular/material/datepicker';

import { TranslateService } from '@ngx-translate/core';
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
  CoreValidators,
  McsDataStatusFactory,
  McsDateTimeService
} from '@app/core';
import {
  animateFactory,
  isNullOrEmpty,
  deleteArrayRecord,
  formatTime,
  getSafeProperty,
  compareStrings,
  compareArrays
} from '@app/utilities';
import {
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesCategory,
  McsServer,
  OsUpdatesScheduleType,
  Day,
  ServerServicesAction,
  Week,
  McsServerOsUpdatesScheduleDetails,
  osUpdatesScheduleTypeText,
  McsServerOsUpdatesScheduleDetailsRequest
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogConfirmation,
  McsFormGroupDirective,
  DialogService,
  TreeNode
} from '@app/shared';
import {
  OsUpdatesScheduleDetails,
  ScheduleDay,
  ScheduleWeek
} from './os-updates-schedule-details';
import { ServerServiceActionDetail } from '../../strategy/server-service-action.context';

@Component({
  selector: 'mcs-server-os-updates-schedule-details',
  templateUrl: './os-updates-schedule-details.component.html',
  host: {
    'class': 'block'
  },
  animations: [
    animateFactory.fadeIn
  ]
})
export class ServiceOsUpdatesScheduleDetailsComponent implements OnInit {

  public monthlyCategories: McsServerOsUpdatesCategory[];
  public weeklyCategories: McsServerOsUpdatesCategory[];
  public customCategories: McsServerOsUpdatesCategory[];
  public scheduleDetails: OsUpdatesScheduleDetails;
  public scheduleDate: McsServerOsUpdatesSchedule;
  public scheduleType: number;
  public snapshot: boolean = false;
  public restart: boolean = false;
  public datePanelOpen: boolean = true;

  public osUpdatesScheduleConfiguration$: Observable<McsServerOsUpdatesSchedule>;
  public scheduleDaysChange$: Observable<ScheduleDay[]>;
  public scheduleWeeksChange$: Observable<ScheduleWeek[]>;
  public configurationStatusFactory: McsDataStatusFactory<any>;

  public timeOptions: string[] = [];
  public dayPeriodOptions: string[] = [];

  // Form variables
  public fgSchedule: FormGroup<any>;

  // Weekly Form Controls
  public fcWeeklyScheduleDay: FormControl<any>;
  public fcWeeklyScheduleTime: FormControl<any>;
  public fcWeeklyScheduleTimePeriod: FormControl<any>;

  // Monthly Form Controls
  public fcMonthlyScheduleWeek: FormControl<any>;
  public fcMonthlyScheduleDay: FormControl<any>;
  public fcMonthlyScheduleTime: FormControl<any>;
  public fcMonthlyScheduleTimePeriod: FormControl<any>;

  // Custom Form Controls
  public fcCustomScheduleTime: FormControl<any>;
  public fcCustomScheduleTimePeriod: FormControl<any>;

  // Custom Calendar variables
  public CALENDAR_CLOSE_ON_SELECTED = false;
  public defaultDate = new Date();
  public resetDateModel = new Date(0);
  public dateModel = [];
  public minDate = new Date(Date.now() + ( 3600 * 1000 * 24)); // current date plus 1 day
  public maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // 1 yr from current date

  @ViewChild('picker') _picker: MatDatepicker<Date>;
  public dateClass = (date: Date) => {
    if (this._findDate(date) !== -1) {
      return [ 'selected' ];
    }
    return [ ];
  }

  @Input()
  public selectedServer: McsServer;

  @Input()
  public validToUpdateOs: boolean;

  @Output()
  public saveSchedule: EventEmitter<ServerServiceActionDetail>;

  @Output()
  public deleteSchedule: EventEmitter<ServerServiceActionDetail>;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _initialScheduleCategoryList: McsServerOsUpdatesCategory[];
  private _initialSchedule: McsServerOsUpdatesScheduleDetails;

  public get scheduleTypeOption(): typeof OsUpdatesScheduleType {
    return OsUpdatesScheduleType;
  }

  public get hasSchedule(): boolean {
    return !isNullOrEmpty(this.scheduleDate?.job?.schedule);
  }

  public get scheduleDateType(): number {
    return this.scheduleDate?.job?.schedule?.type;
  }

  /**
   * Returns true if there are no selected categories and no change in the form, false otherwise
   */
  public get isWeeklySaveButtonDisabled(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return true; }

    let hasSelectedCategories = this.monthlyCategories.filter((category) => category.isSelected).length > 0;
    let hasSelectedDays = getSafeProperty(this.fcWeeklyScheduleDay, (obj) => obj.value.length > 0, false);
    let allRequiredFieldsAreSet = hasSelectedCategories && hasSelectedDays && this._formGroup.isValid();
    if (!allRequiredFieldsAreSet) { return true; }

    if (this.hasSchedule && this.scheduleType === OsUpdatesScheduleType.Weekly) { return !this._hasPendingWeeklyScheduleChanges(); }
    return false;
  }

  /**
   * Returns true if there are no selected categories and no change in the form, false otherwise
   */
  public get isMonthlySaveButtonDisabled(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return true; }

    let hasSelectedCategories = this.weeklyCategories.filter((category) => category.isSelected).length > 0;
    let hasSelectedWeeks = getSafeProperty(this.fcMonthlyScheduleWeek, (obj) => obj.value.length > 0, false);
    let hasSelectedDays = getSafeProperty(this.fcMonthlyScheduleDay, (obj) => obj.value.length > 0, false);
    let allRequiredFieldsAreSet = hasSelectedCategories && hasSelectedWeeks && hasSelectedDays && this._formGroup.isValid();
    if (!allRequiredFieldsAreSet) { return true; }

    if (this.hasSchedule && this.scheduleType === OsUpdatesScheduleType.Monthly) { return !this._hasPendingMonthlyScheduleChanges(); }
    return false;
  }

  /**
   * Returns true if there are no selected categories and no change in the form, false otherwise
   */
  public get isCustomSaveButtonDisabled(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return true; }

    this._changeDetectorRef.markForCheck();
    let hasSelectedCategories = this.customCategories.filter((category) => category.isSelected).length > 0;
    let hasSelectedDates = this.dateModel?.length !== 0;
    let allRequiredFieldsAreSet = hasSelectedDates && hasSelectedCategories && this._formGroup.isValid();
    if (!allRequiredFieldsAreSet) { return true; }

    if (this.hasSchedule && this.scheduleType === OsUpdatesScheduleType.Custom) { return !this._hasPendingCustomScheduleChanges(); }
    return false;
  }

  constructor(
    private _dialogService: DialogService,
    private _formBuilder: FormBuilder,
    private _dateTimeService: McsDateTimeService,
    protected _apiService: McsApiService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _translateService: TranslateService
  ) {
    this.scheduleType = OsUpdatesScheduleType.Weekly;
    this.saveSchedule = new EventEmitter();
    this.deleteSchedule = new EventEmitter();
    this.scheduleDetails = new OsUpdatesScheduleDetails();
    this.configurationStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this._initializeFormControls();
    this._getOsUpdatesScheduleConfiguration();
    this.scheduleDaysChange$ = this.scheduleDetails.scheduleDaysChange();
    this.scheduleWeeksChange$ = this.scheduleDetails.scheduleWeeksChange();
  }

  public updateDatePanelStatus(isPanelOpen: boolean): void {
    this.datePanelOpen = isPanelOpen;
  }

  public saveWeeklySchedule(): void {
    let request = new McsServerOsUpdatesScheduleRequest();
    request.snapshot = this.snapshot;
    request.restart = this.restart;
    let schedule = new McsServerOsUpdatesScheduleDetailsRequest();
    schedule.type = osUpdatesScheduleTypeText[this.scheduleType];
    schedule.weekdays = this.fcWeeklyScheduleDay.value;
    schedule.weekdayOrdinals = null;
    schedule.time = this._convertTimeTo24hrFormat(this.fcWeeklyScheduleTime.value, this.fcWeeklyScheduleTimePeriod.value);
    schedule.dates = null; 
    request.schedule = schedule;
    request.categories = [];

    this.weeklyCategories.forEach((category) => {
      if (category.isSelected) { request.categories.push(category.id); }
    });
    let actionDetails = { server: this.selectedServer, payload: request, action: ServerServicesAction.OsUpdatesScheduleSave };

    if (this.hasSchedule) {
      this._showScheduleDialog(this.selectedServer,
        this._translateService.instant('serverServicesOsUpdatesSchedule.updateDialogTitle'),
        this._translateService.instant('serverServicesOsUpdatesSchedule.updateDialogMessage'),
        this._translateService.instant('serverServicesOsUpdatesSchedule.saveConfirmText'),
      ).pipe(
        tap((dialogResult) => {
          if (isNullOrEmpty(dialogResult)) { return of(undefined); }
          this.saveSchedule.emit(actionDetails);
        })).subscribe();
    } else {
      this.saveSchedule.emit(actionDetails);
    }
  }

  public saveMonthlySchedule(): void {
    let request = new McsServerOsUpdatesScheduleRequest();
    request.snapshot = this.snapshot;
    request.restart = this.restart;
    request.categories = [];
    let schedule = new McsServerOsUpdatesScheduleDetailsRequest();
    schedule.type = osUpdatesScheduleTypeText[this.scheduleType];
    schedule.weekdayOrdinals = this.fcMonthlyScheduleWeek.value;
    schedule.weekdays = this.fcMonthlyScheduleDay.value;
    schedule.time = this._convertTimeTo24hrFormat(this.fcMonthlyScheduleTime.value, this.fcMonthlyScheduleTimePeriod.value);
    schedule.dates = null; 
    request.schedule = schedule;

    this.monthlyCategories.forEach((category) => {
      if (category.isSelected) { request.categories.push(category.id); }
    });
    let actionDetails = { server: this.selectedServer, payload: request, action: ServerServicesAction.OsUpdatesScheduleSave };
    
    if (this.hasSchedule) {
      this._showScheduleDialog(
        this.selectedServer,
        this._translateService.instant('serverServicesOsUpdatesSchedule.updateDialogTitle'),
        this._translateService.instant('serverServicesOsUpdatesSchedule.updateDialogMessage'),
        this._translateService.instant('serverServicesOsUpdatesSchedule.saveConfirmText'),
      ).pipe(
        tap((dialogResult) => {
          if (isNullOrEmpty(dialogResult)) { return of(undefined); }
          this.saveSchedule.emit(actionDetails);
        })).subscribe();
    } else {
      this.saveSchedule.emit(actionDetails);
    }
  }

  public saveCustomSchedule(): void {
    let request = new McsServerOsUpdatesScheduleRequest();
    request.snapshot = this.snapshot;
    request.restart = this.restart;
    request.categories = [];
    let schedule = new McsServerOsUpdatesScheduleDetailsRequest();
    schedule.type = osUpdatesScheduleTypeText[this.scheduleType];
    schedule.weekdayOrdinals = null;
    schedule.weekdays = null;
    schedule.dates = this._convertCustomDatesToIsoString(this.dateModel);
    schedule.time = null;
    request.schedule = schedule;

    this.monthlyCategories.forEach((category) => {
      if (category.isSelected) { request.categories.push(category.id); }
    });
    let actionDetails = { server: this.selectedServer, payload: request, action: ServerServicesAction.OsUpdatesScheduleSave };

    if (this.hasSchedule) {
      this._showScheduleDialog(
        this.selectedServer,
        this._translateService.instant('serverServicesOsUpdatesSchedule.updateDialogTitle'),
        this._translateService.instant('serverServicesOsUpdatesSchedule.updateDialogMessage'),
        this._translateService.instant('serverServicesOsUpdatesSchedule.saveConfirmText'),
      ).pipe(
        tap((dialogResult) => {
          if (isNullOrEmpty(dialogResult)) { return of(undefined); }
          this.saveSchedule.emit(actionDetails);
        })).subscribe();
    } else {
      this.saveSchedule.emit(actionDetails);
    }
  }

  public deleteExistingSchedule(): void {
    this._showScheduleDialog(
      this.selectedServer,
      this._translateService.instant('serverServicesOsUpdatesSchedule.deleteDialogTitle'),
      this._translateService.instant('serverServicesOsUpdatesSchedule.deleteDialogMessage'),
      this._translateService.instant('serverServicesOsUpdatesSchedule.deleteConfirmText'),
    ).pipe(
      tap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(undefined); }
        this.deleteSchedule.emit({ server: this.selectedServer, action: ServerServicesAction.OsUpdatesScheduleDelete });
      })
    ).subscribe();
  }

  public onScheduleTypeChange(): void {
    switch(this.scheduleType)  {
      case OsUpdatesScheduleType.Weekly:
        this._registerWeeklyFormControls();
        break;
      case OsUpdatesScheduleType.Monthly:
        this._registerMonthlyFormControls();
        break;
      case OsUpdatesScheduleType.Custom:
        this._registerCustomFormControls();
        break;
    }

    if (!this.hasSchedule) {
      this.scheduleDetails.resetDays();
      this.scheduleDetails.resetWeeks();
      this.dateModel = [];
      this._resetCategories();
      return;
    }

    let convertedTime = formatTime(this._initialSchedule?.time, 'HH:mm', 'h:mm A');

    if (this._initialSchedule?.dates?.length !== 0) {
      convertedTime = this._formatCustomTypeTime(this._initialSchedule.dates[0]);
    }

    let convertedTimeArray = convertedTime?.split(' ');

    if (this.scheduleType === OsUpdatesScheduleType.Weekly) {
      this._setWeeklyFormControls(convertedTimeArray[1], convertedTimeArray[0], this._initialSchedule.weekdays);

      this.weeklyCategories = this._mapSelectedCategories(
        this.weeklyCategories, this._initialScheduleCategoryList
      );
      return;
    }

    if (this.scheduleType === OsUpdatesScheduleType.Monthly) {
      this._setMonthlyFormControls(convertedTimeArray[1], convertedTimeArray[0], this._initialSchedule.weekdays, this._initialSchedule.weekdayOrdinals);
      this.monthlyCategories = this._mapSelectedCategories(
        this.monthlyCategories, this._initialScheduleCategoryList
      );
      return;
    }

    if (this.scheduleType === OsUpdatesScheduleType.Custom) {
      this._setCustomFormControls(this._initialSchedule.dates, convertedTimeArray[1], convertedTimeArray[0]);
      this.customCategories = this._mapSelectedCategories(
        this.customCategories, this._initialScheduleCategoryList
      );
      return;
    }

    this.scheduleDetails.resetDays();
    this.scheduleDetails.resetWeeks();
    this._resetCategories();
  }

  /**
   * Listener method whenever there is a change in selection on the weekly tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onWeeklyTreeChange(_selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>): void {
    this.weeklyCategories.forEach((category) => {
      category.isSelected = !isNullOrEmpty(_selectedNodes.find(
        (selectedNode) => category.id === selectedNode.value.id));
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener method whenever there is a change in selection on the monthly tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onMonthlyTreeChange(_selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>): void {
    this.monthlyCategories.forEach((category) => {
      category.isSelected = !isNullOrEmpty(_selectedNodes.find(
        (selectedNode) => category.id === selectedNode.value.id));
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener method whenever there is a change in selection on the custom tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onCustomTreeChange(_selectedNodes: Array<TreeNode<McsServerOsUpdatesCategory>>): void {
    this.customCategories.forEach((category) => {
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
    if (this.scheduleType === OsUpdatesScheduleType.Weekly) {
      return false;
    }
    if (this.scheduleType === OsUpdatesScheduleType.Monthly) {
      return false;
    }
    if (this.scheduleType === OsUpdatesScheduleType.Custom) {
      return false;
    }
    return !!this.scheduleDate.categories.find((category) => category.id === osUpdateCategory.id);
  }

  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      let date = event.value;
      let index = this._findDate(date);
      if (index === -1) {
        this.dateModel.push(event.value);
      } else {
        this.dateModel.splice(index, 1)
      }
      this.resetDateModel = new Date(0);
      if (!this.CALENDAR_CLOSE_ON_SELECTED) {
        const closeFn = this._picker.close;
        this._picker.close = () => { };
        this._picker['_componentRef'].instance._calendar.monthView._createWeekCells()
        setTimeout(() => {
          this._picker.close = closeFn;
        });
      }
    }
  }

  public removeSelectedDate(date: Date): void {
    const index = this._findDate(date);
    this.dateModel.splice(index, 1)
  }

  private _findDate(date: Date): number {
    return this.dateModel.map((m) => +m).indexOf(+date);
  }

  private _initializeFormControls(): void {
    // Weekly
    this.fcWeeklyScheduleDay = new FormControl<any>('', [CoreValidators.required]);
    this.fcWeeklyScheduleTime = new FormControl<any>('', [CoreValidators.required]);
    this.fcWeeklyScheduleTimePeriod = new FormControl<any>('', [CoreValidators.required]);

    // Monthly
    this.fcMonthlyScheduleWeek = new FormControl<any>('', [CoreValidators.required]);
    this.fcMonthlyScheduleDay = new FormControl<any>('', [CoreValidators.required]);
    this.fcMonthlyScheduleTime = new FormControl<any>('', [CoreValidators.required]);
    this.fcMonthlyScheduleTimePeriod = new FormControl<any>('', [CoreValidators.required]);

    // Custom
    this.fcCustomScheduleTime = new FormControl<any>('', [CoreValidators.required]);
    this.fcCustomScheduleTimePeriod = new FormControl<any>('', [CoreValidators.required]);

    // Register Form Groups using binding
    this.fgSchedule = this._formBuilder.group([]);

    // Initialize Time and Period selections
    // TODO : Change to Timepicker
    this.timeOptions = this._translateService.instant('serverServicesOsUpdatesSchedule.timeSelection').split(',');
    this.dayPeriodOptions = this._translateService.instant('serverServicesOsUpdatesSchedule.dayPeriod').split(',');
  }

  /**
   * Get the Categories and Schedule date of the current server
   */
  private _getOsUpdatesScheduleConfiguration() {
    this.configurationStatusFactory.setInProgress();
    this.osUpdatesScheduleConfiguration$ = this._getOsUpdatesCategories().pipe(
      concatMap((categories) => {
        return this._getScheduleDate(categories);
      }),
      tap((result) => {
        this.configurationStatusFactory.setSuccessful(result);
      }),
      catchError((error) => {
        this.configurationStatusFactory.setError();
        return throwError(error);
      })
    );
  }

  /**
   * Get the list of categories of the current server
   */
  private _getOsUpdatesCategories(): Observable<McsServerOsUpdatesCategory[]> {
    return this._apiService.getServerOsUpdatesCategories().pipe(
      map((response) => response && response.collection.filter(
        (category) => category.osType === this.selectedServer.operatingSystem.type)
      ),
      tap((categories) => {
        this.weeklyCategories = categories.slice();
        this.monthlyCategories = categories.slice();
        this.customCategories = categories.slice();
      }),
      catchError((error) => throwError(error))
    );
  }

  /**
   * Get the schedule date from api, if there are multiple entries, the first one will be used
   * @param categories categories list reference where the selected categories of the user are map
   */
  private _getScheduleDate(categories: McsServerOsUpdatesCategory[]): Observable<McsServerOsUpdatesSchedule> {
    return this._apiService
      .getServerOsUpdatesSchedule(this.selectedServer.id)
      .pipe(
        tap((response) => {
          if (!isNullOrEmpty(response)) {
            let schedules = getSafeProperty(response, (obj) => obj.collection);
            this.scheduleDate = schedules[0];
            this._setInitialScheduleReference();
            this._setSelectedCategoriesByType(categories);
          }
          this._changeDetectorRef.markForCheck();
        }),
        map((response) => {
          let schedules = getSafeProperty(response, (obj) => obj.collection);
          return !isNullOrEmpty(schedules) ? schedules[0] : new McsServerOsUpdatesSchedule();
        }),
        catchError((error) => {
          this.scheduleDate = undefined;
          return throwError(error);
        })
      );
  }

  private _registerWeeklyFormControls(): void {
    this.fgSchedule = this._formBuilder.group([]);
    this.fgSchedule.setControl('fcWeeklyScheduleDay', this.fcWeeklyScheduleDay);
    this.fgSchedule.setControl('fcWeeklyScheduleTime', this.fcWeeklyScheduleTime);
    this.fgSchedule.setControl('fcWeeklyScheduleTimePeriod', this.fcWeeklyScheduleTimePeriod);
  }

  private _registerMonthlyFormControls(): void {
    this.fgSchedule = this._formBuilder.group([]);
    this.fgSchedule.setControl('fcMonthlyScheduleWeek', this.fcMonthlyScheduleWeek);
    this.fgSchedule.setControl('fcMonthlyScheduleDay', this.fcMonthlyScheduleDay);
    this.fgSchedule.setControl('fcMonthlyScheduleTime', this.fcMonthlyScheduleTime);
    this.fgSchedule.setControl('fcMonthlyScheduleTimePeriod', this.fcMonthlyScheduleTimePeriod);
  }

  private _registerCustomFormControls(): void {
    this.fgSchedule = this._formBuilder.group([]);
    this.fgSchedule.setControl('fcCustomScheduleTime', this.fcCustomScheduleTime);
    this.fgSchedule.setControl('fcCustomScheduleTimePeriod', this.fcCustomScheduleTimePeriod);
  }

  private _resetCategories(): void {
    this.weeklyCategories.forEach((category) => category.isSelected = false);
    this.monthlyCategories.forEach((category) => category.isSelected = false);
    this.customCategories.forEach((category) => category.isSelected = false);
    this._changeDetectorRef.markForCheck();
  }

  private _convertTimeTo24hrFormat(time: string, period: string): string {
    let timeWithPeriod = time + ' ' + period;
    return formatTime(timeWithPeriod, 'hh:mm a');
  }

  private _setInitialScheduleReference(): void {
    if (!this.hasSchedule) { return; }
    this.scheduleType = this.scheduleDateType;
    this.snapshot = this.scheduleDate.snapshot;
    this.restart = this.scheduleDate.restart;
    this._initialSchedule = this.scheduleDate?.job?.schedule;
    this._initialScheduleCategoryList = this.scheduleDate.categories.slice();
    this._changeDetectorRef.markForCheck();
  }

  private _setSelectedCategoriesByType(categories: McsServerOsUpdatesCategory[]) {
    if (!this.hasSchedule) { return; }
    let selectedCategories = this._mapSelectedCategories(categories, this.scheduleDate.categories);
    if (this.scheduleType === OsUpdatesScheduleType.Weekly) {
      this.weeklyCategories = selectedCategories;
    } 
    if (this.scheduleType === OsUpdatesScheduleType.Monthly) {
      this.monthlyCategories = selectedCategories;
    }
    if (this.scheduleType === OsUpdatesScheduleType.Custom) {
      this.customCategories = selectedCategories;
    }
  }

  private _setWeeklyFormControls(period: string, time: string, days: Day[]): void {
    this.fcWeeklyScheduleTimePeriod.setValue(period);
    this.fcWeeklyScheduleTime.setValue(time);
    this.fcWeeklyScheduleDay.setValue(days);
    if (days?.length > 0) {
      this.scheduleDetails.setDays(...days);
    }
  }

  private _setMonthlyFormControls(period: string, time: string, days: Day[], weeks: Week[]): void {
    this.fcMonthlyScheduleTimePeriod.setValue(period);
    this.fcMonthlyScheduleTime.setValue(time);
    this.fcMonthlyScheduleDay.setValue(days);
    this.fcMonthlyScheduleWeek.setValue(weeks);
    if (days?.length > 0) {
      this.scheduleDetails.setDays(...days);
    }
    if (weeks?.length > 0) {
      this.scheduleDetails.setWeeks(...weeks);
    }
  }

    private _setCustomFormControls(dates: string[], period: string, time: string): void {
      let dateArray = [];
      if (dates?.length > 0) {
        dates.forEach((date) => {
          let formatDate = new Date(date).toLocaleDateString();
          dateArray.push(new Date(formatDate));
        });
      }
      this.dateModel = dateArray;
      this.fcCustomScheduleTimePeriod.setValue(period);
      this.fcCustomScheduleTime.setValue(time);
      this._changeDetectorRef.markForCheck();
    }

  /**
   * Returns true if there are current changes in the schedule options of weekly schedule
   */
  private _hasPendingWeeklyScheduleChanges(): boolean {
    let differentScheduleDaySelection = compareArrays(this.fcWeeklyScheduleDay.value, this.scheduleDate?.job?.schedule?.weekdays) !== 0;
    let currentTimeSelected = this._convertTimeTo24hrFormat(this.fcWeeklyScheduleTime.value, this.fcWeeklyScheduleTimePeriod.value);
    let differentScheduleTimeSelection = compareStrings(
      currentTimeSelected, formatTime(this.scheduleDate?.job?.schedule?.time, 'hh:mm:ss')) !== 0;
    let differentSchedule = differentScheduleDaySelection || differentScheduleTimeSelection;

    let differentCategorySelection = this._categorySelectionHasChanged(this.monthlyCategories);
    let differentSnapshotOption = this.snapshot !== this.scheduleDate.snapshot;
    let differentRestartOption = this.restart !== this.scheduleDate.restart;
    return differentSchedule || differentCategorySelection || differentSnapshotOption || differentRestartOption;
  }

  /**
   * Returns true if there are current changes in the schedule options of monthly schedule
   */
  private _hasPendingMonthlyScheduleChanges(): boolean {
    let differentScheduleWeekSelection = compareArrays(this.fcMonthlyScheduleWeek.value, this.scheduleDate?.job?.schedule?.weekdayOrdinals) !== 0;
    let differentScheduleDaySelection = compareArrays(this.fcMonthlyScheduleDay.value, this.scheduleDate?.job?.schedule?.weekdays) !== 0;
    let currentTimeSelected = this._convertTimeTo24hrFormat(this.fcMonthlyScheduleTime.value, this.fcMonthlyScheduleTimePeriod.value);
    let differentScheduleTimeSelection = compareStrings(
      currentTimeSelected, formatTime(this.scheduleDate?.job?.schedule?.time, 'hh:mm:ss')) !== 0;
    let differentSchedule = differentScheduleWeekSelection || differentScheduleDaySelection || differentScheduleTimeSelection;

    let differentCategorySelection = this._categorySelectionHasChanged(this.monthlyCategories);
    let differentSnapshotOption = this.snapshot !== this.scheduleDate.snapshot;
    let differentRestartOption = this.restart !== this.scheduleDate.restart;
    return differentSchedule || differentCategorySelection || differentSnapshotOption || differentRestartOption;
  }

  /**
   * Returns true if there are current changes in the schedule options of custom schedule
   */
  private _hasPendingCustomScheduleChanges(): boolean {
    let differentScheduleTimeSelection = this._isCustomTimeDifferent();
    let differentScheduleDateSelection = this._isCustomDateDifferent();
    let differentSchedule = differentScheduleDateSelection || differentScheduleTimeSelection;

    let differentCategorySelection = this._categorySelectionHasChanged(this.customCategories);
    let differentSnapshotOption = this.snapshot !== this.scheduleDate.snapshot;
    let differentRestartOption = this.restart !== this.scheduleDate.restart;
    return differentSchedule || differentCategorySelection || differentSnapshotOption || differentRestartOption;
  }

  private _isCustomDateDifferent(): boolean {
    let currentDateSelected = this._convertCustomTypeDate(this.dateModel);
    let existingDateSchedule = this._convertCustomTypeDate(this.scheduleDate?.job?.schedule.dates);
    return compareStrings(currentDateSelected.toString(), existingDateSchedule.toString()) !== 0;
  }

  private _convertCustomTypeDate(dates: string[]): string[] {
    let dateArray = [];
    dates.forEach((dateString) => {
      dateArray.push(this._dateTimeService.formatDate(new Date(dateString), 'longDate'));
    })
    return dateArray;
  }

  private _isCustomTimeDifferent(): boolean {
    let currentTimeSelected = this._convertTimeTo24hrFormat(this.fcCustomScheduleTime.value, this.fcCustomScheduleTimePeriod.value);
    let existingTimeSchedule = this._formatCustomTypeTime(this.scheduleDate?.job?.schedule.dates[0]);
    let existingTimeSchedule24hrFormat = formatTime(existingTimeSchedule, 'h:mm A', 'HH:mm');
    return compareStrings(currentTimeSelected, existingTimeSchedule24hrFormat) !== 0;
  }

  private _formatCustomTypeTime(date: string): string {
    let dateString = new Date(date).toUTCString();
    dateString = dateString.split(' ').slice(0, 5).join(' '); // remove GMT in time
    let convertedTime = this._dateTimeService.formatDate(new Date(dateString), 'h:mm A');
    return convertedTime;
  }

  /**
   * Returns true if there is a change in the category selection, false otherwise
   * @param categories list of categories to be checked
   */
  private _categorySelectionHasChanged(categories: McsServerOsUpdatesCategory[]): boolean {
    let selectedCategories = categories.filter((category) => category.isSelected);
    if (this._initialScheduleCategoryList.length !== selectedCategories.length) { return true; }

    let cloneCategoryList = this._initialScheduleCategoryList.slice();
    deleteArrayRecord(cloneCategoryList, (item) => !!categories.find((record) => record.id === item.id));

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
      category.isSelected = !isNullOrEmpty(selectedCategories.find((selectedCategory) => category.id === selectedCategory.id));
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
  private _showScheduleDialog(server: McsServer, title: string, message: string, confirmText: string): Observable<any> {
    let dialogData = { data: server, type: 'warning', title, message, confirmText } as DialogConfirmation<McsServer>;
    let dialogRef = this._dialogService.openConfirmation(dialogData);

    return dialogRef.afterClosed();
  }

  private _convertCustomDatesToIsoString(selectedDates: Date[]): string[] {
    let dateArray = [];
    if (selectedDates?.length > 0) {
      this.dateModel.forEach((date) => {
        let formatDate = this._dateTimeService.formatDate(new Date(date), 'shortDateTime');
        let formatTime = this._convertTimeTo24hrFormat(this.fcCustomScheduleTime.value, this.fcCustomScheduleTimePeriod.value);
        let combinedDateTime = new Date(formatDate + ' ' + formatTime);
        dateArray.push(this._dateTimeService.formatDate(combinedDateTime, 'fullIsoDate'));
      })
    }
    return dateArray;
  }
}
