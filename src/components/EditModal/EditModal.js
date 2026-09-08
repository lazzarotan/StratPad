import { Button, Modal } from "@mui/material"
import { getModuleData } from "@/client_API_calls/session_storage/session_storage_utils";
import { useEffect, useState } from "react";
import AlertModal from "@/components/AlertModal/AlertModal";
import { setSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";
import { MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import './EditModal.css'

import NotesEditForm from "@/components/Modules/Notes/NotesEditForm";
import CounterEditForm from "@/components/Modules/Counter/CounterEditForm";
import StopwatchEditForm from "@/components/Modules/Stopwatch/StopwatchEditForm";
import SpinWheelEditForm from "@/components/Modules/SpinWheel/SpinWheelEditForm";
import NestedDictionaryEditForm from "@/components/Modules/NestedDictionary/EditModal/NestedDictionaryEditForm";
import ResourceBarEditForm from "@/components/Modules/ResourceBar/ResourceBarEditForm";
import ScoreTableEditForm from "@/components/Modules/ScoreTable/ScoreTableEditForm";
import DiceEditForm from "@/components/Modules/Dice/DiceEditForm";
import ListEditForm from "@/components/Modules/List/ListEditForm";
import CoinTossEditForm from "@/components/Modules/CoinToss/CoinTossEditForm";
import SingleImageEditForm from "@/components/Modules/SingleImage/SingleImageEditForm";
//TODO:
/*
- Actually save to session storage on save
- Wire up saving
- Make sure it actually reloads the module
*/



//Placeholder for no edit form available
const NoEditForm = () => <div>No edit form available</div>;
//Map of each module type to its edit form:
const MODULE_EDIT_FORMS = {
    null: NoEditForm,
    notes: NotesEditForm,
    counter: CounterEditForm,
    stopwatch: StopwatchEditForm,
    spinWheel: SpinWheelEditForm,
    nestedDictionary: NestedDictionaryEditForm,
    resourceBar: ResourceBarEditForm,
    scoreTable: ScoreTableEditForm,
    dice: DiceEditForm,
    list: ListEditForm,
    coinToss: CoinTossEditForm,
    singleImage: SingleImageEditForm,
}


export default function EditModal({ open, onClose, onSave, moduleId }) {

    const [editedModuleData, setEditedModuleData] = useState(null);//Modal data we're editing

    const [unsavedChangesFlag, setUnsavedChangesFlag] = useState(false);    //Flag to indicate unsaved edits
    const [alertOpen, setAlertOpen] = useState(false); //Alert modal for "Exit without saving?"


    //On open, load module data from session storage
    useEffect(() => {
        if(!open) return;
        try{
            //Load the module data
            const moduleData = getModuleData(moduleId);
            setEditedModuleData(moduleData);
            setUnsavedChangesFlag(false);
        } catch (error) {
            console.error("Error loading module data:", error);
            throw `Error loading module data: ${error}`;
        }
    }, [open])


    //Load in the corresponding edit form for the module type
        //EditForms are found in the corresponding module folder.
    const EditForm = MODULE_EDIT_FORMS[ editedModuleData?.moduleType] || MODULE_EDIT_FORMS.null;

    //Triggered by child form, toggled "OFF" after saving.
    const onEdit = () => {
        setUnsavedChangesFlag(true);
    }

    //Prompt user to save if unsaved changes present.
    const handleClose = () => {
        console.log(unsavedChangesFlag)
        if(unsavedChangesFlag){
            console.log("Prompt to save.");
            setAlertOpen(true);
        }
        else{
            console.log("Don't prompt.");
            onClose();
        }
    }

    // Handle responses from "Exit without saving?" alert    
    const handleConfirmClose = () => {
        setAlertOpen(false);
        onClose();
    }
    const handleCancelClose = () => {
        setAlertOpen(false);
    }


    //Save the edits to session storage
    const handleSave = () => {
        try{
            setSessionStorage(MODULE_SESSION_PREFIX + moduleId, editedModuleData);
            setUnsavedChangesFlag(false);
            onSave?.(moduleId);
            onClose();
        }
        catch (error) {
            console.error("Error saving edits:", error);
            throw `Error saving edits: ${error}`;
        }
    }


    return (
        <Modal open={open} onClose={onClose}>
            <div className="modal-container">
                <h3>Settings for {editedModuleData?.title ?? "Module"}</h3>
                {open ? <EditForm    
                            editedModuleData={editedModuleData}  
                            setEditedModuleData={setEditedModuleData}
                            onEdit={onEdit}
                        /> : null}
            <div className="modal-button-container">
                <Button className="modal-btn modal-btn--red" onClick={handleClose}>Cancel</Button>
                <Button className="modal-btn" onClick={handleSave}>Save</Button>
            </div>
            <AlertModal 
                open={alertOpen} 
                title="Warning: Unsaved Edits" 
                message="Closing this modal will discard all edits you have made. Do you wish to continue?" 
                onConfirm={handleConfirmClose} 
                onCancel={handleCancelClose} 
                confirmText="Continue" cancelText="Cancel" />
            </div>
        </Modal>
    );
}