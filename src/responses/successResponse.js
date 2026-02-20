/**
 * @fileoverview Success Response - Standardized success response handler
 * @module responses/successResponse
 */

/**
 * Class representing a success response
 * @class
 */
class SuccessResponse {
  /**
   * Creates a new success response instance
   * @constructor
   * @param {string} [message="Success"] - The success message
   * @param {*} [data=null] - The response data
   * @param {number} [statusCode=200] - HTTP status code
   */
  constructor(message = "Success", data = null, statusCode = 200) {
    this.status = "success";
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  /**
   * Sends the success response to the client
   * @function send
   * @param {import('express').Response} res - Express response object
   * @returns {import('express').Response} The Express response object
   */
  send(res) {
    return res.status(this.statusCode).json({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }
}

export default SuccessResponse;
