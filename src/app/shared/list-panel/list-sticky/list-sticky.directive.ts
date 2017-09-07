import {
  Directive,
  ContentChild,
  IterableDiffer,
  AfterContentInit,
  ElementRef,
  Renderer2,
  HostListener
} from '@angular/core';
import { McsBrowserService } from '../../../core';
import {
  getElementOffset,
  refreshView,
  isNullOrEmpty,
  registerEvent
} from '../../../utilities';
/** Directives */
import { ListSearchDefDirective } from './list-search-def.directive';
import { ListPanelDefDirective } from './list-panel-def.directive';

@Directive({
  selector: '[mcsListSticky]'
})

export class ListStickyDirective implements AfterContentInit {
  @ContentChild(ListSearchDefDirective)
  public listSearchDefinition: ListSearchDefDirective;

  @ContentChild(ListPanelDefDirective)
  public listPanelDefinition: ListPanelDefDirective;

  private _listSearchElement: HTMLElement;
  private _listPanelElement: HTMLElement;
  private _footerElement: HTMLElement;

  private _listStickyOffset: ClientRect;
  private _listSearchOffset: ClientRect;
  private _listPanelOffset: ClientRect;
  private _footerOffset: ClientRect;

  private _listSearchHeight: number;
  private _footerVisibleHeight: number;

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngAfterContentInit(): void {
    if (isNullOrEmpty(this.listSearchDefinition) ||
      isNullOrEmpty(this.listPanelDefinition)) { return; }

    this._listSearchElement = this.listSearchDefinition.elementRef.nativeElement;
    this._listPanelElement = this.listPanelDefinition.elementRef.nativeElement;
    this._footerElement = document.getElementsByTagName('footer')[0];

    this._setElementOffset();
    this._setStyles();

    this._listSearchHeight = this._listPanelOffset.top - this._listSearchOffset.top;

    this._registerEvents();
  }

  private _onScroll(event) {
    if (isNullOrEmpty(this._listSearchOffset) ||
      isNullOrEmpty(this._listPanelOffset)) { return; }

    // Set footer visible height when scrolling the page
    this._setFooterVisibleHeight();

    // Detect if scroll offset is same with sidebar top offset
    if (window.pageYOffset >= this._listSearchOffset.top) {
      // Make sidebar sticky
      this._setListSticky();

      // Set element current offset
      this._listStickyOffset = getElementOffset(this._element.nativeElement);
      this._footerOffset = getElementOffset(this._footerElement);

      // Get the offset to be subtracted from 100vh
      let offset = (this._footerVisibleHeight > 0) ?
        this._footerVisibleHeight + this._listSearchHeight : this._listSearchHeight ;

      this._setListPanelHeight(offset);
    } else {
      this._setListPanelHeight(this._listPanelOffset.top - window.pageYOffset);
      this._removeListSticky();
    }
  }

  private _setElementOffset(): void {
    this._listStickyOffset = getElementOffset(this._element.nativeElement);
    this._listSearchOffset = getElementOffset(this._listSearchElement);
    this._listPanelOffset = getElementOffset(this._listPanelElement);
    this._footerOffset = getElementOffset(this._footerElement);
  }

  private _setStyles(): void {
    this._renderer.setStyle(this._element.nativeElement, 'width', '100%');
    this._renderer.setStyle(
      this._element.nativeElement,
      'max-width',
      `${this._listStickyOffset.width}px`
    );
    this._renderer.setStyle(this._listPanelElement, 'overflow', 'auto');
    this._setListPanelHeight(this._listPanelOffset.top - window.pageYOffset);
  }

  private _setListPanelHeight(offset: number): void {
    this._renderer.setStyle(this._listPanelElement, 'max-height', `calc(100vh - ${offset}px)`);
  }

  private _setListSticky(): void {
    this._renderer.setStyle(this._element.nativeElement, 'position', 'fixed');
    this._renderer.setStyle(this._element.nativeElement, 'top', 0);
  }

  private _removeListSticky(): void {
    this._renderer.removeStyle(this._element.nativeElement, 'position');
    this._renderer.removeStyle(this._element.nativeElement, 'top');
  }

  private _setFooterVisibleHeight(): void {
    let scrollTop = window.pageYOffset;
    let scrollBottom = scrollTop + window.innerHeight;
    let visibleTop = this._footerOffset.top < scrollTop ? scrollTop : this._footerOffset.top;
    let visibleBottom = this._footerOffset.bottom > scrollBottom ?
      scrollBottom : this._footerOffset.bottom;
    this._footerVisibleHeight = visibleBottom - visibleTop;
  }

  private _registerEvents(): void {
    // Register for mouse click
    registerEvent(this._renderer, document,
      'scroll', this._onScroll.bind(this));
  }
}
