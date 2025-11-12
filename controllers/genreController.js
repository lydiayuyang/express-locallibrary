const{body,validationResult} = require("express-validator");

var Book = require("../models/book");
var async = require("async");

const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");

exports.genre_list =async function(req,res,next){
    try{
        const genre_list = await Genre.find()
          .sort({name:1})
          .exec();
        
        res.render("genre_list",{
            title:"Genre List",
            genre_list: genre_list,
        });
    } catch(err){
        next(err);
    }
};
exports.genre_detail = async function(req,res,next){
    try{
        const[genre,genre_books]= await Promise.all([
            Genre.findById(req.params.id).exec(),
            Book.find({genre:req.params.id}).exec()
        ]);
        
        if(!genre){
            const err = new Error("Genre not found");
            err.status = 404;
            return next(err);
        }

        res.render("genre_detail",{
            title:"Genre Detail",
            genre:genre,
            genre_books:genre_books,
        });
    }catch(err){
        return next (err);
    }
};

exports.genre_create_get = (req,res,next)=>{
    res.render("genre_form", {title:"Create Genre"});
};

exports.genre_create_post = [
    //验证及清理名称字段
    body("name", "Genre name must contain at least 3 characters")
      .trim() //删除所有的首尾部空白
      .isLength({min:3})
      .escape(), // 删除任何危险的html字符
    //处理验证及清理过后的请求
    asyncHandler(async(req,res,next)=>{
        //从请求中提取验证时产生的错误信息
        const errors = validationResult(req);
        //使用经去除空白字符和转义处理的数据创建一个类型对象
        const genre = new Genre({name:req.body.name});
        if (!errors.isEmpty()){
            //出现错误，使用清理后的值或错误信息重新渲染表单
            res.render("genre_form",{
                title:"Create Genre",
                genre:genre,
                errors:errors.array(),
            });
            return;
        } else{
            //表中中的数据有效
            //检查是否存在同名的Genre
            const genreExists = await Genre.findOne({name:req.body.name})
              .collation({locale:"en", strength:2 })
              .exec();
            if(genreExists){
                //存在同名的Genre，则重定向到详情页面
                res.redirect(genreExists.url);
            } else{
              await genre.save();
              //保存新创建的Genre，然后重定向到类型的详情页面
              res.redirect(genre.url);
            }
        }
    }),
];

exports.genre_delete_get = asyncHandler(async(req,res,next)=>{
    res.send("未实现：流派删除GET");
});

exports.genre_delete_post = asyncHandler(async(req,res,next)=>{
    res.send("未实现：流派删除POST");
});

exports.genre_update_get = asyncHandler(async(req,res,next)=>{
    res.send("未实现：流派更新GET");
});

exports.genre_update_post = asyncHandler(async(req,res,next)=>{
    res.send("未实现：流派更新POST");
});