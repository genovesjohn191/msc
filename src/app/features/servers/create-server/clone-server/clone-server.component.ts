import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Observable,
  Subscription
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreDefinition,
  CoreValidators,
  McsDataStatusFactory
} from '../../../../core';
import {
  replacePlaceholder,
  isNullOrEmpty,
  unsubscribeSafely,
  refreshView
} from '../../../../utilities';
import {
  ServerCreateType,
  ServerCreateDetails,
  ServerServiceType,
  Server,
  ServerIpAllocationMode
} from '../../models';
import { ServersRepository } from '../../servers.repository';
import { CreateServerBase } from '../create-server.base';

@Component({
  selector: 'mcs-clone-server',
  templateUrl: 'clone-server.component.html'
})

export class CloneServerComponent extends CreateServerBase implements OnInit, OnDestroy {
  @Input()
  public serviceType: ServerServiceType;

  public textContent: any;
  public textHelpContent: any;
  public targetServerId: string;
  public servers: Server[];
  public serversSubscription: Subscription;
  public parameterSubscription: Subscription;
  public dataStatusFactory: McsDataStatusFactory<Server[]>;
  public ipAddressStatusFactory: McsDataStatusFactory<Server>;

  // Form variables
  public fgCloneServer: FormGroup;
  public fcServerName: FormControl;
  public fcTargetServer: FormControl;

  /**
   * Selected server property
   */
  private _selectedServer: Server;
  public get selectedServer(): Server { return this._selectedServer; }
  public set selectedServer(value: Server) {
    if (this._selectedServer !== value) {
      this._selectedServer = value;
      this._getServerById(this._selectedServer.id);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Returns true when the server is manually assigned IP address
   */
  private _serverIsManuallyAssignedIp: boolean;
  public get serverIsManuallyAssignedIp(): boolean { return this._serverIsManuallyAssignedIp; }
  public set serverIsManuallyAssignedIp(value: boolean) {
    if (value !== this._serverIsManuallyAssignedIp) {
      this._serverIsManuallyAssignedIp = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _serversRepository: ServersRepository
  ) {
    super(ServerCreateType.Clone);
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
    this.ipAddressStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.cloneServer;
    this.textHelpContent = this._textContentProvider.content.servers.createServer.contextualHelp;
    this._registerFormGroup();
    this._getAllServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.parameterSubscription);
    unsubscribeSafely(this.serversSubscription);
  }

  /**
   * Converts the character to maximum input
   */
  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  /**
   * Returns the creation details input
   */
  public getCreationInputs(): ServerCreateDetails {
    let formIsValid = !isNullOrEmpty(this.fgCloneServer) && this.fgCloneServer.valid;
    if (!formIsValid) { return; }

    let cloneServerInputs = new ServerCreateDetails();
    cloneServerInputs.serverName = this.fcServerName.value;
    cloneServerInputs.targetServer = this.fcTargetServer.value;
    return cloneServerInputs;
  }

  /**
   * Returns the creation form group
   */
  public getCreationForm(): FormGroup {
    return this.fgCloneServer;
  }

  /**
   * Gets all the servers from repository
   */
  private _getAllServers(): void {
    unsubscribeSafely(this.serversSubscription);
    this.dataStatusFactory.setInProgress();
    this.serversSubscription = this._serversRepository
      .findAllRecords()
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this.dataStatusFactory.setError();
          return Observable.throw(error);
        })
      )
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.servers = (response as Server[]).filter((server) => server.clonable);
        this.dataStatusFactory.setSuccesfull(response);
      });
    this.serversSubscription.add(() => {
      this._listenToParamChange();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Gets the corresponding server details
   * @param serverId Sever ID to get the server details
   */
  private _getServerById(serverId: string): void {
    this.serverIsManuallyAssignedIp = false;
    this.ipAddressStatusFactory.setInProgress();
    this._serversRepository
      .findRecordById(serverId)
      .pipe(
        catchError((error) => {
          this.ipAddressStatusFactory.setSuccesfull();
          return Observable.throw(error);
        })
      )
      .subscribe((response) => {
        this.ipAddressStatusFactory.setSuccesfull(response);
        let hasNics = !isNullOrEmpty(response) && !isNullOrEmpty(response.nics);
        if (!hasNics) { return; }
        this.serverIsManuallyAssignedIp = !!response.nics
          .find((nic) => nic.ipAllocationMode === ServerIpAllocationMode.Manual);
      });
  }

  /**
   * Listen to every change of the parameter
   */
  private _listenToParamChange(): void {
    unsubscribeSafely(this.parameterSubscription);
    this.parameterSubscription = this._activatedRoute.queryParams
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
    let server = this.servers.find((_server) => _server.id === this.targetServerId);
    refreshView(() => this.fcTargetServer.setValue(server));
  }

  /**
   * Registers the form group including its form fields
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcServerName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._customServerNameValidator.bind(this),
        'invalidServerName'
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
  }

  /**
   * Returns true when server name is valid
   * @param inputValue Inputted value from input box
   */
  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }
}
