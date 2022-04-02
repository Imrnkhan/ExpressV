const express= require("express");
const mongoose= require("mongoose");
const app= express();

app.use(express.json());
const connect= require("./src/server")
const { body, validationResult } = require('express-validator');

const userSchema= new mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    email:{type:String, required:true},
    pincode:{type:Number, required:true},
    age:{type:Number, required:true},
    gender:{type:String, required:true, enum:["Male", "Female", "Others"]}
},{
    versionKey:false,
});

const User= mongoose.model("user", userSchema);

app.post("/user",body("firstName").not().isEmpty().withMessage("Please give First name"),
body("lastName").not().isEmpty().withMessage("Please give Last name"),
body("email").not().isEmpty().withMessage("Please give email").isEmail().withMessage("Please enter valid email").custom(async(value)=>{
    const user= await User.findOne({email:value});
    if(user){
        throw new Error("Email Already Exsists")
    }
    return true;
}),
body("pincode").not().isEmpty().withMessage("Please enter Pincode").trim().isLength({min:6, max:6}).withMessage("Pincode should be of 6 digits"),
body("age").not().isEmpty().withMessage("Please enter age").custom(async(value)=>{
    if(value<1 || value>100)
    {
        throw new Error("Please enter age between 1 to 100")
    }
    return true;
}),
body("gender").not().isEmpty().withMessage("Please enter gender").custom(async(value)=>{
    if(value == "Male"|| value == "Female" || value == "Others")
    {
        return true
    }
    else{
        throw new Error("Please Enter valid Gender")
    };
}),
async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = User.create(req.body);

        return res.status(200).send(user)
    } catch (error) {

    }
})
app.get("/user", async(req, res)=>{
    try {
        const user=await User.find({}).lean().exec();

        res.send(user)
    } catch (error) {
        console.log(error)
    }
})




app.listen(6666, async()=>{
    try {
        await connect();
    } catch (error) {
        console.log(error)
    }
    console.log("Listening to post 6666")
})