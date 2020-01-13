import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  tap,
  catchError,
  map
} from 'rxjs/operators';
import {
  McsDataStatusFactory,
} from '@app/core';
import {
  McsServerOsUpdates,
  McsServer,
  McsServerOsUpdatesRequest,
  ServerServicesAction
} from '@app/models';
import { McsApiService } from '@app/services';
import { TreeNode } from '@app/shared';
import {
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import { ServerServiceActionDetail } from '../../strategy/server-service-action.context';
import { ServersService } from '../../../../servers.service';

@Component({
  selector: 'mcs-service-os-updates-patch-details',
  templateUrl: './os-updates-patch-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceOsUpdatesPatchDetailsComponent implements OnInit {

  @Input()
  public selectedServer: McsServer;

  @Output()
  public patchUpdates: EventEmitter<ServerServiceActionDetail>;

  public osUpdates$: Observable<McsServerOsUpdates[]>;
  public dataStatusFactory: McsDataStatusFactory<McsServerOsUpdates[]>;
  public selectedNodes: Array<TreeNode<McsServerOsUpdates>>;

  /**
   * Returns true if there are no selected updates, false otherwise
   */
  public get isApplyButtonDisabled(): boolean {
    return this.selectedNodes.length <= 0 || this.selectedServer.isProcessing;
  }

  constructor(
    protected _serversService: ServersService,
    protected _apiService: McsApiService,
    protected _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.patchUpdates = new EventEmitter();
    this.dataStatusFactory = new McsDataStatusFactory();
    this.selectedNodes = new Array<TreeNode<McsServerOsUpdates>>();
  }

  public ngOnInit() {
    this._initializeTreeSource();
  }

  /**
   * Listener method whenever there is a change in selection on the tree view
   * @param _selectedNodes selected nodes reference from the tree view
   */
  public onTreeChange(_selectedNodes: Array<TreeNode<any>>): void {
    this.selectedNodes = _selectedNodes;
  }

  /**
   * Emits an event to Apply the selected os updates on the server
   */
  public applySelectedUpdates(): void {
    let request = new McsServerOsUpdatesRequest();
    request.updates = [];
    request.clientReferenceObject = {
      serverId: this.selectedServer.id
    };
    this.selectedNodes.forEach((node) => request.updates.push(node.value.id));

    this.patchUpdates.emit({
      server: this.selectedServer,
      action: ServerServicesAction.OsUpdatesPatch,
      payload: request
    });
  }

  /**
   * Initializes the data source of the os updates category tree view
   */
  private _initializeTreeSource() {
    this.dataStatusFactory.setInProgress();
    this.osUpdates$ = this._apiService.getServerOsUpdates(this.selectedServer.id, {
      pageIndex: CommonDefinition.PAGE_INDEX_DEFAULT,
      pageSize: CommonDefinition.PAGE_SIZE_MAX
    }).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection)),
      tap((osUpdates) => {
        this.dataStatusFactory.setSuccessful(osUpdates);
      }),
      catchError((error) => {
        this.dataStatusFactory.setError();
        return throwError(error);
      })
    );
  }
}
