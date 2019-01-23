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
import { McsResourceCatalogItem } from '@app/models';

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
  public selectedCatalogChange = new EventEmitter<McsResourceCatalogItem>();

  @Input()
  public catalogs: McsResourceCatalogItem[];

  @Input()
  public get selectedCatalog(): McsResourceCatalogItem { return this._selectedCatalog; }
  public set selectedCatalog(value: McsResourceCatalogItem) {
    if (this._selectedCatalog !== value) {
      this._selectedCatalog = value;
      this.selectedCatalogChange.emit(this._selectedCatalog);
    }
  }
  private _selectedCatalog: McsResourceCatalogItem;

  constructor(private _textContentProvider: McsTextContentProvider) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.shared.manageMedia;
  }

  public ngOnChanges(changes: SimpleChanges) {
    let mediasChange = changes['medias'];
    if (!isNullOrEmpty(mediasChange)) {
      this._setSelectedCatalog();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this.selectedCatalogChange);
  }

  /**
   * Sets the selected catalog if no media selected yet
   */
  private _setSelectedCatalog(): void {
    if (isNullOrEmpty(this.catalogs)) { return; }
    let hasSelectedMedia = !isNullOrEmpty(this.selectedCatalog)
      && !isNullOrEmpty(this.catalogs.find((network) => network === this.selectedCatalog));
    if (hasSelectedMedia) { return; }
    this.selectedCatalog = this.catalogs[0];
  }
}
