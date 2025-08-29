export default () => ({
  typeorm2: {
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "postgres",
    password: "postgres ",
    database: "typeorm2",
    autoLoadEntities: true,
    synchronize: true,
  },
  localDB: {
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "postgres",
    password: "postgres ",
    database: "postgres",
    autoLoadEntities: false,
    synchronize: false,
  },
  remoteDB: {
    type: "postgres",
    url: process.env.DB_URL,
    ssl: true,
    autoLoadEntities: true,
    synchronize: true,
  },
});
