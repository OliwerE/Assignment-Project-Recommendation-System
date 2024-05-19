/**
 * Module represents recommendation controller.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fs from 'fs'
import csv from 'csv-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import createError from 'http-errors'

import { User } from './User.js'
import { Rating } from './Rating.js'

// Get path to application
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Class represents Lits controller.
 */
export class RecommendationController {
  /**
   * Class constructor.
   */
  constructor () {
    this.moviesData = new Map()
    this.numOfMovieRatings = new Map()
    this.ratingsData = []
    this.usersData = []
    this.users = new Map()
  }

  /**
   * Configure data from CSV files.
   */
  configureCsvData () {
    this.readMoviesCSV()
  }

  /**
   * Add csv movie data to an array.
   */
  readMoviesCSV () {
    fs.createReadStream(path.resolve(__dirname, `../../data/${process.env.DATA_FOLDER}/movies.csv`))
      .pipe(csv({ separator: ',' }))
      .on('data', (data) => {
        const movieId = parseInt(data.movieId)
        const movieData = {
          MovieId: data.movieId,
          Title: data.title
        }
        this.moviesData.set(movieId, movieData)
      })
      .on('end', () => {
        this.readRatingsCSV()
      })
  }

  /**
   * Add csv rating data to an array.
   */
  readRatingsCSV () {
    fs.createReadStream(path.resolve(__dirname, `../../data/${process.env.DATA_FOLDER}/ratings.csv`))
      .pipe(csv({ separator: ',' }))
      .on('data', (data) => {
        const ratingsData = {
          UserId: parseInt(data.userId),
          MovieId: parseInt(data.movieId),
          Rating: parseFloat(data.rating)
        }
        this.ratingsData.push(ratingsData)
      })
      .on('end', () => {
        this.createUsers()
        this.createUserRatingObjects()
      })
  }

  /**
   * Creates user objects.
   */
  createUsers () {
    const numOfUsers = this.ratingsData[this.ratingsData.length - 1].UserId

    for (let i = 0; i < numOfUsers; i++) {
      const newUser = {
        Name: `User ${i + 1}`,
        UserId: i + 1
      }
      this.usersData.push(newUser)
    }
  }

  /**
   * Create users and ratings objects.
   */
  createUserRatingObjects () {
    // Create all users
    for (let i = 0; i < this.usersData.length; i++) {
      const ratingsByUser = this.getUserRatingsMap(this.usersData[i].UserId) // Returns array of rating objects (created by user)
      this.createUserObject(this.usersData[i].UserId, this.usersData[i].Name, ratingsByUser)
    }
  }

  /**
   * Creates an array of user rating objects based on a user id.
   *
   * @param {number} userId - Unique user id.
   * @returns {Array} - An array with the user rating objects.
   */
  getUserRatingsMap = (userId) => {
    // Get user ratings
    const ratings = []
    for (let i = 0; i < this.ratingsData.length; i++) {
      if (this.ratingsData[i].UserId === userId) {
        ratings.push(this.ratingsData[i])
      }

      // Break after last user rating (Stored in userId order)
      if (this.ratingsData[i].UserId > userId) {
        break
      }
    }

    const result = new Map()
    for (let i = 0; i < ratings.length; i++) {
      // Update number of movie ratings
      if (this.numOfMovieRatings.get(ratings[i].MovieId) === undefined) {
        this.numOfMovieRatings.set(ratings[i].MovieId, 1)
      } else {
        const currentMovieRatingsCount = this.numOfMovieRatings.get(ratings[i].MovieId)
        const newMovieRatingsCount = currentMovieRatingsCount + 1
        this.numOfMovieRatings.set(ratings[i].MovieId, newMovieRatingsCount)
      }

      // Get movie title
      const movieTitle = this.moviesData.get(ratings[i].MovieId).Title

      // Create rating
      const newRating = new Rating(ratings[i].MovieId, movieTitle, ratings[i].Rating)
      result.set(newRating.movieId, newRating)
    }
    return result
  }

  /**
   * Creates a user object.
   *
   * @param {number} userId - Unique user id.
   * @param {string} name - Name of the user.
   * @param {Array} ratingsByUser - Array of rating objects.
   */
  createUserObject (userId, name, ratingsByUser) {
    const newUser = new User(userId, name, ratingsByUser)
    this.users.set(userId, newUser)
  }

  /**
   * Returns all users stored in usersData.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {Function} next - Next function.
   */
  getAllUsers (req, res, next) {
    try {
      res.json({ msg: 'All users', res: this.usersData })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Returns top matching users.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {Function} next - Next function.
   */
  getTopMatchingUsers (req, res, next) {
    try {
      const { userId, similarity, results } = req.query

      const similarUsersList = this.similarUsersAlgorithm(parseInt(userId))

      // If less results than user requested.
      let numOfResults = parseInt(results)
      if (similarUsersList.length < parseInt(results)) {
        numOfResults = similarUsersList.length
      }

      // Create array with requested number of results
      const dataToReturn = []
      for (let i = 0; i < numOfResults; i++) {
        dataToReturn.push({ name: similarUsersList[i].name, userId: similarUsersList[i].userId, similarity: similarUsersList[i].similarity.toFixed(4) })
      }

      res.json({ user: userId, similarity, results, data: dataToReturn })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Creates an array of objects containing other users data and their similarity score.
   *
   * @param {number} selectedUserId - User to be ignored.
   * @returns {Array} - An array of user similarity scores.
   */
  similarUsersAlgorithm (selectedUserId) {
    const similarityObjects = []
    for (const userId of this.users.keys()) {
      if (userId === selectedUserId) {
        continue
      } else {
        const similarity = this.euclideanDistance(this.users.get(selectedUserId), this.users.get(userId))

        const similarityObject = {
          name: this.users.get(userId).userName,
          userId,
          similarity
        }
        similarityObjects.push(similarityObject)
      }
    }

    // Sort result, highest score first
    const sortedResults = []
    for (let i = 0; i < similarityObjects.length; i++) {
      const result = similarityObjects[i]

      // Find sorted index for result
      let index
      for (index = 0; index < sortedResults.length; index++) {
        if (sortedResults[index].similarity <= result.similarity) {
          break
        }
      }

      // Add result to index
      sortedResults.splice(index, 0, result)
    }
    return sortedResults
  }

  /**
   * Algorithm used to calculate euclidean distance score.
   *
   * @param {object} userA - A user to be compared.
   * @param {object} userB - A user to be compared.
   * @returns {number} - euclidean distance score.
   */
  euclideanDistance = (userA, userB) => {
    let similarity = 0
    let numOfMatchingMovies = 0

    for (const userAMovieId of userA.ratings.keys()) { // Iterate all user a ratings
      for (const UserBMovieId of userB.ratings.keys()) { // iterate all user b ratings
        if (userA.ratings.get(userAMovieId).movieId === userB.ratings.get(UserBMovieId).movieId) {
          similarity += (userA.ratings.get(userAMovieId).score - userB.ratings.get(UserBMovieId).score) ** 2
          numOfMatchingMovies += 1
        }
      }
    }

    if (numOfMatchingMovies === 0) { // = No matching ratings
      return 0
    }

    // Similarity score
    const inv = 1 / (1 + similarity)
    return inv
  }

  /**
   * Returns recommended movies.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {Function} next - Next function.
   */
  recommendedMovies (req, res, next) {
    try {
      const { userId, similarity, results, ratings } = req.query

      const similarUsersList = this.similarUsersAlgorithm(parseInt(userId))
      const recommendedMovies = this.getMovieWeightedScores(similarUsersList, userId, parseInt(ratings)) // ratings = min number of ratings

      // If less results than user requested.
      let numOfResults = parseInt(results)
      if (recommendedMovies.length < parseInt(results)) {
        numOfResults = recommendedMovies.length
      }

      // Create array with requested number of results
      const responseData = []
      for (let i = 0; i < numOfResults; i++) {
        responseData.push({
          movie: this.moviesData.get(recommendedMovies[i].movieId).Title,
          movieId: recommendedMovies[i].movieId,
          score: recommendedMovies[i].score.toFixed(4),
          numOfRatings: this.numOfMovieRatings.get(recommendedMovies[i].movieId)
        })
      }

      res.json({ user: userId, similarity, results, data: responseData })
    } catch (err) {
      console.log(err)
      next(createError(500))
    }
  }

  /**
   * Calculates all weighted movie scores.
   *
   * @param {Array} similarityScores - Array with userdata and similarity scores.
   * @param {number} userToIgnoreID - User id of the selected user.
   * @param {number} minNumOfMovieRatings - Minimum number of movie ratings
   * @returns {Array} - Array of movie data objects (scores and sums).
   */
  getMovieWeightedScores (similarityScores, userToIgnoreID, minNumOfMovieRatings) {
    const moviesToReturn = []

    for (const movieId of this.moviesData.keys()) {
      // If not enough movie ratings
      if (!(this.numOfMovieRatings.get(movieId) >= minNumOfMovieRatings)) {
        continue
      }

      // Check if selected user (in GUI) has seen the movie
      const userToIgnoreRating = this.users.get(parseInt(userToIgnoreID)).ratings.get(movieId)
      if (userToIgnoreRating !== undefined) { // Selected user have already seen movie
        continue
      }

      const allWeightedScoresForMovie = []
      const matchingUserSimilarityScores = [] // used to calculate similarity sum for movie

      for (const userId of this.users.keys()) {
        if (userId === userToIgnoreID) { // Ignores if selected user (in GUI)
          continue
        }

        const userRating = this.users.get(userId).ratings.get(movieId)

        if (userRating !== undefined) { // User has seen the movie
          // Find user similarity score
          const similarityScoreComparedToSelectedUser = []
          for (let s = 0; s < similarityScores.length; s++) {
            if (userId === similarityScores[s].userId) {
              similarityScoreComparedToSelectedUser.push(similarityScores[s])
              break
            }
          }
          const weightedScore = userRating.score * similarityScoreComparedToSelectedUser[0].similarity

          // Does not include users with similarity score 0
          if (similarityScoreComparedToSelectedUser[0].similarity > 0 && weightedScore > 0) {
            allWeightedScoresForMovie.push(parseFloat(weightedScore))
            matchingUserSimilarityScores.push(parseFloat(similarityScoreComparedToSelectedUser[0].similarity)) // Add user similarity score because it has seen the movie.
          }
        }
      }

      // Calculate weighted score sum
      let movieWeightedScoreSum = 0
      for (let s = 0; s < allWeightedScoresForMovie.length; s++) {
        movieWeightedScoreSum += allWeightedScoresForMovie[s]
      }

      // Calculate similarity score sum
      let movieSimilarityScoreSum = 0
      for (let s = 0; s < matchingUserSimilarityScores.length; s++) {
        movieSimilarityScoreSum += matchingUserSimilarityScores[s]
      }

      // Movie result data
      const movieData = {
        movieId,
        weightedScoreSum: movieWeightedScoreSum,
        similarityScoreSum: movieSimilarityScoreSum
      }

      moviesToReturn.push(movieData)
    }

    // Calculate movie score
    for (let i = 0; i < moviesToReturn.length; i++) {
      const score = moviesToReturn[i].weightedScoreSum / moviesToReturn[i].similarityScoreSum
      moviesToReturn[i].score = score // Add score to movieData object

      if (isNaN(moviesToReturn[i].score)) { // 0 / 0 = 0
        moviesToReturn[i].score = 0.0000
      } else {
        moviesToReturn[i].score = parseFloat(moviesToReturn[i].score.toFixed(4))
      }
    }

    // Sort result, highest score first
    const sortedResults = []
    for (let i = 0; i < moviesToReturn.length; i++) {
      const result = moviesToReturn[i]

      // Find sorted index for result
      let index
      for (index = 0; index < sortedResults.length; index++) {
        const sortedResult = sortedResults[index]
        if (sortedResult.score < result.score) {
          break
        }

        // Same score: sort by most ratings
        if (sortedResult.score === result.score) {
          const sortedResultRatings = this.numOfMovieRatings.get(sortedResult.movieId)
          const resultRatings = this.numOfMovieRatings.get(result.movieId)

          if (resultRatings > sortedResultRatings) {
            break
          }
        }
      }

      // Add result to index
      sortedResults.splice(index, 0, result)
    }
    return sortedResults
  }
}
