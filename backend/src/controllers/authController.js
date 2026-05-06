import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import Session from '../models/Session.js';



export const signUp = async (req, res) => {
    const {email, username, password, fullname} = req.body;
    if(!email || !username || !password || !fullname)
    {
        return res.status(400).json({message: "Missing the requirements!"});
    }
    const duplicateUsername = await User.findOne({username: username});
    if(duplicateUsername)
    {
        return res.status(409).json({message: "username existed!"});
    }
    const duplicateEmail = await User.findOne({email: email});
    if(duplicateEmail)
    {
        return res.status(409).json({message: "email existed!"});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Băm mật khẩu, mã hoá mật khẩu //
        const newUser = await User.create({
            email: email,
            username: username,
            hashedPassword: hashedPassword,
            fullname: fullname,
        })

        const displayNewUser = newUser.toObject();
        delete displayNewUser.hashedPassword;

        return res.status(201).json({
            message: "Successfully Created New User!",
            user: displayNewUser
        });
        
    } catch (error) {
        return res.status(401).json({message: "Unsuccessfully Created New User!"});
        
    }

}

const ACCESS_TOKEN_TTL = '1d';
const REFRESH_TOKEN_TTL = 3 * 24 * 60 * 60 * 1000;

export const signIn = async (req, res) => {
    const {username, password} = req.body;

    try {
        if(!username || !password)
        {
            return res.status(400).json({message: "Missing requirements!"});
        }
        const user = await User.findOne({username: username});
        if(!user)
        {
            return res.status(404).json({message: "User not exist!"});
        }
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if(!isMatch)
        {
            return res.status(401).json({message: "Wrong password!"});
        }
        const payload = {
            id: user._id,
            role: user.role
        }

        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_TTL}
        )

        const refreshToken = crypto.randomBytes(64).toString('hex');

        await Session.create({
            userID: user._id,
            refreshToken: refreshToken,
            expiryDate: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: REFRESH_TOKEN_TTL
        })
        return res.status(200).json({
            message: `User ${user.username} successfully login!`,
            accessToken
        })
        
    } catch (error) {
        return res.status(400).json({message: "Errors happened!"});
    }
}   

export const signOut = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if(refreshToken)
        {
            console.log(`Xoá thành công session của ${req.user._id}`);
            await Session.deleteOne({refreshToken: refreshToken});
        }

        res.clearCookie('refreshToken');

        return res.status(200).json({message: "Successfully logout!"});
        
    } catch (error) {
        return res.status(500).json({message: "System error while logging out"});
        
    }

}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if(!refreshToken)
        {
            return res.status(401).json({message: "No refreshToken!"});
        }
        const foundSession = await Session.findOne({refreshToken: refreshToken}).populate({path: 'userID', select: ['username', 'role']});
        if(!foundSession || foundSession.expiryDate < Date.now())
        {
            return res.status(403).json({message: "Session expires or invalid!"});
        }
        const payload = {
            id: foundSession.userID._id,
            role: foundSession.userID.role        
        }

        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_TTL}
        )
        return res.status(200).json({accessToken});
        
    } catch (error) {
        return res.status(500).json({message: "System error while refreshing token"}); 
    }

}




