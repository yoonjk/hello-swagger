var oracledb      = require('oracledb');

var dbconfig = {
   user: 'nexweb',
   password: 'passw0rd',
   connectString: 'localhost/XE' };

const OPTIONS = {
    outFormat: oracledb.OBJECT
}

class Database {
    constructor( config ) {
        this.connection;
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
    connect() {
              console.log('=============connect');
      return new Promise((resolve, reject) => {
        oracledb.getConnection( this.dbConfig )
        .then(conn => resolve(conn))
        .catch(err => reject(err))
      });
    }

    query( sql, args, options = OPTIONS ) {
        return new Promise( ( resolve, reject ) => {
            oracledb.getConnection( this.dbConfig )
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
              oracledb.getConnection( this.dbConfig )
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
            oracledb.getConnection( this.dbConfig )
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


module.exports = Database
