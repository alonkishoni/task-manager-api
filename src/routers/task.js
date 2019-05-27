const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


// new task server request
router.post('/tasks', auth , async (req , res) =>{
    const task = new Task({ ...req.body, owner: req.user._id })

    try{
      await task.save()
    await res.status(201).send(task)  
    } catch (e) {
        res.status(400).send(e)
    }
})



//request server to read tasks
router.get('/tasks', auth, async (req,res) => {


    try {

    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort [parts[0]] = parts[1] === 'desc' ? -1 : 1
    }


         await req.user.populate({
             path: 'tasks',
             match : match,
             options: {
                 skip: parseInt(req.query.skip),
                 limit: parseInt(req.query.limit),
                 sort : sort
             }
         }).execPopulate()
         console.log(req.query)
         res.send(req.user.tasks)
    } catch(e){
        res.status(500).send(e)
    }
})

//request server to read a task by its id
router.get('/tasks/:id', auth , async (req, res) => {
    const _id = await req.params.id
    

    try {
        const task = await Task.findOne({_id , owner: req.user._id})
         if(!task){
            return res.status(404).send()
        }
        await res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

//update task
router.patch('/tasks/:id', auth , async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=> {
       return allowedUpdates.includes(update)
    })



    if(!isValidOperation){
        return res.status(400).send({error : 'invalid updates'})
    }

    try {
         const task = await Task.findOne({_id : req.params.id , owner: req.user._id})

         updates.forEach((update)=>{
             task[update] = req.body[update]

            
         })

         await task.save()

         if(!task){
             return res.status(404).send()
         }

         res.send(task)
       
     } catch (e) {
         res.status(400).send(e)
         
     }
})

//send a request to DB to delete a task by its id and send back the task deleted
router.delete('/tasks/:id', auth, async (req, res) =>{

    try{

        const task = await Task.findOneAndDelete({_id : req.params.id , owner : req.user._id})
        
        if(!task){
            res.status(404).send({error: 'cannot delete'})
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router