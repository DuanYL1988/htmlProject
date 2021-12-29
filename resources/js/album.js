var htmlFlag;
var heroImagePath = '/myapp/resources/images/feh/acter/';
var showLevel = 1;
var imageBox=[];
var currentIndex = -1;

$(function() {
    // 未定义返回ture
    htmlFlag = typeof(mode)=="undefined";
    if(htmlFlag){
        console.log("display from static html");
        heroImagePath = "../../../resources/images/feh/acter/";
        // 静态页面加载json数据
        jsonData = imageList;
        initilizeImage();
        $.each(imageBox,function(index,imgSrc){
          createImg(this,index);
        });
    } else {
      jsonData = JSON.parse(jsonDate);
    }
    
    $(document).on('keydown',function(event){
      if(currentIndex<0){
        return;
      }
      if(event.keyCode==37||event.keyCode==65){
        currentIndex--;
        if(currentIndex<0){
          currentIndex=imageBox.length-1;
        }
      } else if(event.keyCode==39||event.keyCode==68){
        currentIndex++;
        if(currentIndex>=imageBox.length){
          currentIndex=0;
        }
      }
      var src = imageBox[currentIndex];
      $("#showFullImg").attr('src',src);
      console.log(currentIndex);
    });

});

function initilizeImage(){
  imageBox=[];
  $.each(jsonData,function(){
    if(this.level<=showLevel){
      var folder = this.folder;
      $.each(this.images,function(){
        var imgPath = heroImagePath+folder + "/" + this;
        imageBox.push(imgPath);
      });
    }
    window.console.log("update hero set FAVORITE = '"+this.level+"' where IMG_NAME = '"+this.folder+"';");
  });
}

function createImg(src,index){
  var imgEle = document.createElement("img");
  imgEle.src=src;
  imgEle.onclick = function(){
    showImg(imgEle,index);
  };
  document.getElementById("navImg").appendChild(imgEle);
}

function showImg(imgEle,index){
  console.log(index);
  currentIndex = index;
  $("#showFullImg").attr('src',imgEle.src);
}