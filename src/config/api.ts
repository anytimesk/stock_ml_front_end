// API 기본 설정
export const API_CONFIG = {
    // API 기본 URL
    baseURL: 'http://localhost:8000',
    
    // API 요청 기본 설정
    defaultOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 5000, // 5초
    },
    
    // API 엔드포인트
    endpoints: {
        // 주식 관련
        stock: {
            list: '/stock/list',
            detail: '/stock/detail',
            csv: '/stock/csv',
        },
        // 다른 도메인들도 여기에 추가
    },
} as const;

// API 응답 타입
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// API 에러 타입
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

// API 요청 옵션 타입
export interface ApiRequestOptions extends RequestInit {
    params?: Record<string, string>;
    data?: any;
} 