CREATE TABLE IF NOT EXISTS test_import (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255)
);

INSERT INTO test_import (message)
VALUES ('Neon import test successful!');
