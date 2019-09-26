import {
  Component,
  Input,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  EventEmitter,
  AfterContentInit
} from '@angular/core';
import {
  isNullOrEmpty,
  coerceBoolean,
  animateFactory
} from '@app/utilities';
import { McsUniqueId } from '@app/core';

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

export class AccordionPanelComponent implements AfterContentInit {
  public id: string = McsUniqueId.NewId('accordion-panel');

  @Output()
  public selectionChanged = new EventEmitter<any>();

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

  public ngAfterContentInit(): void {
    if (this.expanded) { this.toggle(); }
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
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will close the panel including the animation
   */
  public closePanel(): void {
    this.panelOpen = false;
    this._changeDetectorRef.markForCheck();
  }

  private _emitSelectionChanged(): void {
    if (isNullOrEmpty(this.selectionChanged)) { return; }
    this.selectionChanged.emit(this);
  }
}
