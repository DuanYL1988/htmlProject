var htmlFlag;
var imageBox=[];
var currentIndex = -1;


$(function() {
    $.each(jsonData.album,function(){
        $("#sctFolder").append("<option value='"+this.path+"'>"+this.path+"</option>");
    });
    initilizeImage();
    
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
  var folder = $("#sctFolder").val();
  document.getElementById("navImg").innerHTML = "";
  imageBox=[];
  $.each(jsonData.album,function(){
    if (folder == this.path) {
        $.each(this.images,function(){
          imageBox.push(this);
        });
    }
  });
  
  $.each(imageBox,function(index,imgSrc){
    createImg(this,index);
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
  currentIndex = index;
  $("#showFullImg").attr('src',imgEle.src);
}

function showInWindows(){
    var maxWidth = document.body.clientWidth+'px';
    var maxHeight = document.body.clientHeight+'px';
    //var windows = $(document);
    var showDiv = $("#showWindow")[0];
    if (showDiv.className == "showWindow"){
        $("#sctFolder").css('display','none');
        document.documentElement.requestFullscreen();
        $("#navite").css('display','none');
        showDiv.className = "showFullWindow";
        showDiv.style.width = maxWidth;
        $("#showFullImg").css('width','auto');
        $("#showFullImg").css('height','1080px');
    } else {
        $("#sctFolder").css('display','');
        $("#navite").css('display','');
        showDiv.className = "showWindow";
        $("#showFullImg").css('width','auto');
        $("#showFullImg").css('height','790px');
    }
}