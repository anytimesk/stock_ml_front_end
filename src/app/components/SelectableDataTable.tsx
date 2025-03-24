'use client';

import { useTheme } from '../contexts/ThemeContext';
import { TableConfig } from '@/types/stock';
import { useState, useEffect } from 'react';

interface SelectableDataTableProps<T> extends TableConfig<T> {
    onSelectionChange?: (selectedItems: T[]) => void;
    selectable?: boolean;
}

export default function SelectableDataTable<T>({ 
    headers, 
    data, 
    title, 
    totalCount, 
    itemsPerPage = 15,
    onSelectionChange,
    selectable = true
}: SelectableDataTableProps<T>) {
    const { isDarkMode } = useTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedData, setPaginatedData] = useState(data);
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    // 페이지 변경시 데이터 업데이트
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, data.length);
        setPaginatedData(data.slice(startIndex, endIndex));
    }, [currentPage, data, itemsPerPage]);
    
    // 선택 상태 변경 핸들러
    const handleSelectionChange = (item: T) => {
        const isSelected = selectedItems.some(selected => 
            JSON.stringify(selected) === JSON.stringify(item)
        );
        
        let newSelectedItems: T[];
        if (isSelected) {
            newSelectedItems = selectedItems.filter(selected => 
                JSON.stringify(selected) !== JSON.stringify(item)
            );
        } else {
            newSelectedItems = [...selectedItems, item];
        }
        
        setSelectedItems(newSelectedItems);
        onSelectionChange?.(newSelectedItems);
    };
    
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
                            {selectable && (
                                <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold w-12">
                                    선택
                                </th>
                            )}
                            {headers.map((header, index) => (
                                <th key={index} className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-left font-semibold">
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, rowIndex) => {
                            const isSelected = selectedItems.some(selected => 
                                JSON.stringify(selected) === JSON.stringify(item)
                            );
                            
                            return (
                                <tr 
                                    key={rowIndex} 
                                    onClick={() => selectable && handleSelectionChange(item)}
                                    className={`
                                        ${rowIndex % 2 === 0
                                            ? isDarkMode
                                                ? 'bg-gray-900 text-neutral-50 hover:bg-indigo-800'
                                                : 'bg-white text-neutral-900 hover:bg-indigo-100'
                                            : isDarkMode 
                                                ? 'bg-gray-800 text-neutral-50 hover:bg-indigo-800' 
                                                : 'bg-gray-100 text-neutral-900 hover:bg-indigo-100'
                                        }
                                        ${selectable ? 'cursor-pointer' : ''}
                                        ${isSelected ? isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100' : ''}
                                    `}
                                >
                                    {selectable && (
                                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectionChange(item)}
                                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                        </td>
                                    )}
                                    {headers.map((header, colIndex) => {
                                        const value = item[header.key as keyof T] as string;
                                        let className = "px-4 py-2 border-b border-gray-200 dark:border-gray-600 ";
                                        
                                        if (header.className) {
                                            className = header.className;
                                        } else if (header.key === 'vs' || header.key === 'fltRt') {
                                            const numValue = parseFloat(value);
                                            if (numValue > 0) {
                                                className += " text-red-500";
                                            } else if (numValue < 0) {
                                                className += " text-blue-500";
                                            }
                                        }
                                        
                                        const displayValue = header.formatter ? header.formatter(value) : value;
                                        
                                        return (
                                            <td key={colIndex} className={className}>
                                                {displayValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
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
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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