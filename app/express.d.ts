/* eslint-disable @typescript-eslint/consistent-type-imports */
/** This file name cannot be server.d.ts because it will conflict with the server.ts file.
 * This complication is due to how the typescript compiler works. It will not compile both
 * files and instead will prioritize the server.ts file.
 *
 * More: https://github.com/typescript-eslint/typescript-eslint/issues/955#issuecomment-529075082
 */

declare namespace Express {
  export interface Request {
    gm?: import('./GameManager').default;
    io?: import('socket.io').Server;
  }
}
