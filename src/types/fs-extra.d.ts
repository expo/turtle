import fs from 'fs-extra';

declare module 'fs-extra' {
  export function write(fd: number, data: any): Promise<WriteResult>;
}
