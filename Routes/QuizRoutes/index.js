const databaseHelper = require('../../Helpers/DatabaseHelper');

module.exports = {
    /**
     * End point to register a new user.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    addQuestion(req, res){
        if (req.body) {
            return databaseHelper.addQuestion(req.body.question, req.body.types, req.body.options)
                .then(() => res.status(201).send('The question has been created'))
                .catch(err => res.status(500).send(`Could not create the question: ${err.message}`));
        }

        return res.status(400).send('Could not create the question - Invalid question data.')
    },

    /**
     * End point to sign in a user.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    addQuestionType(req, res){
        if (req.body) {
            return databaseHelper.addQuestionType(req.body.questionType)
                .then(() => res.status(201).send('The question type has been created'))
                .catch(err => res.status(500).send(`Could not create the question type: ${err.message}`));
        }

        return res.status(400).send('Could not create the question type - Invalid question type data.')
    },

    /**
     * End point to add a user answer.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    addUserStatementAnswer(req, res){
        if (req.body) {
            return databaseHelper.addUserStatementAnswer(req.body.questionId, req.body.optionId, req.body.optionIdB, req.body.optionIdC, req.body.optionIdD, req.body.optionIdE, req.body.userId, req.body.timeTaken, req.body.skipped, req.body.correct)
                .then(() => res.status(201).send('The answer has been added'))
                .catch(err => res.status(500).send(`Could not add user answer: ${err.message}`));
        }

        return res.status(400).send('Could not add user answer - Invalid answer data.')
    },

    addUserBubblesAnswer(req, res){
        if (req.body) {
            return databaseHelper.addUserBubblesAnswer(req.body.questionId, req.body.correct, req.body.popped, req.body.answered)
                .then(() => res.status(201).send('The answer has been added'))
                .catch(err => res.status(500).send(`Could not add user answer: ${err.message}`));
        }

        return res.status(400).send('Could not add user answer - Invalid answer data.')
    },

    getBubblesQuestions(req,res){
        if (req.body) {
            return databaseHelper.getBubblesQuestions()
                .then(result => res.status(200).send(result))
                .catch(err => res.status(500).send(`Could not get random question: ${err.message}`));
        }
    },

    getBubblesQuestionsNew(req,res){
        if (req.query) {
            return databaseHelper.getBubblesQuestionsNew(req.query.difficulty)
                .then(result => res.status(200).send(result))
                .catch(err => res.status(500).send(`Could not get random question: ${err.message}`));
        }
        return res.status(400).send('Could not get random questions - Invalid input data.')
    },

    /**
     * End point to get random questions.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    getRandomQuestions(req, res){
        if (req.body) {
            return databaseHelper.getRandomQuestions(req.query.number, req.query.types)
                .then(result => res.status(200).send(result))
                .catch(err => res.status(500).send(`Could not get random question: ${err.message}`));
        }

        return res.status(400).send('Could not get random questions - Invalid input data.')
    },

    getLesson(req,res){
        if (req.body){
            return databaseHelper.getLesson(req.query.lessonID)
                .then(result => res.status(200).send(result))
                .catch(err => res.status(500).send(`Could not get lesson: ${err.message}`));
        }
    },

    updateLesson(req, res){
        if (req.body) {
            return databaseHelper.updateLesson(req.body.lessonID, req.body.served, req.body.answered)
                .then(res.status(201).send('The Lesson has been updated'))
                .catch(err => res.status(500).send(`Could not update lesson: ${err.message}`));
        }

        return res.status(400).send('Could not update lesson - Invalid data.')
    },

    updateChonk(req, res){
        if (req.body) {
            return databaseHelper.updateChonk(req.body.chonkUuid, req.body.served, req.body.rejected)
                .then(res.status(201).send('The chonk has been updated'))
                .catch(err => res.status(500).send(`Could not update chonk: ${err.message}`));
        }

        return res.status(400).send('Could not update lesson - Invalid data.')
    },

    addLessonInstance(req, res){
        if (req.body) {
            return databaseHelper.addLessonInstance(req.body.lessonID, req.body.chonkOne, req.body.chonkTwo, req.body.chonkThree, req.body.chonkFour)
                .then(result => res.status(201).send(result))
                .catch(err => res.status(500).send(`Could not add Lesson: ${err.message}`));
        }

        return res.status(400).send('Could not add Lesson - Invalid Lesson data.')
    },

    updateLessonInstance(req, res){
        if (req.body) {
            return databaseHelper.updateLessonInstance(req.body.LessonUuid, req.body.rated, req.body.rating, req.body.answered)
                .then(() => res.status(201).send('The Lesson has been updated'))
                .catch(err => res.status(500).send(`Could not update Lesson: ${err.message}`));
        }

        return res.status(400).send('Could not update lesson - Invalid data.')
    },

    addChonkInstance(req, res){
        if (req.body) {
            return databaseHelper.addChonkInstance(req.body.questionId, req.body.optionId, req.body.optionIdB, req.body.optionIdC, req.body.optionIdD, req.body.optionIdE, req.body.userId, req.body.timeTaken, req.body.skipped, req.body.correct)
                .then(() => res.status(201).send('The Chonk has been added'))
                .catch(err => res.status(500).send(`Could not add Chonk: ${err.message}`));
        }

        return res.status(400).send('Could not add Chonk - Invalid Chonk data.')
    },

};