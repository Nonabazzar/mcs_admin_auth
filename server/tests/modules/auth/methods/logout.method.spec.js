'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const authCtrl = require('../../../../lib/modules/auth');
const checkSessionInfoHelper = require(`${global._projectDir}/lib/modules/auth/helpers/check-deserialized-session-data.helper`);
const sessionHelper = require(`${global._projectDir}/lib/modules/auth/helpers/get-deserialized-session-data.helper`);
const redisHelper = require(`${global._commonsDir}/helpers/redis.helper`);

describe('[LOGOUT] logout from the system', function () {
  afterEach(function () {
    this.sandbox.restore();
  });

  beforeEach(function () {
    this.sandbox = sinon.createSandbox();
    const call = {
      request: {
        debug: {
          debugId: '1'
        },
        stringValue: 'amazon.com/skm',
        authSessionInfo: {
          session: {
            user: {
              userId: '1'
            }
          }
        },
        authorization: ""
      }
    }
    this.call = JSON.parse(JSON.stringify(call));
  });

  describe('Logout succes false without authSessionInfo', function () {
    it('should return success: false response when authSessionInfo is absent in call.request', function (done) {
      try {
        let call = this.call;

        const sessionHelperStub = this.sandbox.stub(sessionHelper, 'getInfo').resolves({ deserializedData: 'user-1' });
        const checkSessionInfoHelperStub = this.sandbox.stub(checkSessionInfoHelper, 'getInfo').returns(false);
        const redisHelperStub = this.sandbox.stub(redisHelper, 'clearCacheKeys').resolves(false);

        authCtrl.logout(call, function (err, res) {
          expect(sessionHelperStub.calledOnce).to.be.true;
          expect(checkSessionInfoHelperStub.calledOnce).to.be.true;
          expect(redisHelperStub.calledOnce).to.be.true;
          expect(res.success).to.equals(false);
          expect(err).to.equal(null);
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      }
      catch (err) {
        console.log('[Error while validating] => ', err.stack);
        done(err);
      }
    });
  });

  describe('Logout success', function () {
    it('should return success: true response', function (done) {
      try {
        let call = this.call;

        const sessionHelperStub = this.sandbox.stub(sessionHelper, 'getInfo').resolves({ jwtsList: ["", ""] });
        const checkSessionInfoHelperStub = this.sandbox.stub(checkSessionInfoHelper, 'getInfo').returns(true);
        const redisHelperStub = this.sandbox.stub(redisHelper, 'setDataToCache').resolves(true);

        authCtrl.logout(call, function (err, res) {
          expect(sessionHelperStub.calledOnce).to.be.true;
          expect(checkSessionInfoHelperStub.calledOnce).to.be.true;
          expect(redisHelperStub.calledOnce).to.be.true;
          expect(res.success).to.equals(true);
          expect(err).to.equal(null);
          expect(res.debug.debugId).to.equal(call.request.debug.debugId);
          done();
        });
      }
      catch (err) {
        console.log('[Error] => ', err.stack);
        done();
      }
    });
  });

});
