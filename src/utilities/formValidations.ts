const SUCCESS = undefined;

export const hasLengthAtLeast = (value: string, minimumLength: number) => {
    const message = `Debe contener al menos ${minimumLength} caracteres.'`;
    if (!value || value.length < minimumLength) {
        return message;
    }
    return SUCCESS;
};

export const isRequired = (value: unknown) => {
    const FAILURE = 'Es requerido';
    if (!value) return FAILURE;
    const stringValue = String(value).trim();
    const measureResult = hasLengthAtLeast(stringValue, 1);
    if (measureResult) return FAILURE;
    return SUCCESS;
};

export const invalidEmail = (value: string) => {
    const FAILURE = 'Este campo es requerido';
    const INVALID = 'Por favor, ingrese un correo válido (Ej: johndoe@domain.com).';
    var expReg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    var valid = expReg.test(value);
    if (!value) return FAILURE;
    if (!valid) return INVALID;
    const stringValue = String(value).trim();
    const measureResult = hasLengthAtLeast(stringValue, 1);
    if (measureResult) return FAILURE;
    return SUCCESS;
};

export const validateOnlyLetterToName = (value: string) => {
    const FAILURE = 'Este campo es requerido';
    const INVALID = 'Por favor ingrese solo letras';
    var expReg = /^([a-zA-Z&áéíóúÁÉÍÓÚñÑ ])*$/;
    var valid = expReg.test(value);
    if (!value) return FAILURE;
    if (!valid) return INVALID;
    return SUCCESS;
}

export const isRFC = (value: string) => {
    const FAILURE = 'Este campo es requerido';
    const INVALID = 'Por favor, introduzca un rfc válido.';
    const myRfc = value?.toUpperCase();
    const expReg = /^([A-ZÑ&\-]{3,4})\d{6}([A-Z0-9]{2}[A0-9])$/;
    const valid = expReg.test(myRfc);
    if (!value) return FAILURE;
    if (!valid) return INVALID;
    return SUCCESS;
};

export const validateInteriorNumber = (value: string) => {
    const INVALID = 'Introduzca solo números y letras.'
    var expReg = /^([a-zA-Z0-9\-\s])*$/;
    var valid = expReg.test(value);
    if (!valid) return INVALID;
    return SUCCESS;
}

export const isPostCode = (value: string) => {
    const FAILURE = 'Este campo es requerido';
    const messageDigits = 'Por favor, introduzca al menos 5 caracteres.'
    const invalidZipCode = 'Por favor, introduzca un código postal válido'
    if (!value) return FAILURE;
    const regex = /^(?!00000)\d{5}$/;
    const validateRegEx = regex.test(value);
    if (!validateRegEx) return invalidZipCode
    const stringValue = String(value).trim();
    const measureResultMin = hasLengthAtLeast(stringValue, 1);
    if (measureResultMin) return messageDigits;
    return SUCCESS;
};

export const validateOnlyNumber = (value: string) => {
    if (!value) return SUCCESS;
    const INVALID = 'Por favor ingrese solo números';
    var expReg = /^([0-9])*$/;
    var valid = expReg.test(value);
    if (!valid) return INVALID;
    return SUCCESS;
}

export const validateStock = (value: string) => {
    const INVALID = "La cantidad vendible debe ser mayor a 0";
    if (!value) return SUCCESS;
    const isNumeric = /^[0-9]+$/.test(value);
    if (!isNumeric) return INVALID;
    const numericValue = Number(value);
    if (numericValue <= 0) return INVALID;
    return SUCCESS;
};

export const validateOnlyNumberDecimal = (value: string) => {
    if (!value) return SUCCESS;
    const INVALID = 'Por favor ingrese solo números o decimales';
    const expReg = /^[0-9]+(\.[0-9]+)?$/;
    const valid = expReg.test(value);
    if (!valid) return INVALID;
    return SUCCESS;
};


export const validateLatitude = (value: string) => {
    if (!value) return SUCCESS;
    const INVALID = 'Latitud no válida';
    var expReg = /^[-+]?([1-8]?\d(\.\d{1,7})?|90(\.0{1,7})?)$/;
    var valid = expReg.test(value);
    if (!valid) return INVALID;
    return SUCCESS;
}

export const validateLongitude = (value: string) => {
    if (!value) return SUCCESS;
    const INVALID = 'Longitud no válida';
    var expReg = /^[-+]?(1[0-7]\d(\.\d{1,7})?|[1-9]?\d(\.\d{1,7})?|180(\.0{1,7})?)$/;
    var valid = expReg.test(value);
    if (!valid) return INVALID;
    return SUCCESS;
}

export const validatePassword = (value: string) => {
    const INVALID = 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula y al menos un carácter especial (- # _ & . , ? ¿ ! *)';
    var expReg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[-#_&.,?¿!*$]).{8,}$/;
    var valid = expReg.test(value);
    if (!valid) return INVALID;
    return SUCCESS;
}

export const validateConfirmationPasswprd = (value: string, ...data: any[]) => {
    const { password, passwordConfirmation } = data[0];
    const INVALID = 'Las contraseñas no son iguales';
    if (passwordConfirmation !== password) return INVALID;
    return SUCCESS;
}

export const validateSpecialDates = (value: string, ...data: any[]) => {
    const { specialFromDate, specialToDate } = data[0];

    const INVALID = 'La fecha de inicio no puede ser mayor que la fecha de fin';
    const SUCCESS = undefined; // Informed considera `undefined` como válido

    if (!specialFromDate || !specialToDate) return SUCCESS;

    // Convertimos a Date para comparar correctamente
    const from = new Date(specialFromDate);
    const to = new Date(specialToDate);

    if (from > to) return INVALID;

    return SUCCESS;
};

export const isValidPrice = (value: unknown) => {
    const FAILURE = 'Precio inválido';
    const stringValue = String(value).trim();
    if (stringValue === '' || stringValue === 'undefined') return SUCCESS;
    const cleanValue = stringValue.replace(/[^0-9.-]/g, '');
    const numberRegex = /^-?\d+(\.\d{1,2})?$/;
    if (!numberRegex.test(cleanValue)) return FAILURE;
    const numericValue = parseFloat(cleanValue);
    if (isNaN(numericValue)) return FAILURE;
    return SUCCESS;
};

export const validateOnlyCSV = (value: any) => {
    const INVALID = 'Tu archivo no es un tipo permitido. Selecciona un archivo diferente. Formato permitido: CSV';
    if (!value) return SUCCESS;
    const { type } = value || {};
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel' // algunos navegadores usan este MIME
    ];
    if (!allowedTypes.includes(type)) return INVALID;
    return SUCCESS;
};

export const isPhoneNumber = (value: unknown) => {
    const FAILURE = 'Teléfono inválido';
    if (!value) return FAILURE;
    const stringValue = String(value).trim();
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(stringValue)) return FAILURE;
    return SUCCESS;
};
