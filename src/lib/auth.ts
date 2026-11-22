import {createHmac,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";
const key=()=>process.env.SESSION_SECRET||"";
const digest=(s:string)=>createHmac("sha256",key()).update(s).digest("hex");
export function loginOk(email:string,password:string){
 if(!key()||!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD)return false;
 const a=Buffer.from(digest(email.toLowerCase()+"\n"+password),"hex");
 const b=Buffer.from(digest(process.env.ADMIN_EMAIL.toLowerCase()+"\n"+process.env.ADMIN_PASSWORD),"hex");
 return timingSafeEqual(a,b);
}
export function createSession(){const expires=String(Date.now()+86400000);return expires+"."+digest(expires)}
export async function adminOk(){
 if(!key())return false;
 const token=(await cookies()).get("smart_session")?.value||"";
 const [expires,sig]=token.split(".");
 if(!expires||!sig||!/^\d+$/.test(expires)||Number(expires)<Date.now())return false;
 const actual=Buffer.from(sig,"hex"),expected=Buffer.from(digest(expires),"hex");
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}