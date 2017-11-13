import { Injectable } from '@angular/core';
import { PopoverDirective } from './popover.directive';

@Injectable()
export class PopoverService {
  /**
   * Currently Active popover
   */
  private _activePopover: PopoverDirective;
  public get activePopover(): PopoverDirective {
    return this._activePopover;
  }
  public set activePopover(value: PopoverDirective) {
    this._activePopover = value;
  }
}
