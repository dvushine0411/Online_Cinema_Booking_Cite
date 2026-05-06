import express from 'express';
import Room from '../models/Room.js';


export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().select('-seatLayouts');
        return res.status(200).json({
            data: rooms
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });

    }
}


export const getRoomById = async (req, res) => {
    try {
        const {id} = req.params;
        const room = await Room.findById(id);

        if(!room)
        {
            return res.status(404).json({
                message: "Room not found!"
            })
        }

        return res.status(200).json({data: room});
        
    } catch (error) {
        return res.status(500).json({
            message: "Error happened",
            error: error.message
        })

    }
}

export const createRoom = async (req, res) => {
    try {
        const {name, seatLayouts} = req.body;

        if(!name || !seatLayouts || seatLayouts.length === 0)
        {
            return res.status(400).json({message: "Missing the requirements!"});
        }

        const newRoom = await Room.create({
            name: name,
            seatLayouts: seatLayouts

        });

        return res.status(201).json({
            message: "Created Successfully!",
            data: newRoom
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
        
    }
}

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRoom = await Room.findByIdAndDelete(id);

        if(!deletedRoom)
        {
            return res.status(404).json({message: "Room not found!"});
        }

        return res.status(200).json({message: "Successfully deleted!"});
    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
        
    }
}

export const updateRoom = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;

        const updateroom = await Room.findByIdAndUpdate(id, updateData, {new: true});

        if(!updateroom)
        {
            return res.status(404).json({message: "Room not found!"});
        }

        return res.status(200).json({
            message: "Successfully Room Update",
            data: updateroom

        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
        
    }

}