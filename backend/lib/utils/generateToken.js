// Using JSON Web Token. 
import jwt from 'jsonwebtoken';

/*  
    jwt.sign takes payload as input to generate a token. 
    Payload: The main/actual information (or claim) that is included in the token. This is usually information such as user ID, expiry date. 
    JWT_SECRET is a secret key to generate the token, stored in .env file. This has been generated with git bash command: $ openssl rand -base64 32
 */

// Function to create token and set cookie based on input (userId and the response object)
export const generateTokenAndSetCookie = (userId, res) => {

    // generate token
    const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn: '15d'});

    // send cookie back to the client (i.e., user's browser)
    res.cookie("jwt", token, {
        maxAge: 15*24*60*60*1000, // this is in millisec
        httpOnly: true, // prevent XSS (cross-site scripting) attacks e.g., we cannot access this from frontend scripts such as JS
        sameSite: "strict", // prevent CSRF (cross-site request forgery) attacks e.g., if strict, browsers will send cookie only for requests from the issuer site.  
        secure: process.env.NODE_ENV !== "development", // if true, only https requests can send cookie values, reducing the risk of getting the contents revealed to third party attackers. we want this off for DEV env. 
    });
}
