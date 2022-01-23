#Ponemos un alias para hacer referencia a este stage
FROM node:14.17.4-alpine3.14 as build
#Creamos este directorio y nos movemos a él
WORKDIR /Codeforum
#Copiamos el backend al directorio del contenedor
COPY . .
#Instalamos las dependencias
RUN npm i
#Iniciamos el backend
CMD npm run start