type ExpectObject = { status: 200 | 201 | 204 | 403 | 404 | 400; allowed: boolean };

export type Case = { [key: string]: any; expected: ExpectObject };
export type CaseWithPossibilities = {
    [key: string]: any;
    possibilities: { expected: ExpectObject; [key: string]: any }[];
};
