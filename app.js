var express = require('express');
var port = process.env.PORT || 3000;
var app = express();
app.get('/', function (req, res) {
res.send(JSON.stringify({ Hello: 'World'}));
});
app.get('/test', function (req, res) {
    res.send(JSON.stringify({ Hello: 'Test'}));
});
app.listen(port, function () {
    console.log('Example app listening on port !');
});

const bodyParser = require('body-parser');
const path = require('path');

//const cors = require('cors')
const config = require('./config');
const Models = require('./Models');
const Loader = require('./Loader');
const quizRoutes = require('./Routes/QuizRoutes');
const stripeRoutes = require('./Routes/StripeRoutes');
const userRoutes = require('./Routes/UserRoutes');

//const backendsecret = 'backendsecret'; //TODO: Should be set as environment variable

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(cors);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
    res.send('Hello from Chooter');
});

app.get('/getBubblesQuestions', quizRoutes.getBubblesQuestions);
app.get('/getBubblesQuestionsNew', quizRoutes.getBubblesQuestionsNew);
app.get('/getRandomQuestions', quizRoutes.getRandomQuestions);
app.get('/getUser', userRoutes.getUser);

// Check the signature of every request to be sure that it comes from the frontend.
/*app.all('/*', (req, res, next) => {
    jwt.verify(req.headers['x-access-token'], backendsecret, (err, decoded) => {
        if (err) {
            return res.send({done: false, message: 'You are not allowed to do this action.'});
        }

        res.locals.decoded = decoded; // If you want to save the data in the locals variable to be accessible from other endpoints
        return next();
    });
});*/

// The routes can be updated to, for example, 'quiz/addQuestion', 'quiz/addType', 'strapi/createCustomer' etc. This way you can create more rules for the different type of endpoints.
// Quiz routes
app.post('/addQuestion', quizRoutes.addQuestion);
app.post('/addType', quizRoutes.addQuestionType);
app.post('/addUserStatementAnswer', quizRoutes.addUserStatementAnswer);
app.post('/addUserBubblesAnswer', quizRoutes.addUserBubblesAnswer);

//Lesson routes
app.get('/getLesson', quizRoutes.getLesson);
app.post('/updateLesson', quizRoutes.updateLesson);
app.post('/updateChonk', quizRoutes.updateChonk);
app.post('/addLessonInstance', quizRoutes.addLessonInstance);
app.post('/updateLessonInstance', quizRoutes.updateLessonInstance);
app.post('/addChonkInstance', quizRoutes.addChonkInstance); //Currently unused

// Stripe routes
app.post('/createCustomer', stripeRoutes.createCustomer);
app.post('/getCustomer', stripeRoutes.getCustomer);
app.post('/createPaymentIntent', stripeRoutes.createPaymentIntent);
app.post('/submitPayment', stripeRoutes.submitPayment);

// User routes
app.post('/registerUser', userRoutes.signup);
app.post('/login', userRoutes.signin);
app.post('/addUser', userRoutes.addUser);
app.post('/updateUserScore', userRoutes.updateUserScore);

Loader.registerGlobals();
Models.setup(config);
Models.sync();
