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
        $("#forecast").empty();
        var title = $("<h4>").text("5 Day Forecast:");
        var createRow = $("<div>").attr("class", "row").attr("id", "card-row");
        var createCard = $("<div>").attr("class", "card").attr("id", "card-body forecast2");
        $("#forecast").append(title, createRow);
        // $("#forecast2").val('');
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            // merge together and put on page
            var weatherIcon = "https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + "@2x.png";
            console.log(data.list.length);
            var createCard = $("<div>").attr("class", "card-body");
            var dates = $("<h3>").html(data.list[i].dt_txt);
            var weatherPic = $("<img>").attr("src", weatherIcon);
            var temperature = $("<p>").html("Temp: " + data.list[i].main.temp + "℉");
            var humidity = $("<p>").html("Humidity: " + data.list[i].main.humidity + "%");
            var windSpeed = $("<p>").html("Wind Speed: " + data.list[i].wind.speed + "MPH");
            createCard.append(dates, weatherPic, temperature, humidity, windSpeed);
            $("#card-row").append(createCard);
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
          btn.addClass('greenbtn');
        } else if (2 <= data.value && data.value < 5) {
          btn.addClass('yellowbtn');
        } else if (5 <= data.value && data.value < 7) {
          btn.addClass('orangebtn');
        } else if (7 <= data.value && data.value < 10) {
          btn.addClass('redbtn');
        } else if (10 <= data.value) {
          btn.addClass('violetbtn');
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