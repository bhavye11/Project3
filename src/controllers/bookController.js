const bookModel=require("../models/bookModel")
const { isValid } = require("../validations/validator")

const createBook= async function(req,res){
    const data=req.body
    if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in request body." })
    const { title, excerpt, userId, ISBN, category,subcategory,releasedAt } = data
    if(!isValid(title)){
        return res.status(400).send({ status: false, message: "Please enter the title. ⚠️" })
    }
    let titleCheck=await bookModel.findOne({title:title})
    if(titleCheck){
        return res.status(400).send({ status: false, message: "Title is already present ⚠️" })
    }

    if(!isValid(excerpt)){
        return res.status(400).send({ status: false, message: "Please write excerpt. ⚠️" })
    }
    if(!isValid(userId)){
        return res.status(400).send({ status: false, message: "Please enter the UserId. ⚠️" })
    }
}