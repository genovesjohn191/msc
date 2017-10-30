import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ContentChild,
  AfterContentInit,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
  ViewContainerRef,
  TemplateRef
} from '@angular/core';
import { CoreDefinition } from '../../core';
import { isNullOrEmpty } from '../../utilities';
import {
  ContentPanelDefDirective,
  ContentPanelPlaceholderDirective
} from './content-panel';
import {
  LeftPanelDefDirective,
  LeftPanelPlaceholderDirective
} from './left-panel';
import {
  TopPanelDefDirective,
  TopPanelPlaceholderDirective
} from './top-panel';
import { PageService } from './page.service';

@Component({
  selector: 'mcs-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'page-wrapper'
  }
})

export class PageComponent implements AfterContentInit {

  @ViewChild('pageLeftElement')
  public pageLeftElement: ElementRef;

  @ViewChild('headerContainer', { read: ViewContainerRef })
  public headerContainer: ViewContainerRef;

  @ViewChild('headerText')
  public headerText: ElementRef;

  /**
   * Page Header
   */
  @Input()
  public get header(): string | TemplateRef<any> {
    return this._header;
  }
  public set header(value: string | TemplateRef<any>) {
    if (this._header !== value) {
      this._header = value;
      this._createHeaderElement();
      this._changeDetectorRef.markForCheck();
    }
  }
  private _header: string | TemplateRef<any>;

  /**
   * Determine weather the left panel is collapsed
   */
  public get leftPanelIsVisible(): boolean {
    return this._pageService.leftPanelIsVisible;
  }

  /**
   * Determine weather the left panel is displayed on the specific page
   */
  private _hasLeftPanel: boolean;
  public get hasLeftPanel(): boolean {
    return this._hasLeftPanel;
  }
  public set hasLeftPanel(value: boolean) {
    if (this._hasLeftPanel !== value) {
      this._hasLeftPanel = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get leftPanelHeader(): string {
    return this._leftPanelDefinition === undefined
      ? ''
      : this._leftPanelDefinition.header;
  }

  /** Placeholder of panel directives */
  @ViewChild(ContentPanelPlaceholderDirective)
  private _contentPanelPlaceholder: ContentPanelPlaceholderDirective;

  @ViewChild(LeftPanelPlaceholderDirective)
  private _leftPanelPlaceholder: LeftPanelPlaceholderDirective;

  @ViewChild(TopPanelPlaceholderDirective)
  private _topPanelPlaceholder: TopPanelPlaceholderDirective;

  /** Panel directives definitions */
  @ContentChild(ContentPanelDefDirective)
  private _contentPanelDefinition: ContentPanelDefDirective;

  @ContentChild(LeftPanelDefDirective)
  private _leftPanelDefinition: LeftPanelDefDirective;

  @ContentChild(TopPanelDefDirective)
  private _topPanelDefinition: TopPanelDefDirective;

  public constructor(
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef,
    private _pageService: PageService
  ) {
    this.hasLeftPanel = true;
  }

  public get navIconKey(): string {
    return this.leftPanelIsVisible ? CoreDefinition.ASSETS_SVG_CLOSE_BLACK :
      CoreDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  public ngAfterContentInit(): void {
    if (!isNullOrEmpty(this._contentPanelDefinition)) {
      this._contentPanelPlaceholder.viewContainer
        .createEmbeddedView(this._contentPanelDefinition.template);
    }

    if (!isNullOrEmpty(this._leftPanelDefinition)) {
      this._leftPanelPlaceholder.viewContainer
        .createEmbeddedView(this._leftPanelDefinition.template);
    } else {
      this.hasLeftPanel = false;
    }

    if (!isNullOrEmpty(this._topPanelDefinition)) {
      this._topPanelPlaceholder.viewContainer
        .createEmbeddedView(this._topPanelDefinition.template);
    }

    this._initializeLeftPanelDisplay();

    // Manually triggered change detection strategy
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the class of the left panel if it shown or hidden
   */
  public toggleLeftPanel(): void {
    this._changePanelDisplay(this._pageService.leftPanelIsVisible);
  }

  /**
   * Initialize left panel collapse/toggle mode based on the flag
   */
  private _initializeLeftPanelDisplay(): void {
    if (!this._pageService.leftPanelIsVisible) {
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-collapse');
    }
  }

  /**
   * Change the panel display in which determines wheather the left panel is collapsed
   * @param collapse Collapse flag of the left panel
   */
  private _changePanelDisplay(collapse: boolean) {
    if (collapse) {
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-collapse');
      this._pageService.leftPanelIsVisible = false;
    } else {
      this._renderer.removeClass(this.pageLeftElement.nativeElement, 'left-panel-collapse');
      this._pageService.leftPanelIsVisible = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Create Header Element based on header type inputted
   */
  private _createHeaderElement(): void {
    if (!isNullOrEmpty(this.headerContainer)) {
      if (this.header instanceof TemplateRef) {
        this.headerContainer.clear();
        this.headerContainer.createEmbeddedView(this.header);
        this.headerText.nativeElement.remove();
      } else {
        let element: HTMLElement = this.headerText.nativeElement;
        element.innerText = this.header;
      }
    }
  }
}
