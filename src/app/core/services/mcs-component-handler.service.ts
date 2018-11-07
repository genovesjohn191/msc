import {
  Injectable,
  ElementRef
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsComponentHandlerService {

  public deleteComponent(componentElement: HTMLElement | ElementRef): void {
    Promise.resolve().then(() => {
      let hostElement: HTMLElement = componentElement instanceof ElementRef ?
        componentElement.nativeElement : componentElement;

      let parentNode = hostElement && hostElement.parentNode;
      if (isNullOrEmpty(parentNode)) { return; }
      parentNode.removeChild(hostElement);
    });
  }
}
