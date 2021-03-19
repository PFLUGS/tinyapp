const { findUserByEmail, generateRandomString, authenticateUser, urlsForUser} = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

////////////////////////////////////////////

/// IN MEMORY DATABASES ///
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// console.log('Whats Going On iN DB---', urlDatabase)

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
};

////////////////////////////////

const bodyParser = require("body-parser");  // will convert the request body into a string we can read//
app.use(bodyParser.urlencoded({ extended: true }));


//////// REGISTRATION //////////

app.get("/register",(req, res)=> {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  res.render('urls_register', templateVars);
});

app.post("/register",(req, res)=> {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('You need to input login and password (go back)!');
  }

  const userFound = findUserByEmail(email, users);
  // console.log(userFound);
  if (userFound) {
    res.send('The user already exists!');
  }

  let id = generateRandomString();

  const newUser = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, saltRounds)
  };
        
  users[id] = newUser;
  console.log('**USERS**',users);
  req.session['user_id'] = id;
  res.redirect(`/urls/`);

  // console.log(users); // checking to make sure new User is added
});

//////////////LOGIN AND LOG OUT //////////////////////

/// endpoint to handle a POST to /login
app.post("/login",(req, res)=> {
  const email = req.body.email;
  const password = req.body.password;
  let user = authenticateUser(email,password,users);

  /// checks to see if user exists and if not send an error if not ///
  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    res.status(404).send('Could not find user!');
  }

});

app.get('/login',(req,res)=> {
  const user = users[req.session.user_id];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  res.render(`_login`, templateVars);

});

/// endpoint to handle a POST to /logout ///
app.get("/logout",(req, res)=> {
  req.session.user_id = null;
  console.log(req.session.user_id);
  res.redirect(`/urls/`);
});


//////// EDIT AND DELETE/////////


/// delete specific items from database based on the key selected  //
app.post("/urls/:shortURL/delete", (req, res) => {

  const user = req.session.user_id;
  
  // will only let users access the edit page //
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('You do not have access to this page');
  }
});

// get current values and send to form before change
app.post('/urls/:id/Edit', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render('urls_show', templateVars);
  // console.log(id); // checking to see that the correct id is being pulled
});

// Updates long Url based on the id attached
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  
  // will only let users access the edit page //
  if (userID === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;

    res.redirect("/urls");
  } else {
    res.status(403).send('You do not have access to this page');
  }
});

//////////////////////////

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();           /// runs our function which will become the shortUrl
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id};
  // userID: req.cookies["user_id"]}
  // console.log("-----", urlDatabase);
  res.redirect(`/urls/${newShortUrl}`);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  
  if (user) {                                           //// checks to see if the user is loged in and exists - if not they cannot create new url
    res.render("urls_new", templateVars);
  } else {
  
    res.redirect("/login");
  }
});

// uses the shortURL to redirect //
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[`${shortURL}`].longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL, user: user,};
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let templateVars = { urls: urlsForUser(user.id, urlDatabase), user: user };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

////////////////////////////////////////
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
