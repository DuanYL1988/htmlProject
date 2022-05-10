/** WEBSQL管理
 *
 */
class webSqlManagement {
  // 构造函数
  constructor() {
    this.db = openDatabase('db_html','1.0','Display Information',5*1024*1024);
    this.setUp = {
      "head" : "",
      "tableWidth" : "",
      "table" : "",
      "condition" : "",
      "paramters" : [],
      "orderBy" : "",
      "pageNo" : "1",
      "pageSize" : "15",
      "orderByTitle" : "",
      "fifter" : "",
      "selectAll" : "true",
    };
  }
  // 刷入数据
  insertData(tableName,recoderObj){
    let colSql = "insert into "+ tableName +"("
    let valSql = " values (";
    let paramters = [];
    $.each(recoderObj,(column,value)=>{
      colSql += column;
      paramters.push(value);
        colSql += ",";
        valSql += "?,";
    });
    let insertQuery = colSql.substring(0,colSql.length-1) + ")" + valSql.substring(0,valSql.length-1) + ")";
    this.executeQuary(insertQuery,paramters);
  }
  // 更新数据
  updateDate(tableName,id,recoderObj) {
    let updateQuery = 'UPDATE ' + tableName + " SET ";
    let paramters = [];
    $.each(recoderObj,function(col,value){
      value = 'null' == value ? '' : value;
      updateQuery += col + " = ? ,"
      paramters.push(value);
    });
    updateQuery += ' id = ' + id + ' WHERE id = ' + id;
    console.log(updateQuery+paramters);
    this.executeQuary(updateQuery,paramters);
  }
  // 执行SQL
  executeQuary(query,paramters,callback){
    console.log(query);
    //let db = openDatabase(shortName,version,displayName,maxSize);
    this.db.transaction(tx => {
      tx.executeSql(query,paramters,
        (tx,result) => {
          console.log('SQL-success:' + result);
          console.dir(result);
          if (typeof callback == 'function') {
            callback(result);
          }
        },
        (tx,error) => {
          console.log('SQL-filed:' + error.message);
        }
      )
    });
  }
  // 生成Select文
  getSelectQuary(setUp) {
    let sql =setUp.table + " WHERE 1 = 1 ";
    let paramters = [];
    // 检索条件
    if(isNotEmpty(setUp.condition)){
      if (typeof setUp.condition == "object") {
        // 传入键值对
        $.each(setUp.condition,function(col,val){
          sql += " and col = ?";
          paramters.push(val);
        });
      } else {
        // 传入检索文字列
        sql += " and " + setUp.condition;
      }
    }
    // 排序
    if(isNotEmpty(setUp.orderBy)){
      sql += " ORDER BY " + setUp.orderBy;
    }
    // 分页
    if(isNotEmpty(setUp.pageNo)){
      let start = setUp.pageSize * (setUp.pageNo-1);
      sql += " limit " + start + "," + setUp.pageSize;
    }
    let countSql = "SELECT COUNT(*) AS rstCnt FROM " + sql;
    let mainSql = "SELECT * FROM " + sql;
    setUp.paramters = paramters;
    // 件数
    this.executeQuary(countSql,paramters,function(result){
      let totalCnt = result.rows[0].rstCnt;
      $("#totalPage").html(parseInt(totalCnt/setUp.pageSize) + 1);
      $("#currentPageNo").val(setUp.pageNo);
    });
    return mainSql;
  }
}
