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
  isNullOrEmpty,
  coerceBoolean,
  animateFactory
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
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'accordion-panel-wrapper',
    '[id]': 'id'
  }
})

export class AccordionPanelComponent implements OnInit {
  public id: string = `mcs-accordion-panel-${nextUniqueId++}`;

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
    this.panelOpen = true;
    this.headerPanel.updateView();
  }

  /**
   * This will close the panel including the animation
   */
  public closePanel(): void {
    this.panelOpen = false;
    this.headerPanel.updateView();
  }

  private _emitSelectionChanged(): void {
    if (isNullOrEmpty(this.selectionChanged)) { return; }
    this.selectionChanged.emit(this);
  }
}
