const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
    password: bcrypt.hashSync("z", 10)
  },
  "User2": {
    id: "User2", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("z", 10)
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
  if(req.session.user_id){
    return next()
  }
  res.redirect('/login')
} 

app.get("/", userAuthentication, (req, res) => {
  res.redirect('/urls')
});


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: userDatabase[req.session.user_id]
  };
  if(req.session.user_id){
    res.render("urls_index", templateVars);
  } else{
    res.status(400).send("Cannot access! Please go back to the home page and login!");
  }
});

app.get("/register", (req, res) => {
  if(!req.session.user_id){
    let templateVars = {
      user: userDatabase[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  } else{
    res.redirect("urls/");
  }
  
});

app.get("/login", (req, res) => {
  if(!req.session.user_id){
    let templateVars = {
      user: userDatabase[req.session.user_id]
    };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("urls/");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", userAuthentication, (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  if (urlDatabase[id]) {
    let templateVars = {
      shortURL: id,
      longURL: urlDatabase[id].longURL,
      user: userDatabase[req.session.user_id]
    };

    if(req.session.user_id !== urlDatabase[id].userID){
      return res.status(400).send("Cannot access! Incorrect login info! Please go back!")
    }
    res.render("urls_show", templateVars);
  } else{
    res.status(400).send("URL does not exist! Please go back!")
  }

})

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]){
    let longURL = urlDatabase[req.params.shortURL].longURL
    res.redirect(longURL);
  } else{
    res.status(400).send("URL does not exist! Please go back!")
  }
});

app.post("/urls", (req, res) => {
  const id = generateRandomString()
  if (!req.body.longURL) {
    res.status(400).end('No URL inputed! Please go back!');
  } else {
    urlDatabase[id]= {
      "longURL": req.body.longURL,
      "userID": req.session.user_id
    };
    res.redirect(`/urls/${id}`);
  } 
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id
  if (!req.body.longURL) {
    res.status(400).end('No URL inputed! Please go back!');
  } else{
    urlDatabase[id].longURL = req.body.longURL;
    res.redirect(`/urls/`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id
  if(req.session.user_id === urlDatabase[id].userID) {
    delete urlDatabase[id];
  } else {
      return res.status(400).send("Incorrect owner! Please go back!")
    }
  res.redirect(`/urls/`);
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  if (req.body.email === "" || password === "") {
    res.status(400).send("Error input! Please go back and check your inputs!");
  }
  for (let id in userDatabase) {
    if ((userDatabase[id].email === req.body.email) && bcrypt.compareSync(password, userDatabase[id].password)) {
      req.session.user_id =  userDatabase[id].id;
      res.redirect(`/urls/`);
      return;
    }
  }
  res.status(400).send("Error! Please go back and check your inputs!");
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect(`/urls/`);
});

app.post("/register", (req, res) => {

  if(req.body.email){
    for (let id in userDatabase){
      if(userDatabase[id].email === req.body.email){
        return res.status(400).send("Email already exists! Please go back!");
      }
    }
  }
  if(!req.body.email || !req.body.password){
    res.status(400).send("Empty input! Please go back and check your inputs!");
  } else {
      let userID = generateRandomString();
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      userDatabase[userID] = {
        id: userID,
        email: req.body.email,
        password: hashedPassword
      }
      req.session.user_id = userID;
      res.redirect(`/urls/`);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


