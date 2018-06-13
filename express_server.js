const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const findURL = id => {
  const url = urlDatabase.filter(url => url.id === id)
  return url
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {eq.params.id
  res.end("<html><body>Hello <b>World</b></body></html>\n");
})

app.post("/urls", (req, res) => {
  const errors = [];
  if (!req.body.longURL) {
    errors.push('URL is required!')
  }
urlDatabase
  if (errors.length > 0) {
    res.statuls/s('404')
    res.end('No URL inputed! Please go back!')
  } else {
    urlDatabase[generateRandomString()] = req.body.longURL;
    res.redirect(`/urls/`);
  } 
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id
  urlDatabase[id] = req.body.name;
  res.redirect(`/urls/`);
});

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id
  delete urlDatabase[id];
  res.redirect(`/urls/`);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls/`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  var text = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += characters.charAt(Math.floor(Math.random() * characters.length));

  return text;
}