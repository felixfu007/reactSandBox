import React, { useState, useEffect, useCallback, useMemo } from "react";
// 從 @emotion/react 中載入 ThemeProvider
import { ThemeProvider } from "@emotion/react";
//載入emotion的styled css工具
import styled from "@emotion/styled";
import WeatherIcon from "./WeatherIcon.js";
import sunriseAndSunsetData from "./sunrise-sunset.json";

//載入SVG圖片
import { ReactComponent as CloudyIcon } from "./images/day-cloudy.svg";
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as RefreshIcon } from "./images/refresh.svg";
import { ReactComponent as LoadingIcon } from "./images/loading.svg";

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};

const Container = styled.div`
  /* 在 Styled Component 中可以透過 Props 取得對的顏色 */
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`;

// 透過 props 取得傳進來的資料
// props 會是 {theme: "dark", children: "台北市"}
// 透過傳進來的資料決定要呈現的樣式
const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    /* 使用 rotate 動畫效果在 svg 圖示上 */
    animation: rotate infinite 1.5s linear;
    /* 取得傳入的 props 並根據它來決定動畫要不要執行 */
    animation-duration: ${({ isLoading }) => (isLoading ? "1.5s" : "0s")};
  }

  /* STEP 1：定義旋轉的動畫效果，並取名為 rotate */
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`;
//fetch api 並回傳promise
const fetchWeatherForecast = () => {
  return fetch(
    "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-72D15255-A2E4-4B35-A2D4-7C01FCAFD816&locationName=%E8%87%BA%E5%8C%97%E5%B8%82",
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

const getMoment = (stationName) => {
  // STEP 2：從日出日落時間中找出符合的地區
  const location = sunriseAndSunsetData.find(
    (data) => data.locationName === stationName,
  );
  // STEP 3：找不到的話則回傳 null
  if (!location) return null;

  // STEP 4：取得當前時間
  const now = new Date();

  // STEP 5：將當前時間以 "2019-10-08" 的時間格式呈現
  const nowDate = Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/\//g, "-");

  // STEP 6：從該地區中找到對應的日期
  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);

  // STEP 7：將日出日落以及當前時間轉成時間戳記（TimeStamp）
  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`,
  ).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`,
  ).getTime();
  const nowTimeStamp = now.getTime();

  // STEP 8：若當前時間介於日出和日落中間，則表示為白天，否則為晚上
  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? "day"
    : "night";
};

const WeatherApp = () => {
  console.log("invoke function component");
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

  const {
    observationTime,
    stationName,
    temperature,
    windSpeed,
    description,
    weatherCode,
    rainPossibility,
    comfortability,
    isLoading,
  } = weatherElement;

  //使用 useState 並定義 currentTheme 的預設值為 light
  const [currentTheme, setCurrentTheme] = useState("light");

  const moment = useMemo(() => getMoment(stationName), [stationName]);
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

  // 根據 moment 決定要使用亮色或暗色主題
  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
    // 記得把 moment 放入 dependencies 中
  }, [moment]);

  return (
    // 把所有會用到主題配色的部分都包在 ThemeProvider 內
    // 透過 theme 這個 props 傳入深色主題
    // 將當前選到的主題配色傳入 `theme` 中
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log(isLoading)}
        {console.log("render")}
        <WeatherCard>
          <Location theme="dark">{stationName}</Location>
          <Description>
            {description} {comfortability}
          </Description>
          <CurrentWeather>
            <Temperature>
              {Math.round(temperature)} <Celsius>°C</Celsius>
            </Temperature>
            <WeatherIcon
              currentWeatherCode={weatherCode}
              moment={moment || "day"}
            />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon />
            {windSpeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon />
            {rainPossibility} %
          </Rain>
          {/* 把 isLoading 的資料狀態透過 props 傳入 Styled Component */}
          <Refresh onClick={fetchData} isLoading={isLoading}>
            最後觀測時間：
            {new Intl.DateTimeFormat("zh-TW", {
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(observationTime))}{" "}
            {/* STEP 2：當 isLoading 的時候顯示 LoadingIcon 否則顯示 RefreshIcon */}
            {isLoading ? <LoadingIcon /> : <RefreshIcon />}
          </Refresh>
        </WeatherCard>
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
