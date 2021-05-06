var express = require('express');
var router = express.Router();
const stream = require('stream');
const {promisify} = require('util');
const got = require('got');
const pipeline = promisify(stream.pipeline);
const fs = require('fs');
const baseUrl = 'https://sandbox.bcda.cms.gov'

router.get('/', async function(req,res,next)
{
    var fileUrlList = req.session.fileUrlList;
    try{

        for(let i=0; i<fileUrlList.length; i++){

            // Get fresh AUTH Token
            const {body} = await got.post(baseUrl+'/auth/token', {
                Headers:{
                    'accept':'application/json'
                },
                username: req.session.username,
                password: req.session.password,
                responseType: 'json'
            })
            req.session.access_token = body.access_token;


            
            const downloadStream = got.stream(fileUrlList[i].url, {
                headers:{
                    'Authorization': 'Bearer '+req.session.access_token,
                    'Accept-Encoding': 'gzip'
                },
                decompress: false
            })

            const fileStream = fs.createWriteStream(fileUrlList[i].type+"_"+i+".gz")
            
            const response = await pipeline(downloadStream, fileStream);
            console.log("File downloaded..."+fileUrlList[i].type+"_"+i+".gz")
        }

        res.render('allDownloaded')

    }
    catch(error)
    {
        console.log(error)
    }
})

module.exports = router;