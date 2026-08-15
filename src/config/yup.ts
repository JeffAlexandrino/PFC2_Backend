//Necessário para que o resto da aplicação saiba desta configuração.
declare module "yup" {
    interface StringSchema<TType, TContext, TDefault, TFlags> {
        cnpj(errorMessage: string): this;
    }
}

import * as yup from "yup";

yup.addMethod(yup.string, "cnpj", function ({ message }) {
    return this.test("test-cnpj-type", message, function (value?: string) {
        const { path, createError } = this;

        function isValidCNPJ(value?: string) {
            if (value === undefined) return false;
            const cnpjRegex = value.replace(/[^\d]+/g, "");

            if (cnpjRegex.length !== 14) return false;

            // Valida DVs
            let length = cnpjRegex.length - 2;
            let numbers = cnpjRegex.substring(0, length);
            const digits = cnpjRegex.substring(length);
            let sum = 0;
            let pos = length - 7;

            for (let i = length; i >= 1; i--) {
                sum += parseInt(numbers.charAt(length - i)) * pos--;
                if (pos < 2) pos = 9;
            }

            let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
            if (result !== parseInt(digits.charAt(0))) return false;

            length = length + 1;
            numbers = cnpjRegex.substring(0, length);
            sum = 0;
            pos = length - 7;

            for (let i = length; i >= 1; i--) {
                sum += parseInt(numbers.charAt(length - i)) * pos--;
                if (pos < 2) pos = 9;
            }

            result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
            if (result !== parseInt(digits.charAt(1))) return false;

            return true;
        }

        return isValidCNPJ(value) || createError({ path, message: "CNPJ inválido!" });
    });
});

export default yup;
