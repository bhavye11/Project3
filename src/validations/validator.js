// a function is defined to validate the data provided in the request body
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


// Regex(s) used for the validation of different keys
// let nameRegex = /^[.a-zA-Z\s,-]+$/
let nameRegex = /^[.a-zA-Z\s]+$/
// let linkRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/


module.exports = { isValid, isValidTitle,  nameRegex, emailRegex, phoneRegex, passRegex }  // --> exporting the variables defined in the module