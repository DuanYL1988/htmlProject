const id = isEmpty(getUrlParam()['id']) ? '123' : getUrlParam()['id'];
const webSqlObj = new webSqlManagement();
var setUp = webSqlObj.setUp;
setUp.table = "fireemblem_hero";
const imgPath = "D:/picture/illustration/feh/";
//立绘盒
var illustrationBox = ['normal.png','attact.png','extra.png','break.png'];
// 神装flag
var newFlag = false;
var newImgBox = ['new_normal.png','new_attact.png','new_extra.png','new_break.png'];
var imgIndex = 0;
// 自动切换
let autoFlag = true;
let autoPlay = setInterval(function(){
  if (!autoFlag) {
    clearInterval(autoPlay);
  } else {
    imgIndex = imgIndex == illustrationBox.length - 1 ? 0 : imgIndex+1;
    setIllustration(imgIndex);
  }
},5000);
// 面板开关
var dashboardFlag = true;

$(function(){
  setHeroById(id);
  // 左右切换图片
  $(document).on('keydown',function(event){
    if(event.keyCode==37||event.keyCode==65){
      imgIndex = imgIndex == 0 ? illustrationBox.length - 1 : imgIndex-1;
    } else if(event.keyCode==39||event.keyCode==68){
      imgIndex = imgIndex == illustrationBox.length - 1 ? 0 : imgIndex+1;
    } else {
      return;
    }
    autoFlag = false;
    setIllustration(imgIndex);
  });
  // 新窗口打开立绘
  $("#imgName").on("click",function(){
    window.open(this.src);
  })
});

/** 设置面板信息
 */
function setHeroById(heroId) {
  webSqlObj.executeQuary('select * from fireemblem_hero where id = ?',[heroId],(data)=>{
    setPage(data.rows[0]);
  });
}

/** 设置信息
 *
 */
function setPage(hero){
  // 神装
  newFlag = hero.id == 88 ? true : false;
  // Label
  $.each($.find("label"),function(i){
    if(isNotEmpty(this.id)) {
      this.innerHTML = hero[this.id];
    }
  });
  // image
  console.log($.find("img").length);
  $.each($.find("img"),function(i){
    if(isNotEmpty(this.id)) {
      this.src = imgPath + hero[this.id] + "/" + illustrationBox[imgIndex];
      if (newFlag) {
        this.src = imgPath + hero[this.id] + "/" + newImgBox[imgIndex];
      }
    }
  });
  $('#resultArea').html("");
  $('#resultArea').hide();
  $('#searchTxt').val('');
  // 重置图片的点
  imgIndex = 0;
  autoFlag = true;
  setIllustration(imgIndex);
}

/** 设置不同立绘 */
function setIllustration(index){
  imgIndex = index;
  let illImgEle = $('#imgName')[0];
  let baseSrc = illImgEle.src.substring(0,illImgEle.src.lastIndexOf('/'));
  if (newFlag) {
    baseSrc += "/" + newImgBox[index];
  } else {
    baseSrc += "/" + illustrationBox[index];
  }
  illImgEle.src = baseSrc;
  // li样式
  $.each($.find('li'),(i,liEle) => {
    liEle.className = index==i ? 'li-active' : '';
  });
}

function goBack(){
  console.log(dashboardFlag);
  if (!dashboardFlag) {
    dashboardFlag = true;
    let board = $('#heroStatusArea')[0];
    board.style.display = '';
    $('#btn-show').show();
    return;
  } else if(getUrlParam()['pageNo'].indexOf('heroList') >= 0){
    window.close();
  }
}

/** 信息面板隐藏/表示
 * 
 */
function hideInfoArea(btn){
  let board = $('#heroStatusArea')[0];
  board.style.display = board.style.display == 'none'? '' : 'none'; 
  $(btn).hide();
  dashboardFlag = false;
}

/** 检索功能
 */
function fifterResult(inputEle) {
  $('#resultArea').show();
  let val = inputEle.value;
  let likeVal = "'%"+val+"%'";
  let sql = "select * from " + setUp.table + " where ";
  sql += "id = ? or name like "+likeVal+" or lower(imgName) like "+likeVal+" limit 0,10 ";
  webSqlObj.executeQuary(sql,[val],(result)=> {
    showSearchList(result);
  });
}

/** 备选项目
 *
 */
function showSearchList(result){
  document.getElementById('resultArea').innerHTML = "";
  $.each(result.rows,(index,hero) => {
    let divEle = createElement('div','','resultEow','');
    divEle.innerHTML = hero.titleName + " - " + hero.name;
    divEle.setAttribute('onclick', "setHeroById("+hero.id+")");
    document.getElementById('resultArea').appendChild(divEle);
  });
}