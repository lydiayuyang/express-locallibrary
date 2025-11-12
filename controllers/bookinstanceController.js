const{body,validationResult}=require("express-validator");

const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.bookinstance_list = asyncHandler(async(req,res,next)=>{
    const allBookInstances = await BookInstance.find()
    .populate("book")
    .exec();

    res.render("bookinstance_list",{
        title:"Book Instance List",
        bookinstance_list:allBookInstances,
    });
});

exports.bookinstance_detail = asyncHandler(async(req,res,next)=>{
    const bookInstance = await BookInstance.findById(req.params.id)
      .populate("book")
      .exec();
    if(bookInstance ===null){
        const err = new Error("Book copy not found");
        err.status =404;
        return next(err);
    }
    res.render("bookinstance_detail",{
        title:"Book:",
        bookinstance:bookInstance,
    });
});

exports.bookinstance_create_get = asyncHandler(async(req,res,next)=>{
    const books=await Book.find({},"title").sort({title:1}).exec();
    res.render("bookinstance_form",{
        title:"Create BookInstance",
        book_list: books,
    });
});

exports.bookinstance_create_post = [
    body("book", "Book must be specified").trim().isLength({min:1}).escape(),
    body("imprint", "Imprint must be specified")
      .trim()
      .isLength({min:1})
      .escape(),
    body("status").trim().escape(),
    body("due_back", "Invalid date")
      .optional({values:"falsy"})
      .isISO8601()
      .toDate(),
    asyncHandler(async(req,res,next)=>{
        const errors=validationResult(req);
        const bookinstance= new BookInstance({
            book:req.body.book,
            imprint:req.body.imprint,
            status:req.body.status,
            due_back:req.body.due_back,
        });
        if(!errors.isEmpty()){
            const books=(await Book.find({}, "title")).sort({title:1}).exec();
            res.render("bookinstance_form",{
                title:"Create BookInstance",
                book_list:books,
                selected_book:bookinstance.book,
                errors:errors.array(),
                bookinstance:bookinstance,
            });
            return;
        }
        await bookinstance.save();
        res.redirect(bookinstance.url);
    }),
 ];

 
exports.bookinstance_delete_get =asyncHandler(async(req,res,next)=>{
  const bookinstance= await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if(!bookinstance){
    return res.redirect("/catalog/bookinstances");
  }
  res.render("bookinstance_delete",{
    title:"Delete Bookinstance",
    bookinstance,
  });
});

exports.bookinstance_delete_post = 

exports.bookinstance_update_get = asyncHandler(async(req,res,next)=>{
    res.send("未实现：BookInstance 更新 GET");
});

exports.bookinstance_update_post = asyncHandler(async(req,res,next)=>{
    res.send("未实现：BookInstance 更新 POST");
});