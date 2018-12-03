import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  SimpleChanges
} from '@angular/core';
import { McsTextContentProvider } from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSubject
} from '@app/utilities';
import { McsServerMedia } from '@app/models';

@Component({
  selector: 'mcs-server-manage-media',
  templateUrl: 'server-manage-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class ServerManageMediaComponent implements OnInit, OnChanges, OnDestroy {
  public textContent: any;

  @Output()
  public selectedMediaChange = new EventEmitter<McsServerMedia>();

  @Input()
  public media: McsServerMedia[];

  @Input()
  public get selectedMedia(): McsServerMedia { return this._selectedMedia; }
  public set selectedMedia(value: McsServerMedia) {
    if (this._selectedMedia !== value) {
      this._selectedMedia = value;
      this.selectedMediaChange.emit(this._selectedMedia);
    }
  }
  private _selectedMedia: McsServerMedia;

  constructor(private _textContentProvider: McsTextContentProvider) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.shared.manageMedia;
  }

  public ngOnChanges(changes: SimpleChanges) {
    let mediasChange = changes['medias'];
    if (!isNullOrEmpty(mediasChange)) {
      this._setSelectedMedia();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this.selectedMediaChange);
  }

  /**
   * Sets the selected media if no media selected yet
   */
  private _setSelectedMedia(): void {
    if (isNullOrEmpty(this.media)) { return; }
    let hasSelectedMedia = !isNullOrEmpty(this.selectedMedia)
      && !isNullOrEmpty(this.media.find((network) => network === this.selectedMedia));
    if (hasSelectedMedia) { return; }
    this.selectedMedia = this.media[0];
  }
}
