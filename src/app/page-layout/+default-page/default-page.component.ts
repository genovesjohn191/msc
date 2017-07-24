import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CoreDefinition } from '../../core';

@Component({
  selector: 'mcs-default-page',
  templateUrl: './default-page.component.html',
  styles: [require('./default-page.component.scss')]
})

export class DefaultPageComponent {

  public constructor(private _ngLocation: Location) {
    this._removeTokenFromDefaultUrl();
  }

  /**
   * Remove the return URL Token from the given URL of default page
   */
  private _removeTokenFromDefaultUrl(): void {
    this._ngLocation.replaceState(this._ngLocation
      .normalize(CoreDefinition.DEFAULT_INITIAL_PAGE));
  }
}
