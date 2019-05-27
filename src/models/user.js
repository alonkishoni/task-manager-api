const mongoose = require('mongoose')
var validator = require ('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true,
        trim: true
    },
    email : {
        unique : true,
        type : String,
        required : true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('must be a valid email address')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if (value < 0){
                throw new Error('age must be 0 or above')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim:  true,
        minlength : 7,
        validate(value){
            if (value.toLowerCase().includes("password")){
                throw new Error('password cannot contain the word "password"')
            }
        }

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

},{
    timestamps: true
})


//create a virtual field to store tasks data on a user profile
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//hide password and tokens objects when express sends back the json by using this method
userSchema.methods.toJSON = function (){
    user = this
    userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//generate a token for a specific user ()
userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token : token})

    user.save()

    return token
}

//find a user by email and check if password is correct
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email : email})

    if(!user){
        throw new Error ('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error ('Unable to login')
    }
    return user
}

//hash the plain text before saving encrypting the password
userSchema.pre('save', async function(next){
    const user = this

    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//delete user tasks before deleting user
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User