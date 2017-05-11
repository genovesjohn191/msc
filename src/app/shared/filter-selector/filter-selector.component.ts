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
  McsFilterProvider
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

  @ViewChild('filterSelectorObj')
  public filterSelectorObj: any;

  public filterItems: any;
  public filterTitle: string;
  public iconClass: string;

  public constructor(
    private _mcsStorageService: McsStorageService,
    private _elementReference: ElementRef,
    private _textContentProvider: McsTextContentProvider,
    private _assetsProvider: McsAssetsProvider,
    private _filterProvider: McsFilterProvider
  ) {
    this.key = '';
    this.filterTitle = '';
    this.iconClass = '';
    this.onGetFilters = new EventEmitter();
  }

  public ngOnInit() {
    this.iconClass = this._assetsProvider.getIcon('filter-selector');
    this.filterTitle = this._textContentProvider.content.filterSelector.title;
    this._getFilterItems();
    this.onGetFilters.emit(this.filterItems);
  }

  public onCloseFilterSelector() {
    this._mcsStorageService.setItem(this.key, this.filterItems);
    this.onGetFilters.emit(this.filterItems);
  }

  @HostListener('document:click', ['$event.target'])
  public onClickOutside(target): void {
    if (!this._elementReference.nativeElement.contains(target)) {
      this.filterSelectorObj.close();
    }
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
