const {body, validationResult}=require("express-validator");

const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const asyncHandler = require("express-async-handler");
const async = require("async");
const book = require("../models/book");

exports.index = asyncHandler(async(req,res,next)=>{
    const[
        numBooks,
        numBookInstances,
        numAvailableBookInstances,
        numAuthors,
        numGenres,
    ] = await Promise.all([
        Book.countDocuments({}).exec(),
        BookInstance.countDocuments({}).exec(),
        BookInstance.countDocuments({status:"Available"}).exec(),
        Author.countDocuments({}).exec(),
        Genre.countDocuments({}).exec(),
    ]);

    res.render("index",{
        title:"Local Library Home",
        book_count:numBooks,
        book_instance_count:numBookInstances,
        book_instance_available_count:numAvailableBookInstances,
        author_count:numAuthors,
        genre_count:numGenres,
    });
});

exports.book_list = asyncHandler(async(req,res,next)=>{
    const allBooks = await Book.find({}, "title author")
    .sort({title:1})
    .populate("author")
    .exec();

    res.render("book_list",{title:"Book List",book_list:allBooks
    });
});

exports.book_detail = asyncHandler(async(req,res,next)=>{
    const [book,bookInstances]=await Promise.all([
        Book.findById(req.params.id).populate("author").populate("genre").exec(),
        BookInstance.find({book:req.params.id}).exec(),
    ]);

    if (book ===null){
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
    }

    res.render("book_detail",{
        title:book.title,
        book:book,
        book_instances:bookInstances,
    });
});

// 显示书籍创建表单（GET请求）
exports.book_create_get = asyncHandler(async(req,res,next)=>{
    try{
        const[authors,genres] = await Promise.all([
            Author.find().exec(),
            Genre.find().exec(),
        ]);
        res.render('book_form',{
            title:"Create Book",
            authors,
            genres,
        });
    }catch(err){
        return next(err);
    }
});


//在POST请求中处理创建书籍操作。
exports.book_create_post = [
    //将类型转换为数组。
    (req,res,next)=>{
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre === "undefined") req.body.genre =[];
            else req.body.genre=new Array(req.body.genre);
        }
        next();
    },
    //验证字段。
    body("title", "Title must not be empty.").isLength({min:1}).trim(),
    body("author", "Author must not be empty.").isLength({min:1}).trim(),
    body("summary", "Summary must not be empty.").isLength({min:1}).trim(),
    body("isbn", "ISBN must not be empty").isLength({min:1}).trim(),
    //对字段进行消毒（使用通配符）。
    body("*").trim().escape(),
    body("genre.*").escape(),
    //在验证和清理后处理请求。
    (req,res,next)=>{
        //从请求中提取验证错误。
        const errors=validationResult(req);
        //创建一个包含转义和修剪后数据的Book对象。
        var book = new Book({
            title:req.body.title,
            author:req.body.author,
            summary:req.body.summary,
            isbn:req.body.isbn,
            genre:req.body.genre,
        });
        if(!errors.isEmpty()){
            //存在错误。请使用已清理的值/错误消息重新渲染表单。
            //获取表单的所有作者和类型。
            async.parallel(
                {
                    authors:function(callback){
                        Author.find(callback);
                    },
                    genres:function(callback){
                        Genre.find(callback);
                    },
                },
                function(err,results){
                    if(err){
                        return next(err);
                    }
                    //将我们选定的类型标记为已选中。
                    for(let i=0; i<results.genres.length; i++){
                        if(book.genre.indexOf(results.genres[i]._id)>-1){
                            //当前选中的类型。设置"已选中"标记。将选中的类型标记为已选中。
                            results.genres[i].checked="true";
                        }
                    }
                    res.render("book_form",{
                        title:"Create Book",
                        authors:results.authors,
                        genres:results.genres,
                        book:book,
                        errors:errors.array(),
                    });
                },
            );
            return;
        }else{
            //表单数据有效。保存书籍。
            book.save(function(err){
                if(err){
                    return next(err);
                }
                //成功 - 重定向至新图书记录。
                res.redirect(book.url);
            });
        }
    },
];

exports.book_delete_get = asyncHandler(async(req,res,next)=>{
    res.send("未实现：删除图书GET");
});

exports.book_delete_post = asyncHandler(async(req,res,next)=>{
    res.send("未实现：删除图书POST");
});

exports.book_update_get= asyncHandler(async(req,res,next)=>{
    const book = await Book.findById(req.params.id) 
      .populate("author")
      .populate("genre")
      .exec();
    if(!book){
        const err= new Error("Book not found");
        err.status=404;
        throw err;
    }
    const[authors,genres]=await Promise.all([Author.find().exec(), Genre.find().exec()]);
    for(let genreItem of genres){
        genreItem.checked= book.genre.some((g)=>g._id.toString()=== genreItem._id.toString());
    }
    res.render("book_form",{
        title: "Update Book",
        authors,
        genres,
        book,
    });
});

exports.book_update_post= [
    (req,res,next)=>{
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre === "undefined") req.body.genre =[];
            else req.body.genre =[req.body.genre];
        }
        next();
    },
    body("title")
      .trim()
      .isLength({min:1})
      .withMessage("Title must not be empty.")
      .escape(),
    body("author")
      .trim()
      .isLength({min:1})
      .withMessage("Author must not be empty.")
      .escape(),
    body("summary")
      .trim()
      .isLength({min:1})
      .withMessage("Summary must not be empty.")
      .escape(),
    body("isbn")
      .trim()
      .isLength({min:1})
      .withMessage("ISBN must not be empty.")
      .escape(),
    body("genre.*").trim().escape(),
    asyncHandler(async(req,res,next)=>{
        const errors =validationResult(req);
        const book= new Book({
            title:req.body.title,
            author:req.body.author,
            summary:req.body.summary,
            isbn:req.body.isbn,
            genre:typeof req.body.genre ==="undefined" ? [] : req.body.genre,
            _id:req.params.id,
        });
        if(!errors.isEmpty()){
            const[authors,genres]=await Promise.all([
                Author.find(),
                Genre.find(),
            ]);
            for(let i=0; i<genres.length; i++){
                if(book.genre.indexOf(genres[i]._id)>-1){
                    genres[i].checked=true;
                }
            }
            res.render("book_form",{
                title:"Update Book",
                authors,
                genres,
                book,
                errors:errors.array(),
            });
            return;
        }
        const thebook = await Book.findByIdAndUpdate(req.params.id,book,{});
        res.redirect(thebook.url);
    }),
];