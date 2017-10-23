import { Injectable } from '@angular/core';

@Injectable()
export class PageService {

  /**
   * Determine weather the left panel is collapsed
   *
   * `@Note:` Default value is true so that the left panel is visible (if necessary)
   */
  private _leftPanelIsVisible: boolean = true;
  public get leftPanelIsVisible(): boolean {
    return this._leftPanelIsVisible;
  }
  public set leftPanelIsVisible(value: boolean) {
    this._leftPanelIsVisible = value;
  }
}
