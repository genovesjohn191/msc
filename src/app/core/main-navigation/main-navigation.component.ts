import { Component } from '@angular/core';

/** Providers */
import { TextContentProvider } from '../providers/text-content.provider';

@Component({
  selector: 'mfp-main-navigation',
  templateUrl: './main-navigation.component.html',
  styles: [require('./main-navigation.component.scss')]
})

export class MainNavigationComponent {
  public title: string;
  public textContent: any;

  public constructor(textProvider: TextContentProvider) {
    this.title = 'Main navigation component';
    this.textContent = textProvider.content.navigation;
  }
}
