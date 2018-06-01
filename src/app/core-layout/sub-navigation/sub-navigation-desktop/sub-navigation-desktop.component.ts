import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-sub-navigation-desktop',
  templateUrl: './sub-navigation-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'sub-navigation-desktop-wrapper'
  }
})

export class SubNavigationDesktopComponent { }
