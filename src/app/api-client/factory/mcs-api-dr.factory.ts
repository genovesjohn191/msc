import { IMcsApiDrService } from "../interfaces/mcs-api-dr.interface";
import { McsApiDrService } from "../services/mcs-api-dr.service";
import { McsApiEntityFactory } from "./mcs-api-entity.factory";

export class McsApiDrFactory extends McsApiEntityFactory<IMcsApiDrService> {
  constructor() {
    super(McsApiDrService);
  }
}