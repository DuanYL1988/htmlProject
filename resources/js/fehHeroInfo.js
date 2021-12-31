const searchParam = getUrlParam();
const id = searchParam['id'];
const sql = 'select * from fireemblem_hero where id = ?';
const imgPath = "resources/images/illustration/feh/";
var illustrationBox = ['normal.png','attact.png','defend.png','extra.png'];
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
  executeQuary(sql,[id],(data)=>{
    setPage(data.rows[0]);
  });
});

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
      let src = imgPath + hero[this.id] + "/" + illustrationBox[imgIndex];
      console.log(src);
      this.src = src;
    }
  });
}

function hideInfoArea(){
  if (infoShowFlag) {
    $('#heroStatusArea').hide();
  } else {
    $('#heroStatusArea').show();
  }
  infoShowFlag = !infoShowFlag;
}