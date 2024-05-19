/**
 * Module represents Express router.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'

import { RecommendationController } from '../controllers/recommendation-controller.js'

export const router = express.Router()

const controller = new RecommendationController()
controller.configureCsvData()

router.get('/users/all', (req, res, next) => controller.getAllUsers(req, res, next))
router.get('/top-matching-users', (req, res, next) => controller.getTopMatchingUsers(req, res, next))
router.get('/recommended-movies', (req, res, next) => controller.recommendedMovies(req, res, next))

router.use('*', (req, res, next) => next(createError(404)))
