import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`ClinicFlow backend listening on http://localhost:${port}`);
});
