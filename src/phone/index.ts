export function normalizePhone(input: string): string | null {
    let d = input.replace(/[^\d+]/g, "");
    if (d.startsWith("+62")) d = d.slice(3);
    else if (d.startsWith("62")) d = d.slice(2);
    else if (d.startsWith("0")) d = d.slice(1);
    else return null;
  
    // Nomor seluler Indonesia: diawali 8, total 9-12 digit setelah kode negara
    if (!/^8\d{8,11}$/.test(d)) return null;
    return "+62" + d;
  }
  
  export function isValidPhone(input: string): boolean {
    return normalizePhone(input) !== null;
  }