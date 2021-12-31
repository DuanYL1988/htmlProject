
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
  let divEle = createElement('div','','notifyArea','');
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
        let spanEle = createElement('span','',this,'');
        spanEle.innerHTML = "-";
        divEle.appendChild(spanEle);
      }
    });
  }
  return divEle;
}

$(function(){
  console.log("aa");
  // 输入
  const iptList = [];
  iptList.push(new input(document.getElementById("winNumber")));
  //
  $.each(winRule,(key,obj) => {
    let divEle = inputRuleFactory(key,obj);
    iptList.push(new input(divEle));
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
function rule(ticket,win){
  let winUnit = win.split('-')[0];
  let winNo = win.split('-')[1];
  let ticketUnit = ticket.split('-')[0];
  let ticketNo = ticket.split('-')[1];
  if(isNotEmpty(winUnit)){
    return match(ticketUnit,winUnit) && match(ticketNo,winNo);
  }
  return match(ticketNo,winNo);
}

function match(ticket,win){
  return ticket.substring(ticket.length-win.length) == win && isNotEmpty(win);
}
