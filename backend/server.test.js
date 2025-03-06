const request = require('supertest');
const server = require('./server'); // Importamos la API

// Mockeamos PostgreSQL con Jest
jest.mock('pg', () => {
    const mClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }), // Devuelve `{ rows: [] }` por defecto
        release: jest.fn(),
    };
    const mPool = {
        connect: jest.fn().mockResolvedValue(mClient), // Retorna `mClient` cuando se conecta
        query: jest.fn(),
        end: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

// Importar `server.js` después del mock para que use la versión mockeada
const { Pool } = require('pg');
const mPool = new Pool(); // Obtener el mock real

describe('🎵 API de Canciones', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpia los mocks antes de cada test
    });

    it('should insert a new song and verify it with GET /playlist', async () => {
        const songData = {
            user_id: "1",
            song_name: "Test Song",
            artist_name: "Test Artist",
            popularity: 99,
        };

        // Simular conexión a la BD
        const mClient = {
            query: jest.fn()
                .mockResolvedValueOnce({ rows: [] }) // Simula base de datos vacía
                .mockResolvedValueOnce({ rows: [{ ...songData }] }) // Simula la inserción
                .mockResolvedValueOnce({ rows: [songData] }), // Simula respuesta de `/playlist`
            release: jest.fn(),
        };
        mPool.connect.mockResolvedValue(mClient);

        await request(server)
            .post('/add-song')
            .send(songData)
            .expect(201);

        // Asegurar que `client.query()` devolverá `{ rows: [...] }` antes de llamar a `/playlist`
        mClient.query.mockResolvedValueOnce({ rows: [songData] });

        const response = await request(server)
            .get('/playlist')
            .expect(200);

        expect(mClient.query).toHaveBeenCalledWith(
            "SELECT * FROM merged_songs ORDER BY popularity DESC LIMIT 10"
        );

        expect(response.body).toEqual([songData]);
    });

    it('should clear the database successfully', async () => {
        const mClient = {
            query: jest.fn().mockResolvedValueOnce({ rowCount: 1 }),
            release: jest.fn(),
        };
        mPool.connect.mockResolvedValue(mClient);

        await request(server)
            .post('/clear-database')
            .expect(200);

        expect(mClient.query).toHaveBeenCalledWith("DELETE FROM merged_songs");
    });
});

//Cerrar conexión al finalizar los tests
afterAll(() => {
    mPool.end();
});
