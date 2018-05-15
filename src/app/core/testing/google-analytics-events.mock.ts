export const googleAnalyticsEventsMock = {
  dataLayer: [],
  emitEvent(
    _eventCategory: string,
    _eventAction: string,
    _eventLabel: string = null,
    _eventValue: number = null) {
    this.dataLayer.push({
      'event': 'customEvent',
      'eventCategory': _eventCategory.toLowerCase(),
      'eventAction': _eventAction.toLowerCase(),
      'eventLabel': _eventLabel.toLowerCase(),
      'eventValue': _eventValue
    });
  }
};
