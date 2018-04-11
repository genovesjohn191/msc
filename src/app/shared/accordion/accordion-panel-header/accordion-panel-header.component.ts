import {
  Component,
  forwardRef,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreDefinition } from '../../../core';
import { isNullOrEmpty, animateFactory } from '../../../utilities';
import { AccordionPanelComponent } from '../accordion-panel/accordion-panel.component';

@Component({
  selector: 'mcs-accordion-panel-header',
  templateUrl: './accordion-panel-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.rotate180
  ],
  host: {
    'class': 'accordion-panel-header-wrapper',
    '[class.active]': 'panelOpen',
    '(click)': 'onClick()'
  }
})

export class AccordionPanelHeaderComponent {

  public get panelOpen(): boolean {
    return isNullOrEmpty(this._panelHost) ? false : this._panelHost.panelOpen;
  }

  constructor(
    @Inject(forwardRef(() => AccordionPanelComponent)) private _panelHost,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  /**
   * On click event that triggers when user clicks on the panel
   */
  public onClick(): void {
    if (isNullOrEmpty(this._panelHost)) { return; }
    this._panelHost.toggle();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggle icon key (Chevron right and down)
   */
  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  /**
   * Update the view for closing other panels
   */
  public updateView(): void {
    this._changeDetectorRef.markForCheck();
  }
}
