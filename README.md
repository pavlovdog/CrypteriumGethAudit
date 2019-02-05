# README

Данный репозиторий содержит инструкции для создания множества инстансов Geth ([go-ethereum](https://github.com/ethereum/go-ethereum/)) в инфраструктуре AWS и балансировки запросов к ним с помощью доступного на AWS балансировщика нагрузки.

## Содержание

1. Настройка IAM
2. Настройка VPC
3. Настройка Security Group
4. Создание инстансов
5. Создание бадансировщика нагрузки
6. Установка контейнеров в инстансе
7. Запуск и использование
8. Подключение EthStats dashboard
9. Ссылки

## Настройка IAM

В первую очередь, необходимо создать пользователя, от лица которого будут производиться манипуляции с инстансами. Если вы уже создали подходящего пользователя - можете пропустить этот шаг.

1. Войдя в свой аккаунт, открываете настройки IAM - <https://console.aws.amazon.com/iam/>
2. В навигационной панели, выбираете **Users**->**Add user**
3. Устанавливаете **User name**, в Access type выбираете **AWS Managment Console Access**. Выбираете формат пароля (автоматически сгенерированный / ручной ввод). Можете включить / выключить запрос на изменение пароля при следующем входе в систему.

![add_user](/home/pavlovdog/CrypteriumGethAudit/images/IAM_add_user.png)

4. Далее идет утсановка прав пользователя. Если вы уже создавали необходимую группу - просто добавьте пользователя в нее. В противном случае, мы рекомендуем начать с создания группы *администраторов*. Для этого выбираете **Create group**, устанавливаете имя группы и в качестве Policy выбираете **AdministratorAccess**. После этого нажимаете **Create group**.

![add_group](/home/pavlovdog/CrypteriumGethAudit/images/IAM_create_group.png)

5. Следующим шагом необходимо получить приватный ключ, для того, чтобы подключаться к созданным в последствии инстансам. Для этого необходимо авторизоваться, используя созданного только что пользователя (после создания пользователя, вы получите URL для авторизации, вида `https://123123123123.signin.aws.amazon.com/console`).

![user_created](/home/pavlovdog/CrypteriumGethAudit/images/IAM_user_created.png)

6. После авторизации, перейдите в раздел EC2 и выберете в меню слева раздел **Network & Security** -> **Key Pairs**. Нажмите на кнопку **Create Key Pair** и сохраните полученный ключ.

![create_key_pair](/home/pavlovdog/CrypteriumGethAudit/images/EC2_create_keypair.png)

## Настройка VPC

Если вы уже создали подходящий вам Virtual Private Cloud, то вы можете пропустить данный шаг.

1. Откройте https://console.aws.amazon.com/ec2/ и нажмите кнопку **Launch VPC Wizard**.
2. Выберите **VPC with a Single Public Subnet**. Укажите имя VPC и Availability Zone. Остальные настройки можете остафить дефолтными.

![vpc](/home/pavlovdog/CrypteriumGethAudit/images/VPC_create.png)

3. Нажмите кнопку **Create VPC** для сохранения VPC.

## Настройка Security Group

Для работы с инстансами и балансировщиком нагрузки, необходимо указать правила по которым будет блокироваться / пропускаться интернет трафик. В данном примере мы создадим самую простую Security Group, которая будет пропускать *весь* трафик, как входящий, так и исходящий.

> Ни в коем случае не стоит использовать подобные настройки в реальной инфраструктуре! Вместо этого, мы рекомендуем создать отдельные группы для инстансов и балансировщика, и открыть только необходимые порты.

1. После авторизации, перейдите в секцию EC2 и в левом меню откройте **Network & security** -> **Security Groups**. Нажмите кнопку **Create Security Group**. Укажите имя и ваш VPC.

![create_security_group](/home/pavlovdog/CrypteriumGethAudit/images/EC2_security_group.png)

2. Настройте **Outbound** правила.

![outbound](/home/pavlovdog/CrypteriumGethAudit/images/EC2_outbound_group.png)

3. Нажмите кнопку **Create** для сохранения группы.

## Создание инстансов

1. Авторизуйтесь и в левом меню выберите **Instances** -> **Instances**. Нажмите кнопку **Launch Instances**.

2. Для создания инстансов под ноды Geth, мы рекомендуем использовать AMI **Ubuntu Server 16.04 LTS (HVM)**.
3. Из конфигураций общего назначения (General purpose), мы рекомендуем выбрать `t2.xlarge (4 vCPUs, 16 GiB RAM)` или `t2.2xlarge (8 vCPUs, 32 GiB RAM)`. Нажмите **Next: Configurate Instance Details**.
4. Укажите число инстансов (равносильно числу нод), ваш VPC. Если вам нужен публичный IP для инстансов - установите **Enable** в поле **Auto-assign Public IP**. Нажмите кнопку **Next: Add Storage**.

![config](/home/pavlovdog/CrypteriumGethAudit/images/EC2_create_instance.png)

5. Для синхронизации Geth в режиме `--fast`, мы рекомендуем добавить не менее 300 GiB SSD. Нажмите кнопку **Next: Add Tags**.

![storage](/home/pavlovdog/CrypteriumGethAudit/images/EC2_instance_storage.png)

6. Если вам необходимы теги - добавьте их на этом шаге (необязательно). После этого нажмите кнопку **Next: Configura Security Group**.
7. Выберите предварительно созданную группу (или же создайте новую). После этого нажмите кнопку **Review and Launch**.

![security_group](/home/pavlovdog/CrypteriumGethAudit/images/EC2_security_group_instance.png)

8. Проверьте указанную конфигурацию и нажмите кнопку **Launch** для создания инстансов.

## Создание балансировщика нагрузки

1. После авторизации, в секции **EC2**, в меню слева выберите секцию **Load balancing** -> **Load Balancers**.
2. Нажмите кнопку **Create Load Balancer**. В открывшемся меню выберите **Application Load Balancer**. Укажите имя балансировщика, схему `intenet-facing` и `dualstick` в поле **IP address type**. В список портов, которые будет проксировать балансировщик добавьте `HTTP 8545` (стнадартный порт для RPC Geth).

![load_balancer_config](/home/pavlovdog/CrypteriumGethAudit/images/EC2_load_balancer_config.png)

5. Укажите используемую VPC и список Availability Zones, в которых будет расположены инстансы.
6. Выберите необходимую **Security Group** и нажмите кнопку **Next: Configurate Routing**.
7. Настройте необходимые параметры для процесса health check в соответствии со скринштом.

![settings](/home/pavlovdog/CrypteriumGethAudit/images/EC2_load_balancer_settings.png)

8. Добавьте необходимые инстансы в группу targets и запустите балансировщик.

![register](/home/pavlovdog/CrypteriumGethAudit/images/EC2_load_balancer_register.png)

9. Зайдите в левое меню, **Load Balancing** -> **Load Balancers** и проверьте созданный балансировщик.
10. Настройки портов (вкладка **Description**). Здесь и ниже в настройках присутствует порт 80 - вам его добавлять не обязательно.

![port_conf](/home/pavlovdog/CrypteriumGethAudit/images/EC2_port_forwarding.png)

11. Настройки Health Check

![health_check](/home/pavlovdog/CrypteriumGethAudit/images/EC2_health_check.png)

12. Настройки listeners

![listeners](/home/pavlovdog/CrypteriumGethAudit/images/EC2_listeners.png)

## Установка контейнеров в инстансе

```bash
# клонируем репозиторий
git clone https://github.com/pavlovdog/GethCluster

# запускаем скрипт для установки зависимостей
cd GethCluster/
chmod +x shell_helpers/*
sudo ./shell_helpers/install.sh
```

## Запуск и использование

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

- `ETHEREUM_DIR` - полный путь к папке .ethereum, куда будет сохраняться (или уже сохранен) блокчейн.
- `NODE_UNIQUE_NAME` - уникальное имя этой ноды (будет использовано для идентификации в EthStats, об этом далее)
- `ETHSTATS_SECRET` - секретная строка, нужная для подключения к EthStats
- `ETHSTATS_HOST` - адрес хоста, где запущен сервис EthStats (подробное описание для этого сервиса приведено ниже)

Если сервис EthStats не был запущен, флаг `--ethstats` можно убрать из команды запуска geth'a.

После настройки конфиг файла сборка и запуск контейнеров производятся командой:

```bash
sudo docker-compose up -d
```

Несколько команд для манипулирования работой контейнеров.

- Для того, чтобы посмотреть последние N строк логов:

```bash
sudo docker-compose logs --tail 100
```

- Для того, чтобы посмотреть логи конкретного контейнера:

```bash
sudo docker-compose logs --tail 100 <container_name>
```

Где <container_name> - geth или healthchecker.

- Запуск/остановка/рестарт контейнер(ов/а)

```bash
sudo docker-compose start/stop/restart <container_name> # указывается, если команда применяется к конкретному контейнеру
```

- Если, к примеру, нужно обновить версию geth, нужно просто изменить строку

```bash
image: ethereum/client-go:v1.8.22
```

на

```bash
image: ethereum/client-go:vN.N.N
```

И выполнить

```bash
sudo docker-compose down geth
sudo docker-compose up -d
```

- Для проверки работы балансировщика нагрузки можно исполнить следующую команду

```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":67}' LOAD_BALANCER_HOST:8545
```

Результат должен выглядеть следующим образом (может вырьироваться в зависимости от выбранных параметров ноды):

```json
{"jsonrpc":"2.0","id":67,"result":"Geth/v1.8.22-stable/linux-amd64/go1.11.5"}
```

### Подключение EthStats dashboard

![ethstats](/home/pavlovdog/CrypteriumGethAudit/images/ethstats.png)

Чтобы поднять и использовать EthStats используется другой docker-compose файл - `docker-compose.stats.yml` (по умолчанию используется `docker-compose.yml`). Он также требует настройки:

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

Настройка параметров не отличается от предыдущей за исключением того, что нам не нужно указывать `ETHSTATS_HOST`, т.к нода находится на том же хосте. Также, в сервhttps://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.htmlисе **ethstats**, мы указываем `ETHSTATS_SECRET`, который используется во всех остальных настройках на всех нодах. Сгенерировать его можно например следующей командой:

```bash
echo -n 'very secret phrase' | base64
dmVyeSBzZWNyZXQgcGhyYXNl
```

Все команды для докера те же самые, за исключением добавления флага ```-f docker-compose.stats.yml```. В таком случае сборка и запуск контейнеров осуществляются командой:

```bash
sudo docker-compose -f docker-compose.stats.yml up -d
```

Для остальных команд все аналогично.

Контейнер EthStats должен находится в 1ом экземпляре, поэтому использование этой конфигурации производится только на 1ом сервере, ноды с остальных серверов (запущенные с помощью инструкций предыдущего пункта) подключаются к ней.

## Ссылки

- https://docs.aws.amazon.com/rekognition/latest/dg/setting-up.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html
- https://docs.aws.amazon.com/directoryservice/latest/admin-guide/gsg_create_vpc.html