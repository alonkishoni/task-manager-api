const sgMail = require('@sendgrid/mail')

const sendgridApiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridApiKey)


const sendWelcomeEmail = (email, name)=>{
    
    sgMail.send({
    to: email,
    from: 'alonkishoni@gmail.com',
    subject: 'Thanks For Joining In',
    text: `Hello ${name}!, welcome to Tasky!`
  })
} 

const sendGoodbyeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'alonkishoni@gmail.com',
        subject: 'Thank You For Using Tasky!',
        text: `Dear ${name}, although it's sad to see you go we'd still love to hear why you've decided to go`
    })
}



module.exports = {sendWelcomeEmail, sendGoodbyeEmail}