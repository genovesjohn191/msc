import {
  async,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { RadioButtonGroupComponent } from './radio-button-group.component';
import {
  McsListItem,
  McsAssetsProvider,
  CoreConfig,
  CoreDefinition
} from '../../core';

describe('RadioButtonGroupComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: RadioButtonGroupComponent;
  let mockAssetsProvider = {
    getSvgIconPath(key: string): string {
      let icons = {
        'radio-button-checked': 'radio-button-checked.svg',
        'radio-button-unchecked': 'radio-button-unchecked.svg'
      };
      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        RadioButtonGroupComponent
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(RadioButtonGroupComponent, {
      set: {
        template: `
        <div #radioButtonGroupElement class="radio-button-group-container">
          <div *ngFor="let item of items" class="radio-button-container">
            <label for="{{ item.key }}" (click)="onClickRadioButton(item)">
              <input id="{{ item.key }}" type="radio" [checked]="item.key === activeValue.key">
              {{ item.text }}
            </label>
          </div>
        </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(RadioButtonGroupComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.registerOnChange((_: any) => { return; });
      component.registerOnTouched(() => { return; });
    });
  }));

  /** Test Implementation */
  describe('ngOnChanges()', () => {
    it('should set the horizontal class to radioButtonGroupElement', () => {
      component.orientation = 'horizontal';
      component.ngOnChanges();

      let horizontalExist = component.radioButtonGroupElement
        .nativeElement.classList.contains('horizontal');
      expect(horizontalExist).toBeTruthy();
    });

    it('should set the vertical class to radioButtonGroupElement', () => {
      component.orientation = 'vertical';
      component.ngOnChanges();

      let horizontalExist = component.radioButtonGroupElement
        .nativeElement.classList.contains('vertical');
      expect(horizontalExist).toBeTruthy();
    });
  });

  describe('onClickRadioButton()', () => {
    it('should set the value & text of the activeItem', () => {
      let item = new McsListItem('Beef', 'beef');
      component.onClickEvent(undefined, item);
      expect(component.activeKeyItem).toBe(item.key);
    });
  });

  describe('getRadioButtonIconKey()', () => {
    it('should get the radio-button-checked from the Core Definition', () => {
      let item = new McsListItem('Beef', 'beef');
      component.activeKeyItem = item.key;
      let radioButtonCheckedIcon = component.getRadioButtonIconKey(item);
      expect(radioButtonCheckedIcon).toBe(CoreDefinition.ASSETS_SVG_RADIO_CHECKED);
    });

    it('should get the radio-button-unchecked from the Core Definition', () => {
      let item = new McsListItem('Beef', 'beef');
      component.activeKeyItem = 'unknown';
      let radioButtonCheckedIcon = component.getRadioButtonIconKey(item);
      expect(radioButtonCheckedIcon).toBe(CoreDefinition.ASSETS_SVG_RADIO_UNCHECKED);
    });
  });

  describe('writeValue()', () => {
    it('should set the value of activeItem to dhcp', () => {
      component.writeValue('dhcp');
      expect(component.activeKeyItem).toBe('dhcp');
    });
  });
});
