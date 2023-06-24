"use strict";

const { expect } = require("chai");
const sinon = require("sinon");
const authCtrl = require("../../../../lib/modules/auth");
const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
const moduleConfig = require("../config");

const validateAuthTokenHelper = require(`${
  global._projectDir
}/lib/modules/auth//helpers/validate-auth-token.helper`);

describe("[AUTHORIZE] authorize method tests", function() {
  afterEach(function() {
    this.sandbox.restore();
  });

  beforeEach(function() {
    this.sandbox = sinon.createSandbox();
    const call = {
      request: {
        debug: {
          debugId: "1",
          client: "Chrome"
        },
        stringValue: "amazon.com/skm",
        authSessionInfo: {
          session: {
            user: {
              userId: "1"
            }
          }
        },
        authorization: {
          token: "dummy-token",
          permission: "dummy-permission"
        }
      },
      traceId: "trace-unit"
    };
    this.call = JSON.parse(JSON.stringify(call));
  });

  describe("Error: Invalid token", function() {
    it("should return error when no session for given token", function(done) {
      try {
        let call = this.call;
        const validateAuthTokenHelperStub = this.sandbox
          .stub(validateAuthTokenHelper, "validate")
          .resolves({
            sessionObj: [{ session: { user: {} } }],
            success: false,
            errorCode: errorsPb.ErrorCode.AUTH_ERROR
          });
        authCtrl.authorize(call, function(err, res) {
          expect(validateAuthTokenHelperStub.calledOnce).to.equal(true);
          expect(res.error).to.equal(true);
          expect(err).to.equal(null);
          expect(res.errorCode).to.equals(errorsPb.ErrorCode.AUTH_ERROR);
          expect(res.msg).to.equals(
            moduleConfig.message.en.authorizationTokenInvalid
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

  describe("Error when no session", function() {
    it("should return error when no session for given token", function(done) {
      try {
        let call = this.call;
        const validateAuthTokenHelperStub = this.sandbox
          .stub(validateAuthTokenHelper, "validate")
          .resolves({
            sessionObj: [
              {
                session: {
                  user: {},
                  userid: "1",
                  role: {}
                }
              }
            ],
            success: true,
            errorCode: errorsPb.ErrorCode.AUTH_ERROR
          });
        authCtrl.authorize(call, function(err, res) {
          expect(validateAuthTokenHelperStub.calledOnce).to.equal(true);
          expect(res.success).to.equal(true);
          expect(res.authResponse).to.be.an("object");
          expect(res.authResponse.session).to.be.an("object");
          expect(err).to.equal(null);
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      } catch (err) {
        console.log("[Error while validating] => ", err.stack);
        done(err);
      }
    });
  });
});
