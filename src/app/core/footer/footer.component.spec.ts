import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { AssetsProvider } from '../providers/assets.provider';
import { TextContentProvider } from '../providers/text-content.provider';

describe('FooterComponent', () => {

  /** Stub Services/Components */
  let component: FooterComponent;
  let mockAssetsProvider = {
    getImagePath(key: string): string { return 'footer.png'; }
  };
  let mockTextContentProvider = {
    content: {
      footer: {
        copyright: 'sample',
        links: 'hello'
      }
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FooterComponent
      ],
      imports: [
      ],
      providers: [
        { provide: AssetsProvider, useValue: mockAssetsProvider },
        { provide: TextContentProvider, useValue: mockTextContentProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(FooterComponent, {
      set: {
        template: `<div>Overridden template here</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FooterComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the getImagePath() of AssetsProvider',
      inject([AssetsProvider], (assetsProvider: AssetsProvider) => {
        spyOn(assetsProvider, 'getImagePath');
        component.ngOnInit();
        expect(assetsProvider.getImagePath).toHaveBeenCalled();
      }));

    it('mcsLogo variable should not be equal to undefined, null, or empty',
      inject([AssetsProvider], (assetsProvider: AssetsProvider) => {
        expect(component.mcsLogo).not.toEqual(undefined);
        expect(component.mcsLogo).not.toEqual(null);
        expect(component.mcsLogo).not.toEqual('');
      }));

    it('title variable should not be equal to undefined, null, or empty',
      inject([AssetsProvider], (assetsProvider: AssetsProvider) => {
        expect(component.copyright).not.toEqual(undefined);
        expect(component.copyright).not.toEqual(null);
        expect(component.copyright).not.toEqual('');
      }));

    it('links variable should not be equal to undefined, null, or empty',
      inject([AssetsProvider], (assetsProvider: AssetsProvider) => {
        expect(component.links).not.toEqual(undefined);
        expect(component.links).not.toEqual(null);
        expect(component.links).not.toEqual('');
      }));
  });
});
