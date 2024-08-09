const mongoose =require ('mongoose');
const bcrypt = require('bcrypt');

const relationSchema = new mongoose.Schema({
 
    firstName: {
        type: String,
        required:true
    },
    lastName:{
        type : String,
        required :true
    },
    relation:{
        type: String,
        required:true
    },
   

   
});

module.exports = mongoose.model('Relation',relationSchema)