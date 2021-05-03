var express = require('express');
var router = express.Router();
const got = require('got');
const baseUrl = 'https://sandbox.bcda.cms.gov'


router.get('/', async function(req, res, next){
    var sessh = req.session;
    
    // // Recursive function to call itself until our job is completed
        async function isJobCompleted (){

            const jobStatusResponse = await got(sessh.jobUrl, {
                headers:{
                    'Authorization': 'Bearer '+sessh.access_token,
                    'Accept': 'application/fhir+json'
                },
                responseType : 'json'
            })
            
            
            if(jobStatusResponse.statusCode == 202)
            {
                setTimeout(() => {console.log("Checking status..."+jobStatusResponse.statusCode+" "+jobStatusResponse.headers['x-progress']); isJobCompleted()}, 15000)
            }
            else 
            {
                sessh.fileUrlList = jobStatusResponse.body.output
                console.log(sessh.fileUrlList)
                return res.redirect('/jobFinished')
            }

            
        }

        isJobCompleted();
});


module.exports = router;