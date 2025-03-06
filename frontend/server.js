const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

// Servir el frontend React desde la carpeta "build"
app.use(express.static(path.join(__dirname, "build")));

app.get("/health", async (req, res) => {
    try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
            console.error("La variable de entorno REACT_APP_BACKEND_URL no está definida.");
            process.exit(1);
        }
        
        const backendHealth = await axios.get(`${backendUrl}/health`);

        if (backendHealth.status === 200) {
            res.status(200).json({ frontend: "ok", backend: "ok" });
        } else {
            res.status(500).json({ frontend: "ok", backend: "down" });
        }
    } catch (error) {
        console.error("Error en Health Check:", error);
        res.status(500).json({ frontend: "ok", backend: "down" });
    }
});

// Redirigir cualquier otra ruta a React (para que funcione react-router)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Iniciar servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend corriendo en el puerto ${PORT}`);
});
