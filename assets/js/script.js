var key = "64f2ee2a8261daa4d9f780f5b365f275";
var city = "Miami";

// Get the current date and time in the format of "weekday, month day year" and "year-month-day hour:minute:second"
var date = moment().format("dddd, MMMM Do YYYY");
var dateTime = moment().format("YYYY-MM-DD HH:MM:SS");

var cityHist = [];
// Initialize an empty array to store the user's search history
$(".search").on("click", function (event) {
  event.preventDefault();
  city = $(this).parent(".btnPar").siblings(".textVal").val().trim();
  if (city === "") {
    return;
  }
  cityHist.push(city);

  localStorage.setItem("city", JSON.stringify(cityHist));
  fiveForecastEl.empty();
  getHistory();
  getWeatherToday();
});

//Will create buttons based on search history
var contHistEl = $(".cityHist");
function getHistory() {
  contHistEl.empty();

  for (let i = 0; i < cityHist.length; i++) {
    var rowEl = $("<row>");
    var btnEl = $("<button>").text(`${cityHist[i]}`);

    rowEl.addClass("row histBtnRow");
    btnEl.addClass("btn btn-outline-secondary histBtn");
    btnEl.attr("type", "button");

    contHistEl.prepend(rowEl);
    rowEl.append(btnEl);
  }
  if (!city) {
    return;
  }
  //Allows the buttons to start a search
  $(".histBtn").on("click", function (event) {
    event.preventDefault();
    city = $(this).text();
    fiveForecastEl.empty();
    getWeatherToday();
  });
}

//Grab the main 'Today' card body.
var cardTodayBody = $(".cardBodyToday");
//Applies the weather data to the today card and then launches fiveday
function getWeatherToday() {
  var getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`;

  $(cardTodayBody).empty();

  $.ajax({
    url: getUrlCurrent,
    method: "GET",
  }).then(function (response) {
    $(".cardTodayCityName").text(response.name);
    $(".cardTodayDate").text(date);
    //Icons
    $(".icons").attr(
      "src",
      `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
    );
    // Temp
    var pEl = $("<p>").text(`Temperature: ${response.main.temp} °F`);
    cardTodayBody.append(pEl);
    //Feels Like
    var pElTemp = $("<p>").text(`Feels Like: ${response.main.feels_like} °F`);
    cardTodayBody.append(pElTemp);
    //Humidity
    var pElHumid = $("<p>").text(`Humidity: ${response.main.humidity} %`);
    cardTodayBody.append(pElHumid);
    //Wind Speed
    var pElWind = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
    cardTodayBody.append(pElWind);
    //Lat Long Set
    var cityLon = response.coord.lon;
    // console.log(cityLon);
    var cityLat = response.coord.lat;
    // console.log(cityLat);

    var getUrlUvi = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=hourly,daily,minutely&appid=${key}`;

    $.ajax({
      url: getUrlUvi,
      method: "GET",
    }).then(function (response) {
      var pElUvi = $("<p>").text(`UV Index: `);
      var uviSpan = $("<span>").text(response.current.uvi);
      var uvi = response.current.uvi;
      pElUvi.append(uviSpan);
      cardTodayBody.append(pElUvi);
      //set the UV index to match an exposure chart severity based on color
      if (uvi >= 0 && uvi <= 2) {
        uviSpan.attr("class", "green");
      } else if (uvi > 2 && uvi <= 5) {
        uviSpan.attr("class", "yellow");
      } else if (uvi > 5 && uvi <= 7) {
        uviSpan.attr("class", "orange");
      } else if (uvi > 7 && uvi <= 10) {
        uviSpan.attr("class", "red");
      } else {
        uviSpan.attr("class", "purple");
      }
    });
  });
  getFiveDayForecast();
}

var fiveForecastEl = $(".fiveForecast");

function getFiveDayForecast() {
  var getUrlFiveDay = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${key}`;

  $.ajax({
    url: getUrlFiveDay,
    method: "GET",
    success: function (response) {
      var fiveDayArray = response.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      var myWeather = fiveDayArray.map((item) => ({
        date: item.dt_txt.split(" ")[0],
        time: item.dt_txt.split(" ")[1],
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
      }));

      var cardEl = "";
      myWeather.forEach(function (weather) {
        var m = moment(weather.date).format("MM-DD-YYYY");
        cardEl += `
          <div class="card text-white bg-primary mb-4 cardOne rounded" style="max-width: 200px;">
            <div class="card-header">${m}</div>
            <div class="card-body">
              <img class="icons" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png">
              <p>Temperature: ${weather.temp} °F</p>
              <p>Feels Like: ${weather.feels_like} °F</p>
              <p>Humidity: ${weather.humidity} %</p>
            </div>
          </div>
        `;
      });

      fiveForecastEl.html(cardEl);
    },
    error: function (error) {
      console.log(error);
    },
  });
}

//Allows for the example data to load for Miami
function initLoad() {
  if (JSON.parse(localStorage.getItem("city")) !== null) {
    cityHist = JSON.parse(localStorage.getItem("city"));
  }
  getHistory();
  getWeatherToday();
}

initLoad();
