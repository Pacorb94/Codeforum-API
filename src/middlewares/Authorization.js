'use strict';
const jwt=require('jwt-simple');
const moment=require('moment');

/**
 * Clase que almacena la autorización del usuario
 */
class Authorization{

    /**
     * Función que comprueba si el usuario está autorizado
     * @param req 
     * @param res 
     * @param next 
     */
    static checkUserAuth(req, res, next){
        if (req.headers.authorization) {
            let token=req.headers.authorization;
            try {
                let decodedToken=jwt.decode(token, 'claveJWT');
                //Si expiró el token
                if (decodedToken.exp<=moment().unix()) {
                    return res.status(500).send({message:'El token ha expirado'});
                }else{     
                    //El usuario será el token
                    req.user=decodedToken;
                    //Ejecuta la siguiente acción
                    next();
                }             
            } catch (error) {
                return res.status(400).send({message:'El token no es válido'});
            }
        }else{
            return res.status(404).send({message:'No hay autorización'});
        }
    }
}
module.exports=Authorization;