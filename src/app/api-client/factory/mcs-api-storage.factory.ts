import { IMcsApiStorageService } from "../interfaces/mcs-api-storage.interface";
import { McsApiStorageService } from "../services/mcs-api-storage.service";
import { McsApiEntityFactory } from "./mcs-api-entity.factory";

export class McsApiStorageFactory extends McsApiEntityFactory<IMcsApiStorageService> {
  constructor() {
    super(McsApiStorageService);
  }
}