


interface to manage your docker-compose container releases



# Develop
```
npm install
npm run develop
npm run develop-api
```

# Deploy
```
docker build -t versions .
docker build -t versions . && docker tag versions registry.example.com/versions &&  docker push registry.example.com/versions
docker pull registry.example.com/versions && docker-compose up -d
```


## docker-compose.yml
```
version: '2'

services:

  versions:
    image: versions
    volumes:
      - "${VOLUME_DIR}/versions/endpoints.json:/usr/local/project/app/endpoints.json"
      - "${VOLUME_DIR}/versions/certs:/usr/local/certs"
    ports:
      - "3000:3000"
    environment:
      - "EXCLUDE_CONTAINERS_BY_IMAGES=^sha256"
      - "REGISTRY_CONFIG_REGISTRY_EXAMPLE_COM=https://username:passsword@registry.example.com/v2"
      - "MAX_TAGS=30"
      - "CLIENT_CONFIG_API_HOST="
      - "CLIENT_CONFIG_HEADER_LOGO_URL=https://cdn.example.com/images/logo.png"

```
