const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const progress = require('cli-progress');
const database = require('./database');
const { creds } = require('./decrypt');
const fs = require('fs');


const details = creds();
const db = new database(details);
const bar = new progress.SingleBar({},progress.Presets.shades_classic);

const prompt = require('prompt-sync')();

// Input date in "Mon DD YYYY" format
// Load your credentials from a JSON file (client_secret.json)

const date = new Date();
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 because months are zero-indexed

const day = date.getDate().toString().padStart(2, '0');
const year = date.getFullYear().toString();

// Combine the components into the desired format
const formattedDate = `${month}${day}${year}`;
let data = {};

async function dataEx(){
  await db.connect();
  data = await db.retriveData(formattedDate);
  await db.disconnect();
}



const credentials = require('./helpers/client_secret.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Create a new OAuth2 client
const client = new OAuth2Client(credentials.installed.client_id, credentials.installed.client_secret, credentials.installed.redirect_uris[0]);

// Set up a Calendar API client
const calendar = google.calendar({ version: 'v3', auth: client });

let compare;

try {
  compare = require('./calendar.json');
}catch(error){
  compare={};
}
async function update(i,id,input,checkInId,checkOutId){
  compare[i]= {'status':input['STATUS'], 'id':id,'checkInId':checkInId, 'checkOutId': checkOutId };
  fs.writeFileSync('calendar.json',JSON.stringify(compare),'utf-8',()=>{console.log('written...')});
}

function remove(compare,i){
  calendar.events.delete(
    {
      calendarId: 'primary', 
      eventId: compare[i]['id']
    },
    (err,res)=>{
      if (err){
        console.error('error updating event:',err);
        return false;
      }
    }
  );
  calendar.events.delete({calendarId:'primary', eventId :compare[i]['checkInId']},
    (err,res)=>{
      if (err){
        console.error('error updating event:',err);
        return false;
      }
    }
  );
  calendar.events.delete({calendarId : 'primary',eventId: compare[i]['checkOutId']},
    (err,res)=>{
      if (err){
        console.error('error updating event:',err);
        return false;
      }
    }
  );

  return true;
}

async function eventsOf(summary,input,dateOn,colorId){
  let inputDate = new Date(dateOn);
  dateOn = inputDate.toISOString();
  const event= {
      "summary":`${summary}{${input.PROPERTY_NAME}}{{${input.STATUS}}}`,
      "description":  `Name: ${input.ALIAS}\nPhone Number: ${input.NUMBER}\nReservation Number: ${input.RESERVATION_NUMBER}\n\npropertyId: ${input.PROPERTY_ID}\n\nCheck-in: ${input.CHECK_IN}\nCheck-out: ${input.CHECK_OUT}\nTotal amount: ${input['AMOUNT_PAID']}\nNumber of Guest: ${input['GUEST_DETAILS']}` ,

      "start":{
       "dateTime": dateOn ,
      },
      "end":{
        "dateTime": dateOn,
      },
      "colorId": colorId,
    };     
  return new Promise((resolve,reject)=>{
    calendar.events.insert(
      {
        calendarId: 'primary',
        resource: event,
      },
      (err,res)=>{
        if (err){
          reject(err);
        }else{
          resolve(res.data.id);
        }
      }
    );
  });
}


async function createCalendarEvent(data){
  let length=0;  
  for (let x in data){
	length++;
  }
  bar.start(length,0);
  let prog = 1;
  for (let i in data){
    bar.update(prog);
    prog++;
    var input = data[i];
    let id;
    let checkInId;
    let checkOutId;
    
    if (compare[i] && compare[i].status.toLowerCase() != input.STATUS.toLowerCase()){
        var tf = remove(compare,i);
	if (tf){
          console.log('updated...');
          id= await eventsOf('Reservation', input, date,'5');
	  delete compare[i];
	  console.log(compare);
	  fs.writeFileSync('./calendar.json',JSON.stringify(compare),'utf-8',()=>{console.log('updated');}); 
        }
    }else if (!(compare[i])){
      id= await eventsOf('Reservation', input, date,'3'); 
    }
       
    if (input.STATUS.toLowerCase() == 'ok') {
      checkInId = await  eventsOf('Check-In',input,input.CHECK_IN,'2');
      checkOutId =  await eventsOf('Check-out',input,input.CHECK_OUT,'4');
      //Promise.all([id,checkInId,checkOutId])
      update(i,id,input,checkInId,checkOutId);
    }
  }
  bar.update(data.length);
  bar.stop();   
}


// Load or refresh your access token (you can use a token.json file to store it)
fs.readFile('./helpers/token.json', async(err, token) => {
  if (err) {
    getAccessToken();

    let code = prompt('Paste the code: ');

    code = code.slice(code.indexOf('code=')+5,code.indexOf('&scope='));


    getTokens(code);
  } else {

    await dataEx();
    client.setCredentials(JSON.parse(token));
    createCalendarEvent(data);
  }
});

function getAccessToken() {
  const authUrl = client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this URL:', authUrl);
}

// Create a new OAuth2 client


async function getTokens(authCode) {
  const { tokens } = await client.getToken(authCode);
  client.setCredentials(tokens);

  // Store the tokens securely (e.g., in a token.json file)
  fs.writeFileSync('./helpers/token.json', JSON.stringify(tokens), (err) => {
    if (err) {
      console.error('Error saving tokens:', err);
    } else {
      console.log('Tokens saved.');
      createCalendarEvent(data); // Call the function to create a calendar event
    }
  });
}

