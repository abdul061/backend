const mongoose = require ('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGODB)

.then(() => {
    console.log('Database Connected')
})
.catch((err) =>{
    console.log(err)
})

const newSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    message:{
        type:String
    }
})

const mailsubscription = mongoose.Schema({
    email:{
        type:String
    }
});
const subscription = mongoose.model('subscription',mailsubscription);
const collection = mongoose.model('collection',newSchema);

module.exports = {collection,subscription,}