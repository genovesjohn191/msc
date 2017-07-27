import {
  async,
  TestBed
} from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { CoreTestingModule } from '../../core/testing';

describe('DropdownComponent', () => {

  /** Stub Services/Components */
  let component: DropdownComponent;
  let mockIsOpen: boolean;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        DropdownComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(DropdownComponent, {
      set: {
        template: `
          <div #mcsDropdown>DropdownComponent Template
            <span #mcsDropdownGroupName>Group Name</span>
          </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(DropdownComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      mockIsOpen = component.isOpen;
    });
  }));

  /** Test Implementation */
  describe('onClickOutside()', () => {
    it('should set isOpen to false when clicked outside the component', () => {
      document.body.click();
      expect(component.isOpen).toBeFalsy();
    });
  });

  describe('toggleDropdown()', () => {
    it('should change the value of isOpen when dropdown component was clicked', () => {
      let event = {
        target: component.mcsDropdown.nativeElement
      };
      component.toggleDropdown(event);
      expect(component.isOpen).not.toEqual(mockIsOpen);
    });

    it('should remain the value of isOpen to true when groupName was clicked', () => {
      component.isOpen = true;
      let event = {
        target: component.mcsDropdownGroupName.nativeElement
      };
      component.toggleDropdown(event);
      expect(component.isOpen).toBeTruthy();
    });
  });

  describe('writeValue()', () => {
    it('should pass the value of dropdown to option', () => {
      component.writeValue('Selected Option');
      expect(component.option).toEqual('Selected Option');
    });
  });
});
