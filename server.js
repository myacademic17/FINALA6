/*********************************************************************************
* BTI325 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Humaira Shaikh Student ID: 139877203 Date: Dec 4, 2022
*
* Online Link: ________________________________________________________ 
*
********************************************************************************/

const express = require('express')
const path = require('path')
const app = express();
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
dotenv.config();
const dataService = require('./data-service')
const dataServiceAuth = require('./data-service-auth') 
var clientSession = require("client-sessions"); 

var HTTP_PORT = process.env.PORT || 8080; 

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

//setting express-handlebars
app.engine(".hbs", engine({
    extname: '.hbs',
    
    helpers:{
        navLink: function(url, options){
            return '<li' +
                    ((url == app.locals.activeRoute) ? ' class = "active" ' : '') +
                    '><a href="' + url + '">' + options.fn(this) + '</a> </li>';
        }, // helpers: navLink
       /* e.g.,
          {{#equal employee.status "Full Time" }}checked{{/equal}} */
        equal: function(lvalue, rvalue, options){
            if (arguments.length<3)
                throw new Error ("Handlebars Helper equal needs 2 parameters.");
            if (lvalue != rvalue){
                return options.inverse(this);
            } else{
                return options.fn(this);
            }
        } // helpers:equal
    }, //// helpers
    defaultLayout: 'main'
}
));

//A3- define storage destination
// multer: for form with file upload 
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb){
        cb(null, Date.now()+ path.extname(file.originalname));
    }
});
var upload = multer({storage:storage});

// body-parser: for form without file upload
app.use(bodyParser.urlencoded({extended:true}));

//set up default route
app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/about", (req,res)=>{
    res.render("about");
});
app.set("view engine", ".hbs");
app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


data_services.initialize().then(function(data){
    dataServiceAuth.initialize().then(function(data){
      app.listen(HTTP_PORT, onHttpStart);
    }).catch(function(err){
      console.log("Unable to start server:" + err);
    })
  }).catch(function(err){ 
    console.log("Unable to start server:" + err);
  })

  //set up client session
  app.use(clientSessions({
    cookieName: "Sessions",
    secret: "Humaira_BTI325_A6",
    duration: 2 * 60 * 1000,  //two minutes duration of session
    activeDuration: 1000 * 60 // one minute will be extended each time
  })); 

  
  const ensureLogin = (req, res, next) => {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }
  
  app.use(function(req,res,next){ 
    res.locals.session = req.session;
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
  });

  app.get("/", (req, res) =>{
    res.render('home');
})

app.get("/about", (req, res) =>{
    res.render("about");
})

app.get("/login", function(req,res){
    console.log("LOGIN PAGE!");
    res.render("login");
})

app.get("/register", function(req,res){
    res.render("register");
})

app.post("/register", function(req, res){
    console.log("Resgistering User!");
        dataServiceAuth.registerUser(req.body).then(function(){
           res.render("register", {successMessage : "User Created"});
        }).catch(function(errors){
              res.render("register", {errorMessage : errors, userName : req.body.userName})
        });
});

app.post("/login", function(req,res){
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then(function(user){
      req.session.user = {
        userName : user.userName,
        email : user.email,
        loginHistory : user.loginHistory
      }
      res.redirect("/employees");
    }).catch(function(err){
      res.render("login", {errorMessage : err, userName : req.body.userName});
    })
});

app.get("/logout", function(req, res){  
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, function(req,res){
    res.render("userHistory");
});

//1
app.get("/employees", ensureLogin, function(req,res){

    console.log(req.query);
  
    if(Object.keys(req.query).length === 0){ 
      data_services.getAllEmployees().then(function(data){
  
          //res.json(data);
          if (data.length > 0){
            res.render("employees", {data : data});
          }
          else{
            res.render("employees", {data : "No results"});
          }
      })
      .catch(function(err){
         res.render("employees" , {data: err});
      })
    }
    else if (Object.keys(req.query).length !== 0){ 
      data_services.getEmployees(req.query).then(function(data){
        res.render("employees", {data : data});
        //res.json(data)
        
      }).catch(function(err){
        res.render("employees" , {error: err});
        //res.send(err);
      })
    }
  })

//2
  app.get("/employees/add", ensureLogin, function(req,res){

    data_services.getDepartments().then(function(array_of_depts){
      res.render("addEmployee", {departments : array_of_depts});
    }).catch(function(err){
      res.render("addEmployee", {departments : []});
    })
    //res.sendFile(path.join(__dirname + views + "addEmployee.html"));
  })

//3 
app.get("/employees/:num", ensureLogin, function(req, res){

    let viewData = {};
    data_services.getEmployees(req.params).then((data) => {
        if (data) {
    
            viewData.employee = data; 
        } else {
            viewData.employee = null; 
        }
    }).catch(() => {
        viewData.employee = null; 
    }).then(data_services.getDepartments)
    .then((data) => {
        viewData.departments = data; 
  
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee[0].dataValues.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = [];
    }).then(() => {
        if (viewData.employee == null) { 
            res.status(404).send("Employee Not Found");
        } else {
          console.log(viewData.employee);
            res.render("employee", { viewData: viewData }); 
        }
    })
  })

//4 
app.get('/employee/delete/:employeeNum', ensureLogin, function(req, res){
    data_services.deleteEmployeeByNum(req.params).then(function(){
      res.redirect("/employees")
    }).catch(function(err){
      res.send("ERROR : " + err);
    })
});

//5 
app.get("/managers",ensureLogin, function(req, res){
    data_services.getManagers().then(function(data){
      //res.json(data);
      if (data.length > 0){
        res.render("managers", {data : data});
      }
      else{
        res.render("managers", {data : "No results"});
      }
  })
  .catch(function(err){
     res.render("managers" , {data: err});
  })
})

//6 
app.get("/departments", ensureLogin, function(req, res){
    data_services.getDepartments().then(function(data){
      if (data.length > 0){
        res.render("departments", {data : data});
      }
      else{
        res.render("departments", {data : "No results"});
      }  
  })
  .catch(function(err){
      res.render("departments" , {data: err});
  })
})
  
//7 
app.get("/departments/add", ensureLogin, function(req,res){
    res.render("addDepartment");
})

//8 
app.get("/department/:departmentId",ensureLogin, function(req,res){
    data_services.getDepartmentById(req.params).then(function(dept){
      //res.json(dept);
       res.render("department", {data: dept})
    }).catch(function(err){
      res.send("ERROR :  " + err);
    })
})

//9 
app.get("/images/add", ensureLogin, function(req,res){
    res.render("addImage")
    //res.sendFile(path.join(__dirname + views + "addImage.html"));
})

//10
app.get("/images", ensureLogin, function(req, res){
    fs.readdir("./public/images/uploaded", function(err, items){
      console.log("ITEMS : " + items)
      res.render("images", {data: items});
       if (err){
        res.send("IMAGE RETRIVIAL ERROR :" + err);
        console.log(err);
       }
    })
})

//11
app.post("/register", function(req, res){
    console.log("REGISTERING USER!");
        dataServiceAuth.registerUser(req.body).then(function(){
           res.render("register", {successMessage : "User Created"});
        }).catch(function(errors){
              res.render("register", {errorMessage : errors, userName : req.body.userName})
        });
  });

//12
app.post("/employee/update", ensureLogin, function(req,res){
   
    data_services.updateEmployee(req.body).then(function(){
      //console.log(req.body);
        res.redirect("/employees");

    }).catch(function(err){

      res.send(err);

    })
})

//13
app.post("/images/add", ensureLogin, upload.single("imageFile"), function(req, res){
    res.redirect("/images")
});

//14
app.post("/employees/add", ensureLogin, function(req,res){
        data_services.addEmployee(req.body).then(function(data){
            console.log(data);
            res.redirect("/employees");
        }).catch(function(err){  
          res.send(err);
        })
})


//15
app.post("/departments/add", ensureLogin, function(req,res){
    data_services.addDepartment(req.body).then(function(){
        res.redirect("/departments");
    }).catch(function(err){
      res.send("ERROR :  " + err);
    })
  })
  
//16
  app.post("/department/update", ensureLogin, function(req,res){
      data_services.updateDepartment(req.body).then(function(){
        res.redirect("/departments")
      }).catch(function(err){
        res.send("ERROR : " + err);
      })
  })







app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

data_service.initialize().then(()=>{
    //listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
    console.log("Cannot open files.");
}); 
  