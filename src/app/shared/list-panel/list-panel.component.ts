import {
  Component,
  QueryList,
  ContentChildren,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import {
  Subject,
  Observable,
  merge,
  defer
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import { OptionComponent } from '../option-group/option/option.component';
import { OptionGroupComponent } from '../option-group/option-group.component';

@Component({
  selector: 'mcs-list-panel',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./list-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'list-panel-wrapper'
  }
})

export class ListPanelComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(OptionGroupComponent, { descendants: true })
  private _optionGroups: QueryList<OptionGroupComponent>;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;
  private _destroySubject = new Subject<void>();

  /**
   * Combine streams of all option click change
   */
  private readonly _optionsClickEvents: Observable<OptionComponent> = defer(() => {
    return merge<OptionComponent>(...this._options.map((option) => option.clickChange));
  });

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit(): void {
    this._options.changes.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._subscribesToOptionsClickEvent());
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Subscribes to all the options click events
   */
  private _subscribesToOptionsClickEvent(): void {
    let resetSubject = merge(this._options.changes, this._destroySubject);

    this._optionsClickEvents.pipe(
      takeUntil(resetSubject)
    ).subscribe((option: OptionComponent) => {
      this._selectSingleOption(option);
      this._closeOptionGroupsPanel();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Selects single option based on the input provided
   * @param option Option to be selected
   */
  private _selectSingleOption(option: OptionComponent): void {
    this._clearSelectedOptions();
    option.select();
  }

  /**
   * Clears all selected options
   */
  private _clearSelectedOptions(): void {
    this._options.forEach((option) => option.deselect());
  }

  /**
   * Close all the option groups without option selected/active
   */
  private _closeOptionGroupsPanel(): void {
    if (isNullOrEmpty(this._optionGroups)) { return; }

    this._optionGroups.forEach((optionGroup) => {
      if (!optionGroup.hasSelectedOption) {
        optionGroup.closePanel();
      }
    });
  }
}
