const fs = require('fs');
const path = require('path');
const multiparty = require('multiparty');
const mkdirp = require('mkdirp');


/**
 * 创建文件夹
 * @param {基础路径} basePath
 * @param {文件夹名} name
 */
const createFolder = (basePath, name) => {
  const _path = path.join(basePath, name);

  if (!fs.existsSync(_path)) {
    mkdirp.sync(_path);
  }

  return _path;
};

/**
 * 删除filePath的文件
 * @param {*} filePath 
 */
const rmFile = (filePath) => {
  if (fs.existsSync(filePath)){
    fs.unlinkSync(filePath);
  }
};

/**
 * 上传FormData的数据解析
 * @param {*} req 
 * @param {*} maxSize 
 * @param {*} uploadDir 
 */
const parseForm = (req, maxSize, uploadDir) => {
  const size = Number(maxSize);
  if (Number.isNaN(size) || size <= 0) {
    throw new Error(`fs.js: parseForm: maxSize: ${maxSize} is wrong`);
  }

  if (!fs.existsSync(uploadDir)) {
      throw new Error(`fs.js: parseForm: uploadDir: ${uploadDir} is not existed`); 
  }

  const form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: maxSize * 1024 * 1024,
    autoFiles: true,
    uploadDir
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields = {}, files = {}) => {
      // err ? reject(err) : resolve({ fields, files });
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// 上传的文件解析后的结果如下：
// tempFileInfo =  {
//   "file": [
//     {
//       "fieldName": "file",
//       "originalFilename": "Screen Shot 2018-08-15 at 10.35.03 AM.png",
//       "path": "/Users/xujiali/workspace-node/nodejs-core/public/tempFiles/qqrdVBZttJ7DQW35AqCn5lFb.png",
//       "headers": {
//         "content-disposition": "form-data; name=\"file\"; filename=\"Screen Shot 2018-08-15 at 10.35.03 AM.png\"",
//         "content-type": "image/png"
//       },
//       "size": 218422
//     },
//     {
//       "fieldName": "file",
//       "originalFilename": "Screen Shot 2018-08-15 at 11.00.30 AM.png",
//       "path": "/Users/xujiali/workspace-node/nodejs-core/public/tempFiles/tU0ELoxT5utRu-CEk4Jak_ZF.png",
//       "headers": {
//         "content-disposition": "form-data; name=\"file\"; filename=\"Screen Shot 2018-08-15 at 11.00.30 AM.png\"",
//         "content-type": "image/png"
//       },
//       "size": 312622
//     }
//   ]
// }
/**
 * 获取formData数据
 * fieldParam：上传文件的其他参数
 * fileInfo：上传文件的具体内容
 * @param {*} files 
 */
const genFormDataInfo = (files) => {
  const tempFileInfo = JSON.stringify(files.files,null,2);  
  // 其他参数的解析
  const fieldKey = Object.keys(files.fields);
  const fieldParam = {};
  fieldKey.forEach(key => {
    fieldParam[key] = files.fields[key][0];
  });

  const formDataInfo = {
    fieldParam: fieldParam,
    fileInfo: JSON.parse(tempFileInfo).file
  };
  return formDataInfo;
};

/**
 * 检查是否支持压缩
 * @param {*} fileInfo 
 */
const checkFileSuffixForCompress = (fileInfo) => {
  let isAllowCompress = true;
  if (Array.isArray(fileInfo)){
    fileInfo.map((record) => {
      const filePath = record.path;
      const fileSuffix = filePath.substring(filePath.lastIndexOf('.'),filePath.length).toUpperCase();
      if (!('.MOV'.toUpperCase() === fileSuffix || '.MP4'.toUpperCase() === fileSuffix)){
        isAllowCompress = false;
      }
    });
  }
  return isAllowCompress;
};

module.exports = {
  createFolder,
  rmFile,
  parseForm,
  genFormDataInfo,
  checkFileSuffixForCompress
};
