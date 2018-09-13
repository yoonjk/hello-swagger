var oracledb      = require('oracledb');

var dbconfig = {
   user: 'nexweb',
   password: 'passw0rd',
   connectString: 'localhost/XE' ,

    // Default values shown below
    // events: false, // whether to handle Oracle Database FAN and RLB events
    // externalAuth: false, // whether connections should be established using External Authentication
    // poolAlias: 'myalias' // set an alias to allow access to the pool via a name.
    // poolIncrement: 1, // only grow the pool by one connection at a time
    poolMax: 100, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
    poolMin: 10, // start with no connections; let the pool shrink completely
    poolPingInterval: 60, // check aliveness of connection if in the pool for 60 seconds
    // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
    // queueTimeout: 60000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
    // stmtCacheSize: 30 // number of statements that are cached in the statement cache of each connection
   };

const OPTIONS = {
    outFormat: oracledb.OBJECT
}

class Database {
    constructor( config ) {
        if (!config)
            this.dbConfig = dbconfig
        else
            this.dbConfig = config;

    }

    get DATE() {
        return oracledb.DATE;
    }

    get BLOB() {
        return oracledb.BLOB;
    }

    get CLOB() {
        return oracledb.CLOB;
    }

    get NUMBER() {
        return oracledb.NUMBER;
    }

    get STRING() {
        return oracledb.STRING;
    }

    get OBJECT() {
        return oracledb.OBJECT;
    }


    getPool() {
      console.log('=============pool');
      return new Promise((resolve, reject) => {
        oracledb.createPool( this.dbConfig )
        .then(pool => resolve(pool))
        .catch(err => reject(err))
      });
    }

    query( sql, args, options = OPTIONS ) {
        return new Promise( ( resolve, reject ) => {
            this.getPool()
            .then(pool => pool.getConnection())
            .then(connection => {
              if (args) {
                connection.execute( sql, args, options, ( err, rows ) => {
                  if ( err )
                      return reject( err );
                  resolve( {rows: rows, connection: connection} );
                }); //execute
             } else { //args
                connection.execute( sql, options, ( err, rows ) => {
                  if ( err )
                      return reject( err );
                  resolve( {rows: rows, connection: connection });
                }); //execute
              }
            })

        } );
    }

    update( sql, args ) {
        return new Promise( ( resolve, reject ) => {
              this.getPool()
              .then(pool=> poo.getConnection())
              .then(connection => {
                connection.execute( sql, args,  ( err, rows ) => {
                    if ( err )
                        return reject( err );
                    resolve( {rows: rows, connection: connection} );
                });
              })
        } );
    }

    executeMany( sql, args, opts= OPTIONS) {
        return new Promise( ( resolve, reject ) => {
            this.getPool()
            .then(pool => pool.getConnection())
            .then(connection => {
                connection.executeMany( sql, args,  opts, ( err, result ) => {
                    if ( err )
                        return reject( err );
                    resolve({rows : result, connection: connection} );
                });
              })
        });
    }
    /*
    * commit changed data.
    */
    commit(connection) {
      return new Promise((resolve, reject)=>{
        connection.commit(err => {
            if (err) 
              return reject(err)
            resolve();
        });
      })
    }

    /*
    * rollback changed data.
    */
    rollback(connection) {
      return new Promise((resolve, reject)=>{
        connection.rollback(err => {
            if (err) 
              return reject(err)
            resolve();
        });
      })
    }

    /*
    * close connection
    */
    close(connection) {
        return new Promise( ( resolve, reject ) => {
          connection.close(function (err) {
            if (err)
              return reject( err );
            resolve();
          });
        } );
    }
}

  //////////////////////////
  // RELEASE A CONNECTION //
  //////////////////////////
  var doRelease = function(connection) {
    connection.release(function(err) {
      if (err) {
        console.log("ERROR: Unable to RELEASE the connection: ", err);
      }
      return;
    });
  }


module.exports = {
  db: new Database()
};
