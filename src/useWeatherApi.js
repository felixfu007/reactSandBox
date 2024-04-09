// 載入會用到的 React Hooks
import { useState, useEffect, useCallback } from "react";
//fetch api 並回傳promise
const fetchWeatherForecast = () => {
  return fetch(
    "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-72D15255-A2E4-4B35-A2D4-7C01FCAFD816&locationName=%E6%96%B0%E5%8C%97%E5%B8%82",
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].indexOf(item.elementName) !== -1) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {},
      );
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

//fetch api 並回傳promise
const fetchCurrentWeather = () => {
  return fetch(
    "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=CWA-72D15255-A2E4-4B35-A2D4-7C01FCAFD816&StationName=%E4%B8%AD%E5%92%8C",
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const stationData = data.records.Station[0];
      const weatherElements = stationData.WeatherElement;
      return {
        observationTime: stationData.ObsTime.DateTime,
        stationName: stationData.StationName,
        description: "多雲時晴",
        temperature: weatherElements.AirTemperature,
        windSpeed: weatherElements.WindSpeed,
        humid: weatherElements.RelativeHumidity,
      };
    });
};

const useWeatherApi = () => {
  // 把原本 useState 的部分搬移進來
  //初始值
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    stationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true,
  });

  //如果某個函式不需要被覆用，那麼可以直接定義在 useEffect 中，但若該方法會需要被共用，則把該方法提到 useEffect 外面後，記得用 useCallback 進行處理後再放到 useEffect 的 dependencies 中
  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      //非同步呼叫兩隻API
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);
      console.log("currentWeather", currentWeather);
      console.log("weatherForecast", weatherForecast);
      //設定WeatherElement並刷新頁面
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      });
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetchingData();
  }, []);

  //載入頁面時執行，但若該方法會需要被共用，則把該方法提到 useEffect 外面
  //因為fetchData是外部函式，所以需要放進depandencies陣列中
  //當depandencies陣列中的物件(函式)有變化時，就會重新渲染頁面
  useEffect(() => {
    console.log("execute function in useEffect");
    fetchData();
  }, [fetchData]);

  // 把要給其他 React 組件使用的資料或方法回傳出去
  return [weatherElement, fetchData];
};

export default useWeatherApi;
