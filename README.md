1. To start 1 producer and 2 consumers run `docker-compose --scale consumer=2 up`
2. Than stop consumers (in separate tab) by `docker-compose stop consumer`
3. Wait a bit for producer to produce some messages
4. Start consumers again by `docker-compose --scale consumer=2 up consumer`
5. Consumers than retrieve messages.
