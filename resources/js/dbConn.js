var conn;

$(function() {
  // 初始设定
  getConnection();
});

function getConnection(){
  conn = new ActiveXObject("ADODB.Connection");
  
  var rs = new ActiveXObject("ADODB.Recordset");
  
  try {
    console.log("connection start ");
    var connectionstring = "Provider=OraOLEDB.Oracle.1;Password=fireemblem;Persist Security Info=True;User ID=fireemblem;Data Source=ORA";
    //打开连接
    console.log("open connection");
    conn.open(connectionstring);
    
    var sql = " select * from dual ";
  } catch (e) {
    WScript.Echo(e.message);
  }
}