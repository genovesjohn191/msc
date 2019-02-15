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
  catchError
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
} from '@app/core';
import {
  McsServerOsUpdates,
  McsServer,
  McsServerOsUpdatesRequest
} from '@app/models';
import { McsServersRepository } from '@app/services';
import { TreeNode } from '@app/shared';
import { ServersService } from '@app/features/servers/servers.service';
import { OsUpdatesActionDetails } from '../../os-updates-status-configuration';

@Component({
  selector: 'mcs-server-os-updates-schedule-unscheduled',
  templateUrl: './os-updates-schedule-unscheduled.component.html',
  host: {
    'class': 'block'
  }
})
export class OsUpdatesScheduleUnscheduledComponent implements OnInit {

  @Input()
  public selectedServer: McsServer;

  @Output()
  public applyUpdates: EventEmitter<OsUpdatesActionDetails>;

  public textContent: any;
  public osUpdates$: Observable<McsServerOsUpdates[]>;
  public dataStatusFactory: McsDataStatusFactory<McsServerOsUpdates[]>;
  public selectedNodes: Array<TreeNode<McsServerOsUpdates>>;

  /**
   * Returns true if there are no selected updates, false otherwise
   */
  public get isApplyButtonDisabled(): boolean {
    return this.selectedNodes.length <= 0 || this.selectedServer.isProcessing;
  }

  /**
   * Returns the label of the Select all of the tree view
   */
  public get treeViewSelectAllLabel(): string {
    return this.textContent.treeviewAllUpdates;
  }

  constructor(
    protected _serversService: ServersService,
    protected _serversRepository: McsServersRepository,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textProvider: McsTextContentProvider,
  ) {
    this.applyUpdates = new EventEmitter();
    this.dataStatusFactory = new McsDataStatusFactory();
    this.selectedNodes = new Array<TreeNode<McsServerOsUpdates>>();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.services.unscheduled;
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
    request.clientReferenceObject = { serverId: this.selectedServer.id };
    this.selectedNodes.forEach((node) => request.updates.push(node.value.id));

    this.applyUpdates.emit({
      server: this.selectedServer,
      requestData: request
    });
  }

  /**
   * Initializes the data source of the os updates category tree view
   */
  private _initializeTreeSource() {
    this.dataStatusFactory.setInProgress();
    this.osUpdates$ = this._serversRepository.getServerOsUpdates(this.selectedServer).pipe(
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