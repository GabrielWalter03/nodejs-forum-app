const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const PerguntaModel = require("./database/Perguntas")
const RespostaModel = require("./database/Resposta")

//databse
connection.authenticate()
    .then(() => {
        console.log("Conexão com o banco de dados foi estabelecida com sucesso.");
    })
    .catch(err => {
        console.error("Não foi possível conectar ao banco de dados:", err);
    });


app.set('view engine', 'ejs');
app.use(express.static("public"));

// Body parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

// Rotas
app.get("/",(req, res) => {
    PerguntaModel.findAll({raw: true, order:[
        ["id","DESC"] 
    ]}).then(perguntas => {
        res.render("index",{
            perguntas: perguntas
        });
    });
   
});

app.get("/perguntar",(req, res) => {
    res.render("perguntar")
})

app.post("/salvarpergunta", (req, res) => {
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;

    console.log("Dados recebidos:", { titulo, descricao }); // Adicione este log

    PerguntaModel.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/");
    }).catch((err) => {
        console.error("Erro ao salvar a pergunta:", err);
        res.redirect("/perguntar");
    });
});

app.get("/pergunta/:id",(req,res)=> {
    var id = req.params.id;
    PerguntaModel.findOne({
        where:{id:id}
    }).then(pergunta => {
        if(pergunta != undefined) {
            
            RespostaModel.findAll({
                where: {perguntaId: pergunta.id},
                oder:[
                    ["id","DESC"]
                ]
            }).then(respostas => {
                res.render("pergunta",{
                    pergunta:pergunta,
                    respostas:respostas
                });
            });
        }else{
            res.redirect("/")
        }
    })
})

app.post("/responder",(req, res)=> {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    RespostaModel.create({
        corpo:corpo,
        perguntaId:perguntaId
    }).then(()=> {
        res.redirect("/pergunta/"+perguntaId)
    })
})

app.listen(8080,()=> {
    console.log("App rodando")
})