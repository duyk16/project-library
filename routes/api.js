/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose')

const MONGODB_CONNECTION_STRING = process.env.DB || 'mongodb://issue-user:issue123456@ds229108.mlab.com:29108/project-issuetracker'

mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err) => {
    if (err) return console.log('Connect mongo fail')
    console.log('Connect mongo success')
})

const bookSchema = new mongoose.Schema({}, { strict: false });
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

    app.route('/api/books')
        .get(function (req, res) {
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

            Book.find({})
                .lean()
                .exec()
                .then(datas => {
                    datas.map(doc => {
                        doc['commentcount'] = doc['comments'].length
                        delete doc['comments']
                        return doc
                    })

                    res.json(datas)
                })
        })

        .post(function (req, res) {
            let { title } = req.body;
            //response will contain new book object including at least _id and title

            if (!title) return res.send('invalid title');

            let book = new Book({
                title: title,
                comments: []
            })
            book.save()
                .then(doc => res.json(doc))
        })

        .delete(function (req, res) {
            //if successful response will be 'complete delete successful'

            Book.deleteMany({}).exec().then(data => {
                res.json('complete delete successful')
            })
        });


    app.route('/api/books/:id')
        .get(function (req, res) {
            var bookid = req.params.id;
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

            if (!bookid) return res.json({ error: 'Book ID is required' });

            Book.findOne({ _id: bookid }).exec().then(doc => {
                if (!doc) return res.send('no book exists')
                return res.json(doc)
            })
        })

        .post(function (req, res) {
            var bookid = req.params.id;
            var comment = req.body.comment;
            //json res format same as .get

            if (!bookid) return res.json({ error: 'Book ID is required' });

            if (!comment) return res.json({ error: 'Comment is required' });

            Book.findOneAndUpdate(
                {
                    _id: bookid
                },
                {
                    $push: { comments: comment }
                },
                { new: true }
            ).exec().then(doc => res.json(doc))
        })

        .delete(function (req, res) {
            var bookid = req.params.id;
            //if successful response will be 'delete successful'

            if (!bookid) return res.json({ error: 'id is required' });

            Book.findOneAndDelete(
                { _id: bookid },
            ).exec().then(doc => res.json('delete successful'))
        });

};
