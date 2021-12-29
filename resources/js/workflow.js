var CURRENT_STEP;
var formEle;

$(function() {
  // 初始设定
  CURRENT_STEP = wkJson.currentStep;
  formEle = document.getElementById("infoForm");
  initlize();
  // 基本情报
  initEditArea(contract.baseInfo,formEle);
  // 默认表示区域
  var displayA = wkJson.steps[CURRENT_STEP].clnm;
  initEditArea(contract[displayA],formEle);
});

/**
 * 业务控制
 */
function doStep(step,csts,objNm) {
  // 操作時間
  var cntTime = formateDateYMDHMslash(new Date());
  // 書類
  if (isInclude(csts,["A-1","A-2","A-3"])) {
    var nextBtn = $("#"+ csts + "-" + step).prev()[0];
    $(nextBtn).removeAttr("disabled");
    var baseNm = "";
    /**/
    if ("1" == step) {
      baseNm = "application";
    } else if ("2" == step) {
      baseNm = "approval";
    } else if ("3" == step) {
      baseNm = "send";
      $("input[name$='.replyFlag']").removeAttr("disabled");
    }
    $("#"+objNm+"_" + baseNm + "Flag").val("1");
    $("#"+objNm+"_" + baseNm + "Date").val(cntTime);
    $("#Lbl_"+objNm+"_" + baseNm).html("済");
    
  } else {
    // 資産進度管理
    var cnt = 0;
    $.each($("#singleFile").find("input[type='checkbox']"),function(i,rows){
      if (this.checked && i > 0) {
        cnt ++;
        setTbltxtWithCoordinate("singleFile",i,parseInt(step),cntTime);
      }
    });
    if (cnt == 0){
      popupMsg("書類１つ以上選択してください。");
    }
  }
}
