const Author = require("../models/author");
const Book = require("../models/book");

// express-async-handler defines a wrapper function that hides the try-catch block and the code to forward the error.
const asyncHandler = require("express-async-handler");

// express-validator is a set of express.js middlewares that wraps the extensive collection of validators and sanitizers 
// offered by validator.js.

// It allows you to combine them in many ways so that you can validate and sanitize your express requests, and offers tools
// to determine if the request is valid or not, which data was matched according to your validators, and so on.

const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
  res.render("author_list", {
    title: "Author List",
    author_list: allAuthors,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);
  
    if (author === null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("author_detail", {
      title: "Author Detail",
      author: author,
      author_books: allBooksByAuthor,
    });
  });
  
// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
});
  
// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),

    // We can daisy chain validators, using withMessage() to specify the error message to display if the previous validation
    // method fails. This makes it very easy to provide specific error messages without lots of code duplication. 

    // Warning: Never validate names using isAlphanumeric() (as we have done above) as there are many names 
    // that use other character sets. We do it here in order to demonstrate how the validator is used, and how it 
    // can be daisy-chained with other validators and error reporting.  

  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

    // We can use the optional() function to run a subsequent validation only if a field has been entered 
    // (this allows us to validate optional fields).

    // For example, below we check that the optional date of birth is an ISO8601-compliant date 
    // (the { values: "falsy" } object passed means that we'll accept either an empty string or null as an empty value). 

    // Parameters are received from the request as strings. We can use toDate() (or toBoolean()) to cast these 
    // to the proper JavaScript types (as shown at the end of the validator chain above).

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      await author.save();
      // Redirect to new author record.
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    // No results.
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {

  const author = await Author.findById(req.params.id).exec();
  res.render("author_form", { title: "Create Author", author: author });
});

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,

      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
      // Redirect to author detail page.
      res.redirect(updatedAuthor.url);
    }
  }),
];