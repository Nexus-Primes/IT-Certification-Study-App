// ---------- Tools: small validators shared by the network sheet and the 3CX import export ----------

export function validMac(text) {
  const t = String(text || '').trim();
  return /^[0-9a-f]{12}$/i.test(t) || /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(t) || /^([0-9a-f]{4}\.){2}[0-9a-f]{4}$/i.test(t);
}
export const macDigits = text => String(text || '').toLowerCase().replace(/[^0-9a-f]/g, '');
export const validDid = text => /^\+[1-9]\d{6,14}$/.test(String(text || '').replace(/[\s().-]/g, ''));
export const validEmail = text => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(text || '').trim());
