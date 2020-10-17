$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    console.log(searchValue);
    // clear input box
    $("#search-value").val('');
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  $("#clear-history").on("click", function() {
    localStorage.clear();
    window.location.reload();
  });

// makes history box
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(cityName) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=aa4b8fd43ea8bc685207d57d98c4ad7d",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(cityName.toLowerCase()) === -1) {
          history.push(cityName.toLowerCase());
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(cityName);
        }
        
        // clear any old content
        $("#today").val('');
        // create html content for current weather
        // merge and add to page
        var weatherIcon = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
        
        $("#today").html(
          "<h3>" + data.name + " " + "(" + today + ") " + "<img src=" + weatherIcon + '>' + "</h3>" + 
          "<p>" +
          "Temperature: " + data.main.temp + "&#8457;" +
          "</p>" +
          "<p>" +
          "Humidity: " + data.main.humidity + "%" +
          "</p>" +
          "<p>" +
          "Wind Speed: " + data.wind.speed + "MPH" +
          "</p>" +
          '<div class="UVbutton">' + "</div>"
        );

        // call follow-up api endpoints
        getForecast(cityName);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(cityName) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=aa4b8fd43ea8bc685207d57d98c4ad7d",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").val('');
        var title = $("<h4>").text("5 Day Forecast:");
        var createRow = $("<div>").attr("class", "row").attr("id", "card-row forecast2");
        $("#forecast").append(title, createRow);
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {;
            // create html elements for a bootstrap card
            // merge together and put on page
            $("#forecast2").html(
              '<div class="card-body">' + 
              "<h3>" + data.list[i].dt_txt + "</h3>" + 
              "<p>" +
              "Temperature: " + data.list[i].main.temp + "&#8457;" +
              "</p>" +
              "<p>" +
              "Humidity: " + data.list[i].main.humidity + "%" +
              "</p>" +
              "<p>" +
              "Wind Speed: " + data.list[i].wind.speed + "MPH" +
              "</p>" +
              "</div>" +
              "</div>"
            );
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=aa4b8fd43ea8bc685207d57d98c4ad7d",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        // change color depending on uv value
        if (data.value < 2) {
          var btn = $("<span>").addClass("btn btn-sm greenbtn").text(data.value);
        } else if (2 <= data.value && data.value < 5) {
          var btn = $("<span>").addClass("btn btn-sm yellowbtn").text(data.value);
        } else if (5 <= data.value && data.value < 7) {
          var btn = $("<span>").addClass("btn btn-sm orangebtn").text(data.value);
        } else if (7 <= data.value && data.value < 10) {
          var btn = $("<span>").addClass("btn btn-sm redbtn").text(data.value);
        } else if (10 <= data.value) {
          var btn = $("<span>").addClass("btn btn-sm violetbtn").text(data.value);
        }
        
        $("#today .UVbutton").append(uv.append(btn));
        console.log(data.value);
      } 
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});


//code for gathering date for current day
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;