declare namespace release {
    export interface CDData {
        average_release_time: number;
        failure: number;
        max_release_time: number;
        program_name: string;
        program_type: string;
        second_business: string;
        third_business: string;
        total: number;
    }

    export interface releaseData {
        devTime: timeType;
        CI: timeType;
        container: timeType;
        CD: {
            containerPh: timeType;
            resourcePh?: timeType;
        }
    }

    export interface timeType {
        time: number;
        differ: number;
    }

    export interface CIData {
        name: string;
        ave_time: number;
        max_time: number;
        failed: number;
        count: number;
    }
}