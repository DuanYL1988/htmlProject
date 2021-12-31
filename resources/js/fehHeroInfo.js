const searchParam = getUrlParam();
const id = isEmpty(searchParam['id']) ? '167' : searchParam['id'];
const table = 'fireemblem_hero';
const imgPath = "resources/images/illustration/feh/";
var illustrationBox = ['normal.png','attact.png','break.png','extra.png'];
var imgIndex = 0;
var infoShowFlag = true;

/** TODO : webSql是异步执行的,导致无法绑定
var firstApp = angular.module('firstApp',[]).controller('myCtrl',function($scope){
  $scope.hero = hero;
  executeQuary(sql,[id],function(data){
    $scope.hero = data.rows[0];
  });
});
*/

$(function(){
  setHeroById(id);
  // 左右切换图片
  $(document).on('keydown',function(event){
    if(event.keyCode==37||event.keyCode==65){
      imgIndex = imgIndex == 0 ? illustrationBox.length - 1 : imgIndex-1;
    } else if(event.keyCode==39||event.keyCode==68){
      imgIndex = imgIndex == illustrationBox.length - 1 ? 0 : imgIndex+1;
    }
    setIllustration(imgIndex);
  });
  //
  window.resizeTo("1000","1080");
});

setInterval(function(){
  imgIndex = imgIndex == illustrationBox.length - 1 ? 0 : imgIndex+1;
  setIllustration(imgIndex);
},2000);

/* 设置面板信息
 */
function setHeroById(heroId) {
  executeQuary('select * from fireemblem_hero where id = ?',[heroId],(data)=>{
    setPage(data.rows[0]);
  });
}

/** 设置信息
 *
 */
function setPage(hero){
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
    }
  });
  $('#resultArea').html("");
  $('#resultArea').hide();
  $('#searchTxt').val('');
  // 重置图片的点
  imgIndex = 0;
  setIllustration(imgIndex);
}

/* 设置不同立绘 */
function setIllustration(index){
  imgIndex = index;
  let illImgEle = $('#imgName')[0];
  let baseSrc = illImgEle.src.substring(0,illImgEle.src.lastIndexOf('/'));
  baseSrc += "/" + illustrationBox[index];
  illImgEle.src = baseSrc;
  // li样式
  $.each($.find('li'),(i,liEle) => {
    liEle.className = index==i ? 'li-active' : '';
  });
}

/** 信息面板隐藏/表示
 * 
 */
function hideInfoArea(){
  if (infoShowFlag) {
    $('#heroStatusArea').hide();
  } else {
    $('#heroStatusArea').show();
  }
  infoShowFlag = !infoShowFlag;
}

function fifterResult(inputEle) {
  $('#resultArea').show();
  let val = inputEle.value;
  let likeVal = "'%"+val+"%'";
  //or lower(imgName) like
  let sql = "select * from " + table + " where ";
  sql += "id = ? or name like "+likeVal+" or lower(imgName) like "+likeVal+" limit 0,10 ";
  executeQuary(sql,[val],(result)=> {
    showSearchList(result);
  });
}

function showSearchList(result){
  document.getElementById('resultArea').innerHTML = "";
  $.each(result.rows,(index,hero) => {
    let divEle = createElement('div','','resultEow','');
    divEle.innerHTML = hero.titleName + " - " + hero.name;
    divEle.setAttribute('onclick', "setHeroById("+hero.id+")");
    document.getElementById('resultArea').appendChild(divEle);
  });
}