var express = require('express');
var router = express.Router();
const got = require('got');
const baseUrl = 'https://sandbox.bcda.cms.gov'

//TimeConversion Function
const convertTime12to24 = time12h => {
  const [time, modifier] = time12h.split(" ");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}:00.000`;
};



router.get('/', function(req, res, next) {
  res.render('selection');
  
  // if(req.session.access_token)
  // {
  //   console.log(req.session.access_token)
  //   res.render('selection');
  // }
  // else
  // {
  //   res.render('error')
  // }
  
});


router.post('/downloadOptions', function(req, res, next) {
    console.log(req.body)

    req.session.pFlag = req.body.Patient;
    req.session.cFlag = req.body.Coverage;
    req.session.eFlag = req.body.EOB;
    req.session.downloadFlag = req.body.downloadOption;
    req.session.endpoint = req.body.Endpoint;
    

    if(req.session.downloadFlag == 'partial')
    {
      req.session.sinceDate = req.body.since;
      var convertedTime = convertTime12to24(req.body.sinceTime);
      req.session.sinceTime = convertedTime+req.body.timeZone;
    }

    if(req.session.endpoint == 'group')
    {
      req.session.runoutFlag = req.body.Runout;
    }

    res.redirect('/selection/getJob')

});




router.get('/getJob', async function(req, res, next) {

  var typeFlag = 0;
  var completeUrl = baseUrl+'/api/v1/Patient/$export';
  var sessh = req.session;

  if(sessh.endpoint == 'patient')
  {
    if(sessh.pFlag && sessh.cFlag && sessh.eFlag)
    {
      completeUrl = baseUrl+'/api/v1/Patient/$export'
      console.log(completeUrl)
    }
    else
    {
      completeUrl = baseUrl+'/api/v1/Patient/$export?_type='+(sessh.pFlag ? sessh.pFlag+',' : '')+(sessh.cFlag ? sessh.cFlag+',' : '')+(sessh.eFlag ? sessh.eFlag : '')
      completeUrl = completeUrl.replace(/,$/, '');
      console.log(completeUrl)
      typeFlag = 1;
      
    }
    
  }
  else if(sessh.endpoint == 'group')
  {
    if(sessh.runoutFlag == 'on')
    {
      if(sessh.pFlag && sessh.cFlag && sessh.eFlag)
      {
        completeUrl = baseUrl+'/api/v1/Group/runout/$export'
        console.log(completeUrl)
        
      }
      else
      {
        completeUrl = baseUrl+'/api/v1/Group/runout/$export?_type='+(sessh.pFlag ? sessh.pFlag+',' : '')+(sessh.cFlag ? sessh.cFlag+',' : '')+(sessh.eFlag ? sessh.eFlag : '')
        completeUrl = completeUrl.replace(/,$/, '');
        console.log(completeUrl)
        typeFlag = 1;
      }
    }
    else
    {
      if(sessh.pFlag && sessh.cFlag && sessh.eFlag)
      {
        completeUrl = baseUrl+'/api/v1/Group/all/$export'
        console.log(completeUrl)
        
      }
      else
      {
        completeUrl = baseUrl+'/api/v1/Group/all/$export?_type='+(sessh.pFlag ? sessh.pFlag+',' : '')+(sessh.cFlag ? sessh.cFlag+',' : '')+(sessh.eFlag ? sessh.eFlag : '')
        completeUrl = completeUrl.replace(/,$/, '');
        console.log(completeUrl)
        typeFlag = 1;
      }
    }
    
  }



  if(sessh.sinceDate && typeFlag == 0)
  {
    completeUrl = completeUrl+'?_since='+sessh.sinceDate+'T'+sessh.sinceTime;
    console.log(completeUrl);
  }
  else if(sessh.sinceDate && typeFlag == 1)
  {
    completeUrl = completeUrl+'&_since='+sessh.sinceDate+'T'+sessh.sinceTime;
    console.log(completeUrl);
  }
  
  const jobResponse = await got(completeUrl, {
        headers:{
            'Authorization': 'Bearer '+sessh.access_token,
            'Accept': 'application/fhir+json',
            'Prefer': 'respond-async'
        }
    })
    jobUrl = jobResponse.headers['content-location']
    sessh.jobUrl = jobUrl;

    console.log(sessh.jobUrl);

    res.redirect('/jobProgress');
    
});


module.exports = router;
