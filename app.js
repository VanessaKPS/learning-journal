//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');

const app = express();

const aboutContent = `Welcome to my Learning Journal! This site was created to share my Goals, Insights, & how I tackle Challenges along my lifelong professional/personal development journey. I hope you enjoy reading about how I approach my career transition from being a professional contemporary Dancer, Facilitator and Events Organiser in Diversity & Inclusion, to building a career as a self-starting Web Developer.`;

mongoose.connect(
  'mongodb+srv://admin-vk:test123@cluster0-lzbfn.mongodb.net/blogDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const blogSchema = new mongoose.Schema({
  title: String,
  blogPost: String,
  headerImg: String,
  tags: [String],
  date: String,
});

const Post = mongoose.model('Post', blogSchema);

app.get('/', function (req, res) {
  Post.find((err, foundPost) => {
    if (!err) {
      res.render('home', {
        posts: foundPost,
      });
    }
  });
});

app.post('/', (req, res) => {
  if (req.body.tag === 'Show All') {
    res.redirect('/');
  } else {
    Post.find({ tags: req.body.tag }, (err, foundPosts) => {
      if (foundPosts) {
        res.render('home', {
          posts: foundPosts,
        });
      }
    });
  }
});

app.get('/about', function (req, res) {
  res.render('about', { aboutContent: aboutContent });
});

app.get('/contact', function (req, res) {
  res.render('contact', { contactContent: contactContent });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', (req, res) => {
  if (req.body.password === process.env.PASSWORD) {
    res.render('compose');
  } else {
    res.redirect('login');
  }
});
app.post('/compose', function (req, res) {
  const {
    webDev,
    career,
    communication,
    postTitle,
    postBody,
    headerImgURL,
  } = req.body;
  const activeTags = [];

  if (webDev === 'on') {
    activeTags.push('Web Development');
  }
  if (career === 'on') {
    activeTags.push('Career Change');
  }
  if (communication === 'on') {
    activeTags.push('Effective Communication');
  }

  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();

  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }

  const post = new Post({
    title: postTitle,
    headerImg: headerImgURL,
    blogPost: postBody,
    date: `${day}/${month}/${year}`,
    tags: activeTags,
  });

  post.save((err) => {
    if (!err) {
      res.redirect('/');
    }
  });
});

app.get('/posts/:postName', function (req, res) {
  const requestedID = req.params.postName;
  Post.findOne({ _id: requestedID }, (err, identifiedPost) => {
    if (!err) {
      let splitBody = identifiedPost.blogPost.split('~');

      res.render('post', {
        title: identifiedPost.title,
        headerImg: identifiedPost.headerImg,
        content: splitBody,
        date: identifiedPost.date,
      });
    } else {
      console.log(err);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}
app.listen(port, () => console.log(`server opened on port ${port}`));
