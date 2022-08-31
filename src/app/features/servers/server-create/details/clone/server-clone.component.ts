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
  Subject,
  forkJoin
} from 'rxjs';
import {
  catchError,
  takeUntil,
  map
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
  McsApiCollection,
  McsResourceStorage,
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
  public networkStorageStatusFactory: McsDataStatusFactory<any>;

  private _serverPrimaryStorageProfileDisabled: boolean;

  // Form variables
  public fgCloneServer: FormGroup<any>;
  public fcServerName: FormControl<string>;
  public fcTargetServer: FormControl<McsServer>;

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
    this.networkStorageStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
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
   * Returns the input storage size of the server
   */
  public getCreationStorageSize(): number {
    return 0;
  }

  /**
   * Returns the creation form group
   */
  public getCreationForm(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Gets all the servers for the selected VDC
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
      // sort servers alphabetically
      this.servers?.sort((first, second) => first.name.localeCompare(second.name));
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
  private _getServerInformation(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcServerName.setValue(null);
    this.serverIsManuallyAssignedIp = false;
    this.networkStorageStatusFactory.setInProgress();
    forkJoin(
      this._apiService.getServer(server.id).pipe(
        map((response) => getSafeProperty(response, (obj) => obj)),
        catchError((error) => {
          this.networkStorageStatusFactory.setSuccessful();
          return throwError(error);
        })
      ),
      this._apiService.getResourceStorages(server.platform.resourceId).pipe(
        map((response) => getSafeProperty(response, (obj) => obj)),
        catchError((error) => {
          this.networkStorageStatusFactory.setSuccessful();
          return throwError(error);
        })
      ),
    ).subscribe(([_server, _resourceStorage]) => {
      this.networkStorageStatusFactory.setSuccessful();

      let hasNics = !isNullOrEmpty(_server) && !isNullOrEmpty(_server.nics);
      if (!hasNics) { return; }
      this.serverIsManuallyAssignedIp = !!_server.nics
        .find((nic) => nic.ipAllocationMode === IpAllocationMode.Manual);

      let _primaryDiskStorageProfileName = _server.storageDevices.find((disk) => disk.isPrimary).storageProfile;
      this._serverPrimaryStorageProfileDisabled = !_resourceStorage.collection.find
      ((storageProfile) => storageProfile.name === _primaryDiskStorageProfileName)?.enabled;
    });
  }

  /**
   * Returns true when server's primary disk resides on a disabled storage profile
   */
  public get isOnDisabledStorageProfile(): boolean {
    return this._serverPrimaryStorageProfileDisabled;
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
    this.fcServerName = new FormControl<string>('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._customServerNameValidator.bind(this),
        'invalidServerName'
      )
    ]);

    this.fcTargetServer = new FormControl<McsServer>(null, [
      CoreValidators.required
    ]);
    this.fcTargetServer.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(
      (server) => this._getServerInformation(server),
    );

    // Register Form Groups using binding
    this.fgCloneServer = new FormGroup<any>({
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
