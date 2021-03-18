const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')
app.use(cookieParser())


/// generates a random digit alphanumeric code ///
function generateRandomString() {
  let length = 6;
  return Math.random().toString(20).substr(2, length);  // toString allows numeric value to be represented as a character //
}

//FIND USER IN USERS DB//
const findUserByEmail = (email) => {
  // loop and try to match the email
  for (let userId in users) {
    const userObj = users[userId];

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
    if (users[user].email === email && users[user].password === password) {
    // if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      //   console.log(user);
      return users[user];
    }
  }
};

////////////////////////////////////////////

/// in memory database ///
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");  // will convert the request body into a string we can read//
app.use(bodyParser.urlencoded({ extended: true }));

/// registration page ///
app.get("/register",(req, res)=> {
  const user = users[req.cookies['user_id']]
  const templateVars = { user: user };
  res.render('urls_register', templateVars );
  });

  app.post("/register",(req, res)=> {
    const email = req.body.email;
    const password = req.body.password;

      if (!email || !password ) {
        res.status(400).send('You need to input login and password (go back)!');
      }

      const userFound = findUserByEmail(email);
      // console.log(userFound);
      if (userFound) {
        res.send('The user already exists!');
      }

      let id = generateRandomString();

      const newUser = { 
          id: id, 
          email: email, 
          password: password
        }
        
        users[id] = newUser

      res.cookie('user_id', id)
      res.redirect(`/urls/`);

      // console.log(users); // checking to make sure new User is added
  });


/// endpoint to handle a POST to /login ///
app.post("/login",(req, res)=> {
const email = req.body.email;
const password = req.body.password;
let user = authenticateUser(email,password,users);
let id = generateRandomString();

if (user){
  res.cookie('user_id', id)
  res.redirect('/urls');
} else {
  res.status(404).send('Could not find user!');
}
  res.render('_login');

});

app.get('/login',(req,res)=> {
  const user = users[req.cookies['user_id']]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  res.render(`_login`, templateVars);

})

/// endpoint to handle a POST to /logout ///
app.get("/logout",(req, res)=> {
  res.clearCookie("user_id");
  res.redirect(`/urls/`);
  });

/// delete specific items from database based on the key selected  //
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`);
});

// get current values and send to form before change
app.post('/urls/:id/Edit', (req, res) => {
  const user = users[req.cookies['user_id']]
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: user}
  res.render('urls_show', templateVars);
  // console.log(id); // checking to see that the correct id is being pulled 
});

// Updates long Url based on the id attached
app.post("/urls/:id", (req, res) => {
  // console.log("urls/id:", req.params);
  // console.log("LONGURL:", req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();       /// runs our function which will become the shortUrl
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies['user_id']]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  res.render("urls_new", templateVars);
});

// uses the shortURL to redirect //
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies['user_id']]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies['user_id']]
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

// helps you see the content without console.log // 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




/////FUNCTIONS////
