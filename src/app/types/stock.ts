// 주식 데이터 타입 정의
export interface StockData {
    basDt: string;         // 기준일자
    srtnCd: string;        // 종목코드
    isinCd: string;        // 국제 증권 식별 번호
    itmsNm: string;        // 종목명
    mrktCtg: string;       // 시장구분
    clpr: string;          // 종가
    vs: string;            // 전일 대비 등락
    fltRt: string;         // 등락률
    mkp: string;          // 시가
    hipr: string;         // 고가
    lopr: string;         // 저가
    trqu: string;          // 거래량
    trPrc: string;         // 거래대금
    lstgStCnt: string;     // 상장주식수
    mrktTotAmt: string;    // 시가총액
}

// 테이블 헤더 정보 타입 정의
export interface TableHeader {
    key: string;          // 데이터 객체의 키
    label: string;        // 화면에 표시할 헤더 텍스트
    formatter?: (value: string) => string;  // 값 형식화 함수 (옵션)
    className?: string;   // 특정 열에 적용할 CSS 클래스 (옵션)
}

// 테이블 구성 정보 타입
export interface TableConfig {
    headers: TableHeader[];      // 테이블 헤더 배열
    data: StockData[];           // 테이블 데이터 배열
    title?: string;              // 테이블 제목 (옵션)
    totalCount?: number;         // 전체 데이터 수 (옵션)
    itemsPerPage?: number;       // 페이지당 표시할 항목 수 (옵션)
}

// 추가 관련 타입도 여기에 정의할 수 있습니다
export interface StockResponse {
    response: {
        body: {
            items: {
                item: StockData[];
            };
            numOfRows: number;
            pageNo: number;
            totalCount: number;
        };
        header: {
            resultCode: string;
            resultMsg: string;
        };
    };
}

// 주식 CSV 파일 정보 인터페이스
export interface StockCSV {
    filename: string;
    stockName: string;
    createdAt: string;
    sizeBytes: number;
    stockCode: string;
    path: string;
}

// API 응답 인터페이스
export interface ApiResponse {
    success: boolean;
    message: string;
    files: Array<{
        filename: string;
        path: string;
        size_bytes: number;
        created_at: string;
        stock_code: string;
        stock_name: string;
    }>;
    count: number;
}