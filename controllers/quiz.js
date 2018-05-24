const Sequelize = require("sequelize");
const {models} = require("../models");
const Op = Sequelize.Op;

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};
exports.randomplay = (req, res, next) =>{

    console.log("quizzes: " + req.session.quizzes);
    console.log("score: "+ req.session.score);
    const {quiz, query} = req;
    const answer = query.answer || "";
    var lon = 0;
    var ps = [];
/*
    if(req.session.score >= req.session.quizzes.length){
        delete req.session.quizzes;
        delete req.session.score;
    }
*/
    //creo una variable global score de la sesion:
    
    //hago lo mismo con un almacen de quizzes
    if(req.session.quizzes === undefined){
        req.session.score =0;
        models.quiz.findAll()
        .then(quizzes => {
            
            req.session.quizzes = quizzes;
            
            console.log("quizzes1: " + req.session.quizzes);
            console.log("score1: "+ req.session.score);

            lon = req.session.quizzes;
            var i = Math.floor(Math.random() * lon.length);
            var q = req.session.quizzes[i];
            req.session.quizzes.splice(i, 1);
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: q
            });
        })
        .catch(err => console.log(err));

    }else{
        ps = req.session.quizzes;
        if(ps.length === 0){
            var score = req.session.score;
            
            res.render('quizzes/random_none', {score: score});
        }else{
            lon = req.session.quizzes.length;
            var i = Math.floor(Math.random() * lon);
            var q = req.session.quizzes[i];
            req.session.quizzes.splice(i, 1);
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: q
            });
        }
    }


};
exports.randomcheck = (req, res, next) => {
    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();
    var score;
    
    if (result) {
        req.session.score++;
        score = req.session.score;
        if(req.session.quizzes.length===0){
            delete req.session.quizzes;
            delete req.session.score;
            res.render('quizzes/random_none', {score: score});
        }else{

            res.render('quizzes/random_result', {
                answer: answer,
                quiz: quiz,
                result: result,
                score: score
            });
        }
    }else{
        score = req.session.score;
        delete req.session.quizzes;
        delete req.session.score;
        res.render('quizzes/random_result', {
                answer: answer,
                quiz: quiz,
                result: result,
                score: score
        });
    }
    

};
 /*exports.randomplay = (req, res, next) =>{
        if( !req.session.randomPlay) req.session.randomPlay = [];// aqui guardaremos los id de las preguntas contestadas
        // DUDA: AQUI SE GUARDAN LOS ID SOLOS? CADA VEZ QUE RENDERIZAMOS UNO SE GUARDA?
        //CONTESTACIÓN: randomPlay y random check van encadenados, uno llama a una vista y en esa
        //vista se llama al otro, que tras comprobar si esta bien contestada la pregunta, añade el id
        models.quiz.count({where: {id: {[Op.notIn]: req.session.randomPlay}}}) // CONTAMOS LOS ID DE LAS PREGUNTAS QUE NO ESTAN EN EL ALMACEN
        .then(count => { //COUNT SERA EL NUMERO DE LAS QUE NO ESTAN DENTRO
            if (count === 0){ //habremos respondido a todas
                req.session.randomPlay = []; //reiniciamos el almacén
                res.render('quizzes/random_none', {score: score});//una vez hemos terminado cargamos la vista nomore y le pasamos puntuación
            }else{
                models.quiz.findAll()
                .then(quizzes => quizzes.map(quiz => quiz.id))//mapeamos cada quiz a un id propio y como resultado pasamos un array de ids
                .then(ids => ids.filter(id => req.session.randomPlay.indexOf(id) === -1)) //Que sentido tiene?
                .then(ids => ids[Math.floor(Math.random() * ids.length)])
                .then(id => models.quiz.findById(id)
                    .then(quiz => {
                        
                        res.render('quizzes/random_play', {
                            score: req.session.randomPlay.length,
                            quiz: quiz
                        });
                    }))
                .catch(err => console.log(err));


            }
        })
    };
     exports.randomcheck = (req, res, next) => {
        const {quiz, query} = req;
        //de donde vienen quiz y query?
        const answer = query.answer || "";
        const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();
        let lastScore =req.session.randomPlay.length;

        result ? req.session.randomPlay.push(quiz.id) : req.session.randomPlay = []; //si acertamos, lo añade y si fallamos reinicia

        res.render('quizzes/random_result', {
            answer,
            quiz,
            result,
            score: result ? ++lastScore : lastScore
        });
    };*/