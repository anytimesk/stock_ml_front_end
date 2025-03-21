'use client';

import { useTheme } from '../contexts/ThemeContext';
import { TableConfig } from '@/types/stock';
import { useState, useEffect } from 'react';

export default function DataTable<T>({ headers, data, title, totalCount, itemsPerPage = 15 }: TableConfig<T>) {
    const { isDarkMode } = useTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedData, setPaginatedData] = useState(data);
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    // 페이지 변경시 데이터 업데이트
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, data.length);
        setPaginatedData(data.slice(startIndex, endIndex));
    }, [currentPage, data, itemsPerPage]);
    
    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        setCurrentPage(page);
    };
    
    // 기본 처리
    if (!data || data.length === 0) {
        return (
            <div className="w-full p-8 text-center">
                <p>표시할 데이터가 없습니다.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full">
            {title && (
                <div className="mb-4">
                    <h2 className="text-xl font-bold">
                        {title} {data.length !== undefined && `(총 ${data.length}건)`}
                    </h2>
                </div>
            )}
            
            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <thead>
                        <tr className={`
                            ${isDarkMode ? 'bg-indigo-800 text-indigo-50' : 'bg-indigo-200 text-indigo-950'}`
                        }>
                            {headers.map((header, index) => (
                                <th key={index} className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold">
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, rowIndex) => (
                            <tr key={rowIndex} className={
                                rowIndex % 2 === 0
                                    ? isDarkMode
                                        ? 'bg-gray-900 text-neutral-50 hover:bg-indigo-800'
                                        : 'bg-white text-neutral-900 hover:bg-indigo-100'
                                    : isDarkMode 
                                        ? 'bg-gray-800 text-neutral-50 hover:bg-indigo-800' 
                                        : 'bg-gray-100 text-neutral-900 hover:bg-indigo-100'
                            }>
                                {headers.map((header, colIndex) => {
                                    // 값 추출
                                    const value = item[header.key as keyof T] as string;
                                    
                                    // 특별한 스타일이 필요한 열 (등락률, 전일대비 등)
                                    let className = "px-4 py-2 border-b border-gray-200 dark:border-gray-600 ";
                                    
                                    // 특별한 클래스가 정의되어 있는 경우 (등락률, 전일대비 등)
                                    if (header.className) {
                                        className = header.className;
                                    } else if (header.key === 'vs' || header.key === 'fltRt') {
                                        // 상승/하락 여부에 따른 색상 적용
                                        const numValue = parseFloat(value);
                                        if (numValue > 0) {
                                            className += " text-red-500";
                                        } else if (numValue < 0) {
                                            className += " text-blue-500";
                                        }
                                    }
                                    
                                    // 값 형식화 (formatter가 제공된 경우)
                                    const displayValue = header.formatter ? header.formatter(value) : value;
                                    
                                    return (
                                        <td key={colIndex} className={className}>
                                            {displayValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* 페이지네이션 UI */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                            currentPage === 1 
                                ? 'bg-indigo-200 text-indigo-500 cursor-not-allowed dark:bg-indigo-700' 
                                : isDarkMode 
                                    ? 'bg-indigo-700 text-indigo-50 hover:bg-indigo-600' 
                                    : 'bg-indigo-200 text-indigo-950 hover:bg-indigo-300'
                        }`}
                    >
                        처음
                    </button>
                    
                    <div className="flex space-x-1">
                        {/* 페이지 번호 표시 */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // 표시할 페이지 번호 계산
                            const pageNumToShow = totalPages <= 5 
                                ? i + 1 
                                : currentPage <= 3 
                                    ? i + 1 
                                    : currentPage >= totalPages - 2 
                                        ? totalPages - 4 + i 
                                        : currentPage - 2 + i;
                            
                            if (pageNumToShow <= totalPages) {
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(pageNumToShow)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                            currentPage === pageNumToShow
                                                ? isDarkMode
                                                    ? 'bg-indigo-50 text-indigo-950'
                                                    : 'bg-indigo-950 text-indigo-50'
                                                : isDarkMode
                                                    ? 'bg-indigo-700 text-indigo-50 hover:bg-indigo-600'
                                                    : 'bg-indigo-200 text-indigo-950 hover:bg-indigo-300'
                                        }`}
                                    >
                                        {pageNumToShow}
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </div>
                    
                    <button 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${
                            currentPage === totalPages 
                                ? 'bg-indigo-200 text-indigo-500 cursor-not-allowed dark:bg-indigo-700' 
                                : isDarkMode 
                                    ? 'bg-indigo-700 text-indigo-50 hover:bg-indigo-600' 
                                    : 'bg-indigo-200 text-indigo-950 hover:bg-indigo-300'
                        }`}
                    >
                        마지막
                    </button>
                </div>
            )}
            
            {/* 페이지 정보 표시 */}
            {totalPages > 1 && (
                <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {currentPage} / {totalPages} 페이지  (총 {data.length}개 항목)
                </div>
            )}
        </div>
    );
} 