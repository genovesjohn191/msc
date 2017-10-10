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
  Renderer2
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

  /**
   * Page Header
   */
  @Input()
  public get header(): string {
    return this._header;
  }
  public set header(value: string) {
    if (this._header !== value) {
      this._header = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _header: string;

  /**
   * Determine weather the left panel is collapsed
   */
  private _leftPanelIsVisible: boolean;
  public get leftPanelIsVisible(): boolean {
    return this._leftPanelIsVisible;
  }
  public set leftPanelIsVisible(value: boolean) {
    if (this._leftPanelIsVisible !== value) {
      this._leftPanelIsVisible = value;
      this._changeDetectorRef.markForCheck();
    }
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
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.leftPanelIsVisible = true;
    this.hasLeftPanel = true;
  }

  public get navIconKey(): string {
    return this.leftPanelIsVisible ? CoreDefinition.ASSETS_FONT_CLOSE :
      CoreDefinition.ASSETS_FONT_ANGLE_DOUBLE_RIGHT;
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

    // Manually triggered change detection strategy
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the class of the left panel if it shown or hidden
   */
  public toggleLeftPanel(): void {
    this._changePanelDisplay(this.leftPanelIsVisible);
  }

  /**
   * Set the class of the left panel if it shown or hidden
   */
  public showLeftPanel(): void {
    if (!this.leftPanelIsVisible) {
      this._changePanelDisplay(false);
    }
  }

  private _changePanelDisplay(collapse: boolean) {
    if (collapse) {
      this._renderer.addClass(this.pageLeftElement.nativeElement, 'left-panel-collapse');
      this.leftPanelIsVisible = false;
    } else {
      this._renderer.removeClass(this.pageLeftElement.nativeElement, 'left-panel-collapse');
      this.leftPanelIsVisible = true;
    }
  }
}
