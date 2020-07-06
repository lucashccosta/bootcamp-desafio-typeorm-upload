### Observação

Se o seguinte erro ocorrer no momento de rodar as migrations: "QueryFailedError: function uuid_generate_v4() does not exist", rodar o seguinte comando no postgres:

```sh
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```