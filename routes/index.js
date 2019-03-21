var express=require('express');
var router=express.Router();
var sql=require('mssql');
const catchErrors=require('../lib/async-error');

var config={
  user:'genuine',
  password:'Amotech209#',
  server:'192.168.18.69',
  database:'AMOERP',
  port:14233,

  options:{
    encrypt:false
  }
}
router.get('/',catchErrors(async(req,res,next)=>{

}));

router.get('/select',catchErrors(async(req,res,next)=>{
  sql.connect(config).then(pool=>{
    return pool.request()
    //.input('select_sal',sql.Int,value)//input parameter
    .query('select UserName, LoginPwd from dbo._TCAUser')//query
  }).then(result=>{
    console.dir(result.recordset[0].UserName);
    res.render('index',{results:result})
  /*
    return pool.request()
    .input('input_parameter',sql.Int, value)
    .output('output_parameter',sql.VarChar(50))
    .execute('procedure_name')
    */
  }).then(final=>{
    sql.close()
  }).catch(err=>{
    sql.close()
    console.log(err)
  })

  sql.on('error', err=>{
    //error handler
  })

}));


module.exports=router;
