const path = require('path');
// const ffmpeg = require('ffmpeg');
const ffmpeg =  require('fluent-ffmpeg');
const fsUtil = require('../util/fs');
const resultUtil = require('../util/result');
const ossUtil = require('../util/oss');
const logger = require('../../log/logConfig');
const util = require('util');


/**
 * 上传文件到ali-oss路径 - FormData方式
 * 1、支持上传文件带其他参数
 * 2、支持同时上传多个文件
 * 
 * @param {请求request} req
 * @param {请求response} res
 */
exports.uploadFile = async function (req, res) {
  const envConfigInfo = req.app.locals.fsConfig;
  logger.info(util.format('envConfigInfo: %s', JSON.stringify(envConfigInfo)));
  const { ossConfig, tempFilePath } = envConfigInfo;
  try {
    const folderPath = fsUtil.createFolder(path.resolve(__dirname, '../../public/'), tempFilePath);
    logger.info(util.format('folderPath = [%s]', folderPath));
    const files = await fsUtil.parseForm(req, 100, folderPath);
    logger.info(util.format('parseForm files = [%s]', files));
  
    // 校验上传文件参数中包含文件内容
    if (!('files' in files)) {
      throw new Error('请求参数中缺少文件内容');
    }
    if (!('fields' in files)){
      throw new Error('请求参数中缺少其他信息');
    }
    
    // 将FormData中数据解析
    const formDataInfo = fsUtil.genFormDataInfo(files);
    const { ossPath, ossConfigKey,fileName } = formDataInfo.fieldParam;
    logger.info(util.format('formData other params = [%s],[%s],[%s]', ossPath, ossConfigKey, fileName ));
    if (typeof(ossConfigKey) === 'undefined' || typeof(ossPath) === 'undefined' || typeof(fileName) === 'undefined'){
      throw new Error('请求参数中必须存在ossConfigKey,ossPath,fileName');
    }

    // 上传文件到oss并将结果返回
    const fileResult = [];
    if (Array.isArray(formDataInfo.fileInfo)){
      await Promise.all(
        formDataInfo.fileInfo.map(async (record,index) => {
          logger.info(util.format('上传文件信息 = %s', record));
          const localFilePath = record.path;
          const fileSuffix = localFilePath.substring(localFilePath.lastIndexOf('.'),localFilePath.length);
          const ossFilePath = `${ossPath}/${fileName}_${index}${fileSuffix}`;
          try {
            const ossRes = await ossUtil.uploadFileResult(ossConfig, ossConfigKey, ossFilePath, localFilePath);
            fileResult.push({
              fileName:`${fileName}_${index}${fileSuffix}`,
              filePath: ossRes.fileUrl
            });
            // 上传成功清空文件夹
            logger.info(util.format('localFilePath = %s', localFilePath));
            fsUtil.rmFile(localFilePath);
          } catch (err) {
            throw new Error('上传文件到OSS失败');
          }
        })
      );
    }
    logger.info(util.format('fileResult = [%s]', JSON.stringify(fileResult)));
    resultUtil.setSuccessRes(res,fileResult);
  } catch (error) {
    logger.error(util.format('uploadFile error = [%s]', error));
    resultUtil.setErrorRes(res, error);
  }
};


/**
 * 压缩文件到ali-oss路径 - FormData方式
 * 
 * @param {请求request} req
 * @param {请求response} res
 */
exports.compressFile = async function (req, res) {
  try {
    const envConfigInfo = req.app.locals.fsConfig;
    logger.info(util.format('envConfigInfo: %s', JSON.stringify(envConfigInfo)));
    const { tempFilePath } = envConfigInfo;
    // 压缩文件所在文件夹
    const folderPath = fsUtil.createFolder(path.resolve(__dirname, '../../public/'), tempFilePath);
    logger.info(util.format('folderPath = [%s]', folderPath));
    const files = await fsUtil.parseForm(req, 100, folderPath);
    logger.info(util.format('parseForm files = [%s]', files));

    // 校验上传文件参数中包含文件内容
    if (!('files' in files)) {
      throw new Error('请求参数中缺少文件内容');
    }
    if (!('fields' in files)){
      throw new Error('请求参数中缺少其他信息');
    }
    
    // 将FormData中数据解析
    const formDataInfo = fsUtil.genFormDataInfo(files);
    const { fileName } = formDataInfo.fieldParam;
    logger.info(util.format('formData other params = [%s]', fileName ));
    if ( typeof(fileName) === 'undefined'){
      throw new Error('请求参数中必须存在ossConfigKey,ossPath,fileName');
    }
    if (!fsUtil.checkFileSuffixForCompress(formDataInfo.fileInfo)){
      throw new Error('上传文件中存在不支持压缩的文件格式');
    }
    
    const fileResult = [];
    if (Array.isArray(formDataInfo.fileInfo)){
      await Promise.all(
        formDataInfo.fileInfo.map(async (record,index) => {
          logger.info(util.format('压缩文件信息 = %s', JSON.stringify(record)));
          const localFilePath = record.path;
          const fileSuffix = localFilePath.substring(localFilePath.lastIndexOf('.'),localFilePath.length);
          const compressFilePath = `${folderPath}/${fileName}_compress_${index}${fileSuffix}`;
          logger.info(util.format('压缩之后的文件路径信息：[%s]', compressFilePath));
          try {
            return new Promise((resolve, reject) => { 
              new ffmpeg(localFilePath)
                // set video bitrate
                .videoBitrate(1024)
                // set audio codec
                .audioCodec('libmp3lame')    
                // setup event handlers
                .on('end',() => {
                  fileResult.push({
                    fileName: compressFilePath
                  });
                  resolve(fileResult);
                })
                .on('error', (err) => {
                  reject(err);
                })
                // save to file
                .save(compressFilePath);
              }
            ).then(() => {
              logger.info(util.format('resolve localFilePath = %s', localFilePath));
              fsUtil.rmFile(localFilePath);
            })
            .catch((err) => {
              logger.error(util.format('单个文件压缩失败 = [%s]', err));
              throw new Error('压缩文件失败');
            });
          } catch (err) {
            logger.error(util.format('compressFile error = [%s]', err));
            throw new Error('压缩文件失败');
          }
        })
      );
    }
    logger.info(util.format('compressFileResult = [%s]', JSON.stringify(fileResult)));
    resultUtil.setSuccessRes(res,'压缩成功了');
  } catch (error){
    logger.error(util.format('compressFile error = [%s]', error));
    resultUtil.setErrorRes(res, error);
  }
};


/**
 * 压缩并上传文件
 * ali-oss路径 - FormData方式：压缩文件到并将文件上传到指定的oss上
 * 
 * @param {请求request} req
 * @param {请求response} res
 */
exports.compressAndUploadFile = async function (req, res) {
  try {
    const envConfigInfo = req.app.locals.fsConfig;
    logger.info(util.format('envConfigInfo: %s', JSON.stringify(envConfigInfo)));
    const { ossConfig, tempFilePath } = envConfigInfo;
    // 压缩文件所在文件夹
    const folderPath = fsUtil.createFolder(path.resolve(__dirname, '../../public/'), tempFilePath);
    logger.info(util.format('folderPath = [%s]', folderPath));
    const files = await fsUtil.parseForm(req, 100, folderPath);
    logger.info(util.format('parseForm files = [%s]', files));

    // 校验上传文件参数中包含文件内容
    if (!('files' in files)) {
      throw new Error('请求参数中缺少文件内容');
    }
    if (!('fields' in files)){
      throw new Error('请求参数中缺少其他信息');
    }
    
    // 将FormData中数据解析
    const formDataInfo = fsUtil.genFormDataInfo(files);
    const { ossPath, ossConfigKey,fileName } = formDataInfo.fieldParam;
    logger.info(util.format('formData other params = [%s],[%s],[%s]', ossPath, ossConfigKey, fileName ));
    if (typeof(ossConfigKey) === 'undefined' || typeof(ossPath) === 'undefined' || typeof(fileName) === 'undefined'){
      throw new Error('请求参数中必须存在ossConfigKey,ossPath,fileName');
    }
    if (!fsUtil.checkFileSuffixForCompress(formDataInfo.fileInfo)){
      throw new Error('上传文件中存在不支持压缩的文件格式');
    }
    const fileResult = [];
    if (Array.isArray(formDataInfo.fileInfo)){
      await Promise.all(
        formDataInfo.fileInfo.map(async (record,index) => {
          logger.info(util.format('压缩文件信息 = %s', JSON.stringify(record)));
          const localFilePath = record.path;
          const fileSuffix = localFilePath.substring(localFilePath.lastIndexOf('.'),localFilePath.length);
          const compressFilePath = `${folderPath}/${fileName}_compress_${index}${fileSuffix}`;
          logger.info(util.format('压缩之后的文件路径信息：[%s]', compressFilePath));
          try {
            return new Promise((resolve, reject) => { 
              new ffmpeg(localFilePath)
                // set video bitrate
                .videoBitrate(1024)
                // set audio codec
                .audioCodec('libmp3lame')    
                // setup event handlers
                .on('end',() => {
                  logger.info(util.format('resolve localFilePath = %s', localFilePath));
                  fsUtil.rmFile(localFilePath);
                  resolve(fileResult);
                })
                .on('error', (err) => {
                  reject(err);
                })
                // save to file
                .save(compressFilePath);
              }
            ).then(async () => {
              // 上传压缩的文件
              console.log('压缩完成开始上传压缩文件');
              try {
                const ossFilePath = `${ossPath}/${fileName}_${index}${fileSuffix}`;
                console.log('上传文件路径ossFilePath = ', ossFilePath);
                const ossRes = await ossUtil.uploadFileResult(ossConfig, ossConfigKey, ossFilePath, compressFilePath);
                fileResult.push({
                  fileName: `${fileName}_${index}${fileSuffix}`,
                  filePath: ossRes.fileUrl
                });
                // 上传成功清空文件夹
                logger.info(util.format('上传压缩文件 compressFileName = %s', compressFilePath));
                fsUtil.rmFile(compressFilePath);
              } catch (err) {
                throw new Error('上传压缩文件到OSS失败');
              }
            })
            .catch((err) => {
              logger.error(util.format('压缩并上传文件失败 = [%s]', err));
              throw new Error('压缩并上传文件失败');
            });
          } catch (err) {
            fsUtil.rmFile(localFilePath);
            fsUtil.rmFile(compressFilePath);
            logger.error(util.format('compressFile error = [%s]', err));
            throw new Error('压缩并上传文件失败');
          }
        })
      );
    }
    logger.info(util.format('compressAndUploadFile = [%s]', JSON.stringify(fileResult)));
    resultUtil.setSuccessRes(res,fileResult);
  } catch (error){
    logger.error(util.format('compressAndUploadFile error = [%s]', error));
    resultUtil.setErrorRes(res, error);
  }
};
