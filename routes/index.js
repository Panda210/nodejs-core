var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/health', function (req, res) {
  res.render('health', { title: 'OK' });
});

module.exports = router;
