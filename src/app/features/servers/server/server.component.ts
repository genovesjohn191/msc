import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Subscription,
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  Server,
  ServerCommand
} from '../models';
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent,
  RenameServerDialogComponent,
  SuspendServerDialogComponent,
  ResumeServerDialogComponent
} from '../shared';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsSearch,
  McsDialogService,
  McsRoutingTabBase,
  McsErrorHandlerService,
  McsDataStatusFactory
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView,
  unsubscribeSafely
} from '../../../utilities';
import { ServersRepository } from '../servers.repository';
import { ServersService } from '../servers.service';
import { ServerService } from './server.service';
import { ServersListSource } from '../servers.listsource';

// Constant Definition
const SERVER_LIST_GROUP_OTHERS = 'Others';

// Add another group type in here if you have addition tab
type tabGroupType = 'management' | 'storage';

@Component({
  selector: 'mcs-server',
  templateUrl: './server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class ServerComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  public textContent: any;
  public serversMap: Map<string, Server[]>;
  public selectedGroupName: string;
  public selectedServer: Server;
  public selectedServerName: string;
  public serversTextContent: any;
  public serverListSource: ServersListSource | null;
  public serverSubscription: Subscription;
  public serversSubscription: Subscription;
  public listStatusFactory: McsDataStatusFactory<Map<string, Server[]>>;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get angleDoubleRightIconKey(): string {
    return CoreDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _dialogService: McsDialogService,
    private _serversRepository: ServersRepository,
    private _serversService: ServersService,
    private _serverService: ServerService,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    super(_router, _activatedRoute);
    this.selectedServer = new Server();
    this.serversMap = new Map();
    this.listStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.serversTextContent = this._textContentProvider.content.servers;
    this.textContent = this._textContentProvider.content.servers.server;

    // Initialize base class
    super.onInit();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.search.searchChangedStream.pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this.serverSubscription);
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Event that emits when the server is selected on the list panel
   * @param _server Selected server instance
   */
  public onServerSelect(_server: Server) {
    if (isNullOrEmpty(_server)) { return; }

    this._setSelectedServerInfo(_server);
    this._changeDetectorRef.markForCheck();
    this.router.navigate(['/servers', _server.id]);
  }

  /**
   * Execute the server command according to inputs
   * @param servers Servers to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(serverItem: Server, action: ServerCommand): void {
    if (isNullOrEmpty(serverItem)) { return; }
    let dialogComponent = null;

    // Set dialog references in case of Reset Password, Delete Server, Rename Server etc...
    switch (action) {
      case ServerCommand.ResetVmPassword:
        dialogComponent = ResetPasswordDialogComponent;
        break;

      case ServerCommand.Delete:
        dialogComponent = DeleteServerDialogComponent;
        break;

      case ServerCommand.Rename:
        dialogComponent = RenameServerDialogComponent;
        break;

      case ServerCommand.Suspend:
        dialogComponent = SuspendServerDialogComponent;
        break;

      case ServerCommand.Resume:
        dialogComponent = ResumeServerDialogComponent;
        break;

      default:
        this._serversService.executeServerCommand({ server: serverItem }, action);
        return;
    }

    // Check if the server action should be execute when the dialog result is true
    if (!isNullOrEmpty(dialogComponent)) {
      let dialogRef = this._dialogService.open(dialogComponent, {
        data: serverItem,
        size: 'medium'
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this._serversService.executeServerCommand(
            { server: serverItem, result: dialogResult },
            action
          );
        }
      });
    }
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return server.commandAction === ServerCommand.Delete && server.isProcessing;
  }

  /**
   * Navigate to resources
   * @param server Server to navigate from
   */
  public navigateToResource(server: Server): void {
    if (isNullOrEmpty(server)) { return; }
    this.router.navigate(['/servers/vdc', server.platform.resourceId]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    // Navigate route based on current active tab
    this.router.navigate(['servers', this.paramId, tab.id]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string) {
    if (isNullOrEmpty(id)) { return; }
    this._getServerById(id);

    // Set the selection iniatially when no selected item
    // in order for the header to show it immediately
    let serverExist = this._serversRepository.dataRecords
      .find((server) => server.id === this.paramId);
    this._setSelectedServerInfo(serverExist);
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._serversRepository,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: Server) => {
      let resourseName = isNullOrEmpty(item.platform.resourceName) ?
        'Others' : item.platform.resourceName;
      return resourseName;
    };

    // Listen to all records changed
    this.serverListSource.findAllRecordsMapStream(keyFn)
      .catch((error) => {
        this.listStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.serversMap = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccesfull(response);
      });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will set the active server when data was obtained from repository
   * @param serverId Server ID to be the basis of the server
   */
  private _getServerById(serverId: string): void {
    this.serverSubscription = this._serversRepository
      .findRecordById(serverId)
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this._setSelectedServerInfo(response);
        this._serverService.setSelectedServer(this.selectedServer);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * This will set the selected server details every selection
   */
  private _setSelectedServerInfo(selectedServer: Server): void {
    if (isNullOrEmpty(selectedServer)) { return; }
    this.selectedServer = selectedServer;

    this.selectedServerName = selectedServer.name;
    let hasResourceName = !isNullOrEmpty(selectedServer.platform)
      && !isNullOrEmpty(selectedServer.platform.resourceName);

    let resourceName = (hasResourceName) ?
      selectedServer.platform.resourceName : SERVER_LIST_GROUP_OTHERS;
    this.selectedGroupName = resourceName;
  }
}
