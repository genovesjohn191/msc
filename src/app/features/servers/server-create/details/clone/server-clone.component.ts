import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Subscription,
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  CoreValidators,
  McsDataStatusFactory
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  ServiceType,
  IpAllocationMode,
  McsServer,
  McsServerClone,
  Os
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import { ServerCreateDetailsBase } from '../server-create-details.base';

@Component({
  selector: 'mcs-server-clone',
  templateUrl: 'server-clone.component.html'
})

export class ServerCloneComponent
  extends ServerCreateDetailsBase<McsServerClone>
  implements OnInit, OnDestroy {

  @Input()
  public serviceType: ServiceType;

  @Input()
  public serverId: string;

  @Output()
  public dataChange = new EventEmitter<ServerCreateDetailsBase<McsServerClone>>();

  public textHelpContent: any;
  public servers: McsServer[];
  public serversSubscription: Subscription;
  public dataStatusFactory: McsDataStatusFactory<McsServer[]>;
  public ipAddressStatusFactory: McsDataStatusFactory<McsServer>;

  // Form variables
  public fgCloneServer: FormGroup;
  public fcServerName: FormControl;
  public fcTargetServer: FormControl;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

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

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    super();
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
    this.ipAddressStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._getAllServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.serversSubscription);
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns the creation details input
   */
  public getCreationInputs(): McsServerClone {
    let formIsValid = !isNullOrEmpty(this.fgCloneServer) && this.fgCloneServer.valid;
    if (!formIsValid) { return; }

    let serverClone = new McsServerClone();
    serverClone.name = this.fcServerName.value;
    serverClone.serverId = this.fcTargetServer.value.id;

    serverClone.clientReferenceObject = {
      serverId: serverClone.serverId
    };
    return serverClone;
  }

  /**
   * Returns the os type of the server
   */
  public getCreationOsType(): Os {
    let targetServer = getSafeProperty(this.fcTargetServer, (obj) => obj.value) as McsServer;
    return targetServer.isWindows ? Os.Windows : Os.Linux;
  }

  /**
   * Returns the creation form group
   */
  public getCreationForm(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Gets all the servers from repository
   */
  private _getAllServers(): void {
    unsubscribeSafely(this.serversSubscription);
    this.dataStatusFactory.setInProgress();
    this.serversSubscription = this._apiService.getServers().pipe(
      catchError((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return throwError(error);
      })
    ).subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this.servers = response && response.collection.filter((server) => {
        return server.cloneable && server.serviceType === this.serviceType;
      });
      this.dataStatusFactory.setSuccessful(this.servers);
    });
    this.serversSubscription.add(() => {
      this._setTargetServerById();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Gets the corresponding server details
   * @param serverId Sever ID to get the server details
   */
  private _getServerById(serverId: string): void {
    if (isNullOrEmpty(serverId)) { return; }

    this.serverIsManuallyAssignedIp = false;
    this.ipAddressStatusFactory.setInProgress();
    this._apiService.getServer(serverId).pipe(
      catchError((error) => {
        this.ipAddressStatusFactory.setSuccessful();
        return throwError(error);
      })
    ).subscribe((response) => {
      this.ipAddressStatusFactory.setSuccessful(response);
      let hasNics = !isNullOrEmpty(response) && !isNullOrEmpty(response.nics);
      if (!hasNics) { return; }
      this.serverIsManuallyAssignedIp = !!response.nics
        .find((nic) => nic.ipAllocationMode === IpAllocationMode.Manual);
    });
  }

  /**
   * This will set the target server based on ID provided by parameters
   */
  private _setTargetServerById(): void {
    let hasServers = !isNullOrEmpty(this.serverId) && !isNullOrEmpty(this.servers);
    if (!hasServers) { return; }
    let server = this.servers.find((_server) => _server.id === this.serverId);
    Promise.resolve().then(() => this.fcTargetServer.setValue(server));
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
    this.fcTargetServer.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe((server) => this._getServerById(server && server.id));

    // Register Form Groups using binding
    this.fgCloneServer = new FormGroup({
      fcServerName: this.fcServerName,
      fcTargetServer: this.fcTargetServer
    });
    this.fgCloneServer.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(this._notifyDataChange.bind(this));
  }

  /**
   * Returns true when server name is valid
   * @param inputValue Inputted value from input box
   */
  private _customServerNameValidator(inputValue: any): boolean {
    return CommonDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }

  /**
   * Notifies the data change on the form
   */
  private _notifyDataChange(): void {
    this.dataChange.next(this);
  }
}
