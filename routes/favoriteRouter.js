const express = require('express');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');


favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.statusCode = (200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(fav => {
                        if (!favorite.campsites.includes(fav._id)) {
                            favorite.campsites.push(fav._id);
                        }
                    })
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    favorite.remove()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    res.setHeader("Content-Type", 'text/plain');
                    res.send('You do not have any favorites to delete.');
                }
            })
            .catch(err => next(err))
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => statusCode(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                console.log('Post found')
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                            .then(savedFavorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(savedFavorite);
                            })
                            .catch(err => next(err))
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end("That campsite is already in the list of favorites!")
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.params.campsiteId })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'application/json')
                            res.json(favorite)
                        })
                        .catch(err => next(err))
                }
            })
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    const deleteIndex = favorite.campsites.indexOf(req.params.campsiteId);
                    if (deleteIndex >= 0) {
                        (favorite.campsites.splice(deleteIndex, 1))
                    }
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'application/json')
                            res.json(favorite)
                        })
                        .catch(err => next(err));
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('There are no favorites to delete.');
                }
            })
            .catch(err => next(err))
    });



module.exports = favoriteRouter;