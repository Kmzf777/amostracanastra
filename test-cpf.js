// Test CPF validation
function onlyDigits(v) { return v.replace(/\D/g, ""); }

function isValidCPF(cpf) {
  const s = onlyDigits(cpf);
  if (s.length !== 11 || /^([0-9])\1+$/.test(s)) return false;
  const calc = (base, factor) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factor - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(s.slice(0, 9), 10);
  const d2 = calc(s.slice(0, 10), 11);
  return d1 === parseInt(s[9], 10) && d2 === parseInt(s[10], 10);
}

const testCpfs = [
  '123.456.789-09',
  '12345678909',
  '111.111.111-11',
  '000.000.000-00'
];

console.log('Testing CPF validation...\n');
testCpfs.forEach(cpf => {
  const isValid = isValidCPF(cpf);
  console.log(`CPF: "${cpf}" - Valid: ${isValid}`);
});