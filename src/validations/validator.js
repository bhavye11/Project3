// a function is defined to validate the data provided in the request body
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


// a function is defined to validate the title provided in the request body
const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


/*

function dynamicSort(property) {
    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        if(sortOrder == -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
}

*/


// Regex(s) used for the validation of different keys
let nameRegex = /^[.a-zA-Z\s]+$/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
let isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
let dateRegex = /^((17|18|19|20)\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

// let dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
// let ratingRegex = /^[+]?([0-4]*\.[0-9]|[0-5])$/  // --> accepts rating [0-5] with upto one decimal place only.


// exporting the variables defined in the module
module.exports = { isValid, isValidTitle, nameRegex, emailRegex, phoneRegex, passRegex, isbnRegex, dateRegex }