/** 
 * 初期化处理
 */
function initlize(progressData,detailData,progBarId,btnAreaId,formId){
  let currStp = progressData.currentStep;
  // 进度条
  createProgressBarArea(progBarId,progressData,currStp);
  //
  $.each(Object.keys(contract),function(){
    initEditArea(progressData,contract[this],formId,btnAreaId);
  });
  // 
  displayArea(formId,progressData.steps[currStp].clnm);
}

/**
 * 创建进度条
 * @param areaId DIV元素ID
 * @param wkJson JSON数据
 */
function createProgressBarArea(areaId,wkJson,currentStep){
  let progressBarEle = document.getElementById(areaId);
  // 没有进度条区域
  if (isEmpty(progressBarEle)) {
    return;
  }
  // 初期化
  progressBarEle.innerHTML = "";
  // 取得宽度
  var mainEle = document.getElementsByTagName("main")[0].offsetWidth;
  // STEP数
  var count = wkJson.stepsStr.length;
  // 单个Step宽度
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
    if(currentStep == this) {
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
    statusEle.setAttribute("onclick","doEvent('"+this+"','"+currentStep+"')");
    
    // 添加
    progressBarEle.appendChild(statusEle);
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
  
}

/**
 * 创建动作区域
 * @param areaId DIV元素ID
 * @param wkJson JSON数据
 * @param actionArr Action动作集合
 */
function createButtonArea(wkJson,stepName) {
  var actionArr = wkJson.steps[stepName];
  var eventEle = createElement('div','','','');

  // 没有动作区域
  if (isEmpty(actionArr)) {
    return;
  }
  for(var i = actionArr.actions.length; i > 0 ; i--) {
    var eventInfo = actionArr.actions[i-1];
    var btnEle = createElement("button",stepName+"-"+eventInfo.step,"btn","");
    btnEle.type = 'button';
    // 对应的详细内容ID
    var clNm = actionArr.clnm;
    // 按钮表示名
    btnEle.innerHTML = eventInfo.name;

    // 状态切换事件
    // TODO 通用化
    btnEle.setAttribute("onclick","doEvent('"+eventInfo.step+"','"+stepName+"',this)");

    // 添加
    eventEle.appendChild(btnEle);
  }
  return eventEle;
}

/**
 * 生产状态区域DIV
 *
 * @param obj 状态Object(包含状态，布局信息等情报)
 * @param eventFormId 生产DIV的父DIV对象（Element）
 */
function initEditArea(wkJson,obj,eventFormId,btnAreaId){
  parentEle = document.getElementById(eventFormId);
  // 空判断
  if (isNotEmpty(document.getElementById(obj.id)) || isEmpty(parentEle)) {
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
      // 样式
      inputRowEle.style = isEmpty(rows.style) ? "":rows.style;

      //prop
      $.each(rows.items,function(j,prop){
        // 策略模式生成HTML输入元素
        inputRowEle.appendChild(createInputElement(obj,prop));
      });

      baseInfoEle.appendChild(inputRowEle);
      // 列表表示
      if (isNotEmpty(rows.head)){
        console.log(rows.head);
        tableEle = createTable(rows,masterInfo[rows.info]);
        baseInfoEle.appendChild(tableEle);
      }
    });
        
    baseInfoEle.appendChild(createButtonArea(wkJson,obj.step));
    parentEle.appendChild(baseInfoEle);
  }

}

/**
 *
 */
function displayArea(formId,showId){
  $('#'+formId).children().hide();
  //document.getElementById(showId).style.display = 'inherit';
  $('#'+showId).show();
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
function arrIconSet(targetEle,step){
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
}

/**
 * 进度条切换
 */
function doEvent(nextStep,currentStep,thisEle){
  console.log($(thisEle).parents()[1]);
  let curSt = currentStep.split("-")[1];
  let tgtSt = nextStep.split("-")[1];
  if (parseInt(tgtSt) > parseInt(curSt)) {
    if (doValidation($(thisEle).parents()[1])){
      return;
    }
  }
  // 初始化
  arrIconReset();
  // 对象取得
  let targetEle = document.getElementById(nextStep);
  // 状态Step图标重设
  arrIconSet(targetEle,nextStep);
  // 内容刷新
  if ('9' != tgtSt) {
    displayArea('infoForm',wkJson.steps[nextStep].clnm);
  } else {
    $('#infoForm').children().show();
    let formObj = $("#infoForm").serializeObject();
    console.log(formObj);
    $.each($('.displayOnly'),function(){
      let prevInput = $(this).prev()[0];
      $(prevInput).hide();
     // this.innerHTML = prevInput.value;
      $(this).show();
    });
    $('button').hide();
  }
}

/* 策略模式 */
function createInputElement(obj,prop) {
  /* 策略类 */
  var strategyClass = {
    'text' : function(obj,prop,inputEle,inputCell) {
      inputEle.type = "text";
      inputEle.placeholder = prop.value;
      return inputEle;
    },
    'select' : function(obj,prop,inputEle,inputCell) {
      inputEle = null;
      inputEle = createElement("select",obj.objectType + "_" + prop.property, prop.classNm,obj.objectType + "." + prop.property);
      createOptions(inputEle,masterInfo[prop.masterId],true);
      return inputEle;
    },
    'radio' : function(obj,prop,inputEle,inputCell) {
      inputEle = null;
      // 属性设定
      var eleInfo = {
        "name" : obj.objectType + "." + prop.property,
        "id" : obj.objectType + "_" + prop.property,
        "classNm" : prop.classNm,
        "type" : inputType,
        "require" : prop.require,
        "readonly" : isNotEmpty(prop.readonly)
      };
      createCheck(eleInfo,masterInfo[prop.masterId],inputCell);
      return inputEle;
    },
    'checkbox' : function(obj,prop,inputEle,inputCell){
      inputEle = null;
      // 属性设定
      var eleInfo = {
        "name" : obj.objectType + "." + prop.property,
        "id" : obj.objectType + "_" + prop.property,
        "classNm" : prop.classNm,
        "type" : inputType,
        "require" : prop.require,
        "readonly" : isNotEmpty(prop.readonly)
      };
      createCheck(eleInfo,masterInfo[prop.masterId],inputCell);
      return inputEle;
    },
    'autocomplete' : function(obj,prop,inputEle,inputCell) {
      console.log("autocomplete:" + prop.name);
      inputEle.type = "text";
      inputEle.autocomplete = "on";
      inputEle.setAttribute("list",prop.masterId);
      inputEle.placeholder = prop.value;

      var datalistEle = createElement("datalist",prop.masterId, prop.classNm,obj.objectType + "." + prop.property);
      createOptions(datalistEle,masterInfo[prop.masterId]);
      document.getElementById("hideArea").appendChild(datalistEle);
      return inputEle;
    },
    'textarea' : function(obj,prop,inputEle,inputCell){
      inputEle = createElement("textarea",obj.objectType + "_" + prop.property, prop.classNm, obj.objectType + "." + prop.property);
      inputEle.value = prop.value;
      inputEle.style = isEmpty(prop.style) ? "":prop.style;
      inputEle.rows = 7;
      inputEle.cols = 80;
      return inputEle;
    },
    'label' : function(obj,prop,inputEle,inputCell){
      inputEle = createElement("label","Lbl_" + obj.objectType + "_" + prop.property, prop.classNm , "");
      inputEle.innerHTML = prop.value;
      inputEle.style.width = "auto";
      // 隐藏项
      hideEle = createElement("input",obj.objectType + "_" + prop.property, prop.classNm, obj.objectType + "." + prop.property);
      hideEle.type = "hidden";
      hideEle.value = prop.value;
      inputCell.appendChild(hideEle);
      return inputEle;
    },
    'datetime' : function(obj,prop,inputEle,inputCell){
      inputEle.type = "datetime-local";
      inputEle.className = "dateTime";
      inputEle.value = prop.value;
      inputEle.removeAttribute("readonly");
      return inputEle;
    },
    'button' : function(obj,prop,inputEle,inputCell){
      inputEle = createElement("button","","cell_btn", prop.classNm, "");
      inputEle.type = "button"
      inputEle.setAttribute("onclick",prop.value);
      inputEle.innerHTML = prop.name;
      return inputEle;
    }
  };

  /* 通用部分START */
  // 单个属性DIV
  var inputCell = createElement("div","","inputCell","");
  // 属性Title
  var lblEle = createElement("label","","","");
  lblEle.innerHTML = prop.name;
  inputCell.appendChild(lblEle);
  
  // 属性Input
  var inputEle = createElement("input",obj.objectType + "_" + prop.property, prop.classNm, obj.objectType + "." + prop.property);
  var inputType = prop.type;
  inputEle.style = isEmpty(prop.style) ? "":prop.style;
  /* 通用部分END */

  // 执行策略
  inputEle = strategyClass[prop.type](obj,prop,inputEle,inputCell);
  
  if (isNotEmpty(inputEle)) {
    // require
    if (isNotEmpty(prop.require)) {
      inputEle.setAttribute("notempty","true");
    }
    inputCell.appendChild(inputEle);
    
    // 验证信息表示
    var displayEle = createElement("span","","displayOnly","");
    inputCell.appendChild(displayEle);
  }
  return inputCell;
}
