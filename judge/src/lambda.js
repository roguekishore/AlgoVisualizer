const serverlessExpress = require("@codegenie/serverless-express");
const { createApp } = require("./app");

const server = serverlessExpress({ app: createApp() });

/**
 * Lambda entrypoint.
 *
 * Warm pings arrive from EventBridge as a bare `{"warmup": true}` payload -
 * NOT as an HTTP event - so they are answered here and never reach Express.
 * That keeps a ping at a few milliseconds of billed duration instead of
 * running a full request through the router.
 */
exports.handler = async (event, context) => {
  if (event && event.warmup === true) {
    return { warmed: true };
  }
  return server(event, context);
};
