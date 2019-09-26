import { JsonProperty } from '@peerlancers/json-serialization';
import {
  isNullOrEmpty,
  deserializeJsonToObject
} from '@app/utilities';

export class McsApiSuccessResponse<T> {
  @JsonProperty()
  public status: number = undefined;

  @JsonProperty()
  public totalCount: number = undefined;

  @JsonProperty()
  public content: T = undefined;

  /**
   * Deserializes the response from API by providing its type
   * @param classType Class Type in which the response should be deserialzed
   * @param response JSON response to be converted
   */
  public static deserializeResponse<T>(
    classType: new () => any,
    response: any
  ): McsApiSuccessResponse<T> {
    if (isNullOrEmpty(response)) {
      return new McsApiSuccessResponse();
    }
    let apiResponse: McsApiSuccessResponse<any>;

    // Deserialize the MCS Api Response
    apiResponse = deserializeJsonToObject(McsApiSuccessResponse, response);
    apiResponse.content = deserializeJsonToObject(classType, response.content);
    return apiResponse;
  }
}
