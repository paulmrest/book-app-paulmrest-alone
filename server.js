'use strict';

const express = require('express');
const app = express();

const superagent = require('superagent');

require('ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.get('/searches/new', (request, response)=> {
  response.render('./searches/new.ejs');
})

app.post('/searches', (request, response) => {
  const searchTerm = request.body.search[0];
  const searchType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes';
  let queryParams =
  {
    q: `+in${searchType}:${searchTerm}`
  }
  superagent
    .get(url)
    .query(queryParams)
    .then(booksAPIData => {
      const books = booksAPIData.body.items.map(oneBook => {
        // let aNewBook;
        if (oneBook.volumeInfo)
        {
          return new Book(oneBook.volumeInfo);
        }
        return null;
      });
      const noNullBooks = books.filter(oneBook => {
        return oneBook;
      });
      response.render('show.ejs', {searchResults: noNullBooks});
    })
    .catch(error => {
      console.error('Error getting data from Google Books API.');
      console.error(error);
    })
});


//test routes
app.get('/hello', (request, response)=> {
  response.render('index.ejs');
});

app.get('/', (request, response)=> {
  response.send('Hello out there!');
});

//turn on server
app.listen(PORT, ()=> {
  console.log(`Listening on ${PORT}`);
});

//constructor
function Book(object) {
  this.title = object.title ? object.title : 'No title given';
  this.subtitle = object.subtitle ? object.subtitle : 'No subtitle given';
  this.authors = object.authors ? object.authors : new Array('No authors given');
  this.pubDate = object.publishedDate ? object.publishedDate : 'No publication date given';
  this.description = object.description ? object.description : 'No description given';
  this.pageCount = object.pageCount ? object.pageCount : 'No page count given';
  this.averageRating = object.averageRating ? object.averageRating : 'No average rating given';
  if (object.imageLinks && object.imageLinks.thumbnail)
  {
    this.imageLink = object.imageLinks.thumbnail.replace(/http/i, 'https');
  }
  else
  {
    this.imageLinks = 'https://i.imgur.com/J5LVHEL.jpg';
  }
}
