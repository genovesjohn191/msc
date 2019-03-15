import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormArray,
  FormBuilder
} from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  McsFormGroupService
} from '@app/core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  McsSafeToNavigateAway,
  getSafeProperty
} from '@app/utilities';
import { McsResource } from '@app/models';
import { ComponentHandlerDirective } from '@app/shared';
import { ServerCreateDetailsBase } from './server-create-details.base';

enum ServerCreateType {
  New = 1,
  Clone = 2
}

@Component({
  selector: 'mcs-server-create-details',
  templateUrl: 'server-create-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerCreateDetailsComponent implements
  OnInit, OnChanges, AfterViewInit, OnDestroy, McsSafeToNavigateAway {
  public textContent: any;
  public textHelpContent: any;

  public faCreationForms: FormArray;
  public selectedTabIndex: ServerCreateType = ServerCreateType.New;
  public serverDeploying: boolean;

  @Input()
  public resource: McsResource;

  @Output()
  public dataChange = new EventEmitter<Array<ServerCreateDetailsBase<any>>>();

  @Output()
  public dataSubmit = new EventEmitter<Array<ServerCreateDetailsBase<any>>>();

  @ViewChildren('serverBase')
  private _createServerItems: QueryList<ServerCreateDetailsBase<any>>;

  @ViewChild(ComponentHandlerDirective)
  private _serverDetailsComponent: ComponentHandlerDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formGroupService: McsFormGroupService
  ) {
    this.faCreationForms = this._formBuilder.array([]);
  }

  public ngOnInit() {
    this._setInitialTabViewByParam();
  }

  public ngAfterViewInit() {
    this._createServerItems.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        if (!isNullOrEmpty(this._createServerItems)) {
          this.faCreationForms = this._formBuilder.array([]);
          this._createServerItems.forEach((creationDetails) => {
            this.faCreationForms.push(creationDetails.getCreationForm());
          });
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public ngOnChanges(changes: SimpleChanges) {
    let resourceChange = changes['resource'];
    if (!isNullOrEmpty(resourceChange)) {
      this._resetTabForms();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the the create type enum
   */
  public get serverCreateTypeEnum(): any {
    return ServerCreateType;
  }

  /**
   * Event that emits when navigating away from create server page to other route
   */
  public safeToNavigateAway(): boolean {
    if (isNullOrEmpty(this._createServerItems) || this.serverDeploying) { return true; }
    let dirtyForm = this._createServerItems.find((serverItem) => {
      let serverCreationForm = serverItem.getCreationForm();
      return serverCreationForm.touched && serverCreationForm.dirty;
    });
    return isNullOrEmpty(dirtyForm);
  }

  /**
   * Event that emits wen tab changed
   * @param _tabItem Emitted tab item
   */
  public onTabChanged(_tabItem) {
    if (isNullOrEmpty(_tabItem)) { return; }
    this.selectedTabIndex = _tabItem.id;
  }

  /**
   * Event that emits when the created details have been changed
   */
  public onChangeCreationDetails(): void {
    if (!this.allFormsAreValid) { return; }
    if (isNullOrEmpty(this._createServerItems)) { return; }
    this.dataChange.emit(this._createServerItems.map((data) => data));
  }

  /**
   * Event that emits when the creation details have been submitted
   */
  public onSubmitCreationDetails(): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(this._createServerItems)) { return; }
    this.serverDeploying = true;
    this.dataSubmit.emit(this._createServerItems.map((data) => data));
  }

  /**
   * Returns true when all forms are valid
   */
  public get allFormsAreValid(): boolean {
    return getSafeProperty(this.faCreationForms, (obj) => obj.valid);
  }

  /**
   * Validates the form fields in all existing form groups
   */
  private _validateFormFields(): boolean {
    if (this.allFormsAreValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  /**
   * Touches all the invalid form fields
   */
  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.faCreationForms);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Resets all the tab forms
   */
  private _resetTabForms(): void {
    if (!isNullOrEmpty(this._serverDetailsComponent)) {
      this._serverDetailsComponent.recreateComponent();
    }
  }

  /**
   * Sets the initial tab view based on the parameter provided
   */
  private _setInitialTabViewByParam(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params: ParamMap) => {
        let serverId = params['clone'];
        if (!isNullOrEmpty(serverId)) {
          this.selectedTabIndex = ServerCreateType.Clone;
          this._changeDetectorRef.markForCheck();
        }
      });
  }
}
