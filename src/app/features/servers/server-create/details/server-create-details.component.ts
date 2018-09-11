import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  startWith,
  takeUntil,
  merge
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsSafeToNavigateAway,
  McsFormGroupService
} from '../../../../core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  clearArrayRecord
} from '../../../../utilities';
import { Resource } from '../../../resources';
import { ServerCreateType } from '../../models';
import { ServerCreateDetailsBase } from './server-create-details.base';
import { ServerCreateFlyweightContext } from '../server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create-details',
  templateUrl: 'server-create-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerCreateDetailsComponent implements
  OnInit, AfterViewInit, OnDestroy, McsSafeToNavigateAway {
  public textContent: any;
  public textHelpContent: any;

  public faCreationForms: FormArray;
  public selectedTabIndex: ServerCreateType = ServerCreateType.New;
  public serverDeploying: boolean;
  public serverComponents: Array<ServerCreateDetailsBase<any>>;
  public createServerFunc = this._createServer.bind(this);

  /**
   * Returns the current selected resource
   */
  public get resource(): Resource { return this._resource; }
  public set resource(value: Resource) { this._resource = value; }
  private _resource: Resource;

  @ViewChildren('serverBase')
  private _createServerItems: QueryList<ServerCreateDetailsBase<any>>;
  private _destroySubject = new Subject<void>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _formGroupService: McsFormGroupService,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext
  ) {
    this.faCreationForms = new FormArray([]);
    this.serverComponents = new Array();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer;
    this.textHelpContent = this._textContentProvider.content.servers.createServer.contextualHelp;
    this._listenToResourceChanges();
    this._setInitialTabViewByParam();
  }

  public ngAfterViewInit() {
    this._createServerItems.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        if (!isNullOrEmpty(this._createServerItems)) {
          this.faCreationForms = new FormArray([]);
          this._createServerItems.forEach((creationDetails) => {
            this.faCreationForms.push(creationDetails.getCreationForm());
          });
        }
        this._serverCreateFlyweightContext.setCreationFormArray(this.faCreationForms);
        this._changeDetectorRef.markForCheck();
      });
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
    let dirtyForm = this._createServerItems
      .find((serverItem) => serverItem.getCreationForm().dirty);
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
   * Create server based on server details
   */
  private _createServer(): Observable<any> {
    if (!this._validateFormFields()) { return; }

    if (isNullOrEmpty(this._createServerItems)) { return; }
    this.serverDeploying = true;
    let createServerStreams: Observable<any>;

    this._createServerItems.forEach((serverDetails) => {
      let serverStream = this._serverCreateFlyweightContext.createServer(
        serverDetails.getCreationInputs(),
        this.resource.serviceType,
        this.resource.name
      );
      isNullOrEmpty(createServerStreams) ?
        createServerStreams = serverStream :
        createServerStreams.pipe(merge(serverStream));
    });
    return createServerStreams;
  }

  /**
   * Validates the form fields in all existing form groups
   */
  private _validateFormFields(): boolean {
    let formsAreValid = !isNullOrEmpty(this.faCreationForms) && this.faCreationForms.valid;
    if (formsAreValid) { return true; }
    this._formGroupService.touchAllFieldsByFormArray(this.faCreationForms);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
    return false;
  }

  /**
   * Listens to resource changes
   */
  private _listenToResourceChanges(): void {
    this._serverCreateFlyweightContext.resourceChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((updatedResource) => {
        // Clear the record in order to get a new instance of the base component
        clearArrayRecord(this.serverComponents);
        this.resource = updatedResource;

        this.serverComponents.push({} as ServerCreateDetailsBase<any>);
        this._changeDetectorRef.markForCheck();
      });
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
