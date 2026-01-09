// utils/cubeacr-txt-writer.util.ts
import * as fs from 'fs';
import * as path from 'path';

const CUBEACR_DIR = '/mnt/c/inetpub/wwwroot/cubeacr/cubeacr';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function createCubeacrTxt(
  borrowerName: string,
  loanAssignmentId: number,
  mobileNumber: string,
): string {
  const now = new Date();

  const filename =
    `${now.getFullYear()}` +
    `${pad(now.getMonth() + 1)}` +
    `${pad(now.getDate())}-` +
    `${pad(now.getHours())}` +
    `${pad(now.getMinutes())}` +
    `${pad(now.getSeconds())}-` +
    `${mobileNumber}.txt`;

  const content = `${borrowerName}\n${loanAssignmentId}`;

  fs.writeFileSync(
    path.join(CUBEACR_DIR, filename),
    content,
    { encoding: 'utf8' },
  );

  return filename;
}











