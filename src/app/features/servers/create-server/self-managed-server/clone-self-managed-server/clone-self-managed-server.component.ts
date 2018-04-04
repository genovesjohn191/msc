import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormControlDirective
} from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsDataStatus,
  McsDataStatusFactory,
  CoreValidators,
  CoreDefinition
} from '../../../../../core';
import {
  ServerCreateSelfManaged,
  Server,
  ServerCreateType
} from '../../../models';
import {
  isNullOrEmpty,
  isFormControlValid,
  replacePlaceholder,
  unsubscribeSafely
} from '../../../../../utilities';
import { FormGroupDirective } from '../../../../../shared';
import { ServersRepository } from '../../../servers.repository';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'mcs-clone-self-managed-server',
  templateUrl: './clone-self-managed-server.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class CloneSelfManagedServerComponent implements OnInit, OnDestroy {

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChild(FormGroupDirective)
  public fgCreateDirective: FormGroupDirective;

  @ViewChildren(FormControlDirective)
  public formControls: QueryList<FormControlDirective>;

  // Form variables
  public fgCloneServer: FormGroup;
  public fcServerName: FormControl;
  public fcTargetServer: FormControl;

  // Others
  public createType: ServerCreateType;
  public textContent: any;
  public textHelpContent: any;

  // Servers
  public targetServerId: string;
  public servers: Server[];
  public serversSubscription: Subscription;
  public dataStatusFactory: McsDataStatusFactory<Server[]>;

  // Parameters
  private _parameterSubscription: Subscription;

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _serversRespository: ServersRepository,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.createType = ServerCreateType.Clone;
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    // Set text content including contextual help
    this.textContent = this._textContentProvider.content
      .servers.createServer.selfManagedServer;
    this.textHelpContent = this.textContent.contextualHelp;

    // Register forms
    this._registerFormGroup();
    this._getAllServers();
    this._listenToParamChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.serversSubscription);
    unsubscribeSafely(this._parameterSubscription);
  }

  public isControlValid(control: any): boolean {
    return isFormControlValid(control);
  }

  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcServerName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._customServerNameValidator.bind(this),
        this.textContent.invalidServerName
      )
    ]);

    this.fcTargetServer = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.fgCloneServer = new FormGroup({
      fcServerName: this.fcServerName,
      fcTargetServer: this.fcTargetServer
    });
    this.fgCloneServer.statusChanges.subscribe(() => {
      this._outputServerDetails();
    });
  }

  private _outputServerDetails(): void {
    let cloneSelfManaged: ServerCreateSelfManaged;
    cloneSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    cloneSelfManaged.type = ServerCreateType.Clone;
    cloneSelfManaged.serverName = this.fcServerName.value;
    cloneSelfManaged.targetServer = this.fcTargetServer.value;
    cloneSelfManaged.isValid = this.fgCloneServer.valid;
    this.onOutputServerDetails.next(cloneSelfManaged);
  }

  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }

  /**
   * Get all servers from repository service
   */
  private _getAllServers(): void {
    unsubscribeSafely(this.serversSubscription);
    // We need to check the datastatus factory if its not undefined
    // because it was called under base class and for any reason, the instance is undefined.
    if (isNullOrEmpty(this.dataStatusFactory)) {
      this.dataStatusFactory = new McsDataStatusFactory();
    }

    this.dataStatusFactory.setInProgress();
    this.serversSubscription = this._serversRespository
      .findAllRecords()
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.servers = response;
        this.dataStatusFactory.setSuccesfull(response);
        this._setTargetServerById();
      });
    this.serversSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Listen to every change of the parameter
   */
  private _listenToParamChange(): void {
    this._parameterSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        this.targetServerId = params['clone'];
        this._setTargetServerById();
      });
  }

  /**
   * This will set the target server based on ID provided by parameters
   */
  private _setTargetServerById(): void {
    let hasServers = !isNullOrEmpty(this.targetServerId) && !isNullOrEmpty(this.servers);
    if (!hasServers) { return; }
    this.fcTargetServer.setValue(this.targetServerId);
  }
}
