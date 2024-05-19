/**
 * Module represents user class.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Class represents a user.
 */
export class User {
  /**
   * Add user data.
   *
   * @param {number} userId - Unique id of the user.
   * @param {string} userName - Name of the user.
   * @param {Array} ratings - Array of ratings created by the user.
   */
  constructor (userId, userName, ratings) {
    this.userId = userId
    this.userName = userName
    this.ratings = ratings
  }
}
