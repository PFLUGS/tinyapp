const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

/// generates a random digit alphanumeric code ///
function generateRandomString() {
  let length = 6;
  return Math.random().toString(20).substr(2, length);  // toString allows numeric value to be represented as a character //
}

/// in memory database ///
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");  // will convert the request body into a string we can read//
app.use(bodyParser.urlencoded({ extended: true }));

/// delete specific items from database based on the key selected  //
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`);
});

// get current values and send to form before change
app.post('/urls/:id/Edit', (req, res) => {
  // const id = req.params.id
  // urlDatabase[id] = req.body.edit
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render('urls_show', templateVars);
  // console.log(id); // checking to see that the correct id is being pulled 
});
// Updates long Url based on the id attached
app.post("/urls/:id", (req, res) => {
  console.log("urls/id:", req.params);
  console.log("LONGURL:", req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();       /// runs our function which will become the shortUrl
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// uses the shortURL to redirect //
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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