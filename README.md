# Login with 2FA Using NodeJS

```bash

docker-compose up -d mysql
docker-compose logs -f mysql

export $(cat .env | xargs)

mysql -u"${MYSQL_USER}" -p"${MYSQL_PASS}" -P3306 -h127.0.0.1 -e "USE user_system; SHOW TABLES;"


docker-compose up -d --build user-api
docker-compose logs -f user-api

# signup
curl --silent -X POST \
  --header 'Content-type: application/json' \
  --data '{"username": "admin", "email": "admin@email.com", "password": "PASSWORD"}' \
  --url 'http://localhost:5050/api/v1/auth/signup'


mysql -u"${MYSQL_USER}" -p"${MYSQL_PASS}" -P3306 -h127.0.0.1 -e "SELECT * FROM user_system.users;"
mysql -u"${MYSQL_USER}" -p"${MYSQL_PASS}" -P3306 -h127.0.0.1 -e "TRUNCATE user_system.users;"
mysql -u"${MYSQL_USER}" -p"${MYSQL_PASS}" -P3306 -h127.0.0.1 -e "ALTER TABLE user_system.users auto_increment = 1;"


# 2 steps for login
curl --silent -X POST \
  --header 'Content-type: application/json' \
  --data '{"email": "admin@email.com", "password": "PASSWORD"}' \
  --url 'http://localhost:5050/api/v1/auth/signin' | jq -r '.qr_code'

TOKEN='747484'
export ACCESS_TOKEN=$(curl --silent -X POST \
  --header 'Content-type: application/json' \
  --data "{\"email\": \"admin@email.com\", \"password\": \"PASSWORD\", \"token\": \"${TOKEN}\"}" \
  --url 'http://localhost:5050/api/v1/auth/signin' | jq -r '.access_token')
echo "${ACCESS_TOKEN}"

# get current user info
curl --silent -X GET \
  --header 'Content-type: application/json' \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --url 'http://localhost:5050/api/v1/user/me' | jq -r

# reset 2FA for current user
curl --silent -X PUT \
  --header 'Content-type: application/json' \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --url 'http://localhost:5050/api/v1/user/me/secret_reset' | jq -r

# docker-compose up -d --build user-ui
# docker-compose logs -f user-ui

```
