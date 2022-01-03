const webSqlObj = new webSqlManagement();
var setUp = webSqlObj.setUp;
// 上次执行过的检索SQL
var searchedQuary;
// 上次检索后的结果对象
var selectedData;
// 默认排序
var orderby = 'asc';

$(function() {
  //setUp.table = jsonData.tableName;
});

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
  webSqlObj.executeQuary(createTblSql);
}

/** 批量插入数据
 *
 */
function insertDataList() {
  let tblNm = jsonData.tableName;
  $.each(jsonData.dataList,(i,recoderObj) => {
    webSqlObj.insertData(tblNm,recoderObj);
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
  webSqlObj.insertData(setUp.table,recoderObj);
  reflashTable(searchedQuary);
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
    webSqlObj.updateDate(setUp.table,id,recoderObj);
    reflashTable(searchedQuary);
  }
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
  setUp.pageNo = $("#currentPageNo").val();
  setUp.orderByTitle = document.getElementById('orderByFlag') ? 'true' : '';
  setUp.fifter = document.getElementById('fifterFlag') ? 'true' : '';
  searchedQuary = webSqlObj.getSelectQuary(setUp);
  webSqlObj.executeQuary(searchedQuary,[],function(result){
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
    webSqlObj.executeQuary(sql,[],function(result){
    });
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
  searchedQuary = webSqlObj.getSelectQuary(setUp);
  reflashTable(searchedQuary);
}

/** 筛选数据
 * 
 */
function fifterRows(column,inputEle) {
  conditionQuery = column + " like '%" + inputEle.value + "%'";
  setUp.condition = conditionQuery;
  searchedQuary = webSqlObj.getSelectQuary(setUp);
  reflashTable(searchedQuary);
}

/** 刷新结果区域
 *
 */
function reflashTable(sql) {
  webSqlObj.executeQuary(sql,setUp.paramters,function(result){
    console.log(result.rows);
    document.getElementById('detailRows').outerHTML = '';
    document.getElementById('mianTbl').appendChild(createTbody(result));
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
    let classNm = isNotEmpty(setUp.orderByTitle) ? "orderbyCol " : "";
    let th = createElement("th","",classNm,"");
    th.innerHTML = this;
    // orderBy
    if (isNotEmpty(setUp.orderByTitle)) {
      th.setAttribute('onClick','reSearch("'+this+'")');
    }
    tr.appendChild(th);
    
    // fifter
    let fifterTh = createElement("th","","","");
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
      let id = "row" + i + "_" + key;
      let td = createElement("td",id,'',"");
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

/** 下拉框从codeMaster中取值设定选项
 *
 */
function getOptionsFromCodeMaster(selectEle,categoryId){
  let sql = "select * from CODE_MASTER WHERE categoryId = ? ";
  webSqlObj.executeQuary(sql,[categoryId],function(result){
    selectEle.appendChild(createElement('option','','',''));
    $.each(result.rows,function(){
      let optionEle = createElement('option','','','');
      optionEle.value = this.code;
      optionEle.innerHTML = this.value;
      selectEle.appendChild(optionEle);
    })
  });
}