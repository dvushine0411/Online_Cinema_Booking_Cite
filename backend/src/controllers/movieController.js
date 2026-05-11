import express from 'express';
import Movie from '../models/Movie.js';
import { getPagination, formatPaginatedData } from '../helpers/pagination.js';


export const getAllMovies = async (req, res) => {
    try {

        const { search, status, day, date, month, year } = req.query;

        const { page, limit, skip } = getPagination(req.query);

        let queryCondition = {};

        if (search) {
            queryCondition.title = { $regex: search, $options: 'i' };
        }

        if (status) {
            queryCondition.status = status;
        }

        if (day) {
            queryCondition.$expr = {
                $eq: [
                    {
                        $dayOfWeek: "$releaseDate"
                    },
                    parseInt(day)
                ]
            };
        }

        if (month && year) {

            const startDate = new Date(year, parseInt(month) - 1, 1);

            const endDate = new Date(year, parseInt(month), 0);
            endDate.setHours(23, 59, 59, 999);

            queryCondition.releasedDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);

            endDate.setHours(23, 59, 59, 999);
            queryCondition.releasedDate = {
                $gte: startDate,
                $lte: endDate
            }
        }

        const [movies, totalMovies] = await Promise.all([
            Movie.find(queryCondition)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Movie.countDocuments(queryCondition)
        ]);

        const result = formatPaginatedData(movies, totalMovies, page, limit);

        return res.status(200).json({
            message: "Successfully movies filtered",
            data: result

        });

    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
    }
}

export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found!"
            })
        }

        return res.status(200).json({
            message: "Movie found!",
            data: movie
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });

    }
}


// Những controller phần movie danh riêng cho admin //

export const createMovie = async (req, res) => {
    try {
        const { title, description, duration, genres, releasedDate, actors, status } = req.body;

        const posterURL = req.file ? req.file.path : '';

        if (!title || !description || !duration || !genres || !posterURL || !releasedDate || !actors || !status) {
            return res.status(400).json({ message: "Missing the requirements!" });
        }

        const newMovie = await Movie.create({
            title: title,
            description: description,
            duration: duration,
            genres: genres,
            posterURL: posterURL,
            releasedDate: releasedDate,
            actors: actors,
            status: status
        });

        return res.status(201).json({
            message: "Successfully movie created!",
            data: newMovie
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });

    }

};

export const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMovie = await Movie.findByIdAndDelete(id);

        if (!deletedMovie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        return res.status(200).json({
            message: "Successfully Movie Deleted"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
    }
};


export const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedMovie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        return res.status(200).json({
            message: "Successfully Movie Updated",
            data: updatedMovie
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
    }
};




