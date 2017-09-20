import {
  Component,
  AfterViewInit,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  McsTextContentProvider,
  CoreDefinition
} from '../../core';
import { refreshView } from '../../utilities';
/** Directives for mobile/table/desktop */
import {
  NavigationDesktopItemsDirective
} from './navigation-desktop/navigation-desktop-items.directive';
import {
  NavigationMobileItemsDirective
} from './navigation-mobile/navigation-mobile-items.directive';

@Component({
  selector: 'mcs-main-navigation',
  templateUrl: './main-navigation.component.html',
  styles: [require('./main-navigation.component.scss')]
})

export class MainNavigationComponent implements AfterViewInit {

  public textContent: any;

  @ViewChild(NavigationDesktopItemsDirective)
  public navigationDesktop: NavigationDesktopItemsDirective;

  @ViewChild(NavigationMobileItemsDirective)
  public navigationMobile: NavigationMobileItemsDirective;

  @ViewChild('navigationList')
  public navigationList: TemplateRef<any>;

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _titleService: Title
  ) {
    this.textContent = this._textProvider.content;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.navigationMobile.viewContainer.createEmbeddedView(this.navigationList);
      this.navigationDesktop.viewContainer.createEmbeddedView(this.navigationList);
    });
  }

  public setTitle(title: string) {
    this._titleService.setTitle(title);
  }
}
