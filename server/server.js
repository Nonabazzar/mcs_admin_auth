'use strict';

const path = require('path');

global._commonsDir = path.join(__dirname, "../../../common-helpers");
global._projectDir = __dirname;
global._protobufDir = path.join(__dirname, "../../../../ehub_proto");

require('dotenv').config({path: path.join(global._projectDir, "conf/.env")});
const grpc = require('grpc');

// const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
const protoHelper = require(`${global._commonsDir}/helpers/proto-loader.helper`);
// const dynamoDBHelper = require(`${global._commonsDir}/helpers/dynamo-db.helper`);
const { serverZipkinInterceptor, serverProxy, generateDebugIdInterceptor, loggerInterceptor, authorizationInterceptor } = require(`${global._commonsDir}/interceptors`);
const dbConnector = require(`${global._commonsDir}/helpers/database.helper`);
const redisConnector = require(`${global._commonsDir}/helpers/redis.helper`);
const authCtrl = require(`${global._projectDir}/lib/modules/auth`);
const grpcHealthCheckHelper = require(`${global._commonsDir}/helpers/grpc-health-check.helper`);
const appConfig = require(`${global._commonsDir}/configs/app.config`);

try {
    let server = serverProxy(new grpc.Server());
    const proto = protoHelper.init(grpc, 'protos/auth_rpc.proto');
    // logger.info({ call: null, requestId: 'INITIALIZE', message: `Initializing ${process.env.SERVICE_NAME}` });

    server.addService(proto.ehub.auth_rpc.AuthRpc.service, {
        internal_authorizeAdminUser: authCtrl.internal_authorizeAdminUser,

        authorize: authCtrl.authorize,
        login: authCtrl.login,
        logout: authCtrl.logout,
    });

    const dbConnection = dbConnector.init();
    redisConnector.init();
    // const dynamoDBClient = dynamoDBHelper.init();
    grpcHealthCheckHelper.init(grpc, server);

    server.bind(`0.0.0.0:${process.env.PORT}`,
        grpc.ServerCredentials.createInsecure());

    server.start();

    if (server.started) {
        // logger.info({ call: null, requestId: 'INITIALIZE', message: `Server running at 0.0.0.0:${process.env.PORT}` });
        server.use(generateDebugIdInterceptor);
        // server.use(loggerInterceptor);
        // server.use(serverZipkinInterceptor);
        server.use(async (ctx, next) => {
            ctx.call.dbConnection = dbConnection;
            // ctx.call.dynamoDB = dynamoDBClient;
            ctx.call.tracerId = tracer.id["_traceId"];
            ctx.call.checkConnection = [appConfig.connections.redis, appConfig.connections.db];
            if (ctx.service) {
                ctx.call.allowed_services = ['login', 'authorize'];
                ctx.call.internal_auth_required_services = ['internal_authorizeAdminUser'];
                ctx.call.request_service_endpoint = ctx.service.method;
                return await authorizationInterceptor(ctx, next);
            }
            return await next();
        });

        // logger.info({ call: null, requestId: 'INITIALIZE', message: `${process.env.SERVICE_NAME} is initialized and bind to ${process.env.PORT}` });

    } else {
        // return logger.error({ call: null, requestId: 'INITIALIZE', message: `Failed to initialize ${process.env.SERVICE_NAME}`, payload: server });
    }
} catch (err) {
    console.log("error", err)
    // return logger.error({ call: null, requestId: 'INTERNAL SERVER ERROR', message: `Internal server error due to ${err.stack}`, payload: err });
}
