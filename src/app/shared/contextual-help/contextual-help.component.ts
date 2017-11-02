import {
  Component,
  Input,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { CoreDefinition } from '../../core';
import { getElementPositionFromHost } from '../../utilities';
import { ContextualHelpDirective } from './contextual-help.directive';

@Component({
  selector: 'mcs-contextual-help',
  templateUrl: './contextual-help.component.html',
  styleUrls: ['./contextual-help.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContextualHelpComponent {
  @Input()
  public contextualInformations: ContextualHelpDirective[];

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.contextualInformations = new Array();
  }

  /**
   * Get the text styles of the contextual help directive
   * @param targetElementRef Target element of the directive
   * @param contextInformation Contextual informations
   */
  public getTextStyle(targetElementRef: any, contextInformation: ContextualHelpDirective) {
    if (!contextInformation) { return; }

    // Register refresh functions
    contextInformation.refreshFunc = this._markForCheck.bind(this);

    // Get the right top coordinates and set to top of description
    let targetElementPosition = getElementPositionFromHost(
      contextInformation.getHostElement(),
      targetElementRef, 'right-top', false);

    return {
      'top': `${targetElementPosition.top}px`,
      'position': 'absolute',
      'font-family': contextInformation.hasFocus ?
        CoreDefinition.BASE_FONT_BOLD :
        CoreDefinition.BASE_FONT
    };
  }

  /**
   * Refresh the view of the component itself
   */
  private _markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
