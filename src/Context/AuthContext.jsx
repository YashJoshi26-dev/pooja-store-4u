import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({children}){

 const [user,setUser] = useState(null)

 const login = (token)=>{
   localStorage.setItem("adminToken",token)
 }

 const logout = ()=>{
   localStorage.removeItem("adminToken")
 }

 return(
   <AuthContext.Provider value={{login,logout,user}}>
     {children}
   </AuthContext.Provider>
 )
}