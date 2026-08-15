const anoAtual = (): number => { //2024
    //return new Date().getFullYear();
    return 2024;
};

const anoAnterior = (): number => { // 2023
    //return new Date().getFullYear() - 1;
    return 2023;
};

const dataTeste = (month: number, day: number, year?: number): Date => {
    const targetYear = year ?? anoAtual();
    return new Date(targetYear, month - 1, day);
};

export const dataComAnoAtual = (month: number, day: number): Date => {
    return dataTeste(month, day, anoAtual());
};

export const dataComAnoAnterior = (month: number, day: number): Date => {
    return dataTeste(month, day, anoAnterior());
};
