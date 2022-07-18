const userModel = require("../models/userModel")  // ==> importing the module that contains the user schema
const jwt = require('jsonwebtoken')
const pinValidator = require('pincode-validator')
const { isValid, isValidTitle, nameRegex, emailRegex, phoneRegex, passRegex } = require("../validations/validator")



// ==> POST api : To create a user

const createUser = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in request body." })

        let { title, name, phone, email, password } = data

        if ( !isValid(title) || !isValidTitle(title.trim()) )  // ==> title should be provided in the body
            return res.status(400).send({ status: false, message: "Please enter the title ('Mr', 'Miss', 'Mrs'). ⚠️" })

        if (!isValid(name))  // --> name should be provided in the body
            return res.status(400).send({ status: false, message: "Please enter the user name. ⚠️" })
        if (!nameRegex.test(name))  // --> name should be provided in right format
            return res.status(400).send({ status: false, message: "name should contain alphabets only. ⚠️" })
        data.name = data.name.split(' ').map(x => x[0].toUpperCase() + x.slice(1, x.length).toLowerCase()).join(' ')

        if (!isValid(phone))  // --> phone number should be provided in the body
            return res.status(400).send({ status: false, message: "Please enter the phone number. ⚠️" })
        if (!phoneRegex.test(phone))  // --> phone number should be provided in right format
            return res.status(400).send({ status: false, message: "Enter the phone number in valid Indian format. ⚠️" })
        let getPhone = await userModel.findOne({ phone: phone });  // --> to check if provided phone number is already present in the database
        if (getPhone) {  // --> if that phone number is already provided in the database
            return res.status(400).send({ status: false, message: "Phone number is already in use, please enter a new one. ⚠️" });
        }
        
        if (!isValid(email))  // --> email should be provided in the body
            return res.status(400).send({ status: false, message: "Please enter the email. ⚠️" })
        if (!emailRegex.test(email))  // --> email should be provided in right format
            return res.status(400).send({ status: false, message: "Please enter a valid emailId. ⚠️" })
        let getEmail = await userModel.findOne({ email: email });  // --> to check if provided email is already present in the database
        if (getEmail) {  // --> if that email is already provided in the database
            return res.status(400).send({ status: false, message: "Email is already in use, please enter a new one ⚠️" });
        }

        if (!isValid(password))  // --> password should be provided in the body
            return res.status(400).send({ status: false, message: "Please enter the password. ⚠️" })
        if (!passRegex.test(password))  // --> password should be provided in right format
            return res.status(400).send({ status: false, message: "Password length should be alphanumeric with 8-15 characters, should contain at least one lowercase, one uppercase and one special character." })

        if (data.address) {
            if (!isValid(data.address.street) || !isValid(data.address.city) || !isValid(data.address.pincode))
                return res.status(400).send({ status: false, message: "Enter the street, city and pincode in the address." })
            let pinValidated = pinValidator.validate(data.address.pincode)
            if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode." })
        }

        let userCreated = await userModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: userCreated })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



// ==> POST api : login for a user

const loginUser = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if ( !email || !password ) return res.status(400).send({ status: false, msg: "Provide the email and password to login." })  // if either email, password or both not present in the request body.

        if (!emailRegex.test(email))  // --> email should be provided in right format
            return res.status(400).send({ status: false, message: "Please enter a valid emailId. ⚠️" })

        let user = await userModel.findOne( { email: email, password: password } )  // to find that particular user document.
        if ( !user ) return res.status(401).send({ status: false, msg: "Email or password is incorrect." })  // if the user document isn't found in the database.

        let token = jwt.sign(  // --> to generate the jwt token
            {
                userId: user._id.toString(),                            // --> payload
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),     // --> expiry set for 2 hours
                iat: Math.floor(Date.now() / 1000)
            },
            "avinash-bhushan-yogesh-bhavye"                             // --> secret key
        )

        res.setHeader("x-api-key", token)  // to send the token in the header of the browser used by the user.
        return res.status(200).send({ status: true, message: 'Success', data: token })  // token is shown in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}



module.exports = { createUser, loginUser }  // --> exporting the functions