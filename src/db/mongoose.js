//connect mongoose module to mongoDB database

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL ,{
    useNewUrlParser : true, 
    useCreateIndex: true,
    useFindAndModify: false
})