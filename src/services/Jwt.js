'use strict';
const jwt=require('jwt-simple');
const moment=require('moment');
class Jwt{

    /**
     * Función que crea el token
     * @param user
     * @return
     */
    static createToken(user) {
        let token={
            sub:user._id,
            name:user.name,
            surname:user.surname,
            email:user.email,
            role:user.role,
            image:user.image,
            iat:moment().unix(),
            exp:moment().add(30, 'days').unix()
        }
        return jwt.encode(token, 'claveJWT');
    }
}
module.exports=Jwt;