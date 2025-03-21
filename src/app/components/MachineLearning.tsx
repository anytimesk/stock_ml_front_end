'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { StockCSV, ApiResponse, TableHeader } from '@/types/stock';
import DataTable from './DataTable';

export default function MachineLearning() {
    const { isDarkMode } = useTheme();
    const [csvFiles, setCsvFiles] = useState<StockCSV[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [stockName, setStockName] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    // 날짜 형식화 함수
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.replace(/-/g, '. ');
    };

    // 파일 크기 형식화 함수
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 테이블 헤더 설정
    const headers: TableHeader[] = [
        { key: 'filename', label: '파일명' },
        { key: 'stockName', label: '종목명' },
        { key: 'stockCode', label: '종목코드' },
        { key: 'createdAt', label: '생성일', formatter: formatDate },
        { key: 'sizeBytes', label: '파일 크기', formatter: (value) => formatFileSize(Number(value)) }
    ];

    // CSV 파일 목록 가져오기
    const fetchCSVList = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('http://localhost:8000/ml/getStockData', {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error(`API 요청 실패: ${response.status} ${response.statusText}`);
                return;
            }
            
            const data: ApiResponse = await response.json();
            
            if (data.success) {
                // API 응답 구조에 맞게 데이터 매핑
                const mappedFiles = data.files.map(file => ({
                    filename: file.filename,
                    path: file.path,
                    sizeBytes: file.size_bytes,
                    createdAt: file.created_at,
                    stockCode: file.stock_code,
                    stockName: file.stock_name
                }));
                
                setCsvFiles(mappedFiles);
                setTotalCount(data.count);
            } else {
                console.error(data.message || '데이터를 가져오는 데 실패했습니다.');
            }
        } catch (err) {
            console.error('CSV 파일 목록 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    };

    // 새 CSV 파일 생성
    const createCSVFile = async () => {
        if (!stockName.trim()) {
            alert('종목명을 입력해주세요');
            return;
        }

        try {
            setCreating(true);

            // URL 파라미터 설정
            const params = new URLSearchParams({
                itmsNm: stockName
            });
            
            const response = await fetch(`http://localhost:8000/ml/saveStockDataCSV?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                alert(`API 요청 실패: ${response.status} ${response.statusText}`);
                return;
            }
            
            const result = await response.json();
            alert(`"${stockName}" 종목의 CSV 파일이 성공적으로 생성되었습니다`);
            setStockName('');
            
            // 파일 목록 새로고침
            fetchCSVList();
        } catch (err) {
            console.error('CSV 파일 생성 중 오류 발생:', err);
            alert(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        } finally {
            setCreating(false);
        }
    };

    // 페이지 로드 시 CSV 파일 목록 가져오기
    useEffect(() => {
        fetchCSVList();
    }, []);

    return (
        <div className="flex flex-col w-full">
            <div className="p-6 mb-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">머신러닝 분석</h2>
                
                {/* 새 CSV 파일 생성 폼 */}
                <div className="mb-8 p-4 border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">새 종목 데이터 CSV 생성</h3>
                    <div className="flex flex-row items-center">
                        <input
                            type="text"
                            value={stockName}
                            onChange={(e) => setStockName(e.target.value)}
                            placeholder="종목명을 입력하세요"
                            className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                            onClick={createCSVFile}
                            disabled={creating || !stockName.trim()}
                            className={`ml-2 px-4 py-2 rounded-md transition-colors ${
                                isDarkMode 
                                    ? 'bg-teal-500 text-white hover:bg-teal-400 disabled:bg-gray-600 disabled:text-gray-400' 
                                    : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500'
                            }`}
                        >
                            {creating ? '생성 중...' : 'CSV 생성'}
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        * 종목명을 정확히 입력해주세요. CSV 생성에는 시간이 소요될 수 있습니다.
                    </p>
                </div>
                
                {/* CSV 파일 목록 */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">CSV 파일 목록</h3>
                        <button
                            onClick={fetchCSVList}
                            disabled={loading}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                isDarkMode 
                                    ? 'bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-600' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300'
                            }`}
                        >
                            {loading ? '로딩 중...' : '새로고침'}
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <p>데이터 로딩 중...</p>
                        </div>
                    ) : (
                        <DataTable<StockCSV>
                            headers={headers}
                            data={csvFiles}
                            totalCount={totalCount}
                            itemsPerPage={5}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 