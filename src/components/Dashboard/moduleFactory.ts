"use client";
import { MODULE_DEFINITIONS, ModuleType } from "@/module_definitions/module_definitions";
import { PageModuleLayout } from "@/module_definitions/module_template";
import { ModuleDataMinimumRequired } from "@/module_definitions/module_template";


//Create the default data for a module.
export function createDefaults_ModuleData(moduleType: ModuleType): ModuleDataMinimumRequired<any> & Record<string, unknown>{
    try{
        const data = MODULE_DEFINITIONS[moduleType].defaultData;

        if (!data) {
            throw new Error(`Unknown module type: "${moduleType}"`);
        }
        

        //Generate a unique moduleId for the new module.
        const dataWithId = { ...data, moduleId: generateUUID() };        
        console.log("New module Data: ", dataWithId);
        return dataWithId;
    } catch (error) {
        throw `Error creating module: ${error}`;
    }
}

export function createDefaults_PageModule(moduleId: string, moduleType: ModuleType): PageModuleLayout{
    
    try{
        //Get the default values for the module type
        const layout = MODULE_DEFINITIONS[moduleType].defaultLayout;

        if(!layout) {
            throw new Error(`Unknown module type: "${moduleType}"`);
        }

        const layoutWithId = { ...layout, i: moduleId };

        return layoutWithId;


    } catch (error) {
        throw `Error creating module: ${error}`;
    }
}

export function generateUUID(): string {
    if (crypto?.randomUUID) {
      return crypto.randomUUID();
    }
  
    //Fallback - some weird niche cases where crypto.randomUUID isn't available.
        //Main one for now: Mobile devices when not using HTTPS  (I.e. While we're testing locally.)
    return crypto.getRandomValues(new Uint8Array(16))
      .reduce((acc, byte, i) => {
        const hex = byte.toString(16).padStart(2, "0");
        return acc + ([4,6,8,10].includes(i) ? "-" : "") + hex;
    }, "").toString();
}



//DEFAULTS MOVED TO src/module_definitions/module_definitions.ts