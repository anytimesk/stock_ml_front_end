'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import {StockData, StockResponse } from '../types/stock';

export default function SearchStock() {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stockData, setStockData] = useState<StockData[] | null>(null);
    const [stockInfo, setStockInfo] = useState<{ name: string, totalCount: number } | null>(null);

    const searchStock = async () => {
        try {
            setLoading(true);
            setError(null);
            setStockData(null);
            setStockInfo(null);
            
            // 입력값 가져오기
            const stockName = (document.getElementById('itmsNm') as HTMLInputElement)?.value;
            const numOfRows = (document.getElementById('numOfRows') as HTMLSelectElement)?.value || '10';
            
            if (!stockName) {
                setError('종목명을 입력해주세요');
                return;
            }
            
            // URL 파라미터 설정
            const params = new URLSearchParams({
                itmsNm: stockName,
                pageNo: '1',
                numOfRows: numOfRows
            });
            
            // API 호출
            //console.log(`API 요청: 종목명=${stockName}, 데이터 수=${numOfRows}`);
            const response = await fetch(`http://localhost:8000/stock/getStockPriceInfo?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
            }
            
            const data: StockResponse = await response.json();
            //console.log('API 응답 데이터:', data);
            
            // 응답 구조 확인 및 데이터 저장
            if (data?.response?.body?.items?.item) {
                const items = Array.isArray(data.response.body.items.item) 
                    ? data.response.body.items.item 
                    : [data.response.body.items.item];
                
                setStockData(items);
                setStockInfo({
                    name: stockName,
                    totalCount: items.length
                });
            } else {
                setError('데이터 형식이 올바르지 않습니다');
            }
            
        } catch (err) {
            console.error('주가 정보 조회 중 오류 발생:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    // 숫자 형식화 함수
    const formatNumber = (numStr: string) => {
        const num = parseFloat(numStr);
        return isNaN(num) ? numStr : num.toLocaleString('ko-KR');
    };

    // 날짜 형식화 함수
    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    };

    return (
        <div className="flex flex-col w-full items-center justify-center">
            {error && (
                <div className="w-full mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            <div className="flex flex-row items-center justify-center w-full mb-6">
                <input
                    className="w-full p-2 border rounded-md"
                    style={{ 
                        borderColor: 'var(--borderColor)',
                        backgroundColor: 'var(--cardBackground)',
                        color: 'var(--foreground)'
                    }}
                    type="text"
                    id="itmsNm"
                    placeholder="종목명을 입력하세요"
                    list="companiesList" />
                <datalist id="companiesList"> </datalist>
                <select 
                    id="numOfRows" 
                    name="selbox"
                    className="p-2 mx-2 border rounded-md"
                    style={{ 
                        borderColor: 'var(--borderColor)',
                        backgroundColor: 'var(--cardBackground)',
                        color: 'var(--foreground)'
                    }}
                >
                    <option value="60">60</option>
                    <option value="90">90</option>
                    <option value="180">180</option>
                    <option value="365">365</option>
                    <option value="730">730</option>
                </select>
                <button
                    onClick={searchStock}
                    disabled={loading}
                    className={`px-3 py-1 rounded-md transition-colors min-w-[60px] ${
                        isDarkMode 
                            ? 'bg-neutral-50 text-neutral-950 hover:bg-neutral-400' 
                            : 'bg-neutral-950 text-neutral-50 hover:bg-neutral-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? '로딩...' : '조회'}
                </button>
            </div>

            {/* 결과 테이블 */}
            {stockData && stockData.length > 0 && (
                <div className="w-full">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">
                            {stockInfo?.name} 주가 정보 (총 {stockInfo?.totalCount || stockData.length}건)
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto rounded-lg shadow-sm">
                        <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">기준일자</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">종목명</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">시가</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">고가</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">저가</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">종가</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">전일대비</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">등락률</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">거래량</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200">거래대금</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockData.map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatDate(item.basDt)}</td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{item.itmsNm}</td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatNumber(item.mkp)}</td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatNumber(item.hipr)}</td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatNumber(item.lopr)}</td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatNumber(item.clpr)}</td>
                                        <td className={`px-4 py-2 border-b border-gray-200 dark:border-gray-600 ${
                                            parseFloat(item.vs) > 0 
                                                ? 'text-red-500' 
                                                : parseFloat(item.vs) < 0 
                                                    ? 'text-blue-500' 
                                                    : 'text-gray-700 dark:text-gray-200'
                                        }`}>
                                            {formatNumber(item.vs)}
                                        </td>
                                        <td className={`px-4 py-2 border-b border-gray-200 dark:border-gray-600 ${
                                            parseFloat(item.fltRt) > 0 
                                                ? 'text-red-500' 
                                                : parseFloat(item.fltRt) < 0 
                                                    ? 'text-blue-500' 
                                                    : 'text-gray-700 dark:text-gray-200'
                                        }`}>
                                            {item.fltRt}%
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatNumber(item.trqu)}</td>
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">{formatNumber(item.trPrc)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {loading && (
                <div className="flex justify-center items-center w-full p-8">
                    <div className="text-center">데이터를 불러오는 중...</div>
                </div>
            )}
            
            {!loading && stockData && stockData.length === 0 && (
                <div className="w-full p-8 text-center">
                    <p>검색 결과가 없습니다. 다른 종목명으로 검색해 보세요.</p>
                </div>
            )}
        </div>
    );
}