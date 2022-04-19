import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ContentChild,
  AfterViewInit,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { PageHeaderDirective } from './page-header.directive';
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
import { McsAccessControlService } from '@app/core';

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

export class PageComponent implements AfterViewInit {

  @ViewChild('pageLeftElement', { static: true })
  public pageLeftElement: ElementRef;

  @ViewChild('headerContainer', { read: ViewContainerRef, static: false })
  public headerContainer: ViewContainerRef;

  @ViewChild('headerText')
  public headerText: ElementRef;

  @ContentChild(PageHeaderDirective)
  public headerTemplate: PageHeaderDirective;

  @Input()
  public header: string;

  @Input()
  public leftPanelExpandedByDefault: boolean = false;

  @Input()
  public set filterPanelCollapsed(collapsed: boolean) {
    this._changePanelDisplay(collapsed);
  }
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
    private _pageService: PageService,
    private _accessControlService: McsAccessControlService
  ) {
    this.hasLeftPanel = true;
  }

  public get navIconKey(): string {
    return this.leftPanelIsVisible ? CommonDefinition.ASSETS_SVG_CLOSE_BLACK :
      CommonDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      let contentPanelsAreDefined = !isNullOrEmpty(this._contentPanelDefinition)
        && !isNullOrEmpty(this._contentPanelPlaceholder);
      if (contentPanelsAreDefined) {
        this._contentPanelPlaceholder.viewContainer
          .createEmbeddedView(this._contentPanelDefinition.template);
      }

      let leftPanelsAreDefined = !isNullOrEmpty(this._leftPanelDefinition)
        && !isNullOrEmpty(this._leftPanelPlaceholder);
      if (leftPanelsAreDefined) {
        this._leftPanelPlaceholder.viewContainer
          .createEmbeddedView(this._leftPanelDefinition.template);
      } else {
        this.hasLeftPanel = false;
      }

      let topPanelsAreDefined = !isNullOrEmpty(this._topPanelDefinition)
        && !isNullOrEmpty(this._topPanelPlaceholder);
      if (topPanelsAreDefined) {
        this._topPanelPlaceholder.viewContainer
          .createEmbeddedView(this._topPanelDefinition.template);
      }

      this._pageService.leftPanelIsVisible = this.leftPanelExpandedByDefault;

      this._initializeLeftPanelDisplay();
    });
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
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-collapsed');
    } else {
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-expanded');
    }
  }

  /**
   * Change the panel display in which determines wheather the left panel is collapsed
   * @param collapse Collapse flag of the left panel
   */
  private _changePanelDisplay(collapse: boolean) {
    if (collapse) {
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-collapsed');
      this._renderer.removeClass(this.pageLeftElement.nativeElement, 'left-panel-expanded');
      this._pageService.leftPanelIsVisible = false;
    } else {
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-expanded');
      this._renderer.removeClass(this.pageLeftElement.nativeElement, 'left-panel-collapsed');
      this._pageService.leftPanelIsVisible = true;
    }
    this._changeDetectorRef.markForCheck();
  }
}
