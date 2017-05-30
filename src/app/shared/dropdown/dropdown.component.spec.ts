import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { McsAssetsProvider } from '../../core';

describe('DropdownComponent', () => {

  /** Stub Services/Components */
  let component: DropdownComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'search': 'fa fa-search',
        'spinner': 'fa fa-spinner fa-pulse',
        'caret-down': 'fa fa-caret-down'
      };

      return icons[key];
    }
  };
  let mockCollapsed: boolean;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        DropdownComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(DropdownComponent, {
      set: {
        template: `
          <div #mcsDropdown>
            <span #mcsDropdownGroupName>Group Name</span>
            Overridden template here
          </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(DropdownComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      mockCollapsed = component.collapsed;
    });
  }));

  /** Test Implementation */
  describe('onClick()', () => {
    it('should change the value of collapsed when dropdown component was clicked', () => {
      component.mcsDropdown.nativeElement.click();
      expect(component.collapsed).not.toEqual(mockCollapsed);
    });

    it('should set collapsed to true when clicked outside the component', () => {
      document.body.click();
      expect(component.collapsed).toBeTruthy();
    });

    it('should set collapsed to false when groupName was clicked', () => {
      component.mcsDropdownGroupName.nativeElement.click();
      expect(component.collapsed).toBeFalsy();
    });
  });

  describe('writeValue()', () => {
    it('should pass the value of dropdown to option', () => {
      component.writeValue('Selected Option');
      expect(component.option).toEqual('Selected Option');
    });
  });
});
