'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */


/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */


const util = require('util');
const fs   = require('fs');
const path = require('path');
const moment = require('moment');
const mime = require('mime-types');
const {db} = require('../../lib')
const FILE_UPLOAD_PATH = path.resolve(__dirname, '../../upload/')
const FILE_RESOURCE_PATH = path.resolve(__dirname, '../../resources')
const supported_mimes = [
  'image/png',
  'image/jpeg',
  'image/gif'
];

const upload = (req, res)=> {
  const sql = `
    insert into file_attach (file_id, fieldname, originalname, encoding, memetype, file_path, file_size)
    values(:file_id, :fieldname, :originalname, :encoding, :memetype, :file_path, :file_size)
  `
  console.log('files:',req.files);
  const files = req.files;
  var data = {
    'id': 'test',
    'extension': 'test',
    'size': 1,
    'type': 'test'
  };
  let f1
  let buffer;
  for (let file in files) {
    console.log('file=>', file)
   
    f1 = fs.createWriteStream(FILE_UPLOAD_PATH + '/' + files[file][0].originalname);
    buffer = files[file][0].buffer;
    console.log('buffer:', buffer)
    f1.write(files[file][0].buffer);
    f1.close();

    let fileInfo = {}
    fileInfo.file_id =  'ACC-' + moment().format('YYYYMMDDHHmmss')
    fileInfo.originalname = files[file][0].originalname;
    fileInfo.fieldname = files[file][0].fieldname;
    fileInfo.encoding = files[file][0].encoding;
    fileInfo.memetype = files[file][0].memetype;
    fileInfo.file_path = FILE_UPLOAD_PATH;
    fileInfo.file_size = files[file][0].size

    console.log('fileInfo:', fileInfo)
     db.update(sql, fileInfo)
    .then(result => {
      console.log('rows:', result.rows)
      db.commit(result.connection)
    })
  }

  res.status(201).send(data);
  
};

const uploadToDB = (req, res) => {
  const sql = `
    insert into file_attach (file_id, fieldname, originalname, encoding, memetype, file_path, file_size, data)
    values(:file_id, :fieldname, :originalname, :encoding, :memetype, :file_path, :file_size, :data)
  `

  const files = req.files;
  var data = {
    'id': 'test',
    'extension': 'test',
    'size': 1,
    'type': 'test'
  };

  console.log('files:', files)
  let f1
  let buffer;
  let uploadFiles = [];
  
  for (let file in files) {
    console.log('file=>', file)
  
    let fileInfo = {}

    f1 = fs.createWriteStream(FILE_UPLOAD_PATH + '/' +  files[file][0].originalname);
    buffer = files[file][0].buffer;
    console.log('buffer:', buffer)
    f1.write(files[file][0].buffer);
    f1.close();

    fileInfo.file_id =  'ACC-' + moment().format('YYYYMMDDHHmmss')
    fileInfo.originalname = files[file][0].originalname;
    fileInfo.fieldname = files[file][0].fieldname;
    fileInfo.encoding = files[file][0].encoding;
    fileInfo.memetype = files[file][0].memetype;
    fileInfo.file_path = FILE_UPLOAD_PATH;
    fileInfo.file_size = files[file][0].size
    fileInfo.data = files[file][0].buffer;

    console.log('fileInfo:', fileInfo)
     db.update(sql, fileInfo)
    .then(result => {
      console.log('rows:', result.rows)
      db.commit(result.connection)
    })
  }

  res.status(201).send(data)
  
  
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
const hello=(req, res)=>{
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('Hello, %s!', name);
 
  console.log('handler====:', req.t('TRY_AGAIN'))
  // this sends back a JSON response which is a single string
  res.json(hello);
}

const auth = (req, res)=>{
  console.log('user:', req.user)
  res.status(201).send({message: 'login success'})
}

const download = (req, res) => {
	var filename = req.swagger.params.filename.value; //fileid = 각각의 파일을 구분하는 파일ID 값
	var origFileNm, savedFileNm, savedPath, fileSize; //DB에서 읽어올 정보들
	let mimetype;
  console.log('fileId:', req.files)
  console.log('fileId:', filename)
	const sql = `
    select originalname, file_path from file_attach
    where originalname = :originalname
  `
	const param = {
    originalname: filename
  }
	var file = savedPath + '/' + savedFileNm; //예) '/temp/filename.zip'
	/*test*/console.log('file : ', file);
  //만약 var file 이 저장경로+원본파일명으로 이루져 있다면, 'filename = path.basename(file)' 문법으로 파일명만 읽어올 수도 있다.
  console.log('-----file:', file);
	//mimetype = mime.lookup(file) 와 같이 '저장경로+파일명' 정보를 파라미터로 전달해도 된다. 이때 파일명은 확장자를 포함해야함
	
  db.query(sql, param)
  .then(result => {
    console.log('row:',  result.rows.rows[0])
    origFileNm = result.rows.rows[0].ORIGINALNAME;
    const file = result.rows.rows[0].FILE_PATH + '/' + result.rows.rows[0].ORIGINALNAME;

    mimetype = mime.lookup( origFileNm ); // => 'application/zip', 'text/plain', 'image/png' 등을 반환
    /*test*/console.log('mimetype : ' + mimetype);
    
    res.setHeader('Content-disposition', 'attachment; filename=' + origFileNm ); // origFileNm으로 로컬PC에 파일 저장
    res.setHeader('Content-type', mimetype);

    const filestream = fs.createReadStream(file);
    filestream.pipe(res);
  });
}

const downloadFromDB = (req, res) => {
	var filename = req.swagger.params.filename.value; //fileid = 각각의 파일을 구분하는 파일ID 값
	var origFileNm, savedFileNm, savedPath, fileSize; //DB에서 읽어올 정보들
	let mimetype;
  console.log('filename:', filename)
  const sql = `
    select originalname, file_path, data from file_attach
    where originalname = :originalname
  `
  const param = {
    originalname: filename
  }

  db.query(sql, param)
  .then(result => {
    console.log('row:',  result.rows.rows[0])
    origFileNm = result.rows.rows[0].ORIGINALNAME;
    const file = result.rows.rows[0].FILE_PATH + '/' + result.rows.rows[0].ORIGINALNAME;
    console.log('file=:', file)
	  //mimetype = mime.lookup(file) 와 같이 '저장경로+파일명' 정보를 파라미터로 전달해도 된다. 이때 파일명은 확장자를 포함해야함
	  mimetype = mime.lookup( origFileNm ); // => 'application/zip', 'text/plain', 'image/png' 등을 반환
    /*test*/console.log('mimetype : ' + mimetype);
    
    res.setHeader('Content-disposition', 'attachment; filename=' + origFileNm ); // origFileNm으로 로컬PC에 파일 저장
    res.setHeader('Content-type', mimetype);

    const lob = result.rows.rows[0].DATA;
    if (lob === null) {
      console.log("BLOB was NULL");
      return;
    }
    lob.on(
      'end',
      function() {
        console.log("lob.on 'end' event");
        res.end();
      });
    lob.on(
      'close',
      function() {
        console.log("lob.on 'close' event");
        db.close(result.connection)
      });
    lob.on(
      'error',
      function(err) {
        console.log("lob.on 'error' event");
        console.error(err);
        db.close(result.connection)
      });

    lob.pipe(res);

    //filestream.pipe(res);

  })

}

module.exports = {
  hello: hello,
  createImage: upload,
  auth: auth,
  download: download,
  downloadFromDB: downloadFromDB,
  uploadToDB: uploadToDB,
};
