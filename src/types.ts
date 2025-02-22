export type FormType = {
    isRandom: DataType[];
};

export type DataType = {
    length: number;
    isBest: boolean;
    user: {
        psEntry: string;
        name: string;
        doctorName: string;
        sex: string;
        age: number;
        op_data: string;
        op_part: string;
        auto_check: number;
    };
    imgs: string[];
    size: {
        before: number | undefined | null;
        after: number | undefined | null;
    };
    weight: {
        before: number | undefined | null;
        after: number | undefined | null;
    };
};
export type CheckedType = {
    psEntry: string;
    opDate: string;
};
