const Sequelize = require('sequelize');

var sequelize = new Sequelize('hsucypcx', 'hsucypcx', '2RjZiQ40OGdBxpvXVNYa0t51gMxAzBdU', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
    }
   });

   sequelize.authenticate().then(()=> console.log('Connection success.'))
   .catch((err)=>console.log("Unable to connect to DB.", err)); 

   var Employee = sequelize.define('Employee', {
        employeeNum: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        SSN: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addressCity: Sequelize.STRING,
        addressState: Sequelize.STRING,
        addressPostal: Sequelize.STRING,
        maritalStatus: Sequelize.STRING,
        isManager: Sequelize.BOOLEAN,
        employeeManagerNum: Sequelize.INTEGER,
        status: Sequelize.STRING,
        department: Sequelize.INTEGER,
        hireDate: Sequelize.STRING
   }); 

   var Department = sequelize.DEFINE('Department', {
        departmentId:{type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departmentName: Sequelize.STRING
   })




module.exports.initialize = function()
{
    return new Promise(function (resolve, reject) {
        sequelize
        .sync()
        .then(() => {
            resolve()
        })
        .catch(err => {
            reject('Unable to sync to database')
        }); 
       })    
}


module.exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) {
        Employee.findAll()
        .then(employees => {
            resolve(employees);
        })
        .catch(err => {
            reject('No results returned');
        }); 
       });
}

module.exports.getManagers = function(){
    return new Promise(function (resolve, reject) {
        reject();
       });
}

module.exports.getDepartments = function(){
    return new Promise(function (resolve, reject) {
        Department.findAll({})
        .then(departments => {
            resolve(departments);
        })
        .catch(err => {
            reject('No results returned.');
        });
       });
}


module.exports.addEmployee = function(employeeData){

    employeeData.isManager = (employeeData.isManager) ? true : false; 

    for (const key in employeeData){
        if (employeeData[key] === ''){
            employeeData[key] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        Employee.create(employeeData)
        .then(employee => {
            resolve;
        })
        .catch(err => {
            reject('Unable to create employee.');
        });
       });
}

module.exports.getEmployeesByStatus = function(status){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {status: status}
        })
        .then(employees => {
            resolve(employees);
        })
        .catch(err => {
            reject('No results returned');
        });
       });
}

module.exports.getEmployeesByDepartment = function(department){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {department: department}
        })
        .then(employees => {
            resolve(employees);
        })
        .catch(err => {
            reject('No results returned');
        });
       });
}

module.exports.getEmployeesByManager = function (manager){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {employeeManagerNum: manager}
        })
        .then(employees => {
            resolve(employees);
        })
        .catch(err => {
            reject('No results returned');
        });
       });
}

module.exports.getEmployeeByNum = function(value){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {employeeNum: empNum}
        })
        .then(employees =>{
            resolve(employees[0]);
        })
        .catch(err => {
            reject('No results returned.');
        });
       });
    } 


module.exports.updateEmployee= function(employeeData){

    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (const key in employeeData){
            if (employeeData[key]=== ''){
                employeeData[key] = null;
            }
        }

        Employee.update(employeeData,{
            where: {employeeNum: employeeData.employeeNum}
        })
        .then(employee => {
            resolve();
        })
        .catch(err => {
            reject('Unable to update employee');
        })
       });
}

// A5 - 7)Adding new data-service functions

module.exports.addDepartment= function(departmentData){
    for (const key in departmentData){
        if (departmentData[key] === ''){
            departmentData[key] = null; 
        }
    }

    return new promise (function(resolve, reject){
        Department.create(departmentData)
        .then(department => {
            resolve(); 
        })
        .catch(err => {
            reject('Unable to create department'); 
        })
    }); 
}

module.exports.updateDepartment= function(departmentData){

    for (const key in departmentData){
        if(departmentData[key] === ''){
            departmentData[key] = null; 
        }

    }

    return new promise(function (resolve, reject){
        Department.update(departmentData, {
            where: {departmentId : departmentData.departmetnId}
        })

        .then(department  => {
            resolve(); 
        })

        .catch(err =>{
            reject('Unable to update department.')
        })
    })
}

module.exports.getDepartmentById= function(departmentData){
    return new promise(function (resolve, reject){
        Department.findAll({ where: {departmentId : id}})
        .then(department => {
            resolve(department[0]);
        })
        .catch(err => {
            reject('No results returned.');
        });
    }); 
}

module.exports.deleteEmployeeByNum= function(empNum){
    return new Promise(function (resolve, reject) {
    Employee.destroy({
        where: {employeeNum: empNum}
    })
    .then(employee=> {
        resolve(); 
    })
    .catch(err => {
        reject('Unable to delete employee.');
    })
    }); 
}
