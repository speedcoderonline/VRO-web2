const express = require('express')
const logger = require('morgan') 
const path = require('path')
const stylus =require('stylus')
const nib = require('nib')
const bodyParser = require('body-parser')
const firebase = require('firebase')
const admin = require('firebase-admin')
const bb = require('express-busboy');
const fileUpload = require('express-fileupload');

// Initiate App
const app = express()

// Parse requests

app.use(bodyParser.urlencoded({ extended:true }));

app.use(bodyParser.json());

app.use(fileUpload());

// bb.extend(app, {
// 	upload: true,
// 	path: 'uploads',
// 	allowedPath: /^\/uploads$/
// });

//Initialize firebase
var serviceAccount = require("./server-functions/serviceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://vro-web.firebaseio.com"
});

//Compile Stylus

function compile(str, path){
	return stylus(str)
	.set('filename', path)
	.use(nib())
}

// Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.static('static'))

// Routes
const router = require('./routers/router.js')
app.use(router)

app.get('/vroguiden', (req, res) => {
	res.redirect(301, 'https://app.famous.co/VROGuiden2019')
})

//Use db-functions
const dbFunctions = require('./server-functions/db-functions.js')
app.use(dbFunctions)

//Use post-handlers
const postHandlers = require('./server-functions/post-handlers.js') 
app.use(postHandlers)

//Food API
const foodFunction = require('./api/functions/food.js')

app.get('/api/food', getFood)

function getFood(req, res){

	const foodCallback = function(rawFoodData){
		res.send(foodFunction.parseFoodData(rawFoodData))
	}

	foodFunction.fetchRawFoodData((err, data)=> {
		foodCallback(data)
	})


}





// Declaring Port
const port = process.env.PORT || 8000

// Start Server
app.listen(port, function(){
	console.log('Listening on port ' + port)
})