"use strict";

const { expect } = require("chai");
const sinon = require("sinon");
const authCtrl = require("../../../../lib/modules/auth");
const getUserHelper = require(`${
  global._projectDir
}/lib/modules/auth/helpers/get-user-info-by-email.helper`);
const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
const moduleConfig = require("../config");
const authEventGenerator = require(`${
  global._commonsDir
}/auth/auth-event-generator`);
const failedLoginSuspensionInfoHelper = require(`${
  global._projectDir
}/lib/modules/auth/helpers/track-failed-logins-suspension.helper`);
const roleInfoHelper = require(`${
  global._projectDir
}/lib/modules/auth/helpers/get-user-role-info.helper`);
const hasher = require(`${global._commonsDir}/auth/hash-generator`);

const createSessionInfoHelper = require(`${
  global._projectDir
}/lib/modules/auth/helpers/create-session-object.helper`);
const sessionHelper = require(`${
  global._projectDir
}/lib/modules/auth/helpers/get-deserialized-session-data.helper`);
const jwtHelper = require(`${global._commonsDir}/helpers/jwt.helper`);
const protobufHelper = require(`${
  global._projectDir
}/lib/modules/auth/helpers/get-protobuf-message.helper`);
const appEventHelper = require(`${
  global._commonsDir
}/helpers/app-event.helper`);

describe("[LOGIN] login to the system", function() {
  afterEach(function() {
    this.sandbox.restore();
  });

  beforeEach(function() {
    this.sandbox = sinon.createSandbox();
    const call = {
      request: {
        loginRequest: {
          emailPhone: "980000000",
          password: "bitsbeat-1",
          deviceInfo: "device-1",
          ip: "192.168.1.1",
          deviceType: "type-1",
          location: "location-1"
        },
        debug: {
          debugId: "1",
          client: "Chrome"
        },
        traceId: "1.1",
        stringValue: "amazon.com/skm",
        authSessionInfo: {
          session: {
            user: {
              userId: "1"
            }
          }
        },
        authorization: ""
      }
    };
    this.call = JSON.parse(JSON.stringify(call));
  });

  describe("Login error for request without emailPhone and password", function() {
    it("should return error response when emailPhone and password is absent in call.request", function(done) {
      try {
        let call = this.call;
        let locale;
        call.request.loginRequest.emailPhone = "";
        call.request.loginRequest.password = "";

        authCtrl.login(call, function(err, res) {
          expect(res.error).to.equal(true);
          expect(err).to.equal(null);
          expect(res.errorCode).to.equals(errorsPb.ErrorCode.NPE);
          expect(res.msg).to.equals(
            moduleConfig.message[
              locale ? locale : process.env.DEFAULT_RES_LANGUAGE
            ].emailRequired
          );
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      } catch (err) {
        console.log("[Error while validating] => ", err.stack);
        done(err);
      }
    });
  });

  describe("Login error for wrong credentials", function() {
    it("should return error response for wrong credentials", function(done) {
      try {
        let call = this.call;
        let locale;
        const getUserHelperStub = this.sandbox
          .stub(getUserHelper, "getInfo")
          .resolves(false);
        const authEventGeneratorStub = this.sandbox
          .stub(authEventGenerator, "generateQueueForAuthenticationFail")
          .resolves(true);

        authCtrl.login(call, function(err, res) {
          expect(getUserHelperStub.calledOnce).to.be.true;
          expect(authEventGeneratorStub.calledOnce).to.be.true;
          expect(res.msg).to.equals(
            moduleConfig.message[
              locale ? locale : process.env.DEFAULT_RES_LANGUAGE
            ].wrongCredentials
          );
          expect(res.error).to.equal(true);
          expect(err).to.equal(null);
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      } catch (err) {
        console.log("[Error] => ", err.stack);
        done();
      }
    });
  });

  describe("Login error for wrong credentials", function() {
    it("should return error response for wrong credentials", function(done) {
      try {
        let call = this.call;
        let locale;
        const getUserHelperStub = this.sandbox
          .stub(getUserHelper, "getInfo")
          .resolves(true);
        const hasherStub = this.sandbox
          .stub(hasher, "comparePassword")
          .resolves(false);
        const failedLoginSuspensionInfoHelperStub = this.sandbox
          .stub(failedLoginSuspensionInfoHelper, "getInfo")
          .resolves({ error: true });
        const roleInfoHelperStub = this.sandbox
          .stub(roleInfoHelper, "getInfo")
          .resolves(true);

        authCtrl.login(call, function(err, res) {
          expect(getUserHelperStub.calledOnce).to.be.true;
          expect(hasherStub.calledOnce).to.be.true;
          expect(failedLoginSuspensionInfoHelperStub.calledOnce).to.be.true;
          expect(roleInfoHelperStub.calledOnce).to.be.true;
          expect(res.msg).to.equals(
            moduleConfig.message[
              locale ? locale : process.env.DEFAULT_RES_LANGUAGE
            ].maxWrongAttemptExceed
          );
          expect(res.error).to.equal(true);
          expect(err).to.equal(null);
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      } catch (err) {
        console.log("[Error] => ", err.stack);
        done();
      }
    });
  });

  describe("Login success", function() {
    it("should return success response", function(done) {
      try {
        let call = this.call;
        const getUserHelperStub = this.sandbox
          .stub(getUserHelper, "getInfo")
          .resolves({});
        const hasherStub = this.sandbox
          .stub(hasher, "comparePassword")
          .resolves(true);
        const failedLoginSuspensionInfoHelperStub = this.sandbox
          .stub(failedLoginSuspensionInfoHelper, "getInfo")
          .resolves({ error: true });
        const roleInfoHelperStub = this.sandbox
          .stub(roleInfoHelper, "getInfo")
          .resolves(true);

        const createSessionInfoHelperStub = this.sandbox
          .stub(createSessionInfoHelper, "getInfo")
          .resolves("");
        const sessionHelperStub = this.sandbox
          .stub(sessionHelper, "getInfo")
          .resolves("");
        const jwtHelperStub = this.sandbox
          .stub(jwtHelper, "generateJWTToken")
          .resolves("token-1");
        const protobufHelperStub = this.sandbox
          .stub(protobufHelper, "createProtobufMessage")
          .returns(false);


        authCtrl.login(call, function(err, res) {
          expect(getUserHelperStub.calledOnce).to.be.true;
          expect(res.loginResponse.token).to.equals("token-1");
          expect(hasherStub.calledOnce).to.be.true;
          expect(failedLoginSuspensionInfoHelperStub.calledOnce).to.be.true;
          expect(roleInfoHelperStub.calledOnce).to.be.true;
          expect(createSessionInfoHelperStub.calledOnce).to.be.true;
          expect(sessionHelperStub.calledOnce).to.be.true;
          expect(jwtHelperStub.calledOnce).to.be.true;
          expect(protobufHelperStub.calledOnce).to.be.true;
          expect(res.success).to.equal(true);
          expect(err).to.equal(null);
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      } catch (err) {
        console.log("[Error] => ", err.stack);
        done();
      }
    });
  });
});
