const shortName = 'db_html';
const version = '1.0';
const displayName = 'Display Information';
const maxSize = 5*1024*1024;
const positionColIndex = 0;

// 检索设定参数
var setUp = {
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

// 上次执行过的检索SQL
var searchedQuary;

// 上次检索后的结果对象
var selectedData;

// 默认排序
var orderby = 'asc';

/** 创建表
 *
 */
function createTable(){
  let createTblSql = 'create table if not exists ' + jsonData.tableName +
    '(id integer primary key autoincrement'
  $.each(jsonData.columns,function(){
    createTblSql += ',' + this.name + ' ' + this.type +'(' + this.length +')';
  });
  createTblSql += ')';
  executeQuary(createTblSql);
}

/** 批量插入数据
 *
 */
function insertDataList() {
  let tblNm = jsonData.tableName;
  $.each(jsonData.dataList,(i,recoderObj) => {
    insertData(tblNm,recoderObj);
  });
}

/** 当前行数据插入
 *
 */
function insertRow(btnEle){
  let recoderObj = {};
  let rowEle = $(btnEle).parents()[1];
  $.each($(rowEle).find("input"),function() {
    recoderObj[this.name] = this.value;
  });
  insertData(setUp.table,recoderObj);
  reflashTable(searchedQuary);
}

/** 插入数据
 *
 */
function insertData(tableName,recoderObj) {
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
  executeQuary(insertQuery,paramters);
}

/** 编辑/更新当前行
 *
 */
function updateRow(id,btnEle) {
  let rowEle = $(btnEle).parents()[1];
  let tdList = $(rowEle).children();
  if($(rowEle).find("input").length <= 1) {
    $.each(tdList,function(i,tdEle){
      if (i > 1 && i < tdList.length - 1) {
        let val = this.innerHTML;
        let name = this.id.split('_')[1];
        this.innerHTML = '';
        let inputEle = createElement('input','','',name);
        inputEle.value = val;
        this.appendChild(inputEle);
      }
    });
  } else {
    let recoderObj = {};
    $.each($(rowEle).find("input"),function(){
      if('checkbox' != this.type) {
        recoderObj[this.name] = this.value;
      }
    });
    updateDate(setUp.table,id,recoderObj);
    reflashTable(searchedQuary);
  }
}

/** 更新数据
 *
 */
function updateDate(tableName,id,recoderObj) {
  let updateQuery = 'UPDATE ' + tableName + " SET ";
  let paramters = [];
  $.each(recoderObj,function(col,value){
    value = 'null' == value ? '' : value;
    updateQuery += col + " = ? ,"
    paramters.push(value);
  });
  updateQuery += ' id = ' + id + ' WHERE id = ' + id;
  console.log(updateQuery+paramters);
  executeQuary(updateQuery,paramters);
}

/** 删除表
 * 
 */
function dropTable(tableNm) {
  executeQuary('drop table ' + tableNm);
}

/** 创建select文
 * 
 */
function getSelectQuary() {
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
  executeQuary(countSql,paramters,function(result){
    let totalCnt = result.rows[0].rstCnt;
    $("#totalPage").html(parseInt(totalCnt/setUp.pageSize) + 1);
    $("#currentPageNo").val(setUp.pageNo);
  });
  searchedQuary = mainSql;
  return mainSql;
}

/** 检索DB
 *
 */
function searchQuary() {
  //
  if(isEmpty($("#selectedTable").val())){
    return;
  }
  let selectedVal = $("#selectedTable").val();
  setUp.table = selectedVal.split(',')[0];
  setUp.tableWidth = selectedVal.split(',')[1] + "px";
  setUp.pageSize = $("#pageSize").val();
  setUp.orderByTitle = document.getElementById('orderByFlag') ? 'true' : '';
  setUp.fifter = document.getElementById('fifterFlag') ? 'true' : '';
  executeQuary(getSelectQuary(),[],function(result){
    selectedData = result.rows;
    makeTableElement(result,"mianTbl");
  });
}

/** 自定义检索
 * 
 */
function excuteCustQuery(){
  let sql = $('#custQuery').val();
  let keyword = sql.split(' ')[0].toLowerCase();
  console.log(keyword);
  if ('select' == keyword) {
    // 表名
    let tblStartStr = sql.substring(sql.indexOf('from'));
    setUp.table = tblStartStr.split(' ')[1];
    // 条件式
    let condStartStr = tblStartStr.substring(tblStartStr.indexOf('where'));
    setUp.condition = condStartStr.split(' ')[1];
    setUp.paramters = [];
    searchQuary();
  } else {
    executeQuary(sql,[],function(result){
      showUpdateMsg(keyword,result);
    });
  }
}

/** 自定义执行结果表示
 *
 */
function showUpdateMsg(type,result){
  if('update' == type) {
    alert("执行成功,"+result.rowsAffected+"件数据被更新");
  } else if ('insert' == type) {
    alert("追加成功");
  } else if ('delete' == type) {
    alert("删除成功");
  }
}

/** 点击列重新排序
 *
 */
function reSearch(columnName) {
  // 升降序切换
  orderby = 'asc' == orderby ? 'desc' : 'asc';
  // sql排序文字列
  orderbyQuary = columnName + ' ' + orderby;
  setUp.orderBy = orderbyQuary;
  reflashTable(getSelectQuary());
}

/** 筛选数据
 * 
 */
function fifterRows(column,inputEle) {
  conditionQuery = column + " like '%" + inputEle.value + "%'";
  setUp.condition = conditionQuery;
  reflashTable(getSelectQuary());
}

/** 刷新结果区域
 *
 */
function reflashTable(sql) {
  executeQuary(sql,setUp.paramters,function(result){
    console.log(result.rows);
    document.getElementById('detailRows').outerHTML = '';
    document.getElementById('mianTbl').appendChild(createTbody(result));
  });
}

/** WebSql执行sql,其他数据库时使用ajax请求用法基本一致
 *
 */
function executeQuary(query,paramters,callback){
  console.log(query);
  let db = openDatabase(shortName,version,displayName,maxSize);
  db.transaction(tx => {
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

/** 显示检索数据一览
 * 
 */ 
function makeTableElement(dataList,tblEleId){
  // 结果列
  let columns = Object.keys(dataList.rows[0]);
  // 设定参数更新
  setUp.head = columns;
  // Table
  var tableEle = document.getElementById(tblEleId);
  mianTbl.innerHTML = "";
  tableEle.style.width = setUp.tableWidth;
  // Thead
  var thead = createElement("thead","","","");
  var tr = createElement("tr","","","");
  // fifter
  var fifterRow = createElement("tr","","fifterRow","");
  // selectAll
  if (isNotEmpty(setUp.selectAll)) {
    var th = createElement("th","","col-position","");
    // fifter row
    fifterRow.appendChild(createElement("th","","col-position",""));
    
    var selectAll = createElement("input","","","selectAll");
    selectAll.type = "checkbox";
    // 全选事件
    selectAll.setAttribute('onclick','selectAlll(this)');
    th.appendChild(selectAll);
    tr.appendChild(th);
  }

  // 结果设定
  $.each(setUp.head,function(i){
    let thClass = "";
    if(i < positionColIndex) {
      thClass = "col-position";
    } else if (i == positionColIndex) {
      thClass = "re-position";
    }
    let classNm = isNotEmpty(setUp.orderByTitle) ? "orderbyCol " : "";
    let th = createElement("th","",classNm + thClass,"");
    th.innerHTML = this;
    // orderBy
    if (isNotEmpty(setUp.orderByTitle)) {
      th.setAttribute('onClick','reSearch("'+this+'")');
    }
    tr.appendChild(th);
    
    // fifter
    let fifterTh = createElement("th","",thClass,"");
    // 设置id属性,后面追加 更新入力框设定name用
    let inputCol = createElement("input","","","fifter_"+this);
    // 筛选事件
    inputCol.setAttribute('onChange','fifterRows("'+this+'",this)')
    fifterTh.appendChild(inputCol);

    fifterRow.appendChild(fifterTh);
  });
  // 行事件
  let eventTh = createElement("th","","","");
  eventTh.innerHTML = 'Action';
  tr.appendChild(eventTh);
 
  thead.appendChild(tr);
  
  // 筛选功能设定有
  if (isNotEmpty(setUp.fifter)) {
    fifterRow.appendChild(createElement("th","","",""));
    thead.appendChild(fifterRow);
  }
  tableEle.appendChild(thead);
  
  // tbody
  tableEle.appendChild(createTbody(dataList));
  //document.getElementById('displayArea').appendChild(tableEle);
}

/** 显示检索结果
 *
 */
function createTbody(dataList){
  // Tbody
  var tbody = createElement("tbody","detailRows","","");
  $.each(dataList.rows,function(i){
    tr = createElement("tr","","","");
    // selectAll
    if (isNotEmpty(setUp.selectAll)) {
      let selectTd = createElement("td","","col-position","");
      let checkedEle = createElement("input","","","");
      checkedEle.type = "checkbox";
      checkedEle.setAttribute('onchange','selectRow(this)');
      selectTd.appendChild(checkedEle);
      tr.appendChild(selectTd);
    }
    // data
    let j = 0;
    $.each(this,function(key,cell){
      let thClass = "";
      if(j < positionColIndex) {
        thClass = "col-position";
      } else if (j == positionColIndex) {
        thClass = "re-position";
      } 
      let id = "row" + i + "_" + key;
      let td = createElement("td",id,thClass,"");
      td.innerHTML = cell;
      tr.appendChild(td);
      j++;
    });
    // 事件列
    let eventTd = createElement("td","","eventCol","");
    // 数据的主键ID
    let id = this.id;
    // 更新按钮
    let updateBtn = createElement("button","","rowBtn","");
    updateBtn.style = "button";
    updateBtn.innerHTML = "更新";
    updateBtn.setAttribute('onclick',"updateRow('"+this.id+"',this)");
    eventTd.appendChild(updateBtn);
    
    // 删除按钮
    let delBtn = createElement("button","","rowBtn","");
    delBtn.style = "button";
    delBtn.innerHTML = "删除";
    delBtn.setAttribute('onclick',"delete('"+this.id+"')");
    eventTd.appendChild(delBtn);

    tr.appendChild(eventTd);
    // event
    tbody.appendChild(tr);
  });
  return tbody;
}

/** 下拉框从codeMaster中取值设定选项
 *
 */
function getOptionsFromCodeMaster(selectEle,categoryId){
  let sql = "select * from CODE_MASTER WHERE categoryId = ? ";
  executeQuary(sql,[categoryId],function(result){
    selectEle.appendChild(createElement('option','','',''));
    $.each(result.rows,function(){
      let optionEle = createElement('option','','','');
      optionEle.value = this.code;
      optionEle.innerHTML = this.value;
      selectEle.appendChild(optionEle);
    })
  });
}

/** 全选/全不选
 *
 */
function selectAlll(checkAllEle){
  $.each($("#detailRows").find("input[type='checkbox']"),function(){
    this.checked = checkAllEle.checked;
    selectRow(this);
  });
}

/** 选中当前行
 *
 */
function selectRow(checkEle) {
  let classNm = checkEle.checked ? 'selected-row' : '';
  $(checkEle).parents()[1].className = classNm;
}

/** 新加一行
 *
 */
function addLine(){
  // 取得一条基础行
  let tbody = document.getElementById('detailRows');
  let rowEle = $(tbody).children()[0];
  
  // 新加一行
  let newRow = createElement("tr","","","");
  
  // 列数(最后一列添加按钮)
  let maxLength = $(rowEle).children().length;
  
  $.each($(rowEle).children(),function(i,tdEle){
    // 列
    let newTd = createElement("td","","","");
    // 选择框和ID列不处理,最后一列添加按钮
    if(i>1 && i < maxLength-1) {
      // 将基础列的表中列名取出设置name属性
      let name = tdEle.id.split("_")[1];
      let inputEle = createElement("input","","",name);
      // 自适应宽度
      inputEle.style.width = tdEle.clientWidth -10 + "px";
      // 默认值
      inputEle.value = tdEle.innerHTML;
      // 清空内容放入输入框
      newTd.innerHTML = "";
      newTd.appendChild(inputEle);
      
    } else if (i == maxLength-1) {
      // 往DB追加按钮
      let addBtn = createElement("button","","rowBtn","");
      addBtn.style = "button";
      addBtn.innerHTML = "追加";
      addBtn.setAttribute('onclick',"insertRow(this)");
      newTd.appendChild(addBtn);
    }
    newRow.appendChild(newTd);
  });
  tbody.appendChild(newRow);
}
