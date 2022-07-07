const jwt = require("jsonwebtoken");  // importing the jsonwebtoken so as to authenticate and authorize the user.
const userModel = require("../models/userModel");
const mongoose = require('mongoose')


const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]  // --> token is picked from the headers section of the request
        if ( !token ) return res.status(400).send( { status: false, msg: "token must be present in request header."} )  // --> if token is not present in the headers

        jwt.verify(token, 'avinash-bhushan-yogesh-bhavye', (err, decode) => {
            if (err) {
                return res.status(403).send({ status: false, message: err.message })
            } else {
                req.decodedToken = decode
            }
        })

        next()  // --> next function is called after successful verification of the token, either another middleware (in case of PUT and DELETE api) or root handler function.
    } catch (err) {
        return res.status(500).send( { status: false, error: err.message} )
    }
}



const authorize = async function (req, res, next) {
    try {
        let userId = req.body.userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId) ) return res.status(400).send({ status: false, message: "Provide a valid userId." })
        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "userId not present." })
        if (userId !== req.decodedToken.userId) return res.status(401).send({ status: false, message: "Provide your own userId to create a book." })
        next()
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { authenticate, authorize }