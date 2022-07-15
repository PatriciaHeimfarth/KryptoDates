var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    userconnected: String,
    imageName: String,
    date: {type: Date, default: Date.now}
    /*img:
    {
        data: Buffer,
        contentType: String
    }*/
});
  
 
  
module.exports = new mongoose.model('Image', imageSchema);