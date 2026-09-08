"use client";
import { useState, useEffect } from "react";

export const DASHBOARD_SESSION_KEY = "dashboard";
export const PAGE_SESSION_KEY = "pages";
export const MODULE_SESSION_PREFIX = "module-";


function getSavedValue(key, initialValue){
    //Check if window is on client-side
    if (typeof window !== "undefined") {

        //Try to get the value from session storage
        const raw = sessionStorage.getItem(key);
        if (raw !== null) {
            const savedValue = JSON.parse(raw);
            if (savedValue) return savedValue;
        }

        //If they used a function to get the initial value, just call it & return the result.
        if (initialValue instanceof Function) return initialValue();
    }
    //If the window is not defined, just return the initial value.
    return initialValue ?? null;
}

export function useSession(key, initialValue){

    if(!key) throw new Error("useSession: No key provided");
    if(typeof key !== "string") throw new Error("useSession: Key must be a string");

    //NOTE: This function is only called ONCE, on initial render.
    const [value, setValue] = useState(() => {
        return getSavedValue(key, initialValue);
    });

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new CustomEvent("stratlab:session-data-changed"));
    }, [key, value]);

    return [value, setValue];
}