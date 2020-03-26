var express = require('express');
var router = express.Router();
var fileController = require('../api/controller/file');

// 上传文件
router.post('/uploadFile',fileController.uploadFile);
// 压缩文件
router.post('/compressFile',fileController.compressFile);
// 压缩文件并上传
router.post('/compressAndUploadFile',fileController.compressAndUploadFile);

module.exports = router;
