import {
  Component,
  forwardRef,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CoreDefinition } from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import { AccordionPanelComponent } from '../accordion-panel/accordion-panel.component';

@Component({
  selector: 'mcs-accordion-panel-header',
  templateUrl: './accordion-panel-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('indicatorIcon', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
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

  public get panelAnimation(): string {
    return isNullOrEmpty(this._panelHost) ? 'collapsed' : this._panelHost.animateTrigger;
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
