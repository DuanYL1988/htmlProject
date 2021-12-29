let barChart, pieChart;
$(function() {
  // 饼状图
  drawPieChart("serviceType",serviceType);
  drawPieChart("charge",charge);
  drawPieChart("workStatus",workStatus);
  // 柱状图
  drawBarChart("barChart1",charge)
  //
  drawLineChart("lineChart1",trendLine);
});

/**
 * 饼状图
 */
function drawPieChart(eleId,obj) {
  ctxPie = document.getElementById(eleId).getContext("2d");
  var configs = {
    "type" : "pie",
    "data": {
      "datasets": [
        {
          "data": obj.count,
          "backgroundColor": [
          ]
        },
        {
          "data": [getSum(obj.count)],
          "backgroundColor": [
            "white"
          ],
          "labels": []
        }
      ],
      "labels": obj.label
    },
    "options": {
      "responsive": false,
      "maintainAspectRatio": true
    }
  };

  // 生成随机颜色
  $.each(obj.count,function(){
    var color = getRandomColor() + ",1)";
    configs.data.datasets[0].backgroundColor.push(color);
  });
  pieChart = new Chart(ctxPie, configs);

}

/**
 * 柱状图
 */
function drawBarChart(eleId,obj) {
  ctxBar = document.getElementById(eleId).getContext("2d");
  configBar = {
    type: "bar",
    data: {
      labels: obj.label,
      datasets: []
    },
    options: {
      responsive: false,
      maintainAspectRatio : true
    }
  };
  
  // 前月数据
  $.each(compare,function(){
    var dataset = {
      label: this.name,
      data: this.data,
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    };
    configBar.data.datasets.push(dataset);
  });
  
  // 合计数据
  var totalData =  {
    label: "Total",
    data: obj.count,
    backgroundColor: [],
    borderColor: [],
    borderWidth: 1
  };
  configBar.data.datasets.push(totalData);
  
  $.each(configBar.data.datasets,function(i,dataset){
    // 颜色设置
    $.each(dataset.data,function(){
      var color = getRandomColor();
      configBar.data.datasets[i].backgroundColor.push(color+",0.2)");
      configBar.data.datasets[i].borderColor.push(color+",1)");
    });
  });

  barChart = new Chart(ctxBar, configBar);
}

function drawLineChart(eleId,obj) {
  ctxLine = document.getElementById(eleId).getContext("2d");
  
  configLine = {
    type: "line",
    data: {
      labels: obj.title,
      datasets: []
    },
    options: {
      responsive: false,
      maintainAspectRatio : true
    }
  };
  $.each(obj.data,function(){
    var dataset = {
      label: this.name,
      data: this.data,
      fill: false,
      borderColor: getRandomColor()+")",
      lineTension: 0.1
    }
    configLine.data.datasets.push(dataset);
  })

  lineChart = new Chart(ctxLine, configLine);
}

function getSum(arrs){
  var sum = 0;
  $.each(arrs,function(){
    sum = sum + parseInt(this);
  });
  return sum;
}

/**
 * 生成随机颜色
 */
function getRandomColor(){
  var color = "rgb(" + Math.ceil(Math.random()*255) +","+Math.ceil(Math.random()*255) + "," +Math.ceil(Math.random()*255);
  return color;
}
