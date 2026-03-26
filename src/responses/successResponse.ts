/**
 * @fileoverview Success Response - Standardized success response handler
 * @module responses/successResponse
 */

/**
 * Class representing a success response
 * @class
 */
class SuccessResponse {
  public status = 'success';
  public message: string;
  public data: unknown;
  public statusCode: number;
  /**
   * Creates a new success response instance
   * @constructor
   * @param {string} [message="Success"] - The success message
   * @param {*} [data=null] - The response data
   * @param {number} [statusCode=200] - HTTP status code
   */
  constructor(message: string = 'Success', data: unknown = null, statusCode: number = 200) {
    this.status = 'success';
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  /**
   * Sends the success response to the client
   */
  send(res: import('express').Response): import('express').Response {
    return res.status(this.statusCode).json({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }
}

export default SuccessResponse;
