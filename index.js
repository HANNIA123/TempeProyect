//Se cambio findOne por find
const path= require('path');
var express = require('express');
var app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const res = require('express/lib/response');
const uri = "mongodb+srv://dbUser:2021bdhannia@cluster0.jjsks.mongodb.net/Temperatura?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useUnifiedTopology: true});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use( express.static( "public" ) ); 
//app.use('/static', express.static(__dirname + '/public'));


var tempe=[];



let promesa= new Promise((resolve, reject)=>{
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Temperatura");
        dbo.collection("infoTempe").find({}).toArray(function(err, result) {
          if (err) throw err;
          //console.log(result);
          resolve(result);
          
          db.close();
        });
      });
});


app.get("/logo", async function(req, res) {
    
    res.sendFile(path.resolve(__dirname, 'logo.png'));
});

app.get("/clima", async function(req, res) {
    res.sendFile(path.resolve(__dirname, 'clima.jpg'));

});

app.get("/sol", async function(req, res) {
    res.sendFile(path.resolve(__dirname, 'soleado.png'));

});

app.get("/luna", async function(req, res) {
    res.sendFile(path.resolve(__dirname, 'luna.png'));

});


app.get("/", async function (req, res) 
{

    hoy=obtener_fecha().hora;
    var array_hora = hoy.split(":");
    hora_a=array_hora[0]; 


    var guarda_hora=[];
    var guard_tempe=[];
    var guarda_fecha=[];


    promesa.then((resultado)=>{
        var tod_horas=new Object();
       
        tam=resultado.length;
        for (i=0; i< tam; i++){

            var horas_com=resultado[i].hora;
            var todgrados=resultado[i].temperatura;
            var todfecha=resultado[i].fecha;
            var uni_hora=horas_com.split(":");

            var uni=uni_hora[0];
            //console.log(uni);
            
        guarda_hora[i]=uni;
        guard_tempe[i]=todgrados;
        guarda_fecha[i]=todfecha;
        
        


            //tod_horas[i].uni=uni;
            //tod_horas[i].todgrados=todgrados;
            //tod_horas[i]={unii : tod_grados };
         



          if (i==tam-1){
                tActual=resultado[i].temperatura;
                fActual=resultado[i].fecha;
                hActual=resultado[i].hora;
                eActual=resultado[i].numEstacion;
                latActual=resultado[i].latUbicacion;
                lonActul=resultado[i].lonUbicacion;
          }


        }

        //console.log(tod_horas);
        //Mostrar las ultimas 24 horas
       // var cadaHora = tod_horas.filter((v, i, a) => a.indexOf(v) === i); 
        //console.log(cadaHora); //solamente cada hora
        //ultimas_horas=2
        var distinto=[];
        var pos=[];
        var con=0;
        //console.log(guarda_hora);
        //guarda_hora=guarda_hora.reverse();


        for (i=guarda_hora.length-1; i>0 ; i--){
            temporal= guarda_hora[i]; 
            if (i==guarda_hora.length){
                distinto[con]=temporal;
                pos[con]=i;
                con++;
                
            }
            else{
                if (guarda_hora[i+1]!=temporal){
                    distinto[con]=temporal;
                    pos[con]=i;
                    con++;
                }
            }
        }
            

        //Obtener temperaturas
var tempeU=[];
var fechaU=[];




        for (i=0; i<pos.length; i++ ){
            p=pos[i];
            tempeU[i]=guard_tempe[p];
            fechaU[i]=guarda_fecha[p];
        }



//console.log(fechaU);
        //Invertir para que sean los ultimos agregados

        //console.log(distinto);
        //console.log(tempeU);
       

        //Ultimas 12 horas 
        num_horas=5;
        //estas dos mandarlas
        mHora=[];
        mTemp=[];
        mFecha=[];

        //distinto=distinto.reverse(); //horas
        //tempeU=tempeU.reverse();
        //fechaU=fechaU.reverse();

        for (i=0; i<num_horas; i++){
            mHora[i]=distinto[i];
            mTemp[i]=tempeU[i];
            mFecha[i]=fechaU[i];
        }

            //manda mHora y mTemp 
           // console.log(mHora);
            //console.log(mTemp);
            
            
            
        res.render( 'index', { temp_actual: tActual, fechaactual: fActual, horaactual: hActual, estacionactual:eActual,
            ulthora: mHora, ulttem: mTemp, ultfecha: mFecha
        } );
       // res.render('index', {temp_actual: tActual}, {fechaactual: fActual});
    });


//res.sendFile(path.resolve(__dirname, 'index.html'));

//ta=db.infoTempe.find().sort({$natural:-1}).limit(1);

}

);






app.get("/update", async function (req, res) {
    //let r = {'dato': 1,'valor': 'Nio'};
  
//console.log("funciona?");
/* Obtener los valores que se mandaran a MongoDB*/
var lat=req.query.lat; //Para usar en la ubicación despues
var lon=req.query.lon; 
var temp=String(req.query.temp)+"°C";
var num_estacion= String(req.query.device_label)
var fecha=obtener_fecha().fecha;
var hora=obtener_fecha().hora;
console.log("Temperatura: "+ temp);
console.log("Estacion: "+ num_estacion);
console.log("Latitud: "+ lat)
//Conexión con MogoDB

//res.json(num_estacion+"\n " +" Temperatura: "+ temp);


var myobj={ temperatura: temp, fecha: fecha, hora: hora, numEstacion: num_estacion, latUbicacion: lat, lonUbicacion: lon};
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Temperatura");
        //var myobj = { name: "Company Inc", address: "Highway 37" };
    dbo.collection("infoTempe").insertOne(myobj, function(err, res) {
    if (err){
      throw err;
        //let r={'Status': err}
        //res.json(r);
    }
        else{
        console.log("1 document inserted");
    db.close();
        }
    });
    let r={'resultado': 'Insertado satisfactoriamente' };
      //res.json(r);  
    });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }



});



app.listen(3000, function() {
    console.log('Aplicación ejemplo, escuchando el puerto 3000!');
});

function obtener_fecha(){
    var fecha_server=new Object();
    var hoy = new Date();
    var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
    var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    fecha_server.fecha=fecha;
    fecha_server.hora=hora;
return fecha_server;

}