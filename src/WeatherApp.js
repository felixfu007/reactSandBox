import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";

import { ReactComponent as CloudyIcon } from "./images/day-cloudy.svg";
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as RedoIcon } from "./images/refresh.svg";

const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;
`;

// 透過 props 取得傳進來的資料
// props 會是 {theme: "dark", children: "台北市"}
// 透過傳進來的資料決定要呈現的樣式
const Location = styled.div`
  font-size: 28px;
  color: ${(props) => (props.theme === "dark" ? "#dadada" : "#212121")};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
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
  color: #828282;
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
  color: #828282;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Cloudy = styled(CloudyIcon)`
  /* 在這裡寫入 CSS 樣式 */
  flex-basis: 30%;
`;

const Redo = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: #828282;

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;

const WeatherApp = () => {
  console.log("invoke function component");
  const [currentWeather, setCurrentWeather] = useState({
    observationTime: "2019-10-02 22:10:00",
    stationName: "臺北市",
    description: "多雲時晴",
    temperature: 27.5,
    windSpeed: 0.3,
    humid: 88,
  });

  useEffect(() => {
    console.log("execute function in useEffect");
    fetchCurrentWeather();
  }, []);

  const fetchCurrentWeather = () => {
    fetch(
      "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=CWA-72D15255-A2E4-4B35-A2D4-7C01FCAFD816&StationName=%E4%B8%AD%E5%92%8C",
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // STEP 1：定義 `stationData` 把回傳的資料中會用到的部分取出來
        const stationData = data.records.Station[0];

        // STEP 2：將風速（WindSpeed）、氣溫（AirTemperature）和濕度（RelativeHumidity）的資料取出
        const weatherElements = stationData.WeatherElement;

        // STEP 3：要使用到 React 組件中的資料
        setCurrentWeather({
          observationTime: stationData.ObsTime.DateTime,
          stationName: stationData.StationName,
          description: "多雲時晴",
          temperature: weatherElements.AirTemperature,
          windSpeed: weatherElements.WindSpeed,
          humid: weatherElements.RelativeHumidity,
        });
      });
  };

  return (
    <Container>
      {console.log("render")}
      <WeatherCard>
        <Location theme="dark">{currentWeather.stationName}</Location>
        <Description>{currentWeather.description}</Description>
        <CurrentWeather>
          <Temperature>
            {Math.round(currentWeather.temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <Cloudy />
        </CurrentWeather>
        <AirFlow>
          <AirFlowIcon />
          {currentWeather.windSpeed} m/h
        </AirFlow>
        <Rain>
          <RainIcon />
          {currentWeather.humid} %
        </Rain>
        <Redo onClick={fetchCurrentWeather}>
          最後觀測時間：
          {new Intl.DateTimeFormat("zh-TW", {
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(currentWeather.observationTime))}{" "}
          <RedoIcon />
        </Redo>
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
