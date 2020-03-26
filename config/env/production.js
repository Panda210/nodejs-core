module.exports = {
  tempFilePath: 'tempFiles',
  logPath: '/data1/admin/logs/nodejs-core',
  ossConfig: {
    config_1: {
      region: 'oss-cn-beijing',
      endpoint: 'oss-cn-beijing.aliyuncs.com',
      accessKeyId: '#aliyun oss accesskeyId',
      accessKeySecret: '#aliyun oss accessKeySecret',
      bucket: '#aliyun oss bucket',
      filedir: '#aliyun oss filedir',
      internal: false,
      ossDomain: '# oss domain',
      cdnDomain: '# cdn domain'
    },
    config_2: {
      region: 'oss-cn-beijing',
      endpoint: 'oss-cn-beijing.aliyuncs.com',
      accessKeyId: '#aliyun oss accesskeyId',
      accessKeySecret: '#aliyun oss accessKeySecret',
      bucket: '#aliyun oss bucket',
      filedir: '#aliyun oss filedir',
      internal: true,
      ossDomain: '# oss domain',
      cdnDomain: '# cdn domain'
    }
  }
};