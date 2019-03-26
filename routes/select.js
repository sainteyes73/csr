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
    encrypt:true
  }
}
router.get('/',catchErrors(async(req,res,next)=>{
  sql.connect(config).then(pool=>{
    return pool.request()
    //.input('select_sal',sql.Int,value)//input parameter
    .query('select UserName, UserSeq from dbo._TCAUser')//query
  }).then(result=>{
    console.dir(result.recordset);
    return res.render('select',{results:result})
  /*
    return pool.request()
    .input('input_parameter',sql.Int, value)
    .output('output_parameter',sql.VarChar(50))
    .execute('procedure_name')
    */
  }).then(final=>{
    return sql.close()
  }).catch(err=>{
    console.log(err)
    return sql.close()
  })

  sql.on('error', err=>{
    //error handler
  })

}));


module.exports=router;
