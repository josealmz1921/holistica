export type PasswordOptions = {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
};

export function generatePassword(length: number = 12, options: PasswordOptions = {}): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+[]{}|;:,.<>?',
  };

  let pool = '';
  if (uppercase) pool += chars.uppercase;
  if (lowercase) pool += chars.lowercase;
  if (numbers) pool += chars.numbers;
  if (symbols) pool += chars.symbols;

  if (!pool) throw new Error('Debes habilitar al menos un tipo de carácter.');

  let password = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * pool.length);
    password += pool[index];
  }

  return password;
}

export function formatDate(
  dateString: string,
  type: "12" | "24" = "24",
  hours: boolean = true): string {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  if (type === "12") {
    const hours12Raw = date.getHours() % 12 || 12;
    const hours12 = String(hours12Raw).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${day}/${month}/${year} ${hours ? `${hours12}:${minutes}:${seconds} ${ampm}` : ''}`;
  }

  // Formato 24h (default)
  const hours24 = String(date.getHours()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours ? `${hours24}:${minutes}:${seconds}` : ''}`;
}

export const buildQueryString = (params: Record<string, any>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== 0
    ) {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Only = result.split(",")[1];
      resolve(base64Only);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export const parserMoney = (value: string) => {
  if (!value) return value;
  let cleaned = value.replace(/[^0-9.\-]/g, '');
  cleaned = cleaned.replace(/(?!^)-/g, '');
  cleaned = cleaned.replace(/-+/g, '-');
  const parts = cleaned.split('.');
  if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
  const [integer, decimals] = cleaned.split('.');
  if (decimals && decimals.length > 2) {
    cleaned = `${integer}.${decimals.slice(0, 2)}`;
  }
  return cleaned;
};

export const formatterMoney = (value: string) => {
  const stringValue = value.toString().replace(/[^\d.-]/g, '');
  const isNegative = stringValue.startsWith('-');
  const [integerPart, decimalPart] = stringValue
    .replace('-', '')
    .split('.');
  const decimals = decimalPart ? decimalPart.slice(0, 2) : '';
  const pattern = [];
  if (isNegative) pattern.push('-');
  pattern.push('$', ' ');
  pattern.push(...integerPart.split('').map(() => /\d/));
  if (decimals.length > 0) {
    pattern.push('.', ...decimals.split('').map(() => /\d/));
  } else {
    pattern.push('.', /\d/, /\d/);
  }
  return pattern;
};

export const formatPrice = (price: string) =>
  Number(price.replace("$", "").replaceAll(" ", ""));

export const formatDateFormField = (date: string) =>
  date?.split("T")?.[0];

export function calculateVAT(priceWithVAT: number, rate: number = 0.16) {
  const subtotal = priceWithVAT / (1 + rate);
  const vat = priceWithVAT - subtotal;

  return {
    vat,
    subtotal,
    total: priceWithVAT
  };
}

export const cleanText = (text: string) => {
  return text
    .normalize("NFD")               // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos
    .replace(/[^a-zA-Z0-9\s]/g, "")  // quita caracteres especiales (opcional)
    .replace(/\s+/g, " ")            // limpia espacios múltiples
    .trim();
};

export const formatterNumbers = (value: string) => {
  const v = (value || '').replace(/\D/g, '');
  return v.length
    ? v.split('').map(() => /\d/)
    : [''];
};

export const parserNumbers = (value: string) => {
  if (!value) return value;
  return value.replace(/\D/g, '');
};

export const createSlug = (value: string) => {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};