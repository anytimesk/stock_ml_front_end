'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { StockData } from '../types/stock';
import { useTheme } from '../contexts/ThemeContext';

interface CandlestickChartProps {
    data: StockData[];
    stockName: string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, stockName }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const { isDarkMode } = useTheme();

    const upColor = "#FF0000";
    const downColor = "#0000FF";

    // 이동 평균선 계산 함수
    function calculateMA(dayCount: number, values: number[][]) {
        let result = new Array(values.length).fill("-");
        let sum = 0;

        // 데이터가 충분하지 않으면 빈 배열 반환
        if (values.length < dayCount) {
            return result;
        }

        // 첫 번째 `dayCount` 값의 초기 합계를 계산합니다.
        for (let i = 0; i < dayCount; i++) {
            sum += values[i][1]; // 종가 데이터 사용
        }

        // 첫 번째 MA 값을 저장합니다.
        result[dayCount - 1] = (sum / dayCount).toFixed(1);

        // 슬라이딩 윈도우를 사용하여 나머지 MA 값을 계산합니다.
        for (let i = dayCount; i < values.length; i++) {
            sum += values[i][1]; // 새로운 값을 더합니다.
            sum -= values[i - dayCount][1]; // 슬라이드 아웃되는 값을 뺍니다.
            result[i] = (sum / dayCount).toFixed(1);
        }

        return result;
    }

    useEffect(() => {
        // 차트 데이터가 비어있으면 렌더링하지 않음
        if (!data || data.length === 0 || !chartRef.current) {
            return;
        }

        // 차트가 이미 초기화되어 있으면 제거
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        // 차트 초기화
        const chart = echarts.init(chartRef.current, isDarkMode ? 'dark' : undefined);
        chartInstance.current = chart;

        // 데이터 처리
        const sortedData = [...data].sort((a, b) => {
            // 날짜 기준으로 오름차순 정렬 (과거 -> 최근)
            const dateA = a.basDt;
            const dateB = b.basDt;
            return dateA.localeCompare(dateB);
        });

        // 차트에 표시할 데이터 형식으로 변환
        const dates = sortedData.map(item => {
            const date = item.basDt;
            return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
        });

        const values = sortedData.map(item => [
            parseFloat(item.mkp),  // 시가
            parseFloat(item.clpr), // 종가
            parseFloat(item.lopr), // 저가
            parseFloat(item.hipr)  // 고가
        ]);

        // 이동평균선 계산
        const ma5 = calculateMA(5, values);
        const ma10 = calculateMA(10, values);
        const ma20 = calculateMA(20, values);

        const volumes = sortedData.map(item => parseFloat(item.trqu));
        const maxVolume = Math.max(...volumes);

        // 차트 옵션 설정
        const options: echarts.EChartsOption = {
            title: {
                text: `${stockName} 주가 차트`,
                left: 'center',
                textStyle: {
                    color: isDarkMode ? '#ffffff' : '#333333'
                }
            },
            legend: {
                top: '5%',
                data: ['주가', 'MA5', 'MA10', 'MA20'],
                textStyle: {
                    color: isDarkMode ? '#ffffff' : '#333333'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                position: function (pos, params, el, elRect, size) {
                    const obj: Record<string, number> = {
                        top: 10
                    };
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                },
                formatter: function (params: any) {
                    // 파라미터가 배열인지 확인
                    if (!Array.isArray(params)) {
                        return '';
                    }
                    
                    // 캔들스틱 데이터 찾기
                    const candlestickParam = params.find(p => p.seriesName === '주가');
                    if (!candlestickParam) {
                        return '';
                    }
                    
                    const date = candlestickParam.name;
                    const data = candlestickParam.value;
                    
                    let result = [
                        '날짜: ' + date + '<br/>',
                        '시가: ' + Number(data[0]).toLocaleString() + '<br/>',
                        '종가: ' + Number(data[1]).toLocaleString() + '<br/>',
                        '저가: ' + Number(data[2]).toLocaleString() + '<br/>',
                        '고가: ' + Number(data[3]).toLocaleString() + '<br/>'
                    ];
                    
                    // 이동평균선 데이터 추가
                    params.forEach(param => {
                        if (param.seriesName.startsWith('MA') && param.value !== '-') {
                            result.push(param.seriesName + ': ' + Number(param.value).toLocaleString() + '<br/>');
                        }
                    });
                    
                    return result.join('');
                }
            },
            grid: [
                {
                    left: '10%',
                    right: '10%',
                    top: '15%',
                    height: '55%'
                },
                {
                    left: '10%',
                    right: '10%',
                    top: '75%',
                    height: '15%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: dates,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        label: { show: false }
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: dates,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: Math.max(0, 100 - Math.min(100, 2000 / data.length)),
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    bottom: '5%',
                    start: Math.max(0, 100 - Math.min(100, 2000 / data.length)),
                    end: 100
                }
            ],
            series: [
                {
                    name: '주가',
                    type: 'candlestick',
                    data: values,
                    itemStyle: {
                        color: upColor,      // 양봉(상승) 색상
                        color0: downColor,     // 음봉(하락) 색상
                        borderColor: upColor,
                        borderColor0: downColor
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: ma5,
                    smooth: true,
                    lineStyle: {
                        opacity: 0.8
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: ma10,
                    smooth: true,
                    lineStyle: {
                        opacity: 0.8
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: ma20,
                    smooth: true,
                    lineStyle: {
                        opacity: 0.8
                    }
                },
                {
                    name: '거래량',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumes,
                    itemStyle: {
                        color: function(params) {
                            const index = params.dataIndex;
                            const closePrice = values[index][1];  // 종가
                            const openPrice = values[index][0];   // 시가
                            return closePrice > openPrice ? upColor : downColor;
                        }
                    }
                }
            ]
        };

        // 차트 옵션 설정
        chart.setOption(options);

        // 창 크기 변경 시 차트 크기 조절
        const handleResize = () => {
            chart.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [data, stockName, isDarkMode]);

    return <div ref={chartRef} style={{ width: '100%', height: '500px' }} />;
};

export default CandlestickChart; 