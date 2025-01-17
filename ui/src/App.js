// src/App.js
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가

  useEffect(() => {
    const csvFilePath = '/data/경상대_일자별관측_processed.csv';
    console.log(`Fetching CSV file from: ${csvFilePath}`);

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true, // 빈 줄 무시
      complete: (results) => {
        // 데이터 확인
        console.log('Parsed Data:', results.data);

        // Date 필드 처리 (예: 'YYMMDDHHMI'를 Date로 변환)
        const formattedData = results.data.map(item => ({
          ...item,
          // YYMMDDHHMI를 문자열로 변환하여 formatDate 함수에 전달
          Date: item.YYMMDDHHMI ? formatDate(String(item.YYMMDDHHMI)) : null,
        })).filter(item => item.Date && isValidDate(item.Date)); // 유효한 Date 필드만 필터링

        setData(formattedData);
        console.log('Formatted Data: ', formattedData);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError(error);
        setLoading(false);
      }
    });
  }, []);

  // YYMMDDHHMI를 Date 객체로 변환하는 함수
  const formatDate = (yyMMddHHMI) => {
    // 예시 데이터 형식: 202201010000 (YYYYMMDDHHMI)
    if (typeof yyMMddHHMI !== 'string') return null;
    const year = parseInt(yyMMddHHMI.substring(0, 4), 10);
    const month = parseInt(yyMMddHHMI.substring(4, 6), 10) - 1; // 월은 0부터 시작
    const day = parseInt(yyMMddHHMI.substring(6, 8), 10);
    const hour = parseInt(yyMMddHHMI.substring(8, 10), 10);
    const minute = parseInt(yyMMddHHMI.substring(10, 12), 10);

    const date = new Date(year, month, day, hour, minute);
    return isNaN(date.getTime()) ? null : date;
  };

  // 유효한 Date인지 확인하는 함수
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // 그래프에 사용할 컬럼 정의
  const columns = ['WD', 'WS', 'PA', 'PS', 'TA', 'TD', 'HM', 'PV', 'RN', 'RN.1', 'RN.2', 'CA', 'CA.1', 'CH', 'VS', 'SS', 'SI', 'TS'];

  if (loading) {
    return <div className="App"><h1>데이터 로딩 중...</h1></div>;
  }

  if (error) {
    return <div className="App"><h1>데이터 로딩 중 오류 발생: {error.message}</h1></div>;
  }

  return (
    <div className="App">
      <h1>경상대 일자별 기상 데이터 시각화</h1>
      <div className="charts-container">
        {columns.map((col) => (
          <div key={col} className="chart-wrapper">
            <h3>{col}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(date) => `${date.getMonth() + 1}/${date.getDate()}`}
                />
                <YAxis />
                <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
                <Legend />
                <Line type="monotone" dataKey={col} stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
