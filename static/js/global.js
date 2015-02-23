var gCurrentPage;
var gMaxPage;

function forecastById(id) {
    $("#spinner").show();
    $.ajax({
        type: 'GET',
        url: "/forecast/".concat(String(id), "/"),
        success: function (forecast) {
            cleanAllElementChild('forecast_table_body');
            createForecastTable(forecast);
            $("#spinner").hide();
        },
        error: function(data){
            cleanAllElementChild('forecast_table_body');
            createForecastTable(data);
            $("#spinner").hide();
        }
    });
}

function createForecastTable(data) {
    if (data.hasOwnProperty('error_msg')) {
        loadHistoryDataShow();

        $("#forecast_table").hide();
        $("#error_msg").show();

        var error_div = document.getElementById('error_msg');
        var txt = document.createTextNode(data['error_msg']);
        error_div.appendChild(txt);

    } else {
        cleanAllElementChild("error_msg");

        $("#error_msg").hide();
        $("#forecast_table").show();

        var table = document.getElementById("forecast_table_body");
        var rows = document.createElement("tr");
        rows.appendChild(fillTableCell_Text(data['city'] + data['country']));
        rows.appendChild(fillTableCell_Text(data['min_temperature']));
        rows.appendChild(fillTableCell_Text(data['max_temperature']));

        table.appendChild(rows);
    }
}

function historyJsonAsTable(data) {
    var table = document.getElementById("history_table_body");
    gCurrentPage = data['paginator']['current'];
    gMaxPage = data['paginator']['maxpage'];

    $.each(data['history'], function() {
        var rows = document.createElement("tr");
        rows.appendChild(fillTableCell_Text(this['city']));
        rows.appendChild(fillTableCell_Text(this['forecast_day']));
        rows.appendChild(fillTableCell_Text(this['services_name']));
        rows.appendChild(fillTableCell_Urls(this['url']));
        table.appendChild(rows);
    });
}

function historyPagination(){
    var navi_status = document.getElementById('navigation_current');
    var txt = document.createTextNode("Page ".concat(gCurrentPage, ' of ', gMaxPage));
    navi_status.appendChild(txt);
    if (gCurrentPage != gMaxPage && gCurrentPage == 1) {
        $('#navigation_prev').hide();
        $('#navigation_next').show();
    } else if (1 <= gCurrentPage && gCurrentPage < gMaxPage ){
        $('#navigation_prev').show();
        $('#navigation_next').show();
    } else if (gMaxPage != 1 && gCurrentPage == gMaxPage ) {
        $('#navigation_prev').show();
        $('#navigation_next').hide();
    }
}

function cleanAllElementChild(element_id){
    var element = document.getElementById(String(element_id));
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function fillTableCell_Text(cellData){
    var td = document.createElement("td");
    var txt = document.createTextNode(String(cellData));
    td.appendChild(txt);
    return td;
}

function fillTableCell_Urls(data) {
    var td = document.createElement("td");
    var elementA = document.createElement("a");
    var txt = document.createTextNode('check');
    elementA.onclick = function() {forecastById(data)};
    elementA.appendChild(txt);
    td.appendChild(elementA);
    return td;
}

function nextPage(){
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (gCurrentPage + 1)},
        success: function (data) {
            cleanAllElementChild('history_table_body');
            historyJsonAsTable(data);
            cleanAllElementChild('navigation_current');
            historyPagination();
        }
    });
}

function prevPage(){
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (gCurrentPage - 1)},
        success: function (data) {
            cleanAllElementChild('history_table_body');
            historyJsonAsTable(data);
            cleanAllElementChild('navigation_current');
            historyPagination();
            }
    });
}

function loadHistoryDataShow() {
    $.ajax({
        type: 'GET',
        url: "/history/",
        success: function (data) {
            cleanAllElementChild('history_table_body');
            historyJsonAsTable(data);
            cleanAllElementChild('navigation_current');
            historyPagination();
        }
    });
}