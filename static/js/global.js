function  fillTableCell_Text (cellData) {
    var td = document.createElement("td");
    var txt = document.createTextNode(cellData);
    td.appendChild(txt);
    return td;
}

function Forecast() {
    var self = this;

    this.createForecastTable = function (data) {
        if (data.hasOwnProperty('error_msg')) {
            historyPage.loadHistoryPage();
            $("#forecast_table").hide();
            $("#error_msg").empty().show();

            var error_div = document.getElementById('error_msg');
            var txt = document.createTextNode(data['error_msg']);
            error_div.appendChild(txt);

        } else {
            $("#error_msg").empty().hide();
            $("#forecast_table_body").empty();
            $("#forecast_table").show();

            var table = document.getElementById("forecast_table_body");
            var rows = document.createElement("tr");
            rows.appendChild(fillTableCell_Text(data['city'] + data['country']));
            rows.appendChild(fillTableCell_Text(data['min_temperature']));
            rows.appendChild(fillTableCell_Text(data['max_temperature']));

            table.appendChild(rows);
        }
    };

    this.getForecastById = function (id) {
        $("#spinner").show();
        $.ajax({
            type: 'GET',
            url: "/forecast/".concat(String(id), "/"),
            success: function (forecast) {
                $('#forecast_table_body').empty();
                self.createForecastTable(forecast);
                $("#spinner").hide();
            },
            error: function (data) {
                $('#forecast_table_body').empty();
                $("#spinner").hide();
                showErrorMsg("Oops..     Request failed: " + data.statusText +
                ". Please try again later.");
            }
        });
    };
}

function Pagination (perPageElementId) {
    this.elementId = perPageElementId;
    this.currentPage = 0;
    this.perPage = null;
    this.maxPage = null;
    var self  = this;

    this.setPaginationData = function(data){
        self.currentPage = data['paginator']['current'];
        self.perPage = data['paginator']['per_page'];
        self.maxPage = data['paginator']['max_page'];
    };

    this.getNumberOfElementsOnPage = function () {
        var number;
        number = document.getElementById(self.elementId).value;
        if (number < 5) {
            document.getElementById(self.elementId).value = 5;
            number = 5;
        }
        return number;
    };

    this.refreshPaginationButtons = function () {
        var navi_status = document.getElementById('navigation_current');
        var txt = document.createTextNode("Page ".concat(self.currentPage + 1, ' of ', self.maxPage + 1));
        navi_status.appendChild(txt);

        $('#navigation_prev').hide();
        $('#navigation_next').hide();

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


}

function HistoryPaginated () {
    var self  = this;

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

    this.historyJsonToTable = function (dataPage) {
            var table = document.getElementById("history_table_body");
            $.each(dataPage['history'], function() {
                var rows = document.createElement("tr");
                rows.appendChild(fillTableCell_Text(this['city']));
                rows.appendChild(fillTableCell_Text(this['forecast_day']));
                rows.appendChild(fillTableCell_Text(this['services_name']));
                rows.appendChild(self.fillTableCell_Urls(this['url']));
                table.appendChild(rows);
            });
        };

    this.nextPage = function () {
        self.loadHistoryPage({current_page: (self.pagination.currentPage + 1),
                    per_page: Number(self.pagination.getNumberOfElementsOnPage()) });
    };

    this.prevPage = function () {
        self.loadHistoryPage({
            current_page: (self.pagination.currentPage - 1),
            per_page: Number(self.pagination.getNumberOfElementsOnPage())
        });
    };


    this.loadHistoryPage = function (data) {
        data = typeof data !== 'undefined' ? data : {
                    current_page: 0,
                    per_page: Number(historyPage.pagination.getNumberOfElementsOnPage()) };
        $.ajax({
            type: "GET",
            url: "/history/",
            data: data,
            success: function (data) {
                $('#history_table_body').empty();
                $('#navigation_current').empty();

                self.historyJsonToTable(data);
                self.pagination.setPaginationData(data);
                self.pagination.refreshPaginationButtons();
            },
            error: function () {
                showErrorMsg("Something wrong. Please reload page.");
            }
        });
    }

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

HistoryPaginated.prototype.pagination =  new Pagination("elements_per_page");
var historyPage = new HistoryPaginated();
var forecast = new Forecast();