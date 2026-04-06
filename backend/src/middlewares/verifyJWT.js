import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';


export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Lấy accessToken ra //
    if(!authHeader)
    {
        return res.status(401).json({message: "User Unauthorized"});

    }
    const authToken = authHeader.split(' ')[1];   // Lấy ở phần sau chữ Bearer //
    jwt.verify (
        authToken,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.status(403);   // Lỗi token không đúng //
            req.user = decoded;               // Gán username vào phần req.user // 
            next();
        }
        
    );
}