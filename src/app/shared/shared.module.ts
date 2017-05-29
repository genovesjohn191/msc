import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
/** Modules */
import { PopoverModule } from './popover/popover.module';
/** Services */
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
/** Components */
import { ButtonComponent } from './button/button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { FilterSelectorComponent } from './filter-selector/filter-selector.component';
import { TextboxComponent } from './textbox/textbox.component';
import { LightboxComponent } from './lightbox/lightbox.component';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
/** Multiple Components */
import {
  StateChangeNotificationsComponent,
  StateChangeNotificationComponent
} from './state-change-notifications';
/** Layout Components */
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {
  HeaderComponent,
  UserPanelComponent,
  RunningNotificationComponent,
  RunningNotificationMaxDisplayPipe
} from './header';
/** Directives */
import { FlatDirective } from './directives/flat.directive';
import { RedDirective } from './directives/red.directive';

@NgModule({
  declarations: [
    MainNavigationComponent,
    BreadcrumbsComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    PageNotFoundComponent,
    RunningNotificationComponent,
    UserPanelComponent,
    ButtonComponent,
    CheckboxComponent,
    FilterSelectorComponent,
    TextboxComponent,
    LightboxComponent,
    StateChangeNotificationComponent,
    StateChangeNotificationsComponent,
    SvgIconComponent,
    FlatDirective,
    RedDirective,
    RunningNotificationMaxDisplayPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PopoverModule
  ],
  exports: [
    MainNavigationComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    PageNotFoundComponent,
    RunningNotificationComponent,
    UserPanelComponent,
    ButtonComponent,
    CheckboxComponent,
    FilterSelectorComponent,
    TextboxComponent,
    LightboxComponent,
    StateChangeNotificationComponent,
    StateChangeNotificationsComponent,
    SvgIconComponent,
    FlatDirective,
    RedDirective,
    RunningNotificationMaxDisplayPipe,
    CommonModule,
    RouterModule,
    FormsModule,
    PopoverModule
  ],
  providers: [
    BreadcrumbsService
  ]
})

export class SharedModule { }
