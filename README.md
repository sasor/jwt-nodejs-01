# jwt-nodejs-01

Este repo sirve a manera de practica (el 1ro) con JWT, usa redis para
almacenar los refresh_token, cada refresh_token expira dentro de un anio
esto replicado en redis.

### Requirements
- redis instalado
- Insommia

##### Packages
- express
- mongoose
- http-errors (que buena lib)
- redis
- jsonwebtoken
- Joi (para validacion del req.body)
- etc...

###### Dev Packages
- nodemon
- dotenv
- morgan

##### TODO's
- la validacion podria ser un middleware
- cambiar logica de las rutas a controladores separados
