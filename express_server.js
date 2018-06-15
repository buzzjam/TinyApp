const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    "userID": "User1"
  },
  "9sm5xK": {
    "longURL": "http://www.google.com",
    "userID": "User1"
  }
};

const userDatabase = { 
  "User1": {
    id: "User1", 
    email: "user@example.com", 
    password: "z"
  },
  "User2": {
    id: "User2", 
    email: "user2@example.com", 
    password: "z"
  }
};
const findURL = id => {
  const url = urlDatabase.filter(url => url.id === id)
  return url;
}

function findUser(){
  for (let index in userDatabase)
    return userDatabase[index].id;
  }

function urlsForUser(id){
  var obj = {};
  for (let e in urlDatabase){
    if(urlDatabase[e].userID === id){
      (obj[e]) = {"longURL": urlDatabase[e].longURL}
    }
  }
  return obj;
}

function generateRandomString() {
  var text = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += characters.charAt(Math.floor(Math.random() * characters.length));

  return text;
}

function userAuthentication(req, res, next){
  if(req.cookies.user_id){
    return next()
  }
  res.redirect('/login')
} 

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    user: userDatabase[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: userDatabase[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: userDatabase[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", userAuthentication, (req, res) => {
  let templateVars = {
    user: userDatabase[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);

});

app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  let templateVars = {
    shortURL: id,
    longURL: urlDatabase[id].longURL,
    user: userDatabase[req.cookies.user_id]
  };
  if(req.cookies.user_id !== urlDatabase[id].userID){
    return res.status(400).send("Cannot access! Wrong login!")
  }
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
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
  if (errors.length > 0) {
    res.status(404)
    res.end('No URL inputed! Please go back!');
    return;
  } else {
    urlDatabase[generateRandomString()]= {
      "longURL": req.body.longURL,
      "userID": req.cookies.user_id
    };
    res.redirect(`/urls/`);
  } 
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id
  urlDatabase[id].longURL = req.body.name;
  res.redirect(`/urls/`);
});

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id
  if(req.cookies.user_id === urlDatabase[id].userID) {
    delete urlDatabase[id];
  } else {
      return res.status(400).send("Incorrect owner!")
    }
  res.redirect(`/urls/`);
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Error input! Go back and check your inputs!");
  }
  for (let id in userDatabase) {
    if ((userDatabase[id].email === req.body.email) && (userDatabase[id].password === req.body.password)) {
      res.cookie('user_id', userDatabase[id].id);
      res.redirect(`/urls/`);
      return;
    }
  }
  res.status(400).send("Error! Go back and check your inputs!");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls/`);
});

app.post("/register", (req, res) => {

if(req.body.email){
  for (let id in userDatabase){
    if(userDatabase[id].email === req.body.email){
      return res.status(400).send("Email already exists!");
    }
  }
}
if(!req.body.email || !req.body.password){
  res.status(400).send("Empty input! Go back and check your inputs!");
} else {
    let userID = generateRandomString();
    userDatabase[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', userID)
    console.log(userDatabase)
    res.redirect(`/urls/`);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


