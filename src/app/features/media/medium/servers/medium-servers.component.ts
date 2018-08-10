import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  startWith,
  switchMap
} from 'rxjs/operators';
import { McsTextContentProvider } from '../../../../core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../../../utilities';
import { TableDataSource } from '../../../../shared';
import { MediaServer } from '../../models';
import { MediumService } from '../medium.service';
import { MediumDetailsBase } from '../medium-details.base';
import { MediaRepository } from '../../repositories/media.repository';

@Component({
  selector: 'mcs-medium-servers',
  templateUrl: './medium-servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumServersComponent extends MediumDetailsBase implements OnInit, OnDestroy {
  public textContent: any;

  public serversColumns: string[];
  public serversDataSource: TableDataSource<MediaServer>;
  private _requestServersSubject = new Subject<void>();

  constructor(
    _mediumService: MediumService,
    private _mediaRepository: MediaRepository,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
  ) {
    super(_mediumService);
    this.serversColumns = new Array();
    this.serversDataSource = new TableDataSource([]);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.media.medium.servers;
    super.initializeBase();
    this._setDataColumns();
  }

  public ngOnDestroy() {
    super.destroyBase();
    unsubscribeSubject(this._requestServersSubject);
  }

  /**
   * Event that will automatically invoked when the medium selection has been changed
   */
  protected mediumSelectionChange(): void {
    this._initializeDataSource();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.serversColumns = Object.keys(this.textContent.columnHeaders);
    if (isNullOrEmpty(this.serversColumns)) {
      throw new Error('column definition for disks was not defined');
    }
  }

  /**
   * Initializes the data source of the nics table
   */
  private _initializeDataSource(): void {
    this.serversDataSource = new TableDataSource(this._getAttachedServers());
  }

  /**
   * Get attached servers from media API
   */
  private _getAttachedServers() {
    return this._requestServersSubject.pipe(
      startWith(null),
      switchMap(() => this._mediaRepository.findMediaServers(this.selectedMedium))
    );
  }
}
