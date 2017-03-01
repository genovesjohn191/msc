import { Injectable } from '@angular/core';

@Injectable()
export class TextContentProvider {

  /**
   * Content Property (get/set)
   */
  private _content: any;
  public get content(): any {
    return this._content;
  }

  constructor() {
    this.loadContent();
  }

  /**
   * Load Environment Settings (production/development mode)
   */
  private loadContent(): void {
    let config = require('../../config/text-content.config.json');

    if (config != null) {
      this._content = config;
    }
  }
}
