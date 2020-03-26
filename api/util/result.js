// result的基本结构
const result = {
  success: false,
  errorMsg: '',
  value: {}
};

/**
 * 请求结果错误公用方法
 * @param {上下文} res
 * @param {错误信息} error
 */
const setErrorRes = (res, error) => {
  result.success = false;
  result.errorMsg = error.message;
  result.value = {};
  
  res.status(200).send(result);
};

/**
 * 请求错误 - 异常情况 - 公用方法
 *
 * @param {*} res
 * @param {*} error
 */
const setFailRes = (res, error) => {
  result.success = false;
  result.errorMsg = error.message;
  result.value = {};

  res.status(500).send(result);
};

/**
 * 请求结果成功公用方法
 * @param {上下文} res
 * @param {请求正确结果} value
 */
const setSuccessRes = (res, value) => {
  result.success = true;
  result.errorMsg = '';
  result.value = value;

  res.status(200).send(result);
};

module.exports = {
  setErrorRes,
  setFailRes,
  setSuccessRes
};

