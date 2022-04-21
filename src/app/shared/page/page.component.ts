import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {
  FILTER_LEFT_PANEL_ID,
  McsFilterService
} from '@app/core';
import { McsFilterInfo } from '@app/models';
import {
  createObject,
  isNullOrEmpty,
  isNullOrUndefined,
  CommonDefinition
} from '@app/utilities';

import {
  ContentPanelDefDirective,
  ContentPanelPlaceholderDirective
} from './content-panel';
import {
  LeftPanelDefDirective,
  LeftPanelPlaceholderDirective
} from './left-panel';
import { PageHeaderDirective } from './page-header.directive';
import { PageService } from './page.service';
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

export class PageComponent implements AfterViewInit {
  @Input()
  public storageKey: string;

  @Input()
  public header: string;

  @Input()
  public leftPanelExpandedByDefault: boolean = false;

  @Input()
  public defaultFilters: McsFilterInfo[];

  @ViewChild('pageLeftElement', { static: true })
  public pageLeftElement: ElementRef;

  @ViewChild('headerContainer', { read: ViewContainerRef, static: false })
  public headerContainer: ViewContainerRef;

  @ViewChild('headerText')
  public headerText: ElementRef;

  @ContentChild(PageHeaderDirective)
  public headerTemplate: PageHeaderDirective;

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
    private _filterService: McsFilterService
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

      this._initializePanelBySettings();
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
   * Initializes panel by settings
   */
  private _initializePanelBySettings(): void {
    if (isNullOrEmpty(this.storageKey)) { 
      this._pageService.leftPanelIsVisible = this.leftPanelExpandedByDefault;
      return;
    }

    let savedSettings = this._filterService.getFilterSettings(this.storageKey);
    let leftPanelFound = savedSettings?.find(savedItem => savedItem.id === FILTER_LEFT_PANEL_ID);
    this._pageService.leftPanelIsVisible = leftPanelFound?.value;
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

    this._savePanelSettings(this._pageService.leftPanelIsVisible);
    this._changeDetectorRef.markForCheck();
  }

  private _savePanelSettings(visibility: boolean): void {
    if (isNullOrEmpty(this.storageKey)) { return; }

    let savedFilterSettings = this._filterService.getFilterSettings(this.storageKey, this.defaultFilters);
    let leftPanelFound = savedFilterSettings?.find(savedItem => savedItem.id === FILTER_LEFT_PANEL_ID);

    if (isNullOrUndefined(leftPanelFound)) {
      let leftPanelDef = createObject(McsFilterInfo, {
        id: FILTER_LEFT_PANEL_ID,
        value: visibility,
        exclude: true,
        text: 'expanded'
      });
      savedFilterSettings.splice(0, 0, leftPanelDef);
    }
    else {
      leftPanelFound.value = visibility
    }
    this._filterService.saveFilterSettings(this.storageKey, savedFilterSettings);
  }
}
