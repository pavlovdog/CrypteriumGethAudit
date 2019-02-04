### Установка

```bash
# клонируем репозиторий
git clone https://github.com/pavlovdog/GethCluster

# запускаем скрипт для установки зависимостей
cd GethCluster/
chmod +x shell_helpers/*
sudo ./shell_helpers/install.sh
```

### Запуск и использование

**Geth** и приложение, взаимодействующее с балансироващиком нагрузки AWS, находятся в докер контейнерах. Перед тем, как запустить все, требуется настроить параметры запуска geth'a. Сделать это можно путем редактирование файла *docker-compose.yml*:

```yaml
version: '3'

services:
  geth:
    image: ethereum/client-go:v1.8.22
    volumes:
      - {ETHEREUM_DIR}:/geth/.ethereum
    command: "--cache 2048 --syncmode 'fast' --maxpeers 50 --datadir geth/.ethereum  --rpcapi admin,debug,miner,shh,txpool,personal,eth,net,web3 --rpc --rpcvhosts=* --rpcaddr 0.0.0.0 --ethstats={NODE_UNIQUE_NAME}:{ETHSTATS_SECRET}@{ETHSTATS_HOST}:3000 --verbosity=4"
...
```

Нас интересует только подразделы **command** и **volumes** сервиса **geth**. Параметры, требующие настройки:

- ETHEREUM_DIR - полный путь к папке .ethereum, куда будет сохраняться (или уже сохранен) блокчейн.
- NODE_UNIQUE_NAME - уникальное имя этой ноды (будет использовано для идентификации в EthStats, об этом далее)
- ETHSTATS_SECRET - секретная строка, нужная для подключения к EthStats
- ETHSTATS_HOST - адрес, где запущен сервис EthStats

Если сервис EthStats не был запущен, флаг --ethstats можно убрать из команды запуска geth'a.

 После настройки конфиг файла сборка и запуск контейнеров производятся командой:

```bash
sudo docker-compose up -d
```

Несколько полезных команд для манипулирования работой контейнеров.

Для того, чтобы посмотреть последние N строк логов:

```bash
sudo docker-compose logs --tail 100
```

Для того, чтобы посмотреть логи конкретного контейнера:

```bash
sudo docker-compose logs --tail 100 <container_name>
```

Где <container_name> - geth или healthchecker.

Запуск/остановка/рестарт контейнер(ов/а)

```bash
sudo docker-compose start/stop/restart <container_name> # указывается, если команда применяется к конкретному контейнеру
```

Если, к примеру, нужно обновить версию geth, нужно просто изменить строку

```bash
image: ethereum/client-go:v1.8.22
```

на

```bash
image: ethereum/client-go:vN.N.N
```

И прописать

```bash
sudo docker-compose down geth
sudo docker-compose up -d
```



### Подключение EthStats dashboard

Чтобы поднять и использовать EthStats используется другой docker-compose файл - docker-compose.stats.yml (по умолчанию используется docker-compose.yml). Он также требует настройки:

```bash
geth:
    image: ethereum/client-go:v1.8.22
    volumes:
    - {ETHEREUM_DIR}:/geth/.ethereum
    command: "--cache 2048 --syncmode 'fast' --maxpeers 50 --datadir geth/.ethereum  --rpcapi admin,debug,miner,shh,txpool,personal,eth,net,web3 --rpc --rpcvhosts=* --rpcaddr 0.0.0.0 --ethstats={NODE_UNIQUE_NAME}:{ETHSTATS_SECRET}@ethstats:3000 --verbosity=4"
    ]
...
ethstats:
    build:
    context: .
    dockerfile: docker/ethstats/Dockerfile
    restart: on-failure
    environment:
    - WS_SECRET={ETHSTATS_SECRET}
..
```

Настройка параметров не отличается от предыдущей за исключением того, что нам не нужно указывать ETHSTATS_HOST, т.к нода находится рядом с EthStats и знает его адрес. Также, в сервисе **ethstats**, мы указываем ETHSTATS_SECRET, который используется во всех остальных настройках на всех нодах. Сгенерировать его можно например следующей командой:

```bash
echo -n 'very secret phrase' | base64
dmVyeSBzZWNyZXQgcGhyYXNl
```

Все конмады для докера те же самые, за исключением добавления флага ```-f docker-compose.stats.yml```. В таком случае сборка и запуск контейнеров осуществляются командой:

```bash
sudo docker-compose -f docker-compose.stats.yml up -d
```

Для остальных команд все аналогично.

EthStats должна находится в 1ом экземпляре, поэтому использование этой конфигурации производится только на 1ом сервере, ноды с остальных серверов (запущенные с помощью инструкций предыдущего пункта) подключаются к ней.