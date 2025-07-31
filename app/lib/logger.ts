// // // lib/logger.ts
// // import pino from "pino";

// // const logger = pino({
// //   transport:
// //     process.env.NODE_ENV === "production"
// //       ? undefined
// //       : {
// //           target: "pino-pretty",
// //           options: {
// //             colorize: true,
// //             translateTime: "SYS:standard",
// //             ignore: "pid,hostname",
// //           },
// //         },
// //   level: process.env.NODE_ENV === "production" ? "info" : "debug",
// // });

// // export default logger;
// import pino from "pino";

// const isDev = process.env.NODE_ENV !== "production";

// const logger = pino(
//   isDev
//     ? {
//         transport: {
//           target: "pino-pretty",
//           options: {
//             colorize: true,
//             translateTime: "SYS:standard",
//             ignore: "pid,hostname",
//           },
//         },
//       }
//     : undefined // In production use default pino (JSON logs)
// );

// export default logger;
// lib/logger.ts

import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: isDev ? "debug" : "info",
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
