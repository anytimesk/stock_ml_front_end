'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { StockCSV, StockCSVFileList, TableHeader } from '@/types/stock';
import SelectableDataTable from './SelectableDataTable';
import { API_CONFIG } from '@/config/api';

type ModelType = 'LSTM' | 'RNN';

export default function MachineLearning() {
    const { isDarkMode } = useTheme();
    const [csvFiles, setCsvFiles] = useState<StockCSV[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [stockName, setStockName] = useState('');
    const [selectedModel, setSelectedModel] = useState<ModelType>('LSTM');
    const [trainingResult, setTrainingResult] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<StockCSV[]>([]);

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
        { key: 'stock_name', label: '종목명' },
        { key: 'isin_code', label: '종목코드' },
        { key: 'created_at', label: '생성일', formatter: formatDate },
        { key: 'size_bytes', label: '파일 크기', formatter: (value) => formatFileSize(Number(value)) }
    ];

    // CSV 파일 목록 가져오기
    const fetchCSVList = async () => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_CONFIG.baseURL}/ml/getStockData`, {
                ...API_CONFIG.defaultOptions,
                method: 'GET',
            });
            
            if (!response.ok) {
                console.error(`API 요청 실패: ${response.status} ${response.statusText}`);
                return;
            }
            
            const data: StockCSVFileList = await response.json();
            
            if (data.success) {
                // API 응답 구조에 맞게 데이터 매핑
                const mappedFiles = data.files.map(file => ({
                    filename: file.filename,
                    path: file.path,
                    size_bytes: file.size_bytes,
                    created_at: file.created_at,
                    isin_code: file.isin_code,
                    stock_name: file.stock_name
                }));
                
                setCsvFiles(mappedFiles);
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
            
            const response = await fetch(`${API_CONFIG.baseURL}/ml/saveStockDataCSV?${params.toString()}`, {
                ...API_CONFIG.defaultOptions,
                method: 'GET',
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

    // 머신러닝 학습 시작
    const startMachineLearning = async () => {
        if (selectedItems.length === 0) {
            alert('학습할 종목을 선택해주세요.');
            return;
        }

        try {
            setTrainingResult('학습 중...');
            const params = new URLSearchParams({
                isin_code: selectedItems[0].isin_code,
                model_type: selectedModel.toLowerCase(),
                time_steps: "3",
                epochs: "50",
                batch_size: "32",
                validation_split: "0.2"
            });

            const response = await fetch(`${API_CONFIG.baseURL}/ml/trainModel?${params.toString()}`, {
                ...API_CONFIG.defaultOptions,
                method: 'POST',
                body: ''
            });

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setTrainingResult(JSON.stringify(result, null, 2));
        } catch (err) {
            console.error('머신러닝 학습 중 오류 발생:', err);
            setTrainingResult(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        }
    };

    // 페이지 로드 시 CSV 파일 목록 가져오기
    useEffect(() => {
        fetchCSVList();
    }, []);

    return (
        <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold">머신러닝 분석</h2>
            <div className="flex flex-row mt-2">
                {/* 모델 선택 버튼 */}
                <div className="w-1/2 p-3 rounded-lg shadow-sm border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold">모델 선택</h3>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setSelectedModel('LSTM')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                selectedModel === 'LSTM'
                                    ? isDarkMode
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            LSTM
                        </button>
                        <button 
                            onClick={() => setSelectedModel('RNN')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                selectedModel === 'RNN'
                                    ? isDarkMode
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            RNN
                        </button>
                    </div>
                </div>
                <div className="w-[10px]"></div>
                <div className="w-1/2 p-3 rounded-lg shadow-sm border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold">모델 실행</h3>
                    <div className="flex space-x-4">
                        <button
                            onClick={startMachineLearning}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                isDarkMode
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                        >
                            머신러닝 학습 시작
                        </button>
                    </div>
                    <div className="mt-2 border rounded-md p-2">
                        <p className="text-sm font-semibold mb-2">학습 결과</p>
                        <pre className={`text-sm overflow-auto max-h-40 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                            {trainingResult}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="flex flex-row mt-2">
                {/* 새 CSV 파일 생성 폼 */}
                <div className="w-full p-3 rounded-lg shadow-sm border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold">새 종목 데이터 CSV 생성</h3>
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
                                    ? 'bg-indigo-800 text-white hover:bg-indigo-500 disabled:bg-indigo-300 disabled:text-indigo-200' 
                                    : 'bg-indigo-500 text-white hover:bg-indigo-800 disabled:bg-indigo-300 disabled:text-indigo-200'
                            }`}
                        >
                            {creating ? '생성 중...' : 'CSV 생성'}
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        * 종목명을 정확히 입력해주세요. CSV 생성에는 시간이 소요될 수 있습니다.
                    </p>
                </div>
            </div>

            <div className="flex flex-row mt-2">
                {/* CSV 파일 목록 */}
                <div className="w-full p-3 rounded-lg shadow-sm border dark:border-gray-700 rounded-lg">
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
                        <>
                            <SelectableDataTable
                                headers={headers}
                                data={csvFiles}
                                onSelectionChange={(items) => setSelectedItems(items)}
                                selectable={true}
                                itemsPerPage={3}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-row mt-2">
                {/* 머신러닝을 통한 주가 예측 */}
                <div className="w-full p-3 rounded-lg shadow-sm border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold">주가 예측</h3>
                    <div className="flex space-x-4 mt-2">
                        <button
                            onClick={async () => {
                                if (selectedItems.length === 0) {
                                    alert('예측할 종목을 선택해주세요.');
                                    return;
                                }

                                try {
                                    const params = new URLSearchParams({
                                        model_type: selectedModel.toLowerCase()
                                    });

                                    const response = await fetch(
                                        `${API_CONFIG.baseURL}/ml/predict/${selectedItems[0].isin_code}?${params.toString()}`,
                                        {
                                            ...API_CONFIG.defaultOptions,
                                            method: 'POST',
                                            body: ''
                                        }
                                    );

                                    if (!response.ok) {
                                        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
                                    }

                                    const result = await response.json();
                                    setTrainingResult(JSON.stringify(result, null, 2));
                                } catch (err) {
                                    console.error('주가 예측 중 오류 발생:', err);
                                    setTrainingResult(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
                                }
                            }}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                isDarkMode
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                        >
                            주가 예측 시작
                        </button>
                    </div>
                    <div className="mt-2 border rounded-md p-2">
                        <p className="text-sm font-semibold mb-2">예측 결과</p>
                        <pre className={`text-sm overflow-auto max-h-40 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                            {trainingResult}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
} 