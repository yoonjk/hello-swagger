
const {db} = require('../../lib')

const getUser = (user) => {
    sql = `
        select * from test
        where col1 = :col1
    `;

    const params = user;
    const options = {
        outFormat: db.OBJECT
    }
}