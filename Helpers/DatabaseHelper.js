const Sequelize = require('sequelize');
const uuid = require('uuid/v1');

const logger = require('../Logger')(module);
const Models = require('../Models');

const Op = Sequelize.Op;

module.exports = {

    /**
     * Adds a new question type to the database.
     *
     * @param {Object} questionType The question type object
     * @param {String} questionType.type The question type.
     * @param {String} questionType.description The question type description.
     */
    addQuestionType(questionType){
        return Models.QuestionType.create({
            uuid: uuid(),
            type: questionType.type,
            description: questionType.description,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    },

    /**
     * Updates a question type.
     *
     * @param {Object} questionType The question type.
     *
     * @returns {Promise} Promise to update the question type.
     */
    updateQuestionType(questionType) {
        return Models.QuestionType.update(
            {
                type: questionType.type,
                description: questionType.description,
            },
            { 
                where: {
                    uuid: questionType.uuid
                }
            }
        );
    },

    /**
     * Deletes a question type.
     *
     * @param {Object} questionType The question type.
     *
     * @returns {Promise} Promise to delete the question type.
     */
    deleteQuestionType({questionTypeUuid}) { //this object needs to be changed in the future - just avoiding errors now
        return Models.QuestionType.destroy(
            { 
                where: {
                    uuid: questionTypeUuid
                }
            }
        );
    },

    /**
     * Insert a new question in the database.
     *
     * @param {Object} question The question object.
     * @param {String} question.text The question text.
     * @param {String} question.image URL to an image for the question (optional).
     * @param {Number} question.difficulty Intenger representing the question difficulty (1-5).
     * @param {Array<String>} types The question types that are applicable to this question.
     * @param {Array<Object>} options The answer options for this question.
     * @param {String} options.text The answer text for an option.
     * @param {String} options.image An image for this answer option.
     * @param {Boolean} options.correct Value indicating whether an option is the correct answer.
     * @param {String} options.description Additional information which will be presented for this option.
     */
    addQuestion(question, types, options) {
        if (options.filter(o => o.correct).length !== 1){
            return Promise.reject(new Error('There must be one correct option.'));
        }

        return this.getTypes(types)
            .then(data => {
                if (data.length <= 0){
                    return Promise.reject(new Error('The specified question types do not exist.'))
                }

                const questionObject = {
                    uuid: uuid(),
                    text: question.text,
                    image: question.image ? question.image : null,
                    difficulty: question.difficulty,
                    timesSkipped: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
        
                let answerOptions = [];
        
                options.forEach(o => {
                    answerOptions.push({
                        uuid: uuid(),
                        text: o.text,
                        image: o.image,
                        correct: o.correct,
                        description: o.description,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                });
        
                let questionThemes = [];

                data.forEach(t => {
                    questionThemes.push({
                        QuestionTypeId: t.uuid,
                    });
                });

                questionObject.AnswerOptions = answerOptions;
                questionObject.QuestionThemes = questionThemes;

                return Models.Question.create(questionObject, {
                    include: [
                        {
                            model: Models.AnswerOption,
                        },
                        {
                            model: Models.QuestionTheme,
                        }
                    ]
                });
            })
            .catch(err => {throw err})
    },

    /**
     * Gets the question types and their UUID-s.
     *
     * @param {Array<String>} types The question types.
     *
     * @return {Promise} Promise holding the question types.
     */
    getTypes(types){
        return Models.QuestionType.findAll({
            where: {
                type: {
                    [Op.in]: types,
                },
            },
            attributes: ['type', 'uuid'],
        })
    },

    getDifficulty(difficulty){
        return Models.BubblesQuestion.findAll({
            where: {
                difficulty: {
                    [Op.in]: difficulty,
                },
            },
    })},

    /*
     * Adds a user's answer to the database.
     *
     * @param {Object} param0 The object containing the user's answer.
     * @param {Object} param0.questionId The question UUID.
     * @param {Object} param0.optionId The answer option UUID.
     * @param {Object} param0.userId The user ID.
     * @param {Object} param0.timeTaken The time taken to answer the question.
     * @param {Object} param0.skipped Flag indicating whether the question was skipped.
     * @param {Object} param0.correct Flag indicating whether the question was answered correctly.
     *
     * @returns {Promise} Promise to add the user's answer to the database.
     */
    addUserStatementAnswer(questionId, optionId, optionIdB, optionIdC, optionIdD, optionIdE, userId, timeTaken, skipped, correct) {
        return Models.Answer.create({
            uuid: uuid(),
            QuestionId: questionId,
            AnswerOptionId: optionId || null,
            AnswerOptionIdB: optionIdB || null,
            AnswerOptionIdC: optionIdC || null,
            AnswerOptionIdD: optionIdD || null,
            AnswerOptionIdE: optionIdE || null,
            UserId: userId,
            timeTaken,
        }).then(() => 
            Models.Question.update(
                {
                    timesSkipped: skipped === true ? Sequelize.literal('timesSkipped + 1') : Sequelize.literal('timesSkipped'),
                    timesAnswered: Sequelize.literal('timesAnswered + 1'),
                    timesCorrect: correct === true ? Sequelize.literal('timesCorrect + 1') : Sequelize.literal('timesCorrect'),
                },
                { 
                    where: {
                        uuid: questionId,
                    }
                }
            )
        ).then(() => 
            optionId && Models.AnswerOption.update(
                {
                    timesPicked: Sequelize.literal('timesPicked + 1'),
                },
                { 
                    where: {
                        uuid: optionId,
                    }
                }
            )
        ).catch(err => {
            // This error happens if you provide incorrect values for one of the UUIDs
            logger.error('Error:' + err.message);
            // TODO: Handle the error if necessary.
            return false;
        })
    },

    addUserBubblesAnswer(questionId, correct, popped, answered){
        return Models.BubblesQuestion.update(
                {
                    timesPopped: correct === true ? Sequelize.literal('timesPopped + 1') : Sequelize.literal('timesPopped'),
                    timesAnswered: popped === true ? Sequelize.literal('timesAnswered + 1') : Sequelize.literal('timesAnswered'),
                    timesCorrect: answered === true ? Sequelize.literal('timesCorrect + 1') : Sequelize.literal('timesCorrect'),
                },
                {
                    where: {
                        uuid: questionId,
                    }
                }
            ).catch(err => {
            // This error happens if you provide incorrect values for one of the UUIDs
            logger.error('Error:' + err.message);
            // TODO: Handle the error if necessary.
            return false;
        })
    },

    addFake(fakeA, fakeB){
        return fakeA
    },

    /**
     * Gets Bubbles questions - currently imports all bubbles questions (c. 700) to avoid failing to import enough per difficulty.
     * Could avoid this with several imports of X per difficulty
     */
    getBubblesQuestions() {
                    return Models.BubblesQuestion.findAll()
                        .then(data => {
                        const values = data.map(record =>
                            record.dataValues
                        );

                        return values;
                    });
                },

    getBubblesQuestionsNew(difficulty) {
        //difficulty = 0 || typeof difficulty !== 'object' ? 1 : difficulty;
        let difficultyArray = [difficulty];
        return this.getDifficulty(difficultyArray)
            .then(data => {
                if (data.length === 0) {
                    return Models.BubblesQuestion.findAll()
                        .then(data => {
                            const values = data.map(record =>
                                record.dataValues
                            );

                            return values;
                        });
                }else{

                    return data

                }})},

    getLesson(lessonID){
        return Models.Lesson.findAll({
                where: {
                    lessonID: lessonID
                }


        }).then(data => {
            const lessonUuids = data.map(record =>
            record.dataValues.uuid);

            return Models.Chonk.findAll({
                where:{
                    LessonId:{
                        [Op.in]: lessonUuids,
                    },
                },
            })

        }).then(data =>{const values = data.map(record =>
            record.dataValues
        );
            return values;})

    },

    updateLesson(lessonID, served, answered){
        Models.Lesson.update(
            {
                timesOpened: served === true ? Sequelize.literal('timesOpened + 1') : Sequelize.literal('timesOpened'),
                questionsAnswered: answered === true ? Sequelize.literal('questionsAnswered + 1') : Sequelize.literal('questionsAnswered'),
            },
            {
                where: {
                lessonID: lessonID
                }
            });
        return true
    },

    updateChonk(chonkUuid, served, rejected){
        Models.Chonk.update(
            {
                timesServed: served === true ? Sequelize.literal('timesServed + 1') : Sequelize.literal('timesServed'),
                timesRejected: rejected === true ? Sequelize.literal('timesRejected + 1') : Sequelize.literal('timesRejected'),
            },
            {
                where: {
                    uuid: chonkUuid
                }
            });
            return true
    },

    /**
     * Gets a random set of questions.
     *
     * @param {Number} number The number of questions to get.
     * @param {Array<String>} types What type of questions to get.
     *
     * @returns {Promise<Array>} A promise with available questions and their answers.
     */
    getRandomQuestions(number = 15, types = []) {
        number = !number || typeof number !== 'number' || number < 1 ? 20 : number;
        types = !types || typeof types !== 'object' ? [] : types;
        return this.getTypes(types)
            .then(data => {
                if (data.length === 0) {
                    return Models.Question.findAll({
                        order: Sequelize.literal('rand()'),
                        limit: number,
                        include: [
                            {
                                model: Models.AnswerOption,
                            }
                        ]
                    }).then(data => {
                        const values = data.map(record => 
                            record.dataValues
                        );
                        
                        return values;
                    });
                }

                const typeUuids = data.map(record => 
                    record.dataValues.uuid
                );

                //TODO: Decide whether the question should be part of one of the specified types, or whether we should get questions which are under all of the types
                return Models.QuestionTheme.findAll({
                    where: {
                        QuestionTypeId: {
                            //Ok so new plan - two call functions required: one inclusive (I want easy Qs + Maths Qs) using Op.overlap and one exclusive (I wants Qs that are easy  && maths) using Op.contained - first write exclusive function because more valuable for MVP
                            //How to get around exclusivity w/ no SQL array: Single instance of question, multiple instance of question themes for questions specifying both when it is A && B and also A and also B N.B. will require multiple QuestionTypes registered
                            //Final possible thought: collect various UUIDs in an object within API - this is how to solve it
                            //For now - only using single type get requests
                            [Op.in]: typeUuids,
                        },
                    },
                    attributes: ['QuestionId'],
                }).then(data => {
                    const questionUuids = data.map(record => 
                        record.dataValues.QuestionId
                    );

                    return Models.Question.findAll({
                        where: {
                            uuid: {
                                [Op.in]: questionUuids,
                            },
                        }, 
                        order: Sequelize.literal('rand()'),
                        limit: number,
                        include: [
                            {
                                model: Models.AnswerOption,
                            }
                        ]
                    }).then(data => {
                        const values = data.map(record => 
                            record.dataValues
                        );
                        
                        return values;
                    });
                })
            });
    },
    
    /**
     * Adds a new user record in the database.
     *
     * @param {String} email The email address of the user.
     * @param {String} name The name of the user.
     * @param {String} stripeCustomerId The Stripe customer ID.
     * @param {String} role The role of the user.
     *
     * @returns {Promise} Promise to add the user to the database.
     */
    addUser(email, name, role){
        return Models.User.create({
            uuid: uuid(),
            email,
            name,
            role,
        }).then(data => {
            logger.info('The user has been added')
        }).catch(err => {
            logger.error('Error: Could not add user,' + err.message);
            return false;
        })
    },

    /**
     * Updates a user record.
     *
     * @param {String} email The email address of the user.
     * @param {String} name The name of the user.
     * @param {String} role The role of the user.
     *
     * @returns {Promise} Promise to update the user record.
     */
    updateUser(email, name, role){
        return Models.User.update(
            {
                email,
                name,
                role,
            },
            {
                where: { email }
            }
        ).then(() => {
            logger.info('The user has been updated');
        }).catch(err => {
            logger.error('Error: Could not update user,' + err.message);
            return false;
        });
    },

    /**
     * Updates a user record.
     *
     * @param {String} email The email address of the user.
     * @param {String} scoreName The name of the user.
     * @param {Number} scoreValue The role of the user.
     *
     * @returns {Promise} Promise to update the user record.
     */
    updateUserScore(email, scoreName, scoreValue){
        return Models.User.update(
            {
                scoreA: scoreName === 'scoreA' ? scoreValue : Sequelize.literal('scoreA'),
                scoreB: scoreName === 'scoreB' ? scoreValue : Sequelize.literal('scoreB'),
                scoreC: scoreName === 'scoreC' ? scoreValue : Sequelize.literal('scoreC'),
                scoreD: scoreName === 'scoreD' ? scoreValue : Sequelize.literal('scoreD'),

            },
            {
                where: { email }
            }
        ).then(() => {
            logger.info("The user's score has been updated");
        }).catch(err => {
            logger.error('Error: Could not update user,' + err.message);
            return false;
        });
    },

    /**
     * Gets a user record.
     *
     * @param {String} email The email address of the user.
     *
     * @returns {Promise} Promise to get the user record.
     */
    getUser(email) {
        return Models.User.findOne(
            { 
                where: { email }
            }
        ).then(user => {
            if (user && user.dataValues) {
                return user.dataValues;
            }
            else {return false}

            //throw new Error(`Could not find user ${email}`)
        });
    },

    addLessonInstance (lessonID, chonkOne, chonkTwo, chonkThree, chonkFour){
            return Models.LessonInstance.create({
                uuid: uuid(),
                lessonID,
                chonkOne,
                chonkTwo,
                chonkThree,
                chonkFour
            }).then(data => {
                logger.info('The lesson has been added');
                return data;
            }).catch(err => {
                logger.error('Error: Could not add lesson,' + err.message);
                return false;
            })
        },

    updateLessonInstance (LessonUuid, rated, rating, answered){
        Models.LessonInstance.update(
            {
                questionsAnswered: answered === true ? Sequelize.literal('questionsAnswered + 1') : Sequelize.literal('questionsAnswered'),
                rating: rated === true ? rating : Sequelize.literal('rating')
            },
            {
                where: {
                    uuid: LessonUuid
                }
            }).then(() => {
            logger.info("The lesson has been updated");
        }).catch(err => {
            logger.error('Error: Could not update lesson,' + err.message);
            return false;
        });
    },

    addChonkInstance (lessonUUID, chonkUUID){
        return Models.ChonkInstance.create({
            uuid: uuid(),
            lessonUUID,
            chonkUUID
        }).then(data => {
            logger.info('The lesson has been added');
        }).catch(err => {
            logger.error('Error: Could not add lesson,' + err.message);
            return false;
        })
    }

};