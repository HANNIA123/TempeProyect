const express = require ("express");
const app= express();

app.get("/", (req, res) => {
    res.json({
        hola: "Mundo",
        equipo: "Carolina y Hannia"

    });
});

app.listen(3000, ()=> console.log("server in port 3000"));
