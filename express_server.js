const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs")

/// gereates a random 6 ( but could be change) digit alphanumeric code ///
function generateRandomString() {
let length = 6
return Math.random().toString(20).substr(2, length)  // toString allows numeric value to be represented as a character // 
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");  // will convert the request body into a string we can read//
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  // const longUrl = req.body.longURL
  const newShortUrl = generateRandomString()   /// runs our function which will become the shortUrl
  urlDatabase[newShortUrl] = req.body.longURL
  res.redirect(`/urls/${newShortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

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