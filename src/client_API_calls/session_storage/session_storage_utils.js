"use client";

import { MODULE_SESSION_PREFIX, DASHBOARD_SESSION_KEY, PAGE_SESSION_KEY } from "./useSession";


//////////////////////////////////////////////////////
// SETTING UTILS
//

//Sets a session storage item
export function setSessionStorage(key, value){
    try{
        if(typeof window !== "undefined"){
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        throw `Error setting session storage: ${error}`;
    }
}

//////////////////////////////////////////////////////
// CLEARING UTILS
//

//Clears all session storage
export function clearSessionStorage(){
    if(typeof window !== "undefined"){
        sessionStorage.clear();
    }
}

//Clears a specific key from session storage
export function clearKeyFromSessionStorage(key){
    if(typeof window !== "undefined"){
        sessionStorage.removeItem(key);
    }
}

//Clear just the modules from session storage
export function clearModulesFromSessionStorage(){
    if(typeof window !== "undefined"){
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(MODULE_SESSION_PREFIX)){
                sessionStorage.removeItem(key);
            }
        })
    }
}


//////////////////////////////////////////////////////
// LOGGING UTILS
//

export function printSessionStorage(){
    if(typeof window !== "undefined"){
        Object.keys(sessionStorage).forEach(key => {
            console.log(`${key}: ${sessionStorage.getItem(key)}`);
        })
    }
}
export function printSessionStorageKeys(){
    if(typeof window !== "undefined"){
        Object.keys(sessionStorage).forEach(key => {
            console.log(key);
        })
    }
}
export function printSessionStorageItem(key){
    if(typeof window !== "undefined"){
        console.log(`${key}: ${sessionStorage.getItem(key)}`);
    }
}


//////////////////////////////////////////////////////
// GETTING UTILS
//

export function getPages(){
    const pages = JSON.parse(sessionStorage.getItem(PAGE_SESSION_KEY));
    if(!pages){
        throw new Error("getPages: No pages exist in session storage.");
    }
    return pages;
}


export function getDashboard(){
    const dashboard = JSON.parse(sessionStorage.getItem(DASHBOARD_SESSION_KEY));
    if(!dashboard){
        throw new Error("getDashboard: No dashboard exists in session storage.")
    }
    return dashboard;
}

export function getModuleData(moduleId){
    const moduleData = JSON.parse(sessionStorage.getItem(MODULE_SESSION_PREFIX + moduleId));
    if(!moduleData){
        throw new Error("getModuleData: No module data exists in session storage for module with id: " + moduleId);
    }
    return moduleData;
}