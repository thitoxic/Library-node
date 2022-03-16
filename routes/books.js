const express = require("express");
const path = require('path')
const router = express.Router();
const Book = require("../models/book");
const Author = require('../models/author');

//multer requires 
// const multer = require('multer')
// const uploadPath = path.join('public', Book.coverImageBasePath)
// const imageMimeTypes = ['images/jpeg', 'images/png']

// const upload = multer({
//   dest: 'public/',
//   fileFilter: (req,file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })

//All Books Route
router.get("/", async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec({})
    res.render('books/index', {
      books: books, 
      searchOptions : req.query
    })
  } catch {
    res.redirect('/')
  }
   
});

//new Book Route
router.get("/new", async (req, res) => {
   renderNewPage(res, new Book())
});


let locals = {
    errorMessage:'something went wrong'
}
//Create BOOK Route
router.post("/", /* upload.single('cover'), */ async (req, res) => {
    const fileName = req.file != null ? req.file.filename: null 
    const book = new Book ({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      // coverImageName : fileName,
      description: req.body.description
    })

    try {
      const newBook = await book.save() 
      res.redirect(`books`)
    } catch {
      renderNewPage(res, book,true)
    }
});

async function renderNewPage(res, book, hasError= false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
  }
  if(hasError) params.errorMessage = 'Book Creation Error'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}
module.exports = router;
