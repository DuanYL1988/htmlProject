var htmlFlag;
var imageIndex = 0;
var imageName = ['normal.png','attact.png','extra.png','break.png'];
var heroImagePath = '/myapp/resources/images/feh/acter/';
var selectedHeroName = '';
var startFlag = false;
var redTurn = true;//true:red false:black
var chessSelectedFlag = false;
var chessSelectedId = '';
var chessSelectedColor = '';
var wenponCd = ['R-W','R-M','R-D','R-B','R-BOW','R-Dart',
  'B-W','B-M','B-D','R-B','B-BOW','B-Dart',
  'G-W','G-M','G-D','R-B','G-BOW','G-Dart',
  'N-W','N-Dart','N-Staff','N-D'];
var heroObj = {};
var redTeam = [];
var blackTeam = [];
var selectChessHtml = '';

$(function() {
    // 未定义返回ture
    htmlFlag = typeof(mode)=="undefined";
    if(htmlFlag){
        console.log("display from static html");
        heroImagePath = "../../../resources/images/feh/acter/";
        // 静态页面加载json数据
        jsonDate = staticJson;
        initHtml(staticJson,"redTeam");
        initHtml(staticJson,"blackTeam");
    } else {
      jsonDate = JSON.parse(jsonDate);
      initHtml(jsonDate,"redTeam");
      initHtml(jsonDate,"blackTeam");
    }

    // 制作地图DIV
    createMap();

    // 各种按钮事件
    $('#btn_gameStart').on('click',function(){
      gameStart(this);
      printInfo(null,'游戏开始,现在是红方的回合');
    });
    $('#btn_trunEnd').on('click',function(){
      if(!confirm("确认结束吗")){
        return;
      }
      trunEnd();
    });
    $('#btn_cancel').on('click',function(){
      clearMoveAtt();
      selectChessHtml = '';
      chessSelectedId = '';
      chessSelectedColor = '';
      chessSelectedFlag = false;
    });

    // 人物选择选中事件
    $('.img').on('click',function(){
      var heroId = this.id.split(':')[0];
      var weaponType = this.id.split(':')[1];
      var areaPart = this.parentElement.parentElement.id.replace("Team","");
      if (!htmlFlag) {
        openInfoDiv(heroId);
      } else {
        // 取得对象
        opInfoWhenHtml(heroId,weaponType);
        editTeam(areaPart);
      }
    });
    
    // Event
    $(".mapCell").on('click',function(){
      // 棋子选中
      var childDiv = this.children[0];
      if(typeof(childDiv)!="undefined" && this.className!='mapCell move'){
        var imgEle = childDiv.children[0];
        if(typeof(imgEle)!="undefined" && (!chessSelectedFlag && imgEle.src!="")){
          selectChess(childDiv);
        }
      }

      // 移动
      if(chessSelectedFlag && this.className=='mapCell move' && this.id != chessSelectedId){
        clearMoveAtt();
        this.innerHTML = selectChessHtml;
        $('#'+chessSelectedId).html('');
        $('.selected').prop('className','chessman_'+chessSelectedColor);
        selectChessHtml = '';
        chessSelectedId = '';
        chessSelectedColor = '';
        chessSelectedFlag = false;
      }
      // 攻击
    });
    
});

/*
 * 切换立绘
 */
function changeImage(classify){
  if(classify=="next") {
    imageIndex=imageIndex+1;
  } else {
    imageIndex=imageIndex-1;
  }

  if (imageIndex>3){
    imageIndex=0;
  } else if(imageIndex<0){
    imageIndex=3;
  }
  var url = selectedHeroName + "/" +imageName[imageIndex];
  $('#screenImg').prop('src',heroImagePath+url);
}

function pickImageName(){
  printInfo(null,selectedHeroName + "/" +imageName[imageIndex]);
}

/*
 * 选取棋子
 */
function selectChess(obj){
  // 取得棋子信息
  chessSelectedColor = obj.className.replace('chessman_','');
  selectChessHtml = obj.outerHTML;
  chessSelectedId = obj.parentElement.id;
  // 清除移动范围
  clearMoveAtt();
  // 选中棋子为绿色
/*  $(".chessman_black").find('img').prop('className','black');
  $(".chessman_red").find('img').prop('className','red');*/
  $(obj).find('img').prop('className','selected');
  // 取得选中棋子的坐标
  var chessmanCoordinate = getCoordinate(obj.parentElement);
  var heroObj;
  if(chessSelectedColor=='black'){
    heroObj = blackTeam[obj.id.replace(chessSelectedColor,'')].hero;
  } else {
    heroObj = redTeam[obj.id.replace(chessSelectedColor,'')].hero;
  }
  // 计算移动和攻击范围
  getMoveRange(chessmanCoordinate,heroObj.moveSpace,heroObj.moveType);
  //getAttactRange(2);
  //
  chessSelectedFlag = true;
}

/*
 * 清除移动范围
 */
function clearMoveAtt(){
  $('.mapCell.move').prop('className','mapCell');
  $('.mapCell.attact').prop('className','mapCell');
  $(".chessman_black").find('img').prop('className','black');
  $(".chessman_red").find('img').prop('className','red');
}

/**
 * 静态html打开时,读取json设置隐藏区域的图片
 */
function initHtml(jsonData,areaId){
  document.getElementById(areaId).innerHTML = "";

  for(var i=0;i<=wenponCd.length;i++){
    var data = jsonData[wenponCd[i]];
    secondLoop(data,areaId)
  }
}

/**
 * 循环出人物信息
 */
function secondLoop(data,areaId){
    var parentDiv = document.createElement("div");
    parentDiv.className = "row";

    $.each(data,function(){
      var imgDiv = document.createElement("div");
      imgDiv.className = "img";
      imgDiv.id = this.id+":"+this.weaponType;
      var imgEle = document.createElement("img");
      imgEle.src = heroImagePath+this.imgName+"/face.png";
      imgDiv.appendChild(imgEle);

      parentDiv.appendChild(imgDiv);
  });
  document.getElementById(areaId).appendChild(parentDiv);
}

/**
 * 创建地图
 */
function createMap(){
  var mapObj = document.getElementsByClassName("map")[0];
  var redchessIndex = 0;
  var blackchessIndex = 0;
  mapObj.innerHTML = "";
  for(var row=0;row<map.length;row++){
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";
    rowDiv.id = "row"+row;
    for(var col=0;col<map[row].length;col++){
      // 取得地图块信息
      var cellObj = map[row][col];
      // 创建列DIV
      var colDiv = document.createElement("div");
      var colInde = col+1;
      
      // 出击配置处
      if(cellObj.deploy){
        colDiv.style.backgroundColor="#d7e682b5";
        var deployColor = cellObj.deployType;
        // 创建棋子
        var chessman = document.createElement("div");
        var classNm = "";
        var id='';
        if('red'==deployColor){
          classNm = 'chessman_red';
          id = 'red'+redchessIndex;
          redchessIndex++;
        } else {
          classNm = 'chessman_black';
          id = 'black'+blackchessIndex;
          blackchessIndex++;
        }
        chessman.className = classNm;
        chessman.id = id;
        var imgElement = document.createElement("img");
        imgElement.className=deployColor;
        chessman.appendChild(imgElement);
        colDiv.appendChild(chessman);
      }

      colDiv.id = row +"-"+col;
      colDiv.className = "mapCell";

      rowDiv.appendChild(colDiv);
    }
    mapObj.appendChild(rowDiv);
  }
  
}

/**
 * 通过武器类型和ID取得选取对象
 */
function opInfoWhenHtml(heroId,weaponType){
  heroObj = {};
  var data = jsonDate[weaponType];
  $.each(data,function(){
    if(this.id == heroId) {
      heroObj.titleName = this.titleName;
      heroObj.name = this.name;
      heroObj.imgName = this.imgName;
      heroObj.id = this.id;
      heroObj.hp = this.hp;
      heroObj.attact = this.attact;
      heroObj.speed = this.speed;
      heroObj.def = this.def;
      heroObj.mdf = this.mdf;
      heroObj.weaponType = this.weaponType;
      heroObj.weapon = this.weapon;
      heroObj.skillA = this.skillA;
      heroObj.skillB = this.skillB;
      heroObj.skillC = this.skillC;
      heroObj.skillD = this.skillD;
      heroObj.skillS = this.skillS;
      heroObj.skillE = this.skillE;
      heroObj.moveType = this.moveType;
      // 移动距离设定
      if(this.moveType=='02'){
        heroObj.moveSpace = 3;
      } else if (this.moveType=='04'){
        heroObj.moveSpace = 1;
      } else {
        heroObj.moveSpace = 2;
      }
      selectedHeroName = this.imgName;
      //showImg(heroObj.imgName+'/normal.png');
      return heroObj;
    }
  });
}

/**
 * 编组队伍
 */
function editTeam(areaPart){
  var teamImgs = $(".chessman_"+areaPart);
  for(var i=0;i<teamImgs.length;i++) {
    var imgObj = $(teamImgs[i]).find("img")[0];
    var imgStyle = imgObj.style.borderColor;
    var updateFlag = false;
    var imgSrc = heroImagePath+heroObj.imgName+"/face.png";
    if(imgStyle.length >0 && imgStyle.indexOf(areaPart)<0){
      imgObj.src = imgSrc;
      // 选择取消
      imgObj.style.borderColor=areaPart;
      updateFlag = true;
    }
    if(imgObj.src=="") {
      imgObj.src = imgSrc;
      updateFlag = true;
    }
    if(updateFlag){
      var chessman = {key:areaPart+i,hero:heroObj};
      var msg = areaPart+'方'+(i+1)+'号位选择了:'+heroObj.titleName+'-'+heroObj.name;
      if("red"==areaPart){
        redTeam[i]=chessman;
        printInfo(redTeam,msg);
      } else {
        blackTeam[i]=chessman;
        printInfo(blackTeam,msg);
      }
      return;
    }
  }
}

/**
 * 游戏开始
 */
function gameStart(obj){
  /*
  if(redTeam.length==0 || blackTeam.length==0){
    alert("有队伍成员未选");
    return;
  } else if(redTeam.length<4 || blackTeam.length<4){
    if(!confirm("有队伍成员未满,确认开始吗")){
      return;
    }
  }
  */
  startFlag = true;
  obj.disabled = 'true';
  // 出击配置处颜色取消
  $('.mapCell').css('background-color','');
  // game start
  // 去除无内容棋子
  $.each($('.mapCell'),function(){
    var imgEle = $(this).find('img')[0]
    if(typeof(imgEle)=="undefined"){
      this.innerHTML = "";
    }else if("" == imgEle.src){
      this.innerHTML = "";
    }
  });
  // 切换BGM
  // $('#bgm').prop('src','attact.mp3');
  // 人物选择界面隐藏
  $('#redTeam').hide('slow','swing');
  $('#blackTeam').hide('slow','swing');
  // 选择成员信息表示
  createTeamMemberInfo('redTeamCombat',redTeam);
  createTeamMemberInfo('blackTeamCombat',blackTeam);
}

/**
 * 队员详细信息
 */
function createTeamMemberInfo(divId,team){
  var teamMemberArea = document.getElementById(divId);
  teamMemberArea.innerHTML = "";
  for(var i=0;i<team.length;i++){
    var member = team[i].hero;
    // 父div
    var memberDiv = document.createElement("div");
    memberDiv.className='team_member';
    // 图片div
    var faceDiv = document.createElement("div");
    faceDiv.className='memberFace';
    // image
    var imgEle = document.createElement("img");
    imgEle.src = heroImagePath + member.imgName+"/face.png";
    
    faceDiv.appendChild(imgEle);
    memberDiv.appendChild(faceDiv);
    // 详细
    var infoDiv = document.createElement("div");
    infoDiv.className='memberInfo';
    var ulElement = document.createElement("ul");
    createAndAppendElement(ulElement,"li",member.titleName+'-'+member.name,null);
    createAndAppendElement(ulElement,"li",'HP:'+ member.hp,null);
    createAndAppendElement(ulElement,"li",'ATT:'+ member.attact,null);
    createAndAppendElement(ulElement,"li",'SPD:'+ member.speed,null);
    createAndAppendElement(ulElement,"li",'DEF:'+ member.def,null);
    createAndAppendElement(ulElement,"li",'MDF:'+ member.mdf,null);
    createAndAppendElement(ulElement,"li",'武器:'+ member.weapon,null);
    createAndAppendElement(ulElement,"li",'A:'+member.skillA+' B:'+member.skillB+' C:'+member.skillC,null);
    createAndAppendElement(ulElement,"li",member.skillS+member.skillE,null);

    infoDiv.appendChild(ulElement);
    memberDiv.appendChild(infoDiv);
    //
    teamMemberArea.appendChild(memberDiv);
  }
}

/**
 * 设置子元素值
 */
function createAndAppendElement(parentEle,childEleType,htmlText,valText){
  var childEle = document.createElement(childEleType);
  childEle.innerHTML = htmlText;
  childEle.value = valText;
  parentEle.appendChild(childEle);
}

/**
 * 取得选择棋子的坐标
 */
function getCoordinate(mapCell){
  var coordinate = {};
  coordinate.row = Number(mapCell.id.split('-')[0]);
  coordinate.col = Number(mapCell.id.split('-')[1]);
  return coordinate;
}

/**
 * 取得移动范围
 */
function getMoveRange(startCoor,range,moveType){
  if(range<=0){
    return;
  } else {
    var coorObj;
    if(startCoor.col>0){
      coorObj = {'col':startCoor.col-1,'row':startCoor.row};
      divClassChange(coorObj,range,moveType);
    }
    if(startCoor.col<5){
      coorObj = {'col':startCoor.col+1,'row':startCoor.row};
      divClassChange(coorObj,range,moveType);
    }
    if(startCoor.row>0){
      coorObj = {'col':startCoor.col,'row':startCoor.row-1};
      divClassChange(coorObj,range,moveType);
    }
    if(startCoor.row<7){
      coorObj = {'col':startCoor.col,'row':startCoor.row+1};
      divClassChange(coorObj,range,moveType);
    }
  }
}

/**
 * 地形影响判断
 */
function divClassChange(coor,range,moveType){
  window.console.log('剩余:'+range);
  var divId = coor.row+'-'+coor.col;
  var mapInfo = map[coor.row][coor.col];
  if(moveType!='03'){
    if(mapInfo.type=='forest'){
      if(moveType=='01'){
        range = range-1;
      } else if(moveType=='02'){
        range = -1;
      }
    }
    if(mapInfo.moveAble){
      if(range>0){
        $('#'+divId).prop('className','mapCell move');
      }
    } else {
      range = -1;
    }
  }else {
    $('#'+divId).prop('className','mapCell move');
  }
  getMoveRange(coor,range-1,moveType);
}

/**
 * 算出攻击范围
 */
function getAttactRange(attactRange){
  $.each($('.mapCell'),function(){
    if(this.className=='mapCell move'){
      return;
    }
    var divCoor = getCoordinate(this);
    var targetFlag = false;
    $.each($('.mapCell.move'),function(){
      var moveCoor = getCoordinate(this);
      var distance = Math.abs(divCoor.col-moveCoor.col)+Math.abs(divCoor.row-moveCoor.row);
      if(0<distance && distance<=attactRange){
        targetFlag = true;
        return;
      }
    });
    if(targetFlag){
      this.className='mapCell attact';
    }
  });
}

function showImg(url){
  imageIndex = 0;
  $('#screenImg').prop('src',heroImagePath+url);
  $('#screenImg').css('margin-left','0px');
  $('#screen').css('display','inline');
  //$("#screenImg").animate({"margin-left": "600px"}, 2500);
}

function printInfo(obj,textInfo){
  window.console.log(JSON.stringify(obj));
  var value = $("#consoleInfo").val()+textInfo+'\r\n';
  $("#consoleInfo").val(value);
}

function trunEnd(){
  return !redTurn;
}

function sleep(ms){
    for(var t=Date.now();Date.now()-t<=ms;);
}
