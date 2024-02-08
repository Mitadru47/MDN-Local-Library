const mongoose = require("mongoose");

// A powerful, modern, and friendly library for parsing, validating, manipulating, formatting and localising dates.
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({

  book: { type: Schema.Types.ObjectId, ref: "Book", required: true }, // reference to the associated book
  imprint: { type: String, required: true },

  status: {

    type: String,
    required: true,
    
    // enum: This allows us to set the allowed values of a string. 
    // In this case, we use it to specify the availability status of our books 
    // (using an enum means that we can prevent mis-spellings and arbitrary values for our status).
    
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
  
    // default: We use default to set the default status for newly created book instances to "Maintenance" 
    // and the default due_back date to now (note how you can call the Date function when setting the date!).

    default: "Maintenance",
  },

  due_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
BookInstanceSchema.virtual("url").get(function () {

  // We don't use an arrow function as we'll need the this object
  return `/catalog/bookinstance/${this._id}`;
});

// Virtual for bookinstance's due_date field
BookInstanceSchema.virtual("due_back_formatted").get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

// Note: Luxon can import strings in many formats and export to both predefined and free-form formats.

// In this case we use fromJSDate() to import a JavaScript date string and toLocaleString() to output the date in 
// DATE_MED format in English: Apr 10th, 2023

BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate(); // format 'YYYY-MM-DD'
});

// The date value has to be set in the format YYYY-MM-DD because this is expected by <input> elements with type="date",
// however the date is not stored in this format so we have to convert it before setting the value in the control. 

// Export model
module.exports = mongoose.model("BookInstance", BookInstanceSchema);