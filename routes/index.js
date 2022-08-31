var express = require("express");
var router = express.Router();

/* GET home page. */
router.post("/init", function (req, res, next) {
	const { name } = req.body;
	// console.log(req.body);
	res.json(name);
});

module.exports = router;
