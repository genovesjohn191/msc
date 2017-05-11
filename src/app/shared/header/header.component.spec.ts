import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { McsAssetsProvider } from '../../core';

describe('HeaderComponent', () => {

  /** Stub Services/Components */
  let component: HeaderComponent;
  let mockAssetsProvider = {
    getImagePath(key: string): string { return 'header.png'; }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(HeaderComponent, {
      set: {
        template: `<div>Overridden template here</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(HeaderComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the getImagePath() of AssetsProvider',
      inject([McsAssetsProvider], (assetsProvider: McsAssetsProvider) => {
        spyOn(assetsProvider, 'getImagePath');
        component.ngOnInit();
        expect(assetsProvider.getImagePath).toHaveBeenCalled();
      }));

    it('mcsLogo variable should not be equal to undefined, null, or empty',
      inject([McsAssetsProvider], (assetsProvider: McsAssetsProvider) => {
        expect(component.mcsLogo).not.toEqual(undefined);
        expect(component.mcsLogo).not.toEqual(null);
        expect(component.mcsLogo).not.toEqual('');
      }));
  });
});
