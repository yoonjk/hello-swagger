
fieldname: 'account_copy',
       originalname: 'hana02.gif',
       encoding: '7bit',
       mimetype: 'image/gif

       create table file_attach (
           file_id varchar2(35),
           fieldname varchar2(30),
           originalname varchar2(30),
           encoding varchar2(10),
           memetype varchar2(30),
           file_path varchar2(100),
           file_size number,
           data blob
       )  