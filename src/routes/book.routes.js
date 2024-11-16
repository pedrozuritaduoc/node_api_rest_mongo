const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

// Middleware para obtener un libro por ID
const getBook = async (req, res, next) => {
  let book;
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      message: "El id del libro no es válido",
    });
  }

  try {
    book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        message: "El libro no fue encontrado",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }

  res.book = book;
  next();
};

// Obtener todos los libros
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    console.log("GET ALL", books);
    if (books.length === 0) {
      return res.status(204).json([]);
    }
    res.json(books); // Corregido
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo libro (recurso) [POST]
router.post("/", async (req, res) => {
  const { title, author, genre, publication_date } = req.body;

  // Validación de campos requeridos
  if (!title || !author || !genre || !publication_date) {
    return res.status(400).json({
      message: "Los campos title, author, genre y publication_date son obligatorios",
    });
  }

  const book = new Book({
    title,
    author,
    genre,
    publication_date,
  });

  try {
    const newBook = await book.save();
    console.log(newBook);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get('/:id', getBook, async(req, res) => {
  res.json(res.book)
})

//put
router.put('/:id', getBook, async(req, res) => {
  try {
      const book = res.book
      book.title = req.body.title || book.title;
      book.author = req.body.author || book.author;
      book.genre = req.body.genre || book.genre;
      book.publication_date = req.body.publication_date || book.publication_date;

      const updatedBook = await book.save()
      res.json(updatedBook)
  } catch (error) {
      res.status(400).json({
          message: error.message   
      })
    
  }
})

//patch
router.patch('/:id', getBook, async(req, res) => {

  if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
    res.status(400).json({
      message: 'Al  menos uno de estos grupos debe ser enviado: Titulo, autor, genero, o fecha de publicacion'
    })

  }  


  try {
      const book = res.book
      book.title = req.body.title || book.title;
      book.author = req.body.author || book.author;
      book.genre = req.body.genre || book.genre;
      book.publication_date = req.body.publication_date || book.publication_date;

      const updatedBook = await book.save()
      res.json(updatedBook)
  } catch (error) {
      res.status(400).json({
          message: error.message   
      })
    
  }
})

//Delete
router.delete('/:id', getBook, async(req, res) => {
  try {
    const book = res.book
    await book.deleteOne({
      _id: book._id
    });
    res.json({
      message: `El libro ${book.title} fue eliminado correctamente`
    })

  } catch (error) {
      res.status(500).json({
        message: error.message
      })
  }
})



// Exportar el router
module.exports = router;
