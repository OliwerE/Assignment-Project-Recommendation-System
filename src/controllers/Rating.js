/**
 * Module represents user rating class.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Class represents a user rating.
 */
export class Rating {
  /**
   * Add rating data.
   *
   * @param {number} movieId - Unique id of the movie.
   * @param {string} movieName - Name of the movie.
   * @param {number} score - User defined score of the movie.
   */
  constructor (movieId, movieName, score) {
    this.movieId = movieId
    this.movieName = movieName
    this.score = score
  }
}
