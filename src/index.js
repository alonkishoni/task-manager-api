// A New Server For managing users and tasks requests

//importing libraries
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

//setting up express 
const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//server is up waiting for requests
app.listen(port, ()=>{
    console.log('server is up on port ' + port)
})