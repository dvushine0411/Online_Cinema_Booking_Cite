import express from 'express';




export const verifyAdmin = (req, res, next) => {
    const role = req.user.role;

    if(role != "Admin")
    {
        return res.status(403).json({
            message: "Unauthorized"
        })
    }

    next();
    
}