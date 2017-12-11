import {
  Component,
  OnInit,
  Input,
  Output,
  ContentChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  isNullOrEmpty,
  coerceBoolean
} from '../../../utilities';
import {
  AccordionPanelHeaderComponent
} from '../accordion-panel-header/accordion-panel-header.component';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-accordion-panel',
  templateUrl: './accordion-panel.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('bodyExpansion', [
      state('collapsed', style({ height: '0px', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ]),
  ],
  host: {
    'class': 'accordion-panel-wrapper',
    '[id]': 'id'
  }
})

export class AccordionPanelComponent implements OnInit {
  public id: string = `mcs-option-${nextUniqueId++}`;

  @Output()
  public selectionChanged = new EventEmitter<any>();

  @ContentChild(AccordionPanelHeaderComponent)
  public headerPanel: AccordionPanelHeaderComponent;

  /**
   * Flag that determines if the panel is open
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean {
    return this._panelOpen;
  }
  public set panelOpen(value: boolean) {
    if (this._panelOpen !== value) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Animation to be trigger during the collapse and expand
   */
  private _animateTrigger: string;
  public get animateTrigger(): string {
    return this._animateTrigger;
  }
  public set animateTrigger(value: string) {
    if (this._animateTrigger !== value) {
      this._animateTrigger = value;
    }
  }

  @Input()
  public get enableToggle(): boolean { return this._enableToggle; }
  public set enableToggle(value: boolean) { this._enableToggle = coerceBoolean(value); }
  private _enableToggle: boolean;

  @Input()
  public get expanded(): boolean { return this._expanded; }
  public set expanded(value: boolean) { this._expanded = coerceBoolean(value); }
  private _expanded: boolean;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.enableToggle = true;
    this.selectionChanged = new EventEmitter();
    this.animateTrigger = 'collapsed';
  }

  public ngOnInit(): void {
    // If initially expanded, toggle click method
    if (this.expanded) {
      this.toggle();
    }
  }

  /**
   * Toggle the panel to open or close
   */
  public toggle(): void {
    if (this.enableToggle) {
      this.panelOpen ? this.closePanel() : this.openPanel();
    } else {
      this.openPanel();
    }
    this._emitSelectionChanged();
  }

  /**
   * This will open the panel including the animation
   */
  public openPanel(): void {
    this.animateTrigger = 'expanded';
    this.panelOpen = true;
    this.headerPanel.updateView();
  }

  /**
   * This will close the panel including the animation
   */
  public closePanel(): void {
    this.animateTrigger = 'collapsed';
    this.panelOpen = false;
    this.headerPanel.updateView();
  }

  private _emitSelectionChanged(): void {
    if (isNullOrEmpty(this.selectionChanged)) { return; }
    this.selectionChanged.emit(this);
  }
}
