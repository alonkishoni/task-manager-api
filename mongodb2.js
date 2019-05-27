const 
MongoClient = require('mongodb').MongoClient
const connectionURL = 'mongodb://127.0.0.1:27017'

const dbName = 'secondDB'

MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if (error){
        console.log('error')
    } 
    
    const db = client.db(dbName)

    db.collection('gods').insertOne({
        name : 'Shiva',
        type : 'main god',
        decribe : 'the destroyer'
    })

    db.collection('gods').insertOne({
        name : 'Vishnu',
        type : 'main god',
        decribe : 'the preserver'
    })

    db.collection('gods').insertOne({
        name : 'brahma',
        type : 'main god',
        decribe : 'the creator'
    }) 

})
