const { Pool } = require('pg');
const { format } = require('util');
const pool = new Pool({
    host: 'localhost',
    user: '',
    password: '',
    database: 'joyas',
    allowExitOnIdle: true,
});




const obtenerJoyas = async ({ limits = 2, order_by = "id_ASC", page = 0 }) => {
    try {
        const [campo, orden] = order_by.split("_");
        const offset = (page - 1) * limits;

        const formattedQuery = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s', campo, orden, limits, offset);
        pool.query(formattedQuery)
        const result = await pool.query(formattedQuery);
        return (result.rows);
    } catch (error) {
        console.log(error);
    }
}



const obtenerJoyasfiltro = async ({ precio_max, precio_min = 0, categoria, metal }) => {
    try {
        let filtros = [];
        if (precio_max) filtros.push(`precio <= ${precio_max}`);
        if (precio_min) filtros.push(`precio >= ${precio_min}`);
        if (categoria) filtros.push(`categoria = '${categoria}'`);
        if (metal) filtros.push(`metal = '${metal}'`);
        let consulta = "SELECT * FROM inventario";
        if (filtros.length > 0) {
            consulta += " WHERE " + filtros.join(" AND ");
        }
        const result = await pool.query(consulta);
        return (result.rows);
    } catch (error) {
        console.log(error);
    }
};

module.exports = { obtenerJoyas, obtenerJoyasfiltro };

