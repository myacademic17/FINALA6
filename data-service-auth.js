var mongoose = require("mongoose"); // require the moongose 
var Schema = mongoose.Schema; // schema variable 
 
var userSchema = new Schema({
    "userName":  {"type": String, "unique": true},
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String,
    }],
  });
  
  let User; 

  exports.initialize = function(){
        return new Promise(function(resolve, reject){
            let db = mongoose.createConnection("mongodb+srv://dbUser:dbUser123@senecaweb.qjtfeds.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser : true});
        
            db.on('error', (err) => {
            reject("MongoDB connection error."); 
        })

        db.once('open', () => {
            console.log('MongoDB connected.');
            User = db.model('users', userSchema);
            resolve(); 
        })
    })
  }

  exports.registerUser = function(userData){
    return new Promise(function (resolve, reject) {
        if(!userData.password || !userData.password2 || 
            !userData.password.replace(/\s/g, '').length || 
            !userData.password2.replace(/\s/g, '').length) {
            reject('Passwords cannot be empty or only white spaces!');
        }
        else if(userData.password !== userData.password2) {
            reject('Passwords do not match.');
        }
        else if(userData.userName.length == 0 || !userData.userName.replace(/\s/g, '').length) {
            reject('Username cannot be empty or only white spaces!');
        } 
        else{            
            bcrypt.genSalt(12, function(err, salt) { 
                bcrypt.hash(userData.password, salt, (err, hashValue) => {
                    if(err) {
                        reject('There was an error encrypting the password');
                    }
                    else {
                        userData.password = hashValue
                        let newUser = new User(userData)

                        newUser.save((err, user) => {
                            if(err) {
                                if(err.code === 11000) {
                                    reject('Username already taken.');
                                }
                                else {
                                    reject("There was an error creating the user: " + err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
}

exports.checkUser = function(userData){
    return new Promise(function (resolve, reject) {
        
        if(userData.userName.length == 0 || !userData.userName.replace(/\s/g, '').length) {
            reject('Username cannot be empty or only white spaces!');
        }
        else if(!userData.password || 
            !userData.password.replace(/\s/g, '').length) {
            reject('Password cannot be empty or only white spaces!');
        }
        else{
            User.findOne({userName: userData.userName})
            .exec()
            .then(foundUser => {
                if(foundUser) {
                    bcrypt.compare(userData.password, foundUser.password).then((res) => {
                        if(res === true){
                            foundUser.loginHistory.push({
                                dateTime: (new Date()).toDateString(),
                                userAgent: userData.userAgent
                            })

                            User.updateOne({userName: foundUser.userName}, 
                                {$set: {loginHistory: foundUser.loginHistory}})
                            .exec()
                            .then(() => {
                                resolve(foundUser);
                            })
                            .catch(err => {
                                resolve('There was an error verifying the user: ' + err);
                            })
                        }
                        else{
                            reject('Password donot match for user: ' + userData.userName);
                        }
                    })
                }
                else {
                    reject('Unable to find user: ' + userData.userName);
                }
            })
            .catch(err => {
                reject('Unable to find user: ' + userData.userName);
            })
        }
    })
}

