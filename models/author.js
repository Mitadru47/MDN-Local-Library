const { DateTime } = require("luxon");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({

    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },

    date_of_birth: { type: Date },
    date_of_death: { type: Date }
});

// Virtual Property for author's full name.
AuthorSchema.virtual("name").get(function (){

    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case

    let fullname = "";
    if(this.first_name && this.family_name) {
        fullname = `${this.family_name}, ${this.first_name}`
    }

    return fullname;
});

// Note: Declaring our URLs as a virtual in the schema is a good idea 
// because then the URL for an item only ever needs to be changed in one place

// Virtual Property for author's URL
AuthorSchema.virtual("url").get(function (){

    // We don't use an arrow function here as we'll need the this object
    return `/catalog/author/${this._id}`;
});

// Virtual for author's date_of_birth field
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : "";
});

// Virtual for author's date_of_death field
AuthorSchema.virtual("date_of_death_formatted").get(function () {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : "";
});

// Virtual for author's date_of_birth field - YYYY-MM-DD Format
AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toISODate() : "";
});

// Virtual for author's date_of_death field - YYYY-MM-DD Format
AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toISODate() : "";
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);