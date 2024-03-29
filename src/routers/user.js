const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')

router.get('/test', (req, res)=>{
    res.send('from a new file')
})

//new user - server request to create a new user in database
router.post('/users', async (req , res)=>{
    const user = new User(req.body)

    try{
      await user.save()
      token =  await user.generateAuthToken()
      sendWelcomeEmail(user.email , user.name)
      res.status(201).send({user , token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
   try {
       const user = await User.findByCredentials(req.body.email, req.body.password)
       const token = await user.generateAuthToken()
       res.send({user , token})

 } catch (e) {
       res.status(400).send('cannot login')
   }
})

//logout this session

router.post('/users/logout', auth , async (req, res)=>{
    try{
         req.user.tokens = req.user.tokens.filter((token)=>{
           return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch(e){
        res.status(500).send()
    }
})

//logout all session
router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.status(200).send()
    }catch(e){
        res.status(500).send()

    }
})

// get a user prfile, authenticate, send back user profile
router.get('/users/me', auth ,async (req , res)=>{
await res.send(req.user)
})


//update a user
router.patch('/users/me',auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=>{
      return  allowedUpdates.includes(update)
    })

    if (!isValidOperation){
        return res.status(400).send({error: 'invalid updates'})
    }

    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        }) 

        await req.user.save()
        res.send(req.user)

    } catch (e) {
        res.status(400).send(e)
    }

})

//delete a user
router.delete('/users/me' ,auth, async (req, res) =>{
    try {
       await req.user.remove()
       sendGoodbyeEmail(req.user.email, req.user.name)
       res.send(req.user)

    }catch (e){
        res.status(400).send('unauthorized')
    }
 })

//upload a file to avatars folder on the server
const upload = multer({
    limits : {
        fileSize : 1000000
    },
    
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return cb (new Error ('please upload an image file'), undefined)
        }
        cb (undefined, true)
    }
})

 router.post('/users/me/avatar',auth, upload.single('avatar') , async(req,res)=>{
     const buffer = await sharp(req.file.buffer).png().resize({width: 250, height: 250}).toBuffer()

      req.user.avatar = buffer
     await req.user.save()
     res.send()
 },(error, req, res, next)=>{
     res.status(400).send({error: error.message})
 })

 //delete avatar
 router.delete('/users/me/avatar', auth, async (req, res)=>{
     try{
     req.user.avatar = undefined
     await req.user.save()
     res.send()
     }catch(e){
         res.status(500).status(e)
     }
    
 })

 router.get('/users/:id/avatar', async (req, res)=>{
     try{
         const user = await User.findById(req.params.id)
         
         if(!user || !user.avatar){
            throw new Error()
         }
         res.set('Content-type', 'image/png')
         res.send(user.avatar)


     }catch(e){
         res.status(404)
     }
 })
 

module.exports = router


