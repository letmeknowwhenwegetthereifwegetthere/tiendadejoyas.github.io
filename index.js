const express = require('express');
const app = express();
const cors = require('cors');
const {obtenerJoyas, obtenerJoyasfiltro} = require('./consultas');

app.use(express.json());
app.use(cors());


app.listen(3000, () => {
    console.log('Server started at port: 3000');
}  );

// Se crea un middleware para obtener los datos de la consulta
 const middlewareGetJoyas = async (req, res,next) => {
    try {
    const queryStrings = req.query;
    const url = req.url;
    console.log(`
    Se realizó una consulta a la base de datos
    Fecha: ${new Date().toLocaleString()}
    URL: ${url.split("?")[0]}
    queryStrings: ${JSON.stringify(queryStrings)}
    `);
    next();
    } catch (error) {
        res.status(500).json(error);
    }
};

// Se crea una función para preparar los datos de HATEOAS
const prepararHATEOAS = (joyas) => {
    const results = joyas.map(joya => {
        return {
            name: joya.nombre,
            href: `/joyas/${joya.id}`
        }
    }).slice(0, 4);
    const total = joyas.length;
    const HATEOAS = {
        total,
        results
    }
    return HATEOAS;
}


//crear una ruta get para obtener todos los datos de la tabla consulta
app.get('/joyas',middlewareGetJoyas ,async (req, res) => {
    try {
        const {limits , order_by , page} = req.query;
        //validar pagina
        if (page < 1) {
            throw { code: 400, message: "La página debe ser mayor a 0" }    
        }
        //validar limites
        if (limits < 1) {
            throw { code: 400, message: "El límite debe ser mayor a 0" }
        } 
        //validar orden
        const [campo, orden] = order_by.split("_");
        if (orden !== "ASC" && orden !== "DESC") {
            throw { code: 400, message: "El orden debe ser ASC o DESC" }
        }
        //validar campo
        const camposValidos = ["id", "nombre", "categoria", "metal", "precio","stock"];
        if (!camposValidos.includes(campo)) {
            throw { code: 400, message: "El campo no es válido" }
        }
        const result = await obtenerJoyas({limits, order_by, page});
        const HATEOAS = await prepararHATEOAS(result);
        res.json(HATEOAS);
    } catch (error) {
        res.status(500).json(error);
    }
}   );

//crear una ruta get para obtener todos los datos de la tabla consulta aplicando filtros
app.get('/joyas/filtros',middlewareGetJoyas, async (req, res) => {
    try {
        const queryStrings = req.query;
        const result = await obtenerJoyasfiltro(queryStrings);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }

}   );

