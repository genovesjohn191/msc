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
/** Layout Components */
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { HeaderComponent } from './header/header.component';
import { NotificationUiComponent } from './notification-ui/notification-ui.component';
import { UserPanelComponent } from './user-panel/user-panel.component';
/** Page Not Found Component */
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
/** Directives */
import { FlatDirective } from './directives/flat.directive';
import { RedDirective } from './directives/red.directive';
/** Pipes */
import { NotificationMaxDisplayPipe } from './notification-ui/notification-max-display.pipe';

@NgModule({
  declarations: [
    MainNavigationComponent,
    BreadcrumbsComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    PageNotFoundComponent,
    NotificationUiComponent,
    UserPanelComponent,
    ButtonComponent,
    CheckboxComponent,
    FilterSelectorComponent,
    TextboxComponent,
    LightboxComponent,
    FlatDirective,
    RedDirective,
    NotificationMaxDisplayPipe
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
    NotificationUiComponent,
    UserPanelComponent,
    ButtonComponent,
    CheckboxComponent,
    FilterSelectorComponent,
    TextboxComponent,
    LightboxComponent,
    FlatDirective,
    RedDirective,
    NotificationMaxDisplayPipe,
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
