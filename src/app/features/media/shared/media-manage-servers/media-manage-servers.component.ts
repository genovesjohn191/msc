import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { throwError } from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import { McsDataStatusFactory } from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { McsServer } from '@app/models';
import { McsApiService } from '@app/services';
import { MediaManageServers } from './media-manage-servers';

@Component({
  selector: 'mcs-media-manage-servers',
  templateUrl: './media-manage-servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaManageServersComponent implements OnInit, OnDestroy {
  public servers: McsServer[];
  public dataStatusFactory: McsDataStatusFactory<McsServer[]>;

  @Output()
  public dataChange = new EventEmitter<MediaManageServers>();

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
    this._apiService.getServers().pipe(
      catchError((error) => {
        this.dataStatusFactory.setError();
        return throwError(error);
      }),
      map((response) => getSafeProperty(response, (obj) => obj.collection))
    ).subscribe((response) => {
      this.servers = response;
      this.dataStatusFactory.setSuccessful(response);
    });
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
