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
  //START-CONSOLE-TESTING
  // console.log('/searches...');
  // console.log('request.body.search[0]:');
  // console.log(request.body.search[0]);
  // console.log('request.body.search[1]:');
  // console.log(request.body.search[1]);
  //END-CONSOLE-TESTING
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
      //START-CONSOLE-TESTING
      // console.log('booksAPIData.body.items:');
      // console.log(booksAPIData.body.items);
      //END-CONSOLE-TESTING
      const books = booksAPIData.body.items.map(oneBook => {
        // let aNewBook;
        if (oneBook.volumeInfo)
        {
          //START-CONSOLE-TESTING
          // console.log('oneVolume.volumeInfo.imageLinks:');
          // console.log(oneVolume.volumeInfo.imageLinks);
          // console.log('oneBook.volumeInfo:');
          // console.log(oneBook.volumeInfo);
          //END-CONSOLE-TESTING
          return new Book(oneBook.volumeInfo);
        }
        return null;
      });
      //START-CONSOLE-TESTING
      // console.log('books Array:');
      // console.log(books);
      //END-CONSOLE-TESTING
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


app.get('/hello', (request, response)=> {
  response.render('index.ejs');
});

app.get('/', (request, response)=> {
  response.send('Hello out there!');
});




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

// volumeInfo: {
//   title: 'Bellow',
//   subtitle: 'A Biography',
//   authors: [Array],
//   publisher: 'Modern Library',
//   publishedDate: '2012-08-08',
//   description: 'With this masterly and original work, Bellow: A Biography, National Book Award nominee James Atlas gives the first definitive account of the Nobel Prize–winning author’s turbulent personal and professional life, as it unfolded against the background of twentieth-century events—the Depression, World War II, the upheavals of the sixties—and amid all the complexities of the Jewish-immigrant experience in America, which generated a vibrant new literature. Drawing upon a vast body of original research, including Bellow’s extensive correspondence with Ralph Ellison, Delmore Schwartz, John Berryman, Robert Penn Warren, John Cheever, and many other luminaries of the twentieth-century literary community, Atlas weaves a rich and revealing portrait of one of the most talented and enigmatic figures in American intellectual history. Detailing Bellow’s volatile marriages and numerous tempestuous relation-ships with women, publishers, and friends, Bellow: A Biography is a magnificent chronicle of one of the premier writers in the English language, whose prize-winning works include Herzog, The Adventures of Augie March, and, most recently, Ravelstein.',
//   industryIdentifiers: [Array],
//   readingModes: [Object],
//   pageCount: 32,
//   printType: 'BOOK',
//   categories: [Array],
//   averageRating: 4,
//   ratingsCount: 1,
//   maturityRating: 'NOT_MATURE',
//   allowAnonLogging: true,
//   contentVersion: '1.2.2.0.preview.2',
//   panelizationSummary: [Object],
//   imageLinks: [Object],
//   language: 'en',
//   previewLink: 'http://books.google.com/books?id=rbssUYA2nmcC&printsec=frontcover&dq=%2Binauthor:Bellow&hl=&cd=1&source=gbs_api',
//   infoLink: 'https://play.google.com/store/books/details?id=rbssUYA2nmcC&source=gbs_api',
//   canonicalVolumeLink: 'https://play.google.com/store/books/details?id=rbssUYA2nmcC'
// },