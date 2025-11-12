const{body,validationResult} = require("express-validator");

const Book = require("../models/book")
const Author = require("../models/author");
const asyncHandler = require("express-async-handler");

exports.author_list =async function(req,res,next){
    try{
        const list_authors=await Author.find()
          .sort({family_name:1})
          .exec();

        res.render("author_list",{
            title:"Author List",
            author_list: list_authors,
        });
    }catch(err){
        return next(err);
    }
};

exports.author_detail = asyncHandler(async(req,res,next)=>{
    const[author,allBooksByAuthor]=await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({author:req.params.id},"title summary").exec(),
    ]);
    if(author===null){
        const err = new Error("Author not found");
        err.status=404;
        return next(err);
    }
    res.render("author_detail",{
        title:"Author Detail",
        author:author,
        author_books:allBooksByAuthor,
    });
});

//展示GET方法获取的创建作者表单
exports.author_create_get = (req,res,next)=>{
    res.render("author_form",{title:"Create Author"});

};

//处理POST方法提交的创建作者表单
exports.author_create_post = [
    //验证并且清理字段
    body("first_name")
      .trim()
      .isLength({min:1})
      .escape()
      .withMessage("First name must be specified.")
      .isAlphanumeric()
      .withMessage("First name has non-alphanumeric characters."),
    body("family_name")
      .trim()
      .isLength({min:1})
      .escape()
      .withMessage("Family name must be specified")
      .isAlphanumeric()
      .withMessage("Family name has non-alphanumeric characters."),
    body("date_of_birth","Invalid date of birth")
      .optional({values:"falsy"})
      .isISO8601()
      .toDate(),
    body("date_of_death","Invalid date of death")
      .optional({values:"falsy"})
      .isISO8601()
      .toDate(),
    
    //在验证和修正完字段后处理请求
    asyncHandler(async(req,res,next)=>{
        //从请求中提取验证错误
        const errors =validationResult(req);
        //使用经转义和去除空白字符处理的数据创建作者对象
        const author = new Author({
            first_name:req.body.first_name,
            family_name:req.body.family_name,
            date_of_birth:req.body.date_of_birth,
            date_of_death:req.body.date_of_death,
        });
        if(!errors.isEmpth()){
            //出现错误，使用清理后的值和错误信息重新渲染表单
            res.render("author_form",{
                title:"Create Author",
                author:author,
                errors:errors.array(),
            });
        return;
        }else{
            //表格中的数据有效
            //保存作者信息
            await author.save();
            //重定向到新的作者记录
            res.redirect(author.url);
        }
    }),
];

exports.author_delete_get = asyncHandler(async(req,res,next)=>{
      // 使用 Promise.all 并行获取作者和作者的书籍
  const [author, authors_books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);

  if (!author) {
    // 如果作者不存在，重定向到作者列表
    return res.redirect("/catalog/authors");
  }

  // 成功，渲染删除页面
  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: authors_books,
  });
});

exports.author_delete_post = asyncHandler(async(req,res,next)=>{
    // 获取作者和作者的书籍
  const [author, authors_books] = await Promise.all([
    Author.findById(req.body.authorid).exec(),
    Book.find({ author: req.body.authorid }).exec(),
  ]);

  if (!author) {
    // 作者不存在，重定向到作者列表
    return res.redirect("/catalog/authors");
  }

  if (authors_books.length > 0) {
    // 作者有书籍，不能删除，重新渲染删除页面
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: authors_books,
    });
    return;
  }

  // 作者没有书籍，可以删除
  await Author.findByIdAndRemove(req.body.authorid).exec();
  // 删除成功后重定向到作者列表
  res.redirect("/catalog/authors");
});

exports.author_update_get = asyncHandler(async(req,res,next)=>{
    res.send("未实现：更新作者的GET");
});

exports.author_update_post = asyncHandler(async(req,res,next)=>{
    res.send("未实现：更新作者的POST");
});