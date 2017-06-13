import {
  async,
  TestBed
} from '@angular/core/testing';

import { AlertComponent } from './alert.component';
import { McsAssetsProvider } from '../../core';

describe('AlertComponent', () => {

  /** Stub Services/Components */
  let component: AlertComponent;
  let mockIcons = {
    close: 'fa fa-close',
    check: 'fa fa-check',
    exclamation: 'fa fa-exclamation'
  };
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = mockIcons;
      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        AlertComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(AlertComponent, {
      set: {
        template: `
          <div>
            Overridden template here
          </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(AlertComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  describe('ngOnInit()', () => {
    it('should set the icon based on alert type', () => {
      component.type = 'success';
      component.ngOnInit();
      expect(component.icon).toEqual(mockIcons.check);
    });
  });

  describe('getAlertIcon()', () => {
    it('should return the icon based on alert type', () => {
      component.type = 'failed';
      expect(component.getAlertIcon(component.type)).toEqual(mockIcons.close);
    });
  });
});
