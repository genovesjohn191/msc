import { isNullOrUndefined } from '@app/utilities';
import { PlatformType } from '@app/models';
import { IConsolePageEntity } from './console-page-entity.interface';
import { ConsolePageVCloud } from './console-page-vcloud';
import { ConsolePageVCenter } from './console-page-vcenter';

export class ConsolePageFactory {
  private _consoleFactories: Map<PlatformType, IConsolePageEntity>;

  constructor() {
    this._registerFactoryInstances();
  }

  /**
   * Gets the console factory by type object
   */
  public getConsoleFactory(platformType: PlatformType): IConsolePageEntity {
    let factoryInstance = this._consoleFactories.get(platformType);
    if (isNullOrUndefined(factoryInstance)) {
      throw new Error(`${platformType} was not defined in the factory context.`);
    }
    return factoryInstance;
  }

  /**
   * Registers the factory instances of the creation mode
   */
  private _registerFactoryInstances(): void {
    this._consoleFactories = new Map();
    this._consoleFactories.set(PlatformType.VCloud, new ConsolePageVCloud());
    this._consoleFactories.set(PlatformType.VCenter, new ConsolePageVCenter());
  }
}
