import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ContentChild,
  AfterContentInit
} from '@angular/core';
import { isNullOrEmpty } from '../../utilities';

/** Main Directives */
import { PageTitleDefDirective } from './page-title';
import { PageSubTitleDefDirective } from './page-subtitle';
import { PageDescriptionDefDirective } from './page-description';

/** Placeholder Directives */
import {
  PageTitlePlaceholderDirective,
  PageSubTitlePlaceholderDirective,
  PageDescriptionPlaceholderDirective
} from './shared';

@Component({
  selector: 'mcs-page-header',
  templateUrl: './page-header.component.html',
  styles: [require('./page-header.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageHeaderComponent implements AfterContentInit {
  /**
   *  Placeholder Definition where the main directives is placed in the DOM
   */
  @ViewChild(PageTitlePlaceholderDirective)
  private _pageTitlePlaceholder: PageTitlePlaceholderDirective;

  @ViewChild(PageSubTitlePlaceholderDirective)
  private _pageSubTitlePlaceholder: PageSubTitlePlaceholderDirective;

  @ViewChild(PageDescriptionPlaceholderDirective)
  private _pageDescriptionPlaceholder: PageDescriptionPlaceholderDirective;

  /**
   *  Main Definition Directives
   */
  @ContentChild(PageTitleDefDirective)
  private _pageTitleDefinition: PageTitleDefDirective;

  @ContentChild(PageSubTitleDefDirective)
  private _pageSubTitleDefinition: PageSubTitleDefDirective;

  @ContentChild(PageDescriptionDefDirective)
  private _pageDescriptionDefinition: PageDescriptionDefDirective;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngAfterContentInit(): void {
    this._insertTitle();
    this._insertSubTitle();
    this._insertDescription();
    this._changeDetectorRef.markForCheck();
  }

  private _insertTitle(): void {
    if (isNullOrEmpty(this._pageTitleDefinition)) { return; }
    this._pageTitlePlaceholder.viewContainer
      .createEmbeddedView(this._pageTitleDefinition.template);
  }

  private _insertSubTitle(): void {
    if (isNullOrEmpty(this._pageSubTitleDefinition)) { return; }
    this._pageSubTitlePlaceholder.viewContainer
      .createEmbeddedView(this._pageSubTitleDefinition.template);
  }

  private _insertDescription(): void {
    if (isNullOrEmpty(this._pageDescriptionDefinition)) { return; }
    this._pageDescriptionPlaceholder.viewContainer
      .createEmbeddedView(this._pageDescriptionDefinition.template);
  }
}
