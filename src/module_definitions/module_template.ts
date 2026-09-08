import { ModuleType } from "./module_definitions";

export interface ModuleDefinition<T> {
    //Must have title, moduleType, moduleId, + add whatever else you want.
    defaultData: ModuleDataMinimumRequired<T> & Record<string, unknown>; 
    //Must match PageModuleLayout exactly.
    defaultLayout: PageModuleLayout; 
}

//The fields used in pageModuleFactory.
//Stored in the Module table in the database, and in Pages.Modules[] in session.
export interface PageModuleLayout {
    i: string | null; //THIS IS THE SAME AS "moduleId". 
    // WE HAVE TO USE "i" BECAUSE REACT-GRID-LAYOUT REQUIRES IT INTERNALLY.
    moduleType: ModuleType;
    x: number;
    y: number;
    w: number;
    h: number;
    minW: number;
    minH: number;
    maxW: number;
    maxH: number;
}

//The MINIMUM fields required for a module's useSession data.
export interface ModuleDataMinimumRequired<T> {
    moduleType: ModuleType;
    moduleId: string | null;
    title: string;
}