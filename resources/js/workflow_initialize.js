/** 
 * 初期化处理
 */
function initlize(){
  // 初期化
  document.getElementById("progressBar").innerHTML = "";
  //
  var mainEle = document.getElementsByTagName("main")[0].offsetWidth;
  var count = wkJson.stepsStr.length;
  var cellWidth = mainEle/count;
  var currStep = 0;
  // 进度条
  $.each(wkJson.stepsStr,function(i,ele){
    // 状态图标
    var statusEle = createElement("div",this,"status","");
    statusEle.style.width = cellWidth+"px";
    
    // 图标主体和方向箭头
    var preEle = createElement("div","","wk_icon_pre","");
    var stepEle = createElement("div","prog_step_"+i,"wk_icon","");
    stepEle.style.width = (cellWidth-10)+"px";
    var nextEle = createElement("div","","wk_icon_next","");
    
    // 文字
    var stepInfo = wkJson.steps[this];
    stepEle.innerHTML = stepInfo.name;
    
    // 当前状态颜色设置
    if(CURRENT_STEP == this) {
      currStep = i;
      stepEle.className = "wk_icon current";
      nextEle.className = "wk_icon_next currentNext";
    }

    // 第一个没有前方向,最后一个没有后方向
    if (i>0) {
      statusEle.appendChild(preEle);
    }
    statusEle.appendChild(stepEle);
    if (i < wkJson.stepsStr.length - 1) {
      statusEle.appendChild(nextEle);
    }
    statusEle.setAttribute("onclick","doEvent('"+this+"')");
    
    // 添加
    document.getElementById("progressBar").appendChild(statusEle);
  });
  // 前面的进度颜色渐变
  var times = 1;
  for (var i = currStep-1;i >= 0;i--) {
    var alpha = 1 - (times*0.2);
    times++;
    var stepEle2 = document.getElementById("prog_step_"+i);
    var styleBkg = "rgb(95,84,251,"+alpha+")";
    stepEle2.style.backgroundColor = styleBkg;
    var iconEle = $(stepEle2).next()[0];
    iconEle.style.borderLeft = "10px solid " + styleBkg;
  }

  
  // 按钮
  document.getElementById("eventArea").innerHTML = "";
  for(var i = wkJson.steps[CURRENT_STEP].actions.length; i > 0 ; i--) {
    var eventInfo = wkJson.steps[CURRENT_STEP].actions[i-1];
    var btnEle = createElement("button",CURRENT_STEP+"-"+eventInfo.step,"btn","");
    var clNm = wkJson.steps[CURRENT_STEP].clnm;
    btnEle.innerHTML = eventInfo.name;
    // 当前Step内状态切换
    if ("A-9" != CURRENT_STEP) {
      if (parseInt(eventInfo.step) > 0) {
        btnEle.setAttribute("onclick","doStep('"+eventInfo.step+"'"+",'"+CURRENT_STEP+"'"+",'"+clNm+"')");
        if (parseInt(eventInfo.step) > 1) {
          btnEle.setAttribute("disabled",true);
        }
      } else {
        // 前往下一个step
        btnEle.setAttribute("onclick","doEvent('"+eventInfo.step+"')");
        if ("Back" != eventInfo.name) {
          btnEle.setAttribute("disabled",true);
        }
      }
    } else {
      if (parseInt(eventInfo.step) > 0) {
        btnEle.setAttribute("onclick","doStep('"+eventInfo.step+"'"+",'"+CURRENT_STEP+"'"+",'"+clNm+"')");
      } else {
        // 前往下一个step
        btnEle.setAttribute("onclick","doEvent('"+eventInfo.step+"')");
      }
    }
    // 添加
    document.getElementById("eventArea").appendChild(btnEle);
  }
}

/**
 * 生产状态区域DIV
 *
 * @param obj 状态Object(包含状态，布局信息等情报)
 * @param formEle 生产DIV的父DIV对象（Element）
 */
function initEditArea(obj,parentEle){
  // 空判断
  if (isNotEmpty(document.getElementById(obj.id))) {
    document.getElementById(obj.id).style.display = "";
    return;
  }
  
  // 分组表示场合
  if ("group"==obj.layout) {
    
    var stepEle = createElement("div",obj.id,"group-layout","");
    // 标题
    /**/
    var titleEle = createElement("span","","title","");
    titleEle.innerHTML = obj.title;
    stepEle.appendChild(titleEle); 
    
    // Group标签标题部
    var titleEle = createElement("div","","group-title","");
    var firstTagId = "";
    $.each(obj.sections,function(){
      var layoutTitle = createElement("div","","layout-title","");
      layoutTitle.id = "title-" + obj.id + "-" + this;
      layoutTitle.innerHTML = obj.layoutGroup[this].title;
      titleEle.appendChild(layoutTitle);
      
      // 第一个标签默认选中
      if ("" == firstTagId) {
        firstTagId = obj.id + "-" + this;
        layoutTitle.className += " current-layout"; 
      }
    });
    stepEle.appendChild(titleEle);
    
    // 标签对应的显示部分
    $.each(obj.sections,function(){
      var layoutId = obj.id + "-" + this;
      var singleLayout = createElement("div",layoutId,"group-section","");
      // 迭代
      initEditArea(obj.layoutGroup[this],singleLayout);
      stepEle.appendChild(singleLayout);
    });
    
    parentEle.appendChild(stepEle);
    
    // 第一个标签默认显示
    $("#"+firstTagId).show();
    
    // 点击标题切换
    $("div[class^='layout-title']").on('click',function(){
      showSection(this);
    });
    
  } else if ("single"==obj.layout){
    // 实际编辑区域
    var baseInfoEle = createElement("div",obj.id,"editArea","");
    // 标题
    var titleEle = createElement("span","","title","");
    titleEle.innerHTML = obj.title;
    baseInfoEle.appendChild(titleEle);

    $.each(obj.detail.rows,function(i,rows){
      var inputRowEle = createElement("div","","inputRow","");
      // 排列方向
      if ("vertical" == rows.design) {
        inputRowEle.className = "inputRow vertical";
      }
      //prop
      $.each(rows.items,function(j,prop){
        var inputCell = createElement("div","","inputCell","");
        // 属性Title
        var lblEle = createElement("label","","","");
        lblEle.innerHTML = prop.name;
        inputCell.appendChild(lblEle);
        // 属性Input
        var inputEle = createElement("input",obj.id + "_" + prop.property,"",obj.id + "." + prop.property);
        var inputType = prop.type;
        inputEle.style = isEmpty(prop.style) ? "":prop.style;
        if (isNotEmpty(prop.readonly)) {
          inputEle.setAttribute("readonly","");
        }
        
        //
        var hideEle = null;
        
        // 输入框
        if ("text" == inputType) {
          inputEle.type = "text";
          inputEle.value = prop.value;
        // 下拉菜单
        } else if ("select" == prop.type){
          inputEle = createElement("select",obj.id + "_" + prop.property,"",obj.id + "." + prop.property);
          createOptions(inputEle,masterInfo[prop.masterId]);
          
        // Autocomplete
        } else if ("autocomplete" == inputType) {
          inputEle.type = "text";
          inputEle.autocomplete = "on";
          inputEle.setAttribute("list",prop.masterId);
          inputEle.value = prop.value;
          
          var datalistEle = createElement("datalist",prop.masterId,"",obj.id + "." + prop.property);
          createOptions(datalistEle,masterInfo[prop.masterId]);
          document.getElementById("hideArea").appendChild(datalistEle);
          
        // 单选,复选按钮
        } else if ("radio" == inputType || "checkbox" == inputType){
          inputEle = null;
          // 属性设定
          var eleInfo = {
            "name" : obj.id + "." + prop.property,
            "id" : "",
            "classNm" : "",
            "type" : inputType,
            "require" : prop.require,
            "readonly" : isNotEmpty(prop.readonly)
          };
          createCheck(eleInfo,masterInfo[prop.masterId],inputCell);
          
        // 单纯表示项目
        } else if ("label" == inputType){
          inputEle = createElement("label","Lbl_" + obj.id + "_" + prop.property,"","");
          inputEle.innerHTML = prop.value;
          inputEle.style.width = "auto";
          // 隐藏项
          hideEle = createElement("input",obj.id + "_" + prop.property,"",obj.id + "." + prop.property);
          hideEle.type = "hidden";
          hideEle.value = prop.value;
        } else if ("textarea" == inputType){
          inputEle = createElement("textarea",obj.id + "_" + prop.property,"",obj.id + "." + prop.property);
          inputEle.value = prop.value;
          inputEle.style = isEmpty(prop.style) ? "":prop.style;
          inputEle.rows = 7;
          inputEle.cols = 80;
        // 日期控件
        } else if ("datetime" == inputType) {
          inputEle.type = "datetime-local";
          inputEle.className = "dateTime";
          inputEle.value = prop.value;
          inputEle.removeAttribute("readonly");
        // 按钮
        } else if ("button" == inputType) {
          inputEle = createElement("button","","cell_btn","","");
          inputEle.type = "button"
          inputEle.setAttribute("onclick",prop.value);
          inputEle.innerHTML = prop.name;
        }
        
        if (isNotEmpty(inputEle)) {
          // require
          if (isNotEmpty(prop.require)) {
            inputEle.setAttribute("notempty","true");
          }
          inputCell.appendChild(inputEle);
          
          // 验证信息表示
          var displayEle = createElement("span","","displayOnly","");
          inputCell.appendChild(displayEle);
          
          if (isNotEmpty(hideEle)) {
            inputCell.appendChild(hideEle);
          }
        }
        inputRowEle.appendChild(inputCell);
      });
      baseInfoEle.appendChild(inputRowEle);
    });
        
    // 列表表示
    if (isNotEmpty(obj.head)){
      // Table
      var tableEle = createElement("table","","","");
      tableEle.setAttribute("cellspacing",0);
      tableEle.border = "1";
      tableEle.style.width = obj.width;
      tableEle.id = obj.id;
      
      // Thead
      var thead = createElement("thead","","","");
      var tr = createElement("tr","","","");
      // selectAll
      if (isNotEmpty(obj.selectAll)) {
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
      $.each(obj.head,function(){
        var th = createElement("th","","","");
        th.innerHTML = this;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      tableEle.appendChild(thead);
      
      // Tbody
      var tbody = createElement("tbody","","","");
      $.each(masterInfo[obj.info],function(){
        tr = createElement("tr","","","");
        // selectAll
        if (isNotEmpty(obj.selectAll)) {
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
      
      baseInfoEle.appendChild(tableEle);
    }
      
    parentEle.appendChild(baseInfoEle);
  }
}

/**
 * LayoutGroup切换
 */
function showSection(divEle){
  var parentEle = $(divEle).parents()[0];
  $(parentEle).children().attr('class','layout-title');
  divEle.className = 'layout-title current-layout';
  var nm = divEle.id.replace("title-","");
  $("div[class^='group-section']").hide();
  $("#"+nm).show();
}

/**
 * ICON初期化
 * @return 当前St的父元素
 */
function arrIconReset(){
  // 消息清空
  var curStEle = $("div[class='wk_icon current']")[0];
  curStEle.className = "wk_icon";
  // 箭头
  var nextIcon = $(curStEle).next()[0];
  if(null != nextIcon) {
    nextIcon.className = nextIcon.className.replace(' currentNext','');
  }
  return $(curStEle).parents()[0];
}

/**
 * 元素设置颜色
 * @param targetEle 动作的下一步父元素
 */
function arrIconSet(targetEle){
  // 活性控制
  $('#btn_pre').prop('disabled','');
  $('#btn_next').prop('disabled','');
  if(isEmpty($(targetEle).prev()[0])) {
    $('#btn_pre').prop('disabled','true');
  }
  if(isEmpty($(targetEle).next()[0])) {
    $('#btn_next').prop('disabled','true');
  }

  $.each($(targetEle).children(),function(){
    var clsNm = this.className;
    if('wk_icon'==clsNm){
      this.className = clsNm + ' current';
    } else if('wk_icon_next'==clsNm){
      this.className = clsNm + ' currentNext';
    }
  });

  // 页面重置
  initlize();
}

/**
 * 进度条切换
 */
function doEvent(step){
  var curSt = CURRENT_STEP.split("-")[1];
  var tgtSt = step.split("-")[1];
  if (parseInt(tgtSt) > parseInt(curSt)) {
    if (doValidation()){
      return;
    }
  }
  // 初始化
  arrIconReset();
  // 对象取得
  var targetEle = document.getElementById(step);
  // 设置当前step
  CURRENT_STEP = step;

  // 状态Step图标重设
  arrIconSet(targetEle);
  
  // 内容刷新
  $.each($(formEle).children(),function(){
    if ("baseInfo" != this.id) {
      $(this).hide();
    }
  });
  var classNm = wkJson.steps[step].clnm;
  initEditArea(contract[classNm],formEle);
}
