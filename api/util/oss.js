const OSS = require('ali-oss');
const co = require('co');
const logger = require('../../log/logConfig');
const util = require('util');
const fs = require('fs');

/**
 * 根据配置文件中的ossConfig信息创建ossConfigInfo
 * @param {*} ossConfig
 * @param {*} ossConfigKey
 */
const genOssConfigInfo = (ossConfig, ossConfigKey) => ossConfig[ossConfigKey];

/**
 * 根据配置文件中的ossConfig信息创建ossClient
 * @param {*} ossConfig
 * @param {*} ossConfigKey
 */
const genOssClient = (ossConfig, ossConfigKey) => {
  const ossConfigInfo = genOssConfigInfo(ossConfig, ossConfigKey);
  return new OSS({
    region: ossConfigInfo.region,
    accessKeyId: ossConfigInfo.accessKeyId,
    accessKeySecret: ossConfigInfo.accessKeySecret,
    bucket: ossConfigInfo.bucket,
    internal: ossConfigInfo.internal
  });
};

/**
 * 上传文件
 * @param {创建的ossClient} ossClient
 * @param {文件路径名} filePath
 * @param {本地文件} localFlie
 */
const uploadFile = async (ossClient, filePath, localFlie) => {
  let result = 'initial';
  await co(function* () {
    result = yield ossClient.put(filePath, localFlie);
  }).catch((err) => {
    logger.error(util.format('uploadFile error: %s',err));
    result = err;
    throw new Error('上传文件到OSS错误');
  });
  return result;
};

/**
 * 上传文件 - 流式上传
 * @param {创建的ossClient} ossClient
 * @param {文件路径名} filePath
 * @param {本地文件} localFlie
 */
const uploadFileByScream = async (ossClient, filePath, localFlie) => {
  let result = 'initial';
  await co(function* () {
    let stream = fs.createReadStream(localFlie);
    result = yield ossClient.putStream(filePath, stream);
  }).catch((err) => {
    logger.error(util.format('uploadFile error: %s',err));
    result = err;
    throw new Error('上传文件到OSS错误');
  });
  return result;
};

/**
 * 将url进行加签和过期时间设置
 * @param {*} ossClient 
 * @param {*} ossConfigInfo 
 * @param {*} name 
 */
const genSignatureUrl = (ossClient,ossConfigInfo, name) => {
  const options = {
    expires: 3600 * 1000 * 24 * 365 * 100
  };
  return ossClient.signatureUrl(name,options);
};

/**
 * 上传filePath的localFile文件到oss对应配置文件ossConfig,ossConfigKey中，并获取上传后oss的路径
 * @param {*} ossConfig
 * @param {*} ossConfigKey
 * @param {*} filePath
 * @param {*} localFlie
 */
const uploadFileResult = async (ossConfig, ossConfigKey, filePath, localFlie) => {
  let result = 'initial';
  try {
    // 获取oss的配置信息
    const ossConfigInfo = genOssConfigInfo(ossConfig, ossConfigKey);
    // 先根据配置文件创建OSS的client
    const ossClient = genOssClient(ossConfig, ossConfigKey);
    // 上传文件
    result = await uploadFileByScream(ossClient, filePath, localFlie);
    // 返回文件oss的访问url加签
    result.signatureUrl = genSignatureUrl(ossClient,ossConfigInfo,result.name);
    // result.realUrl = ossConfigInfo.domain ? url.resolve(ossConfigInfo.domain, result.name) : result.url;
    // 返回文件oss的 cdn的url
    result.fileUrl = ossConfigInfo.cdnDomain ? result.signatureUrl.replace(ossConfigInfo.ossDomain,ossConfigInfo.cdnDomain) : result.signatureUrl;
  } catch (err){
    logger.error(util.format('uploadFileResult err: %s',err));
    result = err;
    throw new Error('上传文件至OSS并获取返回值');
  }
  return result;
};

module.exports = {
  genOssConfigInfo,
  genOssClient,
  genSignatureUrl,
  uploadFile,
  uploadFileByScream,
  uploadFileResult
};

