const crypto = require('crypto');
require('dotenv').config();

function creds(){
	const Key = "cribsurfer@1234567890!@#$%^&*()_";
	const secretKey = Buffer.from(Key, 'utf8');

	var host = process.env.HOST;
	var user = process.env.USERNAME;
	var password = process.env.PASSWORD;
	var iv = process.env.IV;

	var decipher = crypto.createDecipheriv('aes-256-cbc',secretKey,Buffer.from(iv,'utf8'));
	var decipheru = crypto.createDecipheriv('aes-256-cbc',secretKey,iv);
	var decipherp = crypto.createDecipheriv('aes-256-cbc',secretKey,iv);

	var hdecipher = decipher.update(host,'hex','utf8');
	hdecipher += decipher.final("utf8");

	var udecipher = decipheru.update(user,'hex','utf8');
	udecipher += decipheru.final("utf8");
	var pdecipher = decipherp.update(password,'hex','utf8');
	pdecipher += decipherp.final("utf8");
	//console.log(hdecipher);

	//console.log(udecipher);

	//console.log(pdecipher);


	return { 'host': hdecipher, 'user':  udecipher, 'password': pdecipher }

}
module.exports.creds = creds;
