import {
  Component,
  OnInit,
  ElementRef,
  Input
} from '@angular/core';
import { CoreDefinition } from '../../core';
import { getElementPositionFromHost } from '../../utilities';
import { ContextualHelpDirective } from './contextual-help.directive';

@Component({
  selector: 'mcs-contextual-help',
  templateUrl: './contextual-help.component.html',
  styles: [require('./contextual-help.component.scss')]
})

export class ContextualHelpComponent {
  @Input()
  public contextualInformations: ContextualHelpDirective[];

  public constructor() {
    this.contextualInformations = new Array();
  }

  public getTextStyle(targetElementRef: any, contextInformation: ContextualHelpDirective) {
    if (!contextInformation) { return; }

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
}
