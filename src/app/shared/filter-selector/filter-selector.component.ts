import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  HostListener,
  ElementRef
} from '@angular/core';

/** Services */
import {
  McsStorageService,
  McsTextContentProvider,
  McsAssetsProvider,
  McsFilterProvider,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-filter-selector',
  templateUrl: './filter-selector.component.html',
  styles: [require('./filter-selector.component.scss')]
})

export class FilterSelectorComponent implements OnInit {
  @Input()
  public key: string;

  @Output()
  public onGetFilters: EventEmitter<any>;

  public filterItems: any;
  public filterTitle: string;
  public iconClass: string;

  public get columnsIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COLUMNS_BLACK;
  }

  public constructor(
    private _mcsStorageService: McsStorageService,
    private _elementReference: ElementRef,
    private _textContentProvider: McsTextContentProvider,
    private _filterProvider: McsFilterProvider
  ) {
    this.key = '';
    this.filterTitle = '';
    this.onGetFilters = new EventEmitter();
  }

  public ngOnInit() {
    this.filterTitle = this._textContentProvider.content.filterSelector.title;
    this._getFilterItems();
    this.onGetFilters.emit(this.filterItems);
  }

  public onCloseFilterSelector() {
    this._mcsStorageService.setItem(this.key, this.filterItems);
    this.onGetFilters.emit(this.filterItems);
  }

  public get filterKeys(): any {
    return Object.keys(this.filterItems);
  }

  private _getFilterItems(): void {
    this.filterItems = this._mcsStorageService.getItem<any>(this.key);
    if (!this.filterItems) {
      this.filterItems = this._filterProvider.getDefaultFilters(this.key);
    }
  }
}
