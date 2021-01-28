import { ncp } from 'ncp';

export function ncpAsync(
  source: string,
  dest: string,
  options: any = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    ncp(source, dest, options, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
