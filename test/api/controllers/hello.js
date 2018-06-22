var should = require('should');
var request = require('supertest');
var server = require('../../../app');

describe('controllers', function() {

  describe('hello', function() {

    describe('GET /hello', function() {

      it('should return a default string', function(done) {

        request(server)
          .get('/hello?api_key=1234')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            console.log('res.body.should:',res.body.should)
            res.body.should.eql('Hello, stranger!');

            done();
          });
      });

      it('should accept a name parameter', function(done) {

        request(server)
          .get('/hello?api_key=1234')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.eql('Hello, stranger!');
            //res.body.should.eql('Hello, Scott!');

            done();
          });
      });

    });

  });

});
