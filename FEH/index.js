class baseImage extends DocumentFragment {
  constructor(src) {
    super();// html元素
    this.img = createImg(src); // 图片元素
    // 图片的点击事件
    this.img.addEventListener('click',(e)=>{
      this.clickEvent(e);
    });
    this.img.addEventListener('mouseover',(e)=>{
      this.hoverEvent(e);
    });
    this.img.addEventListener('mouseout',(e)=>{
      this.loseFocus(e);
    });
  }
  clickEvent(){}
  hoverEvent(){}
  loseFocus(){}
}

class faceElement extends baseImage {
  constructor(data,basePath) {
    let src = basePath + data.imgName + "/face.png";
    super(src);
    this.data = data;
  }
  handle(){
    return this;
  }
  clickEvent(e) {
    console.dir(this.data.imgName);
    let param = 'id=' + this.data.id + '&pageNo=' + 'heroList.html';
    window.open('singleHero.html?'+param,"","height=1080 , width=825 , top=0 , left=500 ", false);
  }
  hoverEvent(e){
    let _left = e.clientX;
    let _top = e.clientY;
    //console.dir(_left + "," + _top);
    let hover = document.getElementById('hoverWindow');
    _left = _left > 1000 ? _left-250 : _left+25;
    _top = _top > 600 ? _top-50 : _top+20;
    $(hover).css('left',_left+"px");
    $(hover).css('top',_top+"px");
    $(hover).css('display','grid');/**/
  }
  loseFocus(e){
    $('#hoverWindow').hide();
  }
}

