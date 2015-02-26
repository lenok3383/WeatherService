function BaseClass () {
    this.fillTableCell_Text = function (cellData) {
        var td = document.createElement("td");
        var txt = document.createTextNode(String(cellData));
        td.appendChild(txt);
        return td;
    };

    this.fillTableCell_Urls = function (data) {
        var td = document.createElement("td");
        var elementA = document.createElement("a");
        var txt = document.createTextNode('check');
        elementA.onclick = function () {
            forecast.getForecastById(data)
        };
        elementA.appendChild(txt);
        td.appendChild(elementA);
        return td;
    };

    this.cleanAllElementChild = function (element_id) {
        var element = document.getElementById(String(element_id));
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
   };

    this.getNumberOfElementsOnPage = function () {
        var number;
        number= Number(document.getElementById("elements_per_page").value);
        if (number < 5) {
            document.getElementById("elements_per_page").value = 5;
            number = 5;
        }
        return number;
    };
}


function Forecast() {
    var self = this;

    this.createForecastTable = function (data) {
        if (data.hasOwnProperty('error_msg')) {
            historyPage.loadHistoryDataAndShow();

            $("#forecast_table").hide();
            $("#error_msg").show();

            var error_div = document.getElementById('error_msg');
            self.baseFunc.cleanAllElementChild('error_msg');
            var txt = document.createTextNode(data['error_msg']);
            error_div.appendChild(txt);

        } else {
            self.baseFunc.cleanAllElementChild("error_msg");

            $("#error_msg").hide();
            $("#forecast_table").show();

            var table = document.getElementById("forecast_table_body");
            var rows = document.createElement("tr");
            rows.appendChild(self.baseFunc.fillTableCell_Text(data['city'] + data['country']));
            rows.appendChild(self.baseFunc.fillTableCell_Text(data['min_temperature']));
            rows.appendChild(self.baseFunc.fillTableCell_Text(data['max_temperature']));

            table.appendChild(rows);
        }
    };

    this.getForecastById = function (id) {
        $("#spinner").show();
        $.ajax({
            type: 'GET',
            url: "/forecast/".concat(String(id), "/"),
            success: function (forecast) {
                self.baseFunc.cleanAllElementChild('forecast_table_body');
                self.createForecastTable(forecast);
                $("#spinner").hide();
            },
            error: function (data) {
                self.baseFunc.cleanAllElementChild('forecast_table_body');
                $("#spinner").hide();
                showErrorMsg("Oops..     Request failed: " + data.statusText +
                ". Please try again later.");
            }
        });
    };
}


function HistoryPagination () {
    this.currentPage = 0;
    this.perPage = null;
    this.maxPage = null;
    var self  = this;

    this.setHistoryData = function(data){
        self.currentPage = data['paginator']['current'];
        self.perPage = data['paginator']['per_page'];
        self.maxPage = data['paginator']['max_page'];
    };

    this.historyJsonAsTable = function (data) {
        var table = document.getElementById("history_table_body");
        $.each(data['history'], function() {
            var rows = document.createElement("tr");
            rows.appendChild(self.baseFunc.fillTableCell_Text(this['city']));
            rows.appendChild(self.baseFunc.fillTableCell_Text(this['forecast_day']));
            rows.appendChild(self.baseFunc.fillTableCell_Text(this['services_name']));
            rows.appendChild(self.baseFunc.fillTableCell_Urls(this['url']));
            table.appendChild(rows);
        });
    };

    this.refreshPaginationButtons = function () {
        var navi_status = document.getElementById('navigation_current');
        var txt = document.createTextNode("Page ".concat(self.currentPage + 1, ' of ', self.maxPage + 1));
        navi_status.appendChild(txt);
        $('#navigation_prev').hide();
        $('#navigation_next').hide()

        if (self.currentPage != self.maxPage && self.currentPage == 0) {
            $('#navigation_prev').hide();
            $('#navigation_next').show();
        } else if (0 <= self.currentPage && self.currentPage < self.maxPage) {
            $('#navigation_prev').show();
            $('#navigation_next').show();
        } else if (self.maxPage != 0 && self.currentPage == self.maxPage) {
            $('#navigation_prev').show();
            $('#navigation_next').hide();
        }
    };

    this.nextPage = function () {
        $.ajax({
            type: 'GET',
            url: '/history/',
            data: {current_page: (self.currentPage + 1),
                   per_page: Number(self.baseFunc.getNumberOfElementsOnPage())},
            success: function (data) {
                self.setHistoryData(data);
                self.baseFunc.cleanAllElementChild('history_table_body');
                self.historyJsonAsTable(data);
                self.baseFunc.cleanAllElementChild('navigation_current');
                self.refreshPaginationButtons();
            },
            error: function (data) {
                showErrorMsg("Oops..     Request failed: " + data.statusText +
                ". Please try again later.");
            }
        });
    };

    this.prevPage = function () {
        self.currentPage = self.currentPage - 1;
        $.ajax({
            type: 'GET',
            url: '/history/',
            data: {current_page: self.currentPage,
                   per_page: Number(self.baseFunc.getNumberOfElementsOnPage())},
            success: function (data) {
                self.setHistoryData(data);
                self.baseFunc.cleanAllElementChild('history_table_body');
                self.historyJsonAsTable(data);
                self.baseFunc.cleanAllElementChild('navigation_current');
                self.refreshPaginationButtons();
            },
            error: function (data) {
                showErrorMsg("Oops..     Request failed: " + data.statusText +
                ". Please try again later.");
            }
        });
    };
    this.loadHistoryDataAndShow = function () {
        $.ajax({
            type: 'GET',
            url: "/history/",
            data: {current_page: self.currentPage,
                   per_page: Number(self.baseFunc.getNumberOfElementsOnPage())},
            success: function (data) {
                self.setHistoryData(data);
                self.baseFunc.cleanAllElementChild('history_table_body');
                self.historyJsonAsTable(data);
                self.baseFunc.cleanAllElementChild('navigation_current');
                self.refreshPaginationButtons();
            },
            error: function (data) {
                showErrorMsg("Oops..     Request failed: " + data.statusText +
                ". Please try again later.");
            }
        });
    };
}

function showErrorMsg (msg) {
    $("#global_error_div").text(msg).show();
    setTimeout(function() {
        $("#global_error_div").text('').hide();
    }, 4000);
}

function getTemperatureDynamic(city){
    $.ajax({
        type: 'GET',
        url: "http://api.worldweatheronline.com/free/v2/weather.ashx",
        data: {q: String(city.replace('_',' ')), format: 'json', num_of_days: '5', key: "caccf05de4bf3a130dcd49c9a79d5"},
        success: function (forecastData) {
            if (forecastData.hasOwnProperty('error') || forecastData == undefined) {
                showErrorMsg("Oops.. Bad response from server. Please try again.");
                $("chart_div").hide();
            } else {
                var weather = forecastData['data']['weather'];
                var chartData = [];
                chartData.push(["Date", "Min. temperature", "Max. temperature"]);
                for (var i=0; i < weather.length; i++) {
                    var row = [];
                    row.push(weather[String(i)]['date'],
                        Number(weather[String(i)]['mintempC']),
                        Number(weather[String(i)]['maxtempC']));
                    chartData.push(row);
                }
                var data = google.visualization.arrayToDataTable(chartData);
                var options = {
                    title: 'Weather dynamic for ' + city,
                    hAxis: {title: 'Days',  titleTextStyle: {color: '#333'}},
                    vAxis: {title: 'Celsius', minValue: 0}
                };
                var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
                chart.draw(data, options);
            }
        },
        error: function() {
            $("chart_div").hide();
            showErrorMsg("Oops.. No response from server. Please try again later.");
        }
    });
}

Forecast.prototype.baseFunc = new BaseClass;
HistoryPagination.prototype.baseFunc =  new BaseClass;
var historyPage = new HistoryPagination();
var forecast = new Forecast();