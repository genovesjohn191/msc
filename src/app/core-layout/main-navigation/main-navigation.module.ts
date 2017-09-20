import { NgModule } from '@angular/core';
/** Modules */
import { SharedModule } from '../../shared';
import { MainNavigationComponent } from './main-navigation.component';
/** Desktop/Tablet */
import {
  NavigationDesktopComponent
} from './navigation-desktop/navigation-desktop.component';
import {
  NavigationDesktopItemsDirective
} from './navigation-desktop/navigation-desktop-items.directive';

/** Mobile */
import {
  NavigationMobileComponent
} from './navigation-mobile/navigation-mobile.component';
import {
  NavigationMobileItemsDirective
} from './navigation-mobile/navigation-mobile-items.directive';

@NgModule({
  declarations: [
    MainNavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    NavigationDesktopItemsDirective,
    NavigationMobileItemsDirective
  ],
  imports: [
    SharedModule
  ],
  exports: [
    MainNavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    NavigationDesktopItemsDirective,
    NavigationMobileItemsDirective
  ]
})

export class MainNavigationModule { }
