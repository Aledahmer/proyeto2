const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next)=> {
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
})

// Ruta de inicio
app.get("/", (req, res) => {
    res.status(200).end("Bienvenido a la API de Granjas");
  });

  // Ruta para obtener todas las granjas
app.get("/granjas", async (req, res) => {
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de granjas y convertir los documentos a un array
      const db = client.db("granjas");
      const granjas = await db.collection("granjas").find().toArray();
      res.json(granjas);
    } catch (error) {
      // Manejo de errores al obtener granjas
      res.status(500).send("Error al obtener las granjas de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

  // Ruta para obtener producto por su codigo
app.get("/granja/:codigo", async (req, res) => {
    const granjaCodigo = parseInt(req.params.id);
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de granjas y buscar por su codigo
      const db = client.db("granjas");
      const granja = await db.collection("granjas").findOne({ codigo: granjaCodigo });
      if (granja) {
        res.json(granja);
      } else {
        res.status(404).send("granja no encontrada");
      }
    } catch (error) {
      // Manejo de errores al obtener granjas
      res.status(500).send("Error al obtener la granja de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });
  
 // Ruta para obtener un producto por su nombre
app.get("/granjas/nombre/:nombre", async (req, res) => {
    const granjaQuery = req.params.nombre;
    let granjaNombre = RegExp(granjaQuery, "i");
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de granja y buscar por su Nombre
      const db = client.db("granjas");
      const granja = await db
        .collection("granjas")
        .find({ nombre: granjaNombre })
        .toArray();
      if (granja.length > 0) {
        res.json(granja);
      } else {
        res.status(404).send("Fruta no encontrada");
      }
    } catch (error) {
      // Manejo de errores al obtener granja
      res.status(500).send("Error al obtener granjas de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

  // Ruta para obtener un producto por su importe
app.get("/granjas/precio/:precio", async (req, res) => {
    const granjaPrecio = parseInt(req.params.precio);
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de granjas y buscar por su precio
      const db = client.db("granjas");
      const granja = await db
        .collection("granjas")
        .find({ precio: { $gte: granjaPrecio } })
        .toArray();
  
      if (granja.length > 0) {
        res.json(granja);
      } else {
        res.status(404).send("producto no encontrada");
      }
    } catch (error) {
      // Manejo de errores al obtener granja
      res.status(500).send("Error al obtener granja de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

  // Ruta para agregar un nuevo recurso
app.post("/granjas", async (req, res) => {
    const nuevoProducto = req.body;
    try {
      if (nuevoProducto === undefined) {
        res.status(400).send("Error en el formato de datos a crear.");
      }
  
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
      }
  
      const db = client.db("granjas");
      const collection = db.collection("granjas");
      await collection.insertOne(nuevoProducto);
      console.log("Nuevo producto creado");
      res.status(201).send(nuevoProducto);
    } catch (error) {
      // Manejo de errores al agregar producto
      res.status(500).send("Error al intentar agregar un nuevo producto");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

//Ruta para modificar un recurso
app.put("/granjas/:codigo", async (req, res) => {
    const codigoGranja = parseInt(req.params.id);
    const nuevosDatos = req.body;
    try {
      if (!nuevosDatos) {
        res.status(400).send("Error en el formato de datos a crear.");
      }
  
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
      }
  
      const db = client.db("granjas");
      const collection = db.collection("granjas");
  
      await collection.updateOne({ codigo : codigoGranja }, { $set: nuevosDatos });
  
      console.log("producto Modificada");
  
      res.status(200).send(nuevosDatos);
    } catch (error) {
      // Manejo de errores al modificar el producto
      res.status(500).send("Error al modificar el producto");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

  // Ruta para eliminar un recurso
app.delete("/granjas/:codigo", async (req, res) => {
    const codigoGranja = parseInt(req.params.id);
    try {
      if (!codigoGranja) {
        res.status(400).send("Error en el formato de datos a crear.");
        return;
      }
  
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de granjas, buscar su codigo y eliminarla
      const db = client.db("granjas");
      const collection = db.collection("granjas");
      const resultado = await collection.deleteOne({ id: codigoGranja });
      if (resultado.deletedCount === 0) {
        res
          .status(404)
          .send("No se encontró ningun producto con el codigo seleccionado.");
      } else {
        console.log("producto Eliminada");
        res.status(204).send();
      }
    } catch (error) {
      // Manejo de errores al obtener granjas
      res.status(500).send("Error al eliminar el producto");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });
  
  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });