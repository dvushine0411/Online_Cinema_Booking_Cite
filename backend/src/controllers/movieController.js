import express from 'express';
import Movie from '../models/Movie.js';
import { getPagination, formatPaginatedData } from '../helpers/pagination.js';

export const getMovieNowShowing = async (req, res) => {
    try {

        const {page, limit, skip} = getPagination(req.query);
        const movies = await Movie.find({status: 'Now Showing'}).sort({createdAt: -1}).skip(skip).limit(limit);
        const totalMovies = await Movie.countDocuments({status: "Now Showing"});
        if(totalMovies == 0)
        {
            return res.status(404).json({message: "No movies is showing"});
        }
        const result = formatPaginatedData(movies, totalMovies, page, limit);
        return res.status(200).json({result});

    } catch (error) {
        return res.status(500).json({message: "Error happened in get coming soon movies"});
    }
}

export const getMovieComingSoon = async (req, res) => {
    try {
        const {page, limit, skip} = getPagination(req.query);
        const movies = (await Movie.find({status: "Coming soon"})).sort({created: -1}).skip(skip).limit(limit);
        const totalMovies = await Movie.countDocuments({status: "Coming Soon"});
        if(totalMovies == 0)
        {
            return res.status(404).json({message: "No movies is coming soon"});
        }
        const result = formatPaginatedData(movies, totalMovies, page, limit);
        return res.status(200).json({result});
        
    } catch (error) {
        return res.status(500).json({message: "Error happened in get coming soon movies"});
        
    }

}

export const getmovieDetail = async (req, res) => {
    try {
        const movie = req.query.movie;
        const movieDetails = await Movie.findOne({title: movie});
        if(!movieDetails)
        {
            return res.status(404).json({message: "No movie details"});
        }
        return res.status(200).json({movieDetails});
        
    } catch (error) {
        return res.status(500).json({message: "Error happened in get movies details"});
    }

}

export const searchMovie = async (req, res) => {
    try {
        const { title } = req.query;
        if(!title)
        {
            return res.status(400).json({message: "Please fill the searching bar"});
        }
        const movies = await Movie.find({title: {$regex: title, $options: "i"}});
        return res.status(200).json({movies});
        
    } catch (error) {
        
        return res.status(500).json({message: "Error happened when searching movies!"});
    }

}

export const getMovieByDates = async (req, res) => {
    try {
        

    } catch (error) {
        
    }



}


