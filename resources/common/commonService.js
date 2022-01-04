(function ($) {
  $.extend(true, window, {
      'ajaxGet': ajaxGet,
      'ajaxPost': ajaxPost,
      'getValByKey':getValByKey,
      'isEmpty':isEmpty,
      'isNotEmpty':isNotEmpty,
      'isInclude':isInclude,
      'createOptions':createOptions,
      'createCheck':createCheck,
      'createImg':createImg,
      'createElement':createElement,
      'createTable':createTable,
      'popupMsg':popupMsg,
      'closePopupWindow':closePopupWindow,
      'formateDateYMDHMslash':formateDateYMDHMslash,
      'transListToMap':transListToMap,
      'transGirdToMap':transGirdToMap,
      'getUrlParam':getUrlParam,
      'doValidation':doValidation
  });
  
  function ajaxGet(url,jsonData,callback){
      $.ajax({
            type : 'GET',
            url :url,
            data :jsonData,
            dataType : 'json',
            success : callback,
            error:function(data){
                alert(JSON.stringify(data))
            }
        });
  }
  
  function ajaxPost(url,jsonData,callback){
      $.ajax({
            type : 'POST',
            url :url,
            contentType: 'application/json;charset=UTF-8',
            data :JSON.stringify(jsonData),
            dataType : 'JSON',
            success : callback,
            error:function(data){
                alert(JSON.stringify(data));
            }
        });
  }
  
  function getValByKey(key) {
      var value;
      jQuery.i18n.properties({
          name : "message",
          path : "/myapp/resources/",
          language : "",
          mode : "map",
          callback : function() {
              value = jQuery.i18n.prop(key);
          }
      });
      return value;
  }
  
  function isEmpty(arg) {
      arg = $.trim(arg);
      if (typeof arg == 'undefined') {
          return true;
      } else {
          if (typeof arg == 'object') {
              return false;
          } else if (''==arg || null == arg || 'null' == arg || 'NaN' == arg) {
              return true;
          }
          return false;
      }
  }
  
  function isNotEmpty(arg) {
      var rslt = isEmpty(arg) ? false : true;
      return rslt;
  }
  
  /** 数组内是否包含元素
   * @param str 值
   * @param arr 数组
   */
  function isInclude(str,arr) {
    if (typeof arr == "object" && arr.length > 0) {
      var incluedeFlag = false;
      $.each(arr,function(){
        if (str == this || incluedeFlag) {
          incluedeFlag = true;
        }
      });
      return incluedeFlag;
    } else {
      return false;
    }
  }
  
  /** 生成<option>标签
   *
   * @param ele <option>的父标签,如<select><dataset>
   * @param arrs 内容集合,格式[{"code":"A","value":"NM"},{"code":"B","value":"NM2"}]
   */
  function createOptions(ele,arrs,firstBlank){
    if (isNotEmpty(firstBlank)) {
      let optionEle = createElement("option","","");
      ele.appendChild(optionEle);
    }
    $.each(arrs,function(){
      let optionEle = createElement("option","","");
      optionEle.value = this.code;
      optionEle.innerHTML = this.value;
      ele.appendChild(optionEle);
    });
  }
  
  /** 生成单选,复选框
   *
   * @param eleInfo Radio或Checkbox的属性对象{"id":test,"name":"hero.imgSrc",...}
   * @param infoList 内容集合,格式[{"code":"A","value":"NM"},{"code":"B",,"value":"NM2"}]
   * @param parentEle Radio或Checkbox存放位置的父标签
   */
  function createCheck(eleInfo,infoList,parentEle) {
    if (isEmpty(infoList)){
      // 没有设定内容时设置默认值
      infoList = [{"code":"1","value":"Yes"}];
      if ("radio" == eleInfo.type){
        infoList.push({"code":"0","value":"No"});
      }
    }
    
    $.each(infoList,function(){
      var gpEle = createElement("div","","checkItem");
      gpEle.style.display = ""
      var inputEle = createElement("input","","");
      inputEle.name = eleInfo.name;
      inputEle.className = eleInfo.classNm;
      inputEle.id = eleInfo.id;
      inputEle.type = eleInfo.type;
      inputEle.value = this.code;
      // readOnly
      if (eleInfo.readonly) {
        inputEle.setAttribute("disabled","");
      }
      // require
      if (isNotEmpty(eleInfo.require)) {
        inputEle.setAttribute("notempty","true");
      }
      gpEle.appendChild(inputEle);
      
      var labelEle = createElement("label","","");
      labelEle.innerHTML = this.value;
      labelEle.style.width = "auto";
      gpEle.appendChild(labelEle);
      
      parentEle.appendChild(gpEle);
    });
    
    // 只读
    var displayEle = createElement("span","","displayOnly");
    parentEle.appendChild(displayEle);
  }
  
  /** 创建图片元素<img>
   * @param arg js对象,值
   */
  function createImg(path,id,classNm,name){
      var imgEle = createElement('img',id,classNm,name);
      imgEle.src = path;
      return imgEle;
  }
  
  /** 创建html元素<img>
   * @param arg js对象,值
   */
  function createElement(type,id,classNm,name) {
    var ele = document.createElement(type);
    createAttr(ele,"id",id);
    createAttr(ele,"className",classNm);
    createAttr(ele,"name",name);
    return ele;
  }
  
  function createTable(paramObj,dataList){
    console.log(dataList);
    // Table
    var tableEle = createElement("table","","","");
    tableEle.setAttribute("cellspacing",0);
    tableEle.border = "1";
    tableEle.style.width = paramObj.width;
    tableEle.id = paramObj.id;
    
    // Thead
    var thead = createElement("thead","","","");
    var tr = createElement("tr","","","");
    // selectAll
    if (isNotEmpty(paramObj.selectAll)) {
      var th = createElement("th","","","");
      var selectAll = createElement("input","","","selectAll");
      selectAll.type = "checkbox";
      $(selectAll).on("click",function(){
        var tblEle = $(this).parents("table")[0];
        var checkCnt = $(tblEle).find("input[type='checkbox']");
        $(checkCnt).attr("checked",this.checked);
      });
      th.appendChild(selectAll);
      tr.appendChild(th);
    }
    $.each(paramObj.head,function(){
      var th = createElement("th","","","");
      th.innerHTML = this;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    tableEle.appendChild(thead);
    
    // Tbody
    var tbody = createElement("tbody","","","");
    $.each(dataList,function(){
      tr = createElement("tr","","","");
      // selectAll
      if (isNotEmpty(paramObj.selectAll)) {
        var selectTd = createElement("td","","","");
        var checkedEle = createElement("input","","","");
        checkedEle.type = "checkbox";
        selectTd.appendChild(checkedEle);
        tr.appendChild(selectTd);
      }
      // data
      $.each(this,function(j,cell){
        var td = createElement("td","","","");
        td.innerHTML = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    
    });
    tableEle.appendChild(tbody);
    return tableEle;
  }
  
  /** 设置元素属性
   * @param elementObj 对象
   * @param attrNm 属性
   * @param attrValue 值
   */
  function createAttr(elementObj,attrNm,attrValue){
    if (isNotEmpty(attrValue)){
      elementObj[attrNm] = attrValue;
    }
  }
  
  /** 日期转换Data→yyyy/MM/DD HH:MI
  * @param dateVal Data型日期值
  */
  function formateDateYMDHMslash(dateVal) {
    var rst = dateVal.getFullYear();
    rst += "-" + (parseInt(dateVal.getMonth()) +1);
    rst += "-" + dateVal.getDate();
    rst += "T" + dateVal.getHours();
    var sec = dateVal.getSeconds();
    if (parseInt(sec)<10) {
      sec = "0" + sec;
    }
    rst += ":" + sec;
    return rst;
  }
  
  /** 显示错误提示区域块
   *
   */
  function popupMsg(errorMsg){
    $("#popup").show(50);
    $("#messageArea").html(errorMsg);
  }

  /** 关闭错误提示区域
   *
   */
  function closePopupWindow() {
    $("#messageArea").html("");
    $("#popup").hide();
  }
  
  /** 输入验证
   *
   */
  function doValidation(docAreaEle){
    // 清空
    $(".error").prop('class','');
    let errorMsg = "";
    // 首个出错项目
    let firstFlag = false;
    // 验证区域
    let partFlag = isNotEmpty(docAreaEle);
    // 取得输入元素
    let inputEleList;
    if (partFlag) {
      inputEleList = $(docAreaEle).find("input[type='text']");
    } else {
      inputEleList = $("input[type='text']");
    }
    $.each(inputEleList,function(){
      // 可以输入
      if(!this.disabled) {
        let titleEle = $(this).prev()[0];
        let title = titleEle.innerHTML;
        // 必须输入验证
        if(isNotEmpty(this.attributes.notempty) && isEmpty(this.value)) {
          this.placeholder = 'please input value!';
          this.className = this.className + "error";
          //
          title += "未输入<br>";
          errorMsg += title;
          if (!firstFlag) {
            this.focus();
            firstFlag = true;
          }
        }
  
        // 属性验证
        if(isNotEmpty(this.attributes.validation) && isNotEmpty(this.value)) {
          title += "格式不正确<br>";
          errorMsg += title;
          let valType = this.attributes.validation.value;
          // TODO
          if (!firstFlag && false) {
            this.focus();
            firstFlag = true;
          }
        }
      }
    });

    // 单选，复选框
    let radioEles;
    if (partFlag) {
      radioEles = $(docAreaEle).find("input[type='radio'],[type='checkbox']");
    } else {
      radioEles = $("input[type='radio'],[type='checkbox']");
    }
    let namesCond = [];
    $.each(radioEles,function(){
      if(this.disabled){
        return;
      }
      if (this.name.indexOf(".")>0) {
        if(!isInclude(this.name , namesCond)){
          namesCond.push(this.name);
        } else {
          return;
        }
      }
    });
    
    // 表单对象Json
    let formObj = $("#infoForm").serializeObject();
    // 验证单选，复选框
    $.each(namesCond,function(){
      let radioEle = $("input[name='"+this+"']")[0];
      let parentEle = $(radioEle).parents("div[class='inputCell']")[0];
      let msgSpan = $(parentEle).find("span")[0];
      msgSpan.innerHTML = "";
      
      let titleEle = $(parentEle).find("label")[0];
      let title = titleEle.innerHTML;
      title += "未选择<br>";
      errorMsg += title;
      
      let value = "";
      // 判断是否为对象
      let objNm;
      let attrNm;
      if (this.indexOf(".") > 0) {
        objNm = this.split(".")[0];
        attrNm = this.split(".")[1];
        // Null
        if (isEmpty(formObj[objNm]) || isEmpty(formObj[objNm][attrNm])){
          value = "";
        } else {
          value = formObj[objNm][attrNm];
        }
      } else {
        value = formObj[objNm];
      }
      // 验证
      if (isNotEmpty(radioEle.attributes.notempty) && isEmpty(value)) {
          msgSpan.innerHTML = attrNm + " input please!";
          firstFlag = true;
          return;
        }
    });
  
    //
    if(!firstFlag) {
      console.dir(formObj);
      return false;
    } else {
      popupMsg(errorMsg);
      return true;
    }
  }
  
  /** 将list进行group处理成map
   * @param dataList 集合数据
   * @param mapKey 分组字段
   * @param singleFlag 单独对象
   */
  function transListToMap(dataList,mapKey,singleFlag) {
    var resultMap = {};
    $.each(dataList,function(i,data){
      var keyValue = data[mapKey];
      // map中存在check
      if(isEmpty(resultMap[keyValue])) {
        resultMap[keyValue] = [];
      }
      // 不重复flag
      if (singleFlag) {
        resultMap[keyValue] = data;
        return;
      } else if (isNotEmpty(keyValue) && '99'!=keyValue){
        resultMap[keyValue].push(data);
      }
    });
    return resultMap;
  }
  
  /** 多对多网状结构转换为某一属性的1对多Map
  * 
  * @param dataList 元数据集合
  * @param attrId Group化项目名
  * @param strSplit 分割符
  * @param uniqueList 属性集合List
  */
  function transGirdToMap(dataList,attrId,strSplit,uniqueList){
    var resultMap = {};
    var code = 1;
    $.each(dataList,function(i,data){
      var attrList;
      if (isNotEmpty(strSplit)) {
        attrList = data[attrId].split(strSplit);
      } else {
        attrList = data[attrId];
      }
      // 循环属性
      $.each(attrList,function(j,attr){
        if (isEmpty(resultMap[attr])) {
          resultMap[attr] = [];
          resultMap[attr].push(data.id);
          uniqueList.push({"code":code++,"value":attr});
        } else {
          resultMap[attr].push(data.id);
        }
      });
    });
    return resultMap;
  }
  
  /** 取得get请求url中的参数
   * @return 参数对象{'key' : value1 ,'key2' : value2}
   */
  function getUrlParam(){
    let paramText = window.location.search;
    paramText = paramText.replace('?','');
    paramText = paramText.split('&');
    let paramObj = {};
    $.each(paramText,function(){
      let key = this.split('=')[0];
      let val = this.split('=')[1];
      paramObj[key] = val;
    });
    return paramObj;
  }

  $.fn.serializeObject = function(){
      var jsonObj = {};
      var formParam = this.serializeArray();
      $.each(formParam,function(){
        if ("undefined" != this.name) {
          var keyName = this.name.split('.');
          if(keyName.length>1){
              var innerObjKey = keyName[0];
              if(jsonObj.hasOwnProperty(innerObjKey)){
                  jsonObj[this.name.split('.')[0]][this.name.split('.')[1]] = this.value || '';
              } else {
                  jsonObj[this.name.split('.')[0]] = {};
                  jsonObj[this.name.split('.')[0]][this.name.split('.')[1]] = this.value || '';
              }
          } else {
              if(jsonObj.hasOwnProperty(this.name)){
                jsonObj[this.name].push(this.value || '');
              } else {
                jsonObj[this.name] = this.value;
              }
          }
        }
      });
      return jsonObj;
  }
  
})(jQuery);
