import {
  Component,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsPaginator
} from '../../core';
import {
  coerceNumber,
  coerceBoolean
} from '../../utilities';

@Component({
  selector: 'mcs-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'paginator-wrapper'
  }
})

export class PaginatorComponent implements McsPaginator {

  public loading: boolean;
  public textContent: any;
  public pageChangedStream: EventEmitter<any>;

  @Input()
  public get pageIndex(): number { return this._pageIndex; }
  public set pageIndex(value: number) {
    this._pageIndex = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex: number;

  @Input()
  public get pageSize(): number { return this._pageSize; }
  public set pageSize(value: number) {
    this._pageSize = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _pageSize: number;

  @Input()
  public get totalCount(): number { return this._totalCount; }
  public set totalCount(value: number) {
    this._totalCount = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _totalCount: number;

  @Input()
  public get enableLoader(): boolean { return this._enableLoader; }
  public set enableLoader(value: boolean) {
    this._enableLoader = coerceBoolean(value);
    this._changeDetectorRef.markForCheck();
  }
  private _enableLoader: boolean;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this._pageIndex = 0;
    this._pageSize = 0;
    this._totalCount = 0;
    this.loading = false;
    this.pageChangedStream = new EventEmitter<any>();
    this.textContent = this._textContentProvider.content.shared.paginator;
  }

  /**
   * Return true if the paginator has next page otherwise false
   */
  public get hasNextPage(): boolean {
    let numberOfPages = Math.ceil(this.totalCount / this.pageSize) - 1;
    return this.pageIndex < numberOfPages && this.pageSize !== 0;
  }

  /**
   * Return true if the paginator has previous page otherwise false
   */
  public get hasPreviousPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize !== 0;
  }

  public get arrowDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public nextPage() {
    if (!this.hasNextPage) { return; }
    this.pageIndex++;
    this._onPageChanged();
  }

  public previousPage() {
    if (!this.hasPreviousPage) { return; }
    this.pageIndex--;
    this._onPageChanged();
  }

  public showLoading(showLoading: boolean) {
    this.loading = showLoading;
    this._changeDetectorRef.markForCheck();
  }

  private _onPageChanged() {
    this.loading = true;
    this._changeDetectorRef.markForCheck();
    this.pageChangedStream.next(this);
  }
}
