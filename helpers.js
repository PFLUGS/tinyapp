const bcrypt = require('bcrypt');   

function generateRandomString() {
  let length = 6;
  return Math.random().toString(20).substr(2, length);  // toString allows numeric value to be represented as a character //
}

//FIND USER IN USERS DB//
const findUserByEmail = (email, userDatabase) => {
  // loop and try to match the email
  for (let userId in userDatabase) {
    const userObj = userDatabase[userId];

    if (userObj.email === email) {
      // if found return the user
      return userObj;
    }
  }
  // if not found return false
  return false;
};

const authenticateUser = function(email, password, users) {
  for (let user in users) {

    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      //   console.log(user);
      return users[user];
    }
  }
};

const urlsForUser = function(id, urlDatabase){
  const output = {};
  // console.log('URL-DB',urlDatabase)
  // console.log('HERE IS ID',id)
  for (const shortURL in urlDatabase){
    const url = urlDatabase[shortURL]
    // console.log('*-*_*_',url)
    if (id === url.userID){
      output[shortURL] = url
      // console.log('---------')
    }
}
return output;
};

module.exports = { findUserByEmail, generateRandomString, authenticateUser, urlsForUser };
