import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import {
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  map,
  tap
} from 'rxjs/operators';
import { McsDataStatusFactory } from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  McsServer,
  McsResourceMedia
} from '@app/models';
import { McsApiService } from '@app/services';
import { MediaManageServers } from './media-manage-servers';

@Component({
  selector: 'mcs-media-manage-servers',
  templateUrl: './media-manage-servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaManageServersComponent implements OnInit, OnDestroy {
  public servers$: Observable<McsServer[]>;
  public dataStatusFactory: McsDataStatusFactory<McsServer[]>;

  @Output()
  public dataChange = new EventEmitter<MediaManageServers>();

  @Input()
  public media: McsResourceMedia;

  private _manageServerOutput = new MediaManageServers();

  /**
   * Get or set the selected server in the dropdown
   */
  private _selectedServer: McsServer;
  public get selectedServer(): McsServer { return this._selectedServer; }
  public set selectedServer(value: McsServer) {
    if (this._selectedServer !== value) {
      this._selectedServer = value;
      this._notifyDataChange();
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this._getServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.dataChange);
  }

  /**
   * Get the servers listing from API
   */
  private _getServers(): void {
    this.dataStatusFactory.setInProgress();
    this.servers$ = this._apiService.getServers().pipe(
      map((serversCollection) => {
        let servers = getSafeProperty(serversCollection, (obj) => obj.collection);
        return servers.filter((server) => server.platform.resourceName === getSafeProperty(this.media, (obj) => obj.resourceName, ''));
      }),
      tap((servers) => {
        this.dataStatusFactory.setSuccessful(servers);
      }),
      catchError((error) => {
        this.dataStatusFactory.setError();
        return throwError(error);
      })
    );
  }

  /**
   * Notifies the changes to output parameter
   */
  private _notifyDataChange() {
    this._manageServerOutput.valid = !isNullOrEmpty(this.selectedServer);
    this._manageServerOutput.server = this.selectedServer;
    this.dataChange.emit(this._manageServerOutput);
  }
}
