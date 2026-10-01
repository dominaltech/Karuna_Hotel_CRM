import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgPath = path.resolve(__dirname, '../public/qr_scan_phone_icon.png');
const outPath = path.resolve(__dirname, '../src/utils/qrScanPhoneIcon.js');

const imgBuf = fs.readFileSync(imgPath);
const b64 = imgBuf.toString('base64');
const content = `// Auto-generated exact base64 data URL for phone QR scanner icon
export const QR_SCAN_PHONE_ICON_DATA_URL = 'data:image/png;base64,${b64}';
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('Successfully written', outPath, 'Length:', content.length);
