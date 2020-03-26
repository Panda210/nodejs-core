# nodeJs的微服务项目

## 本地启动
请自行将config中相关配置信息补充完善，后可执行如下命令：` npm install`编译完成，执行 ` npm run dev` 启动项目。


## 多环境配置

目录：config/env中各个文件是不同环境的配置文件。可根据自己需要进行配置。

* dev.js 开发环境
* test.js 测试环境
* uat.js 集成测试环境
* pre.js 预生产环境
* production.js 正式环境

配合package.json中scripts，服务器上采用Dockerfile进行部署。

## 上传文件到OSS，支持多个配置

ossConfig是上传文件的相关OSS的配置信息。可以支持不同aliyun oss配置。

* config_1、config_2 是不同配置的名称，自行定义即可。
* internal: false表示走外网；true表示走内网。正常本地环境测试配置为false。如果是服务器并且与ECS共域直接配置为true，加快处理速度。

`ossConfig: {
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
      internal: false,
      ossDomain: '# oss domain',
      cdnDomain: '# cdn domain'
    }
  }`

## 文件上传功能
访问：`/file/uploadFile`，按照要求传递参数。其中 ossConfigKey对应配置文件ossConfig中的config_1,config_2。 ossPath可不填写，不填写会直接获取配置文件filedir，文件会上传到该目录；如果上传目录需要更换，可传入具体参数值。

|参数            | 类型           | 示例                  |是否必填      |
| ------------- |:-------------: | --------------------:| -----------:|
| file          | File文件       | text.pdf             | 必填         |
| fileName      | Text文本       | my_text_20200320.pdf | 必填         |
| ossConfigKey  | Text文本       | config_1             | 必填         |
| ossPath       | Text文本       |                      | 不必填       |

## 文件压缩
需要在服务器安装`ffmpeg`，访问`/file/compressFile`将文件压缩到指定配置文件`tempFilePath`指定目录。

## 文件压缩并上传
需要在服务器安装`ffmpeg`，访问`/file/compressAndUploadFile`将文件压缩到指定配置文件`tempFilePath`指定目录。参数同`文件上传功能`。

