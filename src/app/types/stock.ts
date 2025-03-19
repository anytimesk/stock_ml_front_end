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