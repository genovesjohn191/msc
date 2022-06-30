export class ChangeExtenderSpeed {
  public desiredSpeed: number;
}

// Launch Extender Speed values in Mbps
export const extenderSpeedSliderDefaultValues = [
  10, 50, 100, 250, 500, 1000, 2500, 5000
]

export class ChangeExtenderSpeedInfo {
  public desiredSpeed: number;
  public serviceId: string;
  public speedHasChanged: boolean;
}

export interface ExtenderSpeedConfig {
  extenderServiceLabel: string;
  extenderServiceId: string;
  extenderServiceProductType: string;
  desiredSpeedId: string;
}