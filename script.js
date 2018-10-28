var invoiceData;
var obj_ind = [];
var obj_com = [];
var topCom = [];
var obj_ind2 = [];
var obj_com2 = [];
var arr_ind = [];
var arr_com = [];

$("#analyseTL").on("click", function() {
  fetchData();
  moveDataAnimation();
});

function fetchData() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "invoices.json", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      invoiceData = JSON.parse(xhr.responseText);
      setTimeout(loadData, 1800);
    }
  };
  xhr.send();
}

function loadData() {
  var totalAmount = 0;
  var totalPaid = 0;
  var totalUnpaid = 0;
  for (var i = 0; i < invoiceData.length; i++) {
    totalAmount += invoiceData[i].amount;
    totalPaid += invoiceData[i].amountPaid;
    if (!arr_ind.includes(invoiceData[i].industry)) {
      arr_ind[arr_ind.length++] = invoiceData[i].industry;
    }
    if (!arr_com.includes(invoiceData[i].company)) {
      arr_com[arr_com.length++] = invoiceData[i].company;
    }
  }
  for (var i = 0; i < arr_ind.length; i++) {
    obj_ind[i] = { name: arr_ind[i], num: 0 };
    obj_ind2[i] = { name: arr_ind[i], num: 0 };
  }
  for (var i = 0; i < arr_com.length; i++) {
    obj_com[i] = { name: arr_com[i], num: 0 };
    obj_com2[i] = { name: arr_com[i], num: 0 };
  }
  totalUnpaid = totalAmount - totalPaid;
  analyseData();
  generateReport(totalAmount, totalUnpaid);
}

function analyseData() {
  var arrSort = [];
  for (var i = 0; i < invoiceData.length; i++) {
    //INDUSTRY #1
    for (var j = 0; j < obj_ind.length; j++) {
      if (invoiceData[i].industry == obj_ind[j].name) {
        obj_ind[j].num++;
      }
    }

    //COMPANY #1
    for (var j = 0; j < obj_com.length; j++) {
      if (obj_com[j].name == invoiceData[i].company) {
        obj_com[j].num += invoiceData[i].amountPaid;
      }
    }

    //INDUSTRY #2
    for (var j = 0; j < obj_ind2.length; j++) {
      if (
        invoiceData[i].status == "DEFAULTED" &&
        invoiceData[i].industry == obj_ind2[j].name
      ) {
        obj_ind2[j].num++;
      }
    }
  }

  for (var i = 0; i < obj_com.length; i++) {
    arrSort[i] = obj_com[i].num;
  }
  arrSort.sort(sortNumbers);
  topCompanies(arrSort);
  unpaidCompanies();
}

function unpaidCompanies() {
  for (var i = 0; i < invoiceData.length; i++) {
    //COMPANY #2
    for (var j = 0; j < obj_com2.length; j++) {
      if (
        invoiceData[i].status == "DEFAULTED" &&
        invoiceData[i].company == obj_com2[j].name
      ) {
        obj_com2[j].num += invoiceData[i].amount;
      }
    }
  }
}

function topCompanies(arrSort) {
  var k = 0;
  for (var i = arrSort.length - 1; i >= 20; i--) {
    for (var j = 0; j < obj_com.length; j++) {
      if (arrSort[i] == obj_com[j].num) {
        topCom[k++] = { name: obj_com[j].name, num: arrSort[i] };
      }
    }
  }
  return topCom;
}

function sortNumbers(a, b) {
  return a - b;
}

function generateReport(totalAmount, totalUnpaid) {
  var report_start =
    '<h1 id="reportTitle">Report</h1><div class="report-header">' +
    "<h2>Total Amount</h2>" +
    "<p>£ " +
    totalAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") +
    "</p></div>";
  var report_next =
    '<div class="report-section"><p>Industry/Company with more invoices issued</p><div class="report-section-inner"><div class="report-section-cat"><h2>Industry</h2>';
  var part1 =
    generateChartBars(obj_ind, 10, 0) +
    '</div><div class="report-section-cat"><h2>Company</h2>' +
    generateChartBars(topCom, 10, 1) +
    "</div></div></div>";
  var part2 = generateReportRisks(totalUnpaid);
  var report_next2 =
    '<div class="report-section report-risks"><p>Industry/Company with more unpaid invoices</p><div class="report-section-inner"><div class="report-section-cat"><h2>Industry</h2>';
  var part3 =
    generateChartBars(obj_ind2, 2, 2) +
    '</div><div class="report-section-cat"><h2>Company</h2>' +
    generateChartBars(obj_com2, 10, 1) +
    "</div></div></div>";

  $(".before-report").hide();
  $("section").css("height", "auto");
  $(".report").show();
  $(".report").html(
    report_start + report_next + part1 + part2 + report_next2 + part3
  );
}

function generateReportRisks(totalUnpaid) {
  var report_extra =
    '<div class="report-header"><h1>Risks</h1>' +
    "<h2>Total Unpaid</h2>" +
    "<p>£ " +
    totalUnpaid.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") +
    "</p></div>";
  return report_extra;
}

function generateChartBars(obj, num, flag) {
  var reportCat = "";
  var number = 0;
  var bar = 0;
  for (var j = 0; j < 5; j++) {
    if (flag == 0) {
      number = Math.floor((obj[j].num / invoiceData.length) * 100) + "%";
      bar = obj[j].num / num;
    } else if (flag == 1) {
      number = "£ " + obj[j].num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
      bar = 0;
    } else {
      number = obj[j].num + " invoices";
      bar = obj[j].num;
    }
    reportCat +=
      "<h4>" +
      obj[j].name +
      "</h4><a>" +
      number +
      '</a><br/><span style="width:' +
      bar +
      'px;"></span><br/>';
  }
  return reportCat;
}

function moveDataAnimation() {
  var i = 0;
  var dots = 0;
  var timer = setInterval(function() {
    $(".dots")
      .eq(i)
      .fadeIn(500);
    $(".dots")
      .eq(i)
      .fadeOut(500);
    i < 5 ? i++ : (i = 0);
    dots++;
    if (dots > 11) {
      clearInterval(timer);
      dots = 0;
    }
  }, 100);
}
