//导入模块
let express = require('express');
let path = require('path');
//导入 body-parse
let bodyParser = require('body-parser');
//导入生成验证图片的模块
let svgCaptcha = require('svg-captcha');
//导入session模块
let session = require('express-session');
//导入自己封装的工具函数
let myT = require(path.join(__dirname,'tools/myT.js'));



//创建app
let app = express();
//托管静态文件
app.use(express.static('static'));
//body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));
//使用session中间件
app.use(session({
    secret: 'keyboard cat love west blue flower hahahaha'
}))

//路由1,访问登录页面时,直接读取登陆页面
app.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})

//路由2,使用post方法,提交数据过来,验证用户登录
app.post('/login',(req,res) => {
    //获取提交过来的数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    let code = req.body.code;
    //验证码跟session中的验证码进行比较
    if(code == req.session.captcha) {
        // console.log('验证码正确');
        req.session.userInfo = {
            userName,
            userPass
        }
        //去首页
        res.redirect('/index');
    } else {
        res.setHeader('content-type','text/html');
        res.send('<script>alert("验证码失败");window.location="/login"</script>');
    }
    
})

//路由3,生成图片的路由
app.get('/captcha', function (req, res) {
    let captcha = svgCaptcha.create();

    // console.log(captcha.text);
    //保存验证码的值 到session中方便使用,为了比较简单直接转为小写
    req.session.captcha = captcha.text.toLocaleLowerCase();

    res.type('svg');
    res.status(200).send(captcha.data);
});

//路由4,访问首页
app.get('/index',(req,res) => {
    //有session 
    if(req.session.userInfo) {
        //登陆了
        res.sendFile(path.join(__dirname,'static/views/index.html'));
    } else {
        //没有登录,打去登陆页
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请登陆");window.location="/login"</script>');
    }
})

//路由5,退出
app.get('/logout',(req,res) => {
    //删除session中的userInfo
    delete req.session.userInfo;
    //去登录页
    res.redirect('/login');
})

//路由6,进注册页面
app.get('/register',(req,res) => {
    res.sendFile(path.join(__dirname,'static/views/register.html'));
})

//路由7
app.post('/register',(req,res) => {
    //获取用户数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    myT.find('userList',{userName},(err,docs) => {
        if(docs.length == 0) {
            //没有注册
            myT.insert('userList',{userName,userPass},(err,result) => {
                if(!err) myT.mess(res,'欢迎加入','/login');
            })
        } else {
            //已被注册
            myT.mess(res,"已被注册",'/register');
        }
    })
})


//开启监听
app.listen(8888,'127.0.0.1',()=>{
    console.log('success');
})