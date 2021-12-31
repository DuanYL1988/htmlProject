/* 输入基类 */
class input {
  constructor(el,monery){
    this.lotteryList = [];
    el.addEventListener("input",(e)=>{
      // 组号拼接
      let winNo = "-" + e.target.value;
      let preEle = $(el).prev()[0];
      if (preEle.tagName == 'SPAN'){
        winNo = $(preEle).prev()[0].value + winNo;
        console.log(winNo);
      }
      this.notifyAll(winNo,monery);
    });
  }
  notifyAll(value,monery) {
    this.lotteryList.forEach(item=>{
      item.notify(value,monery);
    })
  }
  addLottery(lottery) {
    this.lotteryList.push(lottery);
  }
}

/* 彩票基类 */
class lottery extends DocumentFragment {
  constructor(index,lotteryData){
    super();
    this.div = lotteryFactory(index,lotteryData);
    document.getElementById('lotteryBox').appendChild(this.div);
  }
  notify(value,monery) {
    this.div.classList.toggle("active",this.handle(value,monery));
  }
}

/* 中奖彩票 */
class winLottery extends lottery {
  constructor(index,lotteryData){
    super(index,lotteryData);
    this.txt = lotteryData.unit + '-' +lotteryData.code;
  }
  handle(value,monery){
    return rule(this.txt,value,monery);
  }
}

/* 彩票间距 */
const padding = 25;

/* 中奖规则 */
const winRule = {
  "levelOne" : {"count":1,"rule":["unit","number"],"monery":10000},
  "levelTwo" : {"count":4,"rule":["unit","number"],"monery":1000},
  "levelThree" : {"count":2,"rule":["unit","number"],"monery":100},
  "levelFour" : {"count":1,"rule":["number"],"monery":5},
  "levelFive" : {"count":3,"rule":["number"],"monery":1},
  "levelSix" : {"count":1,"rule":["number"],"monery":0.3},
  "levelSeven" : {"count":1,"rule":["number"],"monery":0.03}
};

/* 中奖金额 */
var winMoney = 0;

function inputRuleFactory(key,obj){
  let divEle = createElement('div','','notify','');
  // title
  let titleEle = createElement('h3','','','');
  titleEle.innerHTML = key;
  divEle.appendChild(titleEle);
  // input
  for(let i=0;i<obj.count;i++) {
    $.each(obj.rule, function() {
      let inputEle = createElement('input','',this,'');
      inputEle.type = 'text';
      divEle.appendChild(inputEle);
      if('unit'==this) {
        let spanEle = createElement('span','','','');
        spanEle.innerHTML = " - ";
        divEle.appendChild(spanEle);
      }
    });
  }
  return divEle;
}

$(function(){
  // 输入
  const iptList = [];
  //
  $.each(winRule,(key,obj) => {
    let divEle = inputRuleFactory(key,obj);
    $.each($(divEle).find(".number"),function() {
      iptList.push(new input(this,obj.monery));
    });
    document.getElementById("notifyArea").appendChild(divEle);
  });
  // 取得数据
  let sql = "select * from caipiao order by unit,code";
  executeQuary(sql,[],(result) => {
    createLotterys(result,iptList);
  });
});

function createLotterys(result,iptList){
  $.each(result.rows,(index,obj) => {
    let lottery = new winLottery(index,obj);
    $.each(iptList, (index,ipt) => {
      ipt.addLottery(lottery);
    });
  });
}

/* 创建彩票html元素DIV */
function lotteryFactory(index,lotteryData){
  let lottery = createElement('div','','lottery','');
  lottery.style.top = (index * padding + 10) + "px";
  // 组号
  let unitEle = createElement('span','','unit','');
  unitEle.innerHTML = lotteryData.unit;
  // 号码
  let numberEle = createElement('span','','number','');
  numberEle.innerHTML = lotteryData.code;
  
  lottery.appendChild(unitEle);
  lottery.appendChild(numberEle);
  return lottery;
}

/* 中奖判断 */
function rule(ticket,win,money){
  let winFlag = false;
  if(isNotEmpty(win.split('-')[0])){
    winFlag = match(ticket.split('-')[0],win.split('-')[0]) && match(ticket.split('-')[1],win.split('-')[1]);
  } else {
    winFlag = match(ticket.split('-')[1],win.split('-')[1]);
  }
  if(winFlag){
    winMoney = winMoney + money;
  }
  return winFlag;
}

function match(ticket,win){
  return ticket.substring(ticket.length-win.length) == win && isNotEmpty(win);
}